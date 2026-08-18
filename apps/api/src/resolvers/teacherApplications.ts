import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const teacherApplicationResolvers = {
  Query: {
    async myTeacherApplication(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.teacherApplication.findUnique({ where: { userId: user.id } });
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
        },
        update: {
          headline: input.headline ?? null,
          bio: input.bio ?? null,
          instruments: input.instruments ?? [],
          experienceYears: input.experienceYears ?? null,
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
      return prisma.user.findUnique({ where: { id: application.userId }, include: { profile: true } });
    },
  },
};
