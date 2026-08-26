import { requireAuth } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

// NOT currently wired into resolvers/index.ts's merged map: this resolves
// Query.recommendations, but schema.graphql declares no such field (and no
// RecommendationsResult/Recommendation type for its return shape) - wiring
// it as-is throws "Query.recommendations defined in resolvers, but not in
// schema" at server startup. Nothing in apps/web calls it either. Add the
// matching SDL (query + result type) as its own reviewable change before
// re-including this in the merge; don't just re-add it to the array.
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

      // Recommend teachers matching user's instruments. Only currently-TEACHER
      // users are recommendable — a demoted user's TeacherProfile row isn't
      // deleted (it's history), so role is what "is a teacher" means here.
      const teachers = await prisma.teacherProfile.findMany({
        where: {
          isPublic: true,
          isAvailable: true,
          user: { role: { in: ['TEACHER', 'ADMIN'] }, status: 'ACTIVE' },
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
