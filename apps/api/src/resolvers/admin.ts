import { requireRole } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const adminResolvers = {
  Query: {
    // Public (no requireRole) - the homepage's headline counters. Scoped to
    // what's actually live rather than raw table counts: PUBLISHED courses
    // only, upcoming events (native isPublished + startsAt in the future,
    // external not yet expired) so a page full of past events doesn't
    // inflate the count, STUDENT-role users.
    async platformStats(_: unknown, __: unknown, { prisma }: GraphQLContext) {
      const now = new Date();
      const [totalCourses, totalTeachers, totalStudents, nativeEvents, externalEvents] = await Promise.all([
        prisma.course.count({ where: { status: 'PUBLISHED' } }),
        prisma.teacherProfile.count(),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.event.count({ where: { isPublished: true, startsAt: { gte: now } } }),
        prisma.externalEventProjection.count({
          where: { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        }),
      ]);
      return { totalCourses, totalTeachers, totalStudents, totalEvents: nativeEvents + externalEvents };
    },

    async adminSettings(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      return prisma.adminSetting.findMany();
    },

    async adminStats(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const [totalUsers, totalTeachers, totalCourses, totalEvents, totalBookings, revenueAgg] =
        await Promise.all([
          prisma.user.count(),
          prisma.teacherProfile.count(),
          prisma.course.count(),
          prisma.event.count(),
          prisma.booking.count(),
          prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCEEDED' } }),
        ]);
      return {
        totalUsers,
        totalTeachers,
        totalCourses,
        totalEvents,
        totalBookings,
        totalRevenue: revenueAgg._sum.amount ?? 0,
      };
    },

    async adminUsers(_: unknown, { role, search, page = 1, limit = 50 }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const where: any = {};
      if (role) where.role = role;
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { displayName: { contains: search, mode: 'insensitive' } } },
        ];
      }
      return prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { profile: true },
      });
    },
  },

  Mutation: {
    async updateAdminSetting(_: unknown, { key, value }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      return prisma.adminSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    },

    // Schema name: adminSetRole
    async adminSetRole(_: unknown, { userId, role }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
      const updated = await prisma.$transaction(async (tx) => {
        const savedUser = await tx.user.update({
          where: { id: userId },
          data: { role },
          include: { profile: true },
        });
        if (role === 'TEACHER') {
          await tx.teacherProfile.upsert({
            where: { userId },
            create: {
              userId,
              instruments: savedUser.profile?.instruments ?? [],
              musicStyles: savedUser.profile?.musicStyles ?? [],
              languages: [],
              isAvailable: true,
            },
            update: {},
          });
        }
        return savedUser;
      });

      return updated;
    },

    // Schema name: adminBanUser — downgrades to STUDENT (minimum role; no hard-delete)
    async adminBanUser(_: unknown, { userId }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      if (userId === user!.id) {
        throw new Error('Cannot ban your own account.');
      }
      return prisma.user.update({ where: { id: userId }, data: { role: 'STUDENT' }, include: { profile: true } });
    },
  },

  // displayName/username/isEmailVerified/avatarUrl on User are resolved in
  // users.ts — mergeResolvers merges field-by-field, so a second definition
  // here for the same type+field would silently shadow that one (and did,
  // for these four, until this cleanup) rather than adding anything of its
  // own; both were behaviourally equivalent so no fix was needed there, but
  // keeping one copy is what "one source of truth" is supposed to mean.
};
