import { GraphQLError } from 'graphql';
import { requireAuth } from '../middleware/auth.js';
import { aiChat } from '../lib/ai.js';
import type { GraphQLContext } from '../types.js';

async function generateAssessmentReport(
  skillLevel: string,
  correctAnswers: number,
  totalAnswered: number,
  instruments: string[],
): Promise<string> {
  const deterministicSummary = `You answered ${correctAnswers} of ${totalAnswered} questions correctly, placing you at ${skillLevel.toLowerCase()} level.`;
  if (totalAnswered === 0) return deterministicSummary;

  const ai = await aiChat(
    'You are a supportive music education coach writing a short (2-3 sentence) assessment result for a student who just ' +
      'completed an onboarding quiz on theory and musical culture. Be encouraging, specific, and suggest one concrete next ' +
      'step (a course topic or practice focus). Do not repeat the raw score back verbatim - interpret it.',
    `Skill level: ${skillLevel}. Score: ${correctAnswers}/${totalAnswered} correct. ` +
      `Instruments: ${instruments.length > 0 ? instruments.join(', ') : 'not yet specified'}.`,
  );
  // aiChat returns null when no provider is configured or the call failed -
  // never block onboarding completion on an optional, advisory-only feature.
  return ai ?? deterministicSummary;
}

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
      const { assessmentId, questionId, selectedOption, openAnswer } = input;

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

      // Upsert, not create: revisiting a question (e.g. going back a step)
      // must replace the prior answer, not add a second row that would
      // inflate completeAssessment's totalAnswered count.
      return prisma.assessmentAnswer.upsert({
        where: { assessmentId_questionId: { assessmentId, questionId } },
        create: { assessmentId, questionId, selectedOption, openAnswer, isCorrect },
        update: { selectedOption, openAnswer, isCorrect },
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

      const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
      const feedback = await generateAssessmentReport(skillLevel, correctAnswers, totalAnswered, profile?.instruments ?? []);

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
          aiReport: JSON.stringify({ score, correctAnswers, totalAnswered, skillLevel, feedback }),
        },
      });
    },
  },

  // The DB column is `prompt` (see schema.prisma) but the public field is
  // `question` - there was no mapping here before, so this field silently
  // resolved to null (violating its own String! type) the moment anything
  // actually queried it, which nothing did until this work package.
  AssessmentQuestion: {
    question: (q: any) => q.prompt,
  },
};
