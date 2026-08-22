import { GraphQLError } from 'graphql';
import { requireRole } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const adminResolvers = {
  Query: {
    // Public (no requireRole) - the homepage's headline counters. Scoped to
    // what's actually live rather than raw table counts: PUBLISHED courses
    // only, upcoming events (native isPublished + startsAt in the future,
    // external not yet expired) so a page full of past events doesn't
    // inflate the count, STUDENT-role users, and teachers counted the same
    // way the public `teachers`/`teacher` queries do: a TeacherProfile row
    // for whoever currently holds the TEACHER or ADMIN role. A
    // TeacherProfile row is never deleted on demotion (it's history), so a
    // raw table count would include stale profiles for users no longer
    // discoverable as teachers at all.
    async platformStats(_: unknown, __: unknown, { prisma }: GraphQLContext) {
      const now = new Date();
      const [totalCourses, totalTeachers, totalStudents, nativeEvents, externalEvents] = await Promise.all([
        prisma.course.count({ where: { status: 'PUBLISHED' } }),
        prisma.teacherProfile.count({ where: { user: { role: { in: ['TEACHER', 'ADMIN'] } } } }),
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

    async mailOutbox(_: unknown, { status, limit = 100 }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const safeLimit = Math.max(1, Math.min(limit, 200));
      return prisma.mailOutboxMessage.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
      });
    },

    async adminStats(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      // totalTeachers is scoped the same way platformStats (above) is, and
      // for the same reason: a TeacherProfile row is never deleted on
      // demotion, so a raw prisma.teacherProfile.count() also counts every
      // stale profile left behind by a user who no longer holds the
      // TEACHER/ADMIN role - this admin tile was written independently of
      // platformStats and never got that fix, so it silently drifted out
      // of sync with the (correct) public homepage number.
      //
      // totalUsers/totalCourses/totalEvents/totalBookings/totalRevenue stay
      // (or, for totalEvents, become) raw, unfiltered totals - deliberately
      // *broader* than platformStats' "what's currently live" homepage
      // figure. Unlike a stale TeacherProfile, a DRAFT/ARCHIVED course or a
      // past/unpublished native event is real content an admin legitimately
      // wants the true count of, not a data-integrity artifact to filter
      // out. totalEvents does still gain the external-event count it was
      // missing entirely before (see externalEvents below) - that omission
      // was a real gap, not an intentional narrower scope.
      const [totalUsers, totalTeachers, totalCourses, nativeEvents, externalEvents, totalBookings, revenueAgg] =
        await Promise.all([
          prisma.user.count(),
          prisma.teacherProfile.count({ where: { user: { role: { in: ['TEACHER', 'ADMIN'] } } } }),
          prisma.course.count(),
          prisma.event.count(),
          prisma.externalEventProjection.count(),
          prisma.booking.count(),
          prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCEEDED' } }),
        ]);
      return {
        totalUsers,
        totalTeachers,
        totalCourses,
        totalEvents: nativeEvents + externalEvents,
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

    async retryMailOutboxMessage(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const message = await prisma.mailOutboxMessage.findUnique({ where: { id } });
      if (!message) throw new GraphQLError('Mail message not found.', { extensions: { code: 'NOT_FOUND' } });
      return prisma.mailOutboxMessage.update({
        where: { id },
        data: { status: 'PENDING', attempts: 0, lastError: null, nextAttemptAt: new Date() },
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
