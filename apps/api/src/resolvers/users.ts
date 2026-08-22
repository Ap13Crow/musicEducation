import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { awardXpOnce } from './xp.js';
import { isOwnedUploadUrl } from '../lib/storage.js';
import type { GraphQLContext } from '../types.js';

const PROFILE_COMPLETED_XP = 50;

function isProfileComplete(profile: { displayName?: string | null; bio?: string | null; instruments?: string[] } | null | undefined): boolean {
  return Boolean(profile?.displayName?.trim() && profile?.bio?.trim() && (profile?.instruments?.length ?? 0) > 0);
}

type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone?: string;
};

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function validateAvailabilitySlots(slots: AvailabilitySlot[]) {
  if (!Array.isArray(slots) || slots.length > 50) {
    throw new Error('Availability must contain at most 50 slots.');
  }

  for (const slot of slots) {
    if (!Number.isInteger(slot.dayOfWeek) || slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
      throw new Error('Availability dayOfWeek must be between 0 and 6.');
    }
    if (!TIME_PATTERN.test(slot.startTime) || !TIME_PATTERN.test(slot.endTime) || slot.startTime >= slot.endTime) {
      throw new Error('Availability times must use HH:MM and end after start.');
    }
    if (slot.timezone && slot.timezone.length > 64) {
      throw new Error('Availability timezone is invalid.');
    }
  }
}

export const userResolvers = {
  Query: {
    async me(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      if (!user) return null;
      return prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true, teacherProfile: true, gamification: true },
      });
    },

    async user(_: unknown, { id, email }: any, { prisma }: GraphQLContext) {
      if (id) return prisma.user.findUnique({ where: { id }, include: { profile: true, teacherProfile: true } });
      if (email) return prisma.user.findUnique({ where: { email }, include: { profile: true, teacherProfile: true } });
      return null;
    },

    async searchUsers(_: unknown, { query, role, page = 1, limit = 20 }: any, { prisma }: GraphQLContext) {
      const where: any = {
        OR: [
          { profile: { displayName: { contains: query, mode: 'insensitive' } } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      };
      if (role) where.role = role;
      return prisma.user.findMany({ where, take: limit, skip: (page - 1) * limit });
    },

    async teachers(_: unknown, { filter, page = 1, limit = 20 }: any, { prisma }: GraphQLContext) {
      // Repair previously promoted teachers that predate automatic profile
      // provisioning. TEACHER only - unlike TEACHER, holding the ADMIN role
      // is not itself an expression of intent to teach, so this must not
      // silently provision (and thereby publicly list) a TeacherProfile for
      // every admin who happens to lack one. An admin becomes discoverable
      // below only once they actually have a TeacherProfile - typically via
      // applyAsTeacher, which admins are also allowed to call.
      const missingProfiles = await prisma.user.findMany({
        where: { role: 'TEACHER', teacherProfile: null },
        include: { profile: true },
      });
      for (const candidate of missingProfiles) {
        await prisma.teacherProfile.upsert({
          where: { userId: candidate.id },
          create: {
            userId: candidate.id,
            instruments: candidate.profile?.instruments ?? [],
            musicStyles: candidate.profile?.musicStyles ?? [],
            languages: [],
            isAvailable: true,
          },
          update: {},
        });
      }

      // Users who currently hold the TEACHER role are publicly discoverable,
      // and so is an ADMIN who has gone through applyAsTeacher/set up a
      // TeacherProfile (admins are allowed to teach too - requireRole allows
      // TEACHER or ADMIN on every teacher-profile mutation). A TeacherProfile
      // row is never deleted on demotion (it's history — past courses/
      // bookings still reference it), so this role check — not row
      // existence — is what "is this person a teacher right now" means.
      const where: any = { isAvailable: true, user: { role: { in: ['TEACHER', 'ADMIN'] } } };
      if (filter) {
        if (filter.instrument) where.instruments = { has: filter.instrument };
        if (filter.maxHourlyRate !== undefined) where.hourlyRate = { lte: filter.maxHourlyRate };
        if (filter.minRating !== undefined) where.avgRating = { gte: filter.minRating };
        if (filter.isAvailable !== undefined) where.isAvailable = filter.isAvailable;
        if (filter.search) {
          where.OR = [
            { bio: { contains: filter.search, mode: 'insensitive' } },
          ];
        }
      }
      const skip = (page - 1) * limit;
      const [nodes, totalCount] = await Promise.all([
        prisma.teacherProfile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { avgRating: 'desc' },
          include: { user: { include: { profile: true } }, certifications: true, availability: true },
        }),
        prisma.teacherProfile.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },

    async teacher(_: unknown, { id }: any, { prisma }: GraphQLContext) {
      // Same rule as the `teachers` list: a demoted user's TeacherProfile row
      // survives (history), but they stop being discoverable as a teacher.
      return prisma.teacherProfile.findFirst({
        where: { id, user: { role: { in: ['TEACHER', 'ADMIN'] } } },
        include: { certifications: true, availability: true },
      });
    },

    async myAvailability(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.studentAvailability.findMany({ where: { userId: user!.id }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
    },
  },

  Mutation: {
    async updateProfile(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const { displayName, bio, city, country, timezone, instruments, musicStyles } = input;
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          profile: {
            upsert: {
              create: {
                displayName,
                bio,
                city,
                country,
                timezone: timezone ?? 'Europe/Zurich',
                instruments: instruments ?? [],
                musicStyles: musicStyles ?? [],
              },
              update: { displayName, bio, city, country, timezone, instruments, musicStyles },
            },
          },
        },
        include: { profile: true, teacherProfile: true, gamification: true },
      });
      // One-time XP for a filled-out profile - awardXpOnce's unique ledger key
      // ('self' per user) makes every save after the first a no-op, so it's
      // safe to just check completeness again on every update.
      if (isProfileComplete(updated.profile)) {
        await awardXpOnce(prisma, user.id, 'PROFILE_COMPLETED', 'self', PROFILE_COMPLETED_XP);
      }
      return updated;
    },

    async applyAsTeacher(_: unknown, _input: any, { prisma, user }: GraphQLContext) {
      // Keycloak is the authority for roles. This mutation provisions the local
      // Practice profile only after the access token already contains TEACHER/ADMIN.
      requireRole(user, 'TEACHER', 'ADMIN');
      return prisma.teacherProfile.upsert({
        where: { userId: user!.id },
        create: { userId: user!.id, instruments: [], musicStyles: [], languages: [] },
        update: {},
      });
    },

    async updateTeacherProfile(_: unknown, args: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      // These names are the GraphQL-facing ones (see TeacherProfile /
      // updateTeacherProfile in schema.graphql) - teachingBio/specializations
      // map onto the Prisma columns bio/musicStyles, same renaming the
      // TeacherProfile field resolvers below undo on the way out. Previously
      // this destructured the *column* names instead (bio, currency,
      // musicStyles, languages - none of which updateTeacherProfile actually
      // accepts as args), so every field but hourlyRate/instruments/
      // isAvailable/calendlyUsername was silently ignored.
      const { headline, teachingBio, hourlyRate, instruments, specializations, isAvailable, calendlyUsername, introVideoVisible, publicImageUrl } = args;
      const data: Record<string, unknown> = {};
      // hourlyRate/calendlyUsername are nullable columns - an explicit null
      // is a legitimate "clear this" and Prisma accepts it.
      if (hourlyRate !== undefined) data.hourlyRate = hourlyRate;
      if (calendlyUsername !== undefined) data.calendlyUsername = calendlyUsername;
      // publicImageUrl: null clears the image (falls back to a neutral
      // placeholder in the UI); a non-null value must be a URL this exact
      // teacher actually got from requestUploadUrl(purpose:
      // TEACHER_PROFILE_IMAGE) - otherwise a caller could point the public
      // directory/profile at an arbitrary external URL.
      if (publicImageUrl !== undefined) {
        if (publicImageUrl !== null && !isOwnedUploadUrl(publicImageUrl, 'TEACHER_PROFILE_IMAGE', user!.id)) {
          throw new GraphQLError('publicImageUrl must come from requestUploadUrl(purpose: TEACHER_PROFILE_IMAGE).', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        data.publicImageUrl = publicImageUrl;
      }
      // instruments/isAvailable/introVideoVisible/musicStyles are non-nullable
      // columns (String[]/Boolean with a default). The GraphQL args are still
      // nullable, so a client can send an explicit null even though the
      // schema doesn't attach any "clear it" meaning to that for these
      // fields - Prisma would otherwise reject writing null into a
      // non-nullable column with an opaque validation error. Treat an
      // explicit null the same as omitting the field (no-op) rather than
      // letting it reach Prisma.
      if (instruments !== undefined && instruments !== null) data.instruments = instruments;
      if (isAvailable !== undefined && isAvailable !== null) data.isAvailable = isAvailable;
      if (introVideoVisible !== undefined && introVideoVisible !== null) data.introVideoVisible = introVideoVisible;
      if (specializations !== undefined && specializations !== null) data.musicStyles = specializations;
      // headline has no independent column - TeacherProfile.headline is
      // derived from bio's first line (see the headline resolver below), so
      // an update needs to recompute both halves together. Rebuilding
      // data.bio from *stored* bio whenever headline was given (regardless
      // of whether teachingBio was given in the same call) discarded a
      // same-call teachingBio edit - exactly what the dashboard's profile
      // form does, sending both every save. Only fetch the existing row to
      // fill in whichever half wasn't actually provided this call.
      if (headline !== undefined || teachingBio !== undefined) {
        let newHeadline = headline;
        let newBody = teachingBio;
        if (newHeadline === undefined || newBody === undefined) {
          const existing = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
          const existingLines = (existing?.bio ?? '').split(/\r?\n/);
          if (newHeadline === undefined) newHeadline = existingLines[0] ?? '';
          if (newBody === undefined) newBody = existingLines.slice(1).join('\n');
        }
        // filter(Boolean) here would drop an *intentionally cleared* empty
        // headline whenever the body is non-empty, collapsing bio down to
        // just the body - and headline() derives from bio's own first line,
        // so the body's own first line would then read back as a bogus
        // headline. Keep the headline slot (even empty) whenever there's a
        // body to protect, and only fall back to null when there's truly
        // nothing to store.
        const headlineLine = newHeadline ?? '';
        const bodyText = newBody ?? '';
        data.bio = headlineLine || bodyText ? `${headlineLine}\n${bodyText}` : null;
      }
      return prisma.teacherProfile.update({ where: { userId: user!.id }, data });
    },

    async addCertification(_: unknown, { title, issuingBody, issuedYear, documentUrl }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
      if (!teacherProfile) throw new Error('Teacher profile not found.');
      return prisma.teacherCertification.create({
        data: { teacherProfileId: teacherProfile.id, title, issuingBody, issuedYear, documentUrl },
      });
    },

    async setAvailability(_: unknown, { slots }: { slots: AvailabilitySlot[] }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      validateAvailabilitySlots(slots);
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
      if (!teacherProfile) throw new Error('Teacher profile not found.');
      await prisma.teacherAvailability.deleteMany({ where: { teacherProfileId: teacherProfile.id } });
      await prisma.teacherAvailability.createMany({
        data: slots.map((s: any) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, timezone: s.timezone ?? 'Europe/Zurich', teacherProfileId: teacherProfile.id })),
      });
      return prisma.teacherAvailability.findMany({ where: { teacherProfileId: teacherProfile.id } });
    },

    async setStudentAvailability(_: unknown, { slots }: { slots: AvailabilitySlot[] }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      validateAvailabilitySlots(slots);
      await prisma.studentAvailability.deleteMany({ where: { userId: user!.id } });
      if (slots.length > 0) {
        await prisma.studentAvailability.createMany({
          data: slots.map((s: any) => ({
            userId: user!.id,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            timezone: s.timezone ?? 'Europe/Zurich',
          })),
        });
      }
      return prisma.studentAvailability.findMany({
        where: { userId: user!.id },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
    },

    async completeOnboarding(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      await prisma.userProfile.update({ where: { userId: user.id }, data: { onboardingDone: true } });
      return prisma.user.findUniqueOrThrow({ where: { id: user.id }, include: { profile: true, gamification: true } });
    },
  },

  User: {
    async username(u: any) {
      return u.email?.split('@')[0] ?? u.id;
    },
    async displayName(u: any, _: unknown, { prisma }: GraphQLContext) {
      if (u.profile?.displayName) return u.profile.displayName;
      const profile = await prisma.userProfile.findUnique({ where: { userId: u.id }, select: { displayName: true } });
      return profile?.displayName ?? u.email?.split('@')[0] ?? 'Musician';
    },
    isEmailVerified(u: any) {
      return Boolean(u.emailVerified);
    },
    async avatarUrl(u: any, _: unknown, { prisma }: GraphQLContext) {
      if (u.profile?.avatarUrl) return u.profile.avatarUrl;
      const profile = await prisma.userProfile.findUnique({ where: { userId: u.id }, select: { avatarUrl: true } });
      return profile?.avatarUrl ?? null;
    },
    async profile(u: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.userProfile.findUnique({ where: { userId: u.id } });
    },
    async teacherProfile(u: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.teacherProfile.findUnique({ where: { userId: u.id } });
    },
    async gamification(u: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.gamificationProfile.findUnique({ where: { userId: u.id } });
    },
    async enrollments(u: any, { page = 1, limit = 10 }: any, { prisma }: GraphQLContext) {
      const skip = (page - 1) * limit;
      const where = { userId: u.id };
      // include: { course: true } so Enrollment.course's fast path (see
      // courses.ts) is hit for every row here instead of falling through to
      // its own per-row findUnique - without it, a request for N
      // enrollments' courses (e.g. the profile page) would issue N separate
      // queries.
      const [nodes, totalCount] = await Promise.all([
        prisma.enrollment.findMany({ where, skip, take: limit, include: { course: true } }),
        prisma.enrollment.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },
    async eventsPublished(u: any, { page = 1, limit = 10 }: any, { prisma }: GraphQLContext) {
      const skip = (page - 1) * limit;
      const where = { publisherId: u.id };
      const [nodes, totalCount] = await Promise.all([
        prisma.event.findMany({ where, skip, take: limit }),
        prisma.event.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },
    async followers(u: any, _: unknown, { prisma }: GraphQLContext) {
      const follows = await prisma.follow.findMany({ where: { followingId: u.id }, include: { follower: true } });
      return follows.map((f) => f.follower);
    },
    async following(u: any, _: unknown, { prisma }: GraphQLContext) {
      const follows = await prisma.follow.findMany({ where: { followerId: u.id }, include: { following: true } });
      return follows.map((f) => f.following);
    },
    async feedPosts(u: any, { page = 1, limit = 10 }: any, { prisma }: GraphQLContext) {
      const skip = (page - 1) * limit;
      const where = { authorId: u.id };
      const [nodes, totalCount] = await Promise.all([
        prisma.feedPost.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.feedPost.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },
  },
  UserProfile: {
    timezone(profile: any) {
      return profile.timezone ?? 'Europe/Zurich';
    },
    onboardingStep(profile: any) {
      return profile.onboardingStep ?? 0;
    },
  },
  TeacherProfile: {
    // bio stores headline as its first line, teachingBio as everything
    // after (see updateTeacherProfile) - teachingBio must strip that first
    // line back off, or it duplicates the headline at the top of the
    // self-presentation text every time it round-trips through a read.
    teachingBio(profile: any) {
      if (!profile.bio) return null;
      const body = profile.bio.split(/\r?\n/).slice(1).join('\n');
      return body || null;
    },
    headline(profile: any) {
      if (!profile.bio) return null;
      // An intentionally-cleared headline is stored as an empty first line
      // (see updateTeacherProfile) so it doesn't get confused with the
      // body's own first line - read back as null, not ''.
      const first = profile.bio.split(/\r?\n/, 1)[0].slice(0, 120);
      return first || null;
    },
    specializations(profile: any) {
      return profile.musicStyles ?? [];
    },
    teachingFormats() {
      return [];
    },
    yearsExperience(profile: any) {
      return profile.experienceYears ?? null;
    },
    locationCity(profile: any) {
      return profile.user?.profile?.city ?? null;
    },
    locationCountry(profile: any) {
      return profile.user?.profile?.country ?? null;
    },
    // Null whenever there's nothing to show, regardless of *why* - no link
    // set, or the teacher has toggled it off - so callers never need to
    // check introVideoVisible separately to decide whether to render it.
    // The owner/an admin still sees the raw link so they can flip the
    // toggle without having to re-paste it.
    introVideoUrl(profile: any, _: unknown, { user }: GraphQLContext) {
      if (!profile.introVideoUrl) return null;
      const isOwnerOrAdmin = user?.id === profile.userId || user?.role === 'ADMIN';
      return profile.introVideoVisible || isOwnerOrAdmin ? profile.introVideoUrl : null;
    },
    stripeAccountId(profile: any, _: unknown, { user }: GraphQLContext) {
      const isOwnerOrAdmin = user?.id === profile.userId || user?.role === 'ADMIN';
      return isOwnerOrAdmin ? (profile.stripeAccountId ?? null) : null;
    },
    stripePayoutsEnabled(profile: any, _: unknown, { user }: GraphQLContext) {
      const isOwnerOrAdmin = user?.id === profile.userId || user?.role === 'ADMIN';
      return isOwnerOrAdmin ? Boolean(profile.stripePayoutsEnabled) : null;
    },
    async user(profile: any, _: unknown, { prisma }: GraphQLContext) {
      if (profile.user) return profile.user;
      return prisma.user.findUnique({ where: { id: profile.userId }, include: { profile: true } });
    },
    async certifications(profile: any, _: unknown, { prisma }: GraphQLContext) {
      if (profile.certifications) return profile.certifications;
      return prisma.teacherCertification.findMany({ where: { teacherProfileId: profile.id } });
    },
    async availability(profile: any, _: unknown, { prisma }: GraphQLContext) {
      if (profile.availability) return profile.availability;
      return prisma.teacherAvailability.findMany({
        where: { teacherProfileId: profile.id },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
    },
  },
  GamificationProfile: {
    currentStreak() {
      return 0;
    },
  },
};
