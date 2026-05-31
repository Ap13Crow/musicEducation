import { requireAuth } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const recommendationResolvers = {
  Query: {
    async recommendations(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);

      const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
      const gamification = await prisma.gamificationProfile.findUnique({ where: { userId: user.id } });
      const latestAssessment = await prisma.assessment.findFirst({
        where: { userId: user.id, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
      });

      const instruments = profile?.instruments ?? [];
      const musicStyles = profile?.musicStyles ?? [];
      const skillLevel = gamification?.skillLevel ?? 'BEGINNER';

      // Recommend courses matching user's instruments/styles and skill level
      const courses = await prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          level: skillLevel,
          ...(instruments.length > 0 && { instruments: { hasSome: instruments } }),
        },
        take: 5,
        orderBy: { avgRating: 'desc' },
      });

      // Recommend teachers matching user's instruments
      const teachers = await prisma.teacherProfile.findMany({
        where: {
          isAvailable: true,
          ...(instruments.length > 0 && { instruments: { hasSome: instruments } }),
        },
        take: 5,
        orderBy: { avgRating: 'desc' },
      });

      // Recommend upcoming events matching user's instruments/styles
      const events = await prisma.event.findMany({
        where: {
          isPublished: true,
          startsAt: { gte: new Date() },
          ...(instruments.length > 0 && { instruments: { hasSome: instruments } }),
          ...(musicStyles.length > 0 && { musicStyles: { hasSome: musicStyles } }),
        },
        take: 5,
        orderBy: { startsAt: 'asc' },
      });

      const rationale = latestAssessment?.aiReport
        ? `Based on your ${skillLevel.toLowerCase()} assessment results and interests in ${instruments.join(', ')}.`
        : `Based on your profile preferences for ${instruments.join(', ')}.`;

      return { courses, teachers, events, rationale };
    },
  },
};
