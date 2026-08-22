import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { isOwnedUploadUrl, type UploadPurpose } from '../lib/storage.js';
import { isValidYouTubeUrl } from '../lib/youtube.js';
import type { GraphQLContext } from '../types.js';

const MIN_TEACHER_AGE_YEARS = 18;

// Rejects a URL the client didn't actually get from requestUploadUrl for
// this purpose and this user - without it, a client could submit an
// arbitrary external URL for a field an admin later opens (cvUrl,
// audioSampleUrl, documentUrls), or one from someone else's upload
// namespace. Also rejects everything once storage isn't configured, so a
// stray URL can't sneak past the "uploads disabled" state.
function requireOwnedUploadUrl(url: string, purpose: UploadPurpose, userId: string, label: string): string {
  if (!isOwnedUploadUrl(url, purpose, userId)) {
    throw new GraphQLError(`${label} must come from requestUploadUrl(purpose: ${purpose}).`, { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return url;
}

// Full identity verification is a later phase; this is the quality/legal
// floor for a self-employed teacher applying now - exact age, not just
// "born 18 years ago or earlier" (accounts for the birthday not having
// happened yet this year).
export function calculateAge(birthdate: Date, asOf: Date = new Date()): number {
  let age = asOf.getFullYear() - birthdate.getFullYear();
  const monthDiff = asOf.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < birthdate.getDate())) {
    age -= 1;
  }
  return age;
}

export const teacherApplicationResolvers = {
  Query: {
    async myTeacherApplication(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.teacherApplication.findUnique({ where: { userId: user.id }, include: { user: { include: { profile: true } } } });
    },

    async teacherApplications(_: unknown, { status, page = 1, limit = 50 }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const where: any = {};
      if (status) where.status = status;
      return prisma.teacherApplication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        // Oldest-pending-first — reviewers work through a queue, not a feed.
        orderBy: { createdAt: 'asc' },
        // Preloaded so the User field resolver below doesn't re-fetch per row.
        include: { user: { include: { profile: true } } },
      });
    },
  },

  Mutation: {
    async applyForTeacher(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        throw new GraphQLError('You already have teacher access.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const existing = await prisma.teacherApplication.findUnique({ where: { userId: user.id } });
      if (existing?.status === 'PENDING') {
        throw new GraphQLError('Your application is already pending review.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (!input.birthdate) {
        throw new GraphQLError('Date of birth is required to apply.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const birthdate = new Date(input.birthdate);
      if (Number.isNaN(birthdate.getTime())) {
        throw new GraphQLError('Date of birth is invalid.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (calculateAge(birthdate) < MIN_TEACHER_AGE_YEARS) {
        throw new GraphQLError(`You must be at least ${MIN_TEACHER_AGE_YEARS} years old to apply as a teacher.`, { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Required - this becomes the public profile's presentation video once
      // approved. A YouTube link, not an upload, so the site stays light.
      if (!input.videoUrl || !isValidYouTubeUrl(input.videoUrl)) {
        throw new GraphQLError('A YouTube link to a presentation or performance video is required to apply.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // The name that will show on the public teacher profile once approved -
      // update it now rather than waiting for approval, so the applicant sees
      // it reflected immediately.
      const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
      if (fullName) {
        await prisma.userProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, displayName: fullName, instruments: [], musicStyles: [] },
          update: { displayName: fullName },
        });
      }

      // Each non-null URL must be one requestUploadUrl actually minted for
      // this user and this purpose - otherwise a client could submit any
      // external URL for a field an admin later opens in a new tab. Only
      // touch these columns when the client actually sent the field:
      // undefined means "no change" (the web wizard always re-sends the
      // application's existing URLs, but the resolver shouldn't rely on
      // that - a client that omits the field on a resubmission, e.g. to
      // only edit the headline, must not wipe out a previously uploaded
      // CV/recording/documents), while an explicit null/[] is a deliberate
      // clear.
      const cvUrl = input.cvUrl !== undefined
        ? (input.cvUrl ? requireOwnedUploadUrl(input.cvUrl, 'TEACHER_APPLICATION_CV', user.id, 'CV') : null)
        : undefined;
      const audioSampleUrl = input.audioSampleUrl !== undefined
        ? (input.audioSampleUrl ? requireOwnedUploadUrl(input.audioSampleUrl, 'TEACHER_APPLICATION_AUDIO', user.id, 'Audio sample') : null)
        : undefined;
      const documentUrls: string[] | undefined = input.documentUrls !== undefined
        ? input.documentUrls.map((url: string) => requireOwnedUploadUrl(url, 'TEACHER_APPLICATION_DOCUMENT', user.id, 'Document'))
        : undefined;
      const imageUrl = input.imageUrl !== undefined
        ? (input.imageUrl ? requireOwnedUploadUrl(input.imageUrl, 'TEACHER_PROFILE_IMAGE', user.id, 'Photo') : null)
        : undefined;

      // Upsert rather than create-only: a previously rejected applicant can
      // resubmit, which resets status to PENDING and clears the prior review.
      return prisma.teacherApplication.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          headline: input.headline ?? null,
          bio: input.bio ?? null,
          instruments: input.instruments ?? [],
          experienceYears: input.experienceYears ?? null,
          address: input.address ?? null,
          birthdate,
          gender: input.gender?.trim() || null,
          motivation: input.motivation?.trim() || null,
          cvUrl,
          audioSampleUrl,
          documentUrls,
          imageUrl,
          videoUrl: input.videoUrl,
        },
        update: {
          headline: input.headline ?? null,
          bio: input.bio ?? null,
          instruments: input.instruments ?? [],
          experienceYears: input.experienceYears ?? null,
          address: input.address ?? null,
          birthdate,
          gender: input.gender?.trim() || null,
          motivation: input.motivation?.trim() || null,
          cvUrl,
          audioSampleUrl,
          documentUrls,
          imageUrl,
          videoUrl: input.videoUrl,
          status: 'PENDING',
          reviewedBy: null,
          reviewedAt: null,
        },
      });
    },

    async reviewTeacherApplication(_: unknown, { id, approve }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const application = await prisma.teacherApplication.findUnique({ where: { id } });
      if (!application) throw new GraphQLError('Application not found.', { extensions: { code: 'NOT_FOUND' } });

      return prisma.$transaction(async (tx) => {
        const updated = await tx.teacherApplication.update({
          where: { id },
          data: { status: approve ? 'APPROVED' : 'REJECTED', reviewedBy: user!.id, reviewedAt: new Date() },
        });

        if (approve) {
          const applicant = await tx.user.update({
            where: { id: application.userId },
            data: { role: 'TEACHER' },
            include: { profile: true },
          });
          // TeacherProfile.bio stores headline as its first line and
          // teachingBio (self-presentation) as everything after it (see
          // updateTeacherProfile / the teachingBio field resolver) -
          // combine the application's two fields the same way. filter(Boolean)
          // would drop an empty/missing headline whenever bio has content,
          // collapsing bio down to just the body - and the teachingBio
          // resolver always strips bio's first line regardless, so it would
          // wrongly eat the real first line of the self-presentation text.
          // Keep the headline slot (even empty) whenever there's a body.
          const headlineLine = application.headline ?? '';
          const bodyText = application.bio ?? applicant.profile?.bio ?? '';
          const combinedBio = headlineLine || bodyText ? `${headlineLine}\n${bodyText}` : null;
          await tx.teacherProfile.upsert({
            where: { userId: application.userId },
            create: {
              userId: application.userId,
              bio: combinedBio,
              instruments: application.instruments.length > 0 ? application.instruments : (applicant.profile?.instruments ?? []),
              musicStyles: applicant.profile?.musicStyles ?? [],
              languages: [],
              isAvailable: true,
              experienceYears: application.experienceYears,
              introVideoUrl: application.videoUrl,
              publicImageUrl: application.imageUrl,
            },
            // A resubmission-then-reapproval refreshes the bio/video/photo
            // (the teacher may have edited any of them) but leaves
            // introVideoVisible alone - that's the teacher's own toggle, not
            // something re-approval should silently reset. Only overwrite
            // publicImageUrl when the reapproved application actually has an
            // image - never blank out a photo the teacher already has live
            // just because a resubmission happened to omit it.
            update: {
              bio: combinedBio,
              experienceYears: application.experienceYears,
              introVideoUrl: application.videoUrl,
              ...(application.imageUrl ? { publicImageUrl: application.imageUrl } : {}),
            },
          });
        }

        return updated;
      });
    },
  },

  TeacherApplication: {
    async user(application: any, _: unknown, { prisma }: GraphQLContext) {
      if (application.user) return application.user;
      return prisma.user.findUnique({ where: { id: application.userId }, include: { profile: true } });
    },
  },
};
