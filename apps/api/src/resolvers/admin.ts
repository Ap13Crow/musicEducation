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
          { displayName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ];
      }
      return prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

    async adminUpdateUserRole(_: unknown, { userId, role }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const validRoles = ['GUEST', 'STUDENT', 'TEACHER', 'ADMIN'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
      return prisma.user.update({ where: { id: userId }, data: { role } });
    },

    async adminDeleteUser(_: unknown, { userId }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      if (userId === user!.id) {
        throw new Error('Cannot delete your own account.');
      }
      await prisma.user.delete({ where: { id: userId } });
      return true;
    },
  },
};
