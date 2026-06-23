import { requireAuth, requireRole } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

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
      const where: any = { isAvailable: true };
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
        prisma.teacherProfile.findMany({ where, skip, take: limit, orderBy: { avgRating: 'desc' } }),
        prisma.teacherProfile.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },

    async teacher(_: unknown, { id }: any, { prisma }: GraphQLContext) {
      return prisma.teacherProfile.findUnique({ where: { id }, include: { certifications: true, availability: true } });
    },

    async myAvailability(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.studentAvailability.findMany({ where: { userId: user!.id }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] });
    },
  },

  Mutation: {
    async updateProfile(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const { displayName, bio, city, country, instruments, musicStyles } = input;
      return prisma.user.update({
        where: { id: user.id },
        data: {
          profile: {
            upsert: {
              create: { displayName, bio, city, country, instruments: instruments ?? [], musicStyles: musicStyles ?? [] },
              update: { displayName, bio, city, country, instruments, musicStyles },
            },
          },
        },
        include: { profile: true, teacherProfile: true, gamification: true },
      });
    },

    async applyAsTeacher(_: unknown, _input: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const [teacherProfile] = await prisma.$transaction([
        prisma.teacherProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, instruments: [], musicStyles: [], languages: [] },
          update: {},
        }),
        prisma.user.update({ where: { id: user.id }, data: { role: 'TEACHER' } }),
      ]);
      return teacherProfile;
    },

    async updateTeacherProfile(_: unknown, args: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const { bio, hourlyRate, currency, instruments, musicStyles, languages, isAvailable, calendlyUsername } = args;
      return prisma.teacherProfile.update({
        where: { userId: user!.id },
        data: { bio, hourlyRate, currency, instruments, musicStyles, languages, isAvailable, calendlyUsername },
      });
    },

    async addCertification(_: unknown, { title, issuingBody, issuedYear, documentUrl }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
      if (!teacherProfile) throw new Error('Teacher profile not found.');
      return prisma.teacherCertification.create({
        data: { teacherProfileId: teacherProfile.id, title, issuingBody, issuedYear, documentUrl },
      });
    },

    async setAvailability(_: unknown, { slots }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
      if (!teacherProfile) throw new Error('Teacher profile not found.');
      await prisma.teacherAvailability.deleteMany({ where: { teacherProfileId: teacherProfile.id } });
      await prisma.teacherAvailability.createMany({
        data: slots.map((s: any) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, timezone: s.timezone ?? 'Europe/Zurich', teacherProfileId: teacherProfile.id })),
      });
      return prisma.teacherAvailability.findMany({ where: { teacherProfileId: teacherProfile.id } });
    },

    async setStudentAvailability(_: unknown, { slots }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
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
      const [nodes, totalCount] = await Promise.all([
        prisma.enrollment.findMany({ where, skip, take: limit }),
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
};
