import { GraphQLError } from 'graphql';
import { requireAuth } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const assessmentResolvers = {
  Query: {
    async assessmentQuestions(_: unknown, { category, difficulty, instrument, limit = 20 }: any, { prisma }: GraphQLContext) {
      const where: any = {};
      if (category) where.category = category;
      if (difficulty) where.difficulty = difficulty;
      if (instrument) where.instrument = instrument;
      return prisma.assessmentQuestion.findMany({ where, take: limit });
    },

    async myAssessments(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.assessment.findMany({ where: { userId: user.id }, orderBy: { startedAt: 'desc' } });
    },
  },

  Mutation: {
    async startAssessment(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.assessment.create({ data: { userId: user.id } });
    },

    async submitAssessmentAnswer(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const { assessmentId, questionId, selectedOption, openAnswer, recordingId } = input;

      const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
      if (!assessment) throw new GraphQLError('Assessment not found.', { extensions: { code: 'NOT_FOUND' } });
      if (assessment.userId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      if (assessment.completedAt) throw new GraphQLError('Assessment already completed.', { extensions: { code: 'BAD_USER_INPUT' } });

      const question = await prisma.assessmentQuestion.findUnique({ where: { id: questionId } });
      if (!question) throw new GraphQLError('Question not found.', { extensions: { code: 'NOT_FOUND' } });

      let isCorrect: boolean | undefined;
      if (question.options && selectedOption) {
        const options = question.options as Array<{ id: string; isCorrect: boolean }>;
        isCorrect = options.find((o) => o.id === selectedOption)?.isCorrect ?? false;
      }

      return prisma.assessmentAnswer.create({
        data: { assessmentId, questionId, selectedOption, openAnswer, isCorrect },
      });
    },

    async completeAssessment(_: unknown, { assessmentId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: { answers: { include: { question: true } } },
      });
      if (!assessment) throw new GraphQLError('Assessment not found.', { extensions: { code: 'NOT_FOUND' } });
      if (assessment.userId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });

      const durationSec = Math.round((Date.now() - assessment.startedAt.getTime()) / 1000);
      const totalAnswered = assessment.answers.length;
      const correctAnswers = assessment.answers.filter((a) => a.isCorrect === true).length;
      const score = totalAnswered > 0 ? correctAnswers / totalAnswered : 0;

      // Determine skill level from score
      const skillLevel =
        score >= 0.9 ? 'PROFESSIONAL' :
        score >= 0.75 ? 'ADVANCED' :
        score >= 0.5 ? 'INTERMEDIATE' :
        score >= 0.25 ? 'ELEMENTARY' : 'BEGINNER';

      const xpAwarded = Math.round(score * 200);

      // Update gamification profile
      await prisma.gamificationProfile.update({
        where: { userId: user.id },
        data: { skillLevel, xp: { increment: xpAwarded }, totalPoints: { increment: xpAwarded } },
      });

      // Mark onboarding done
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: { onboardingDone: true },
      });

      return prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          completedAt: new Date(),
          durationSec,
          skillLevel,
          xpAwarded,
          aiReport: { score, correctAnswers, totalAnswered, skillLevel, feedback: 'Assessment completed. AI analysis pending.' },
        },
      });
    },
  },
};
