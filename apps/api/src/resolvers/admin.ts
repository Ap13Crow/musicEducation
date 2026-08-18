import { requireRole } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const adminResolvers = {
  Query: {
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

  // Field resolvers on User that derive values not stored directly on the model.
  User: {
    // displayName lives on UserProfile; fall back to email prefix if no profile yet.
    displayName: (u: any) =>
      u.profile?.displayName ?? u.email?.split('@')[0] ?? 'Unknown',

    // username is not a separate DB field — use the email prefix as a stable handle.
    username: (u: any) => u.email?.split('@')[0] ?? u.id,

    // Prisma column is emailVerified; schema field is isEmailVerified.
    isEmailVerified: (u: any) => u.emailVerified ?? false,

    // avatarUrl comes from profile
    avatarUrl: (u: any) => u.profile?.avatarUrl ?? null,
  },
};
