import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { isOwnedUploadUrl, type UploadPurpose } from '../lib/storage.js';
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

      // Each non-null URL must be one requestUploadUrl actually minted for
      // this user and this purpose - otherwise a client could submit any
      // external URL for a field an admin later opens in a new tab.
      const cvUrl = input.cvUrl ? requireOwnedUploadUrl(input.cvUrl, 'TEACHER_APPLICATION_CV', user.id, 'CV') : null;
      const audioSampleUrl = input.audioSampleUrl
        ? requireOwnedUploadUrl(input.audioSampleUrl, 'TEACHER_APPLICATION_AUDIO', user.id, 'Audio sample')
        : null;
      const documentUrls: string[] = (input.documentUrls ?? []).map((url: string) =>
        requireOwnedUploadUrl(url, 'TEACHER_APPLICATION_DOCUMENT', user.id, 'Document'),
      );

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
          cvUrl,
          audioSampleUrl,
          documentUrls,
        },
        update: {
          headline: input.headline ?? null,
          bio: input.bio ?? null,
          instruments: input.instruments ?? [],
          experienceYears: input.experienceYears ?? null,
          address: input.address ?? null,
          birthdate,
          cvUrl,
          audioSampleUrl,
          documentUrls,
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
          await tx.teacherProfile.upsert({
            where: { userId: application.userId },
            create: {
              userId: application.userId,
              bio: application.bio ?? applicant.profile?.bio ?? null,
              instruments: application.instruments.length > 0 ? application.instruments : (applicant.profile?.instruments ?? []),
              musicStyles: applicant.profile?.musicStyles ?? [],
              languages: [],
              isAvailable: true,
            },
            update: {},
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
