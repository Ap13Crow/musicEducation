import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';
import { completeLessonForUser, requireOwnedCourse, resolveLessonAccess } from './courses.js';

// A QuizAnswer's isCorrect/pointsAwarded are graded and stored the moment a
// student submits, but must not be *exposed* until the lesson's feedbackMode
// (or attempt completion) says so — otherwise a "feedback at the end" quiz
// would leak correctness through the per-question mutation response. `_revealed`
// is attached in this file's own resolvers, never sent to the client itself,
// and read back by the QuizAnswer field resolvers below.
function withReveal(answer: any, revealed: boolean) {
  return { ...answer, _revealed: revealed };
}

export const quizResolvers = {
  Query: {
    async myQuizAttempt(_: unknown, { lessonId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.quizAttempt.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId } } });
    },
  },

  Mutation: {
    async createQuizQuestion(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId }, include: { section: true } });
      if (!lesson) throw new GraphQLError('Lesson not found.', { extensions: { code: 'NOT_FOUND' } });
      await requireOwnedCourse(prisma, user!, lesson.section.courseId);
      const { options, ...data } = input;
      return prisma.quizQuestion.create({
        data: {
          ...data,
          options: { create: (options ?? []).map((o: any, i: number) => ({ text: o.text, isCorrect: Boolean(o.isCorrect), order: i })) },
        },
        include: { options: true },
      });
    },

    async updateQuizQuestion(_: unknown, { id, input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const question = await prisma.quizQuestion.findUnique({ where: { id }, include: { lesson: { include: { section: true } } } });
      if (!question) throw new GraphQLError('Question not found.', { extensions: { code: 'NOT_FOUND' } });
      await requireOwnedCourse(prisma, user!, question.lesson.section.courseId);
      const { options, ...data } = input;
      if (options) {
        // Full replace: simplest way to keep option order/ids consistent
        // with whatever the builder UI just submitted.
        await prisma.$transaction([
          prisma.quizOption.deleteMany({ where: { questionId: id } }),
          prisma.quizQuestion.update({
            where: { id },
            data: { ...data, options: { create: options.map((o: any, i: number) => ({ text: o.text, isCorrect: Boolean(o.isCorrect), order: i })) } },
          }),
        ]);
      } else {
        await prisma.quizQuestion.update({ where: { id }, data });
      }
      return prisma.quizQuestion.findUnique({ where: { id }, include: { options: true } });
    },

    async deleteQuizQuestion(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const question = await prisma.quizQuestion.findUnique({ where: { id }, include: { lesson: { include: { section: true } } } });
      if (!question) return true;
      await requireOwnedCourse(prisma, user!, question.lesson.section.courseId);
      await prisma.quizQuestion.delete({ where: { id } });
      return true;
    },

    async startQuizAttempt(_: unknown, { lessonId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
      if (!lesson) throw new GraphQLError('Lesson not found.', { extensions: { code: 'NOT_FOUND' } });
      const { allowed } = await resolveLessonAccess(prisma, user, lesson);
      if (!allowed) throw new GraphQLError('Enroll in this course to take the quiz.', { extensions: { code: 'FORBIDDEN' } });

      const existing = await prisma.quizAttempt.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId } } });
      if (existing && !existing.completedAt) return existing;
      if (existing) {
        // Retake: clear previous answers and reset the attempt in place.
        await prisma.quizAnswer.deleteMany({ where: { attemptId: existing.id } });
        return prisma.quizAttempt.update({ where: { id: existing.id }, data: { score: 0, maxScore: 0, completedAt: null } });
      }
      return prisma.quizAttempt.create({ data: { userId: user.id, lessonId } });
    },

    async submitQuizAnswer(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const attempt = await prisma.quizAttempt.findUnique({ where: { id: input.attemptId } });
      if (!attempt || attempt.userId !== user.id) throw new GraphQLError('Attempt not found.', { extensions: { code: 'NOT_FOUND' } });
      if (attempt.completedAt) throw new GraphQLError('This attempt is already submitted.', { extensions: { code: 'BAD_USER_INPUT' } });

      const question = await prisma.quizQuestion.findUnique({ where: { id: input.questionId }, include: { options: true } });
      if (!question || question.lessonId !== attempt.lessonId) {
        throw new GraphQLError('Question not found.', { extensions: { code: 'NOT_FOUND' } });
      }

      // Graded server-side against the DB's isCorrect flags - the client
      // only ever sends which option ids it picked, never a verdict.
      const correctIds = new Set(question.options.filter((o: any) => o.isCorrect).map((o: any) => o.id));
      const selectedIds: string[] = input.selectedOptionIds ?? [];
      const selected = new Set(selectedIds);
      const isCorrect = correctIds.size === selected.size && [...correctIds].every((id) => selected.has(id));
      const pointsAwarded = isCorrect ? question.points : 0;

      const answer = await prisma.quizAnswer.upsert({
        where: { attemptId_questionId: { attemptId: attempt.id, questionId: question.id } },
        update: { selectedOptionIds: selectedIds, isCorrect, pointsAwarded },
        create: { attemptId: attempt.id, questionId: question.id, selectedOptionIds: selectedIds, isCorrect, pointsAwarded },
      });

      const lesson = await prisma.lesson.findUnique({ where: { id: attempt.lessonId } });
      return withReveal(answer, lesson?.feedbackMode === 'IMMEDIATE');
    },

    async completeQuizAttempt(_: unknown, { attemptId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
      if (!attempt || attempt.userId !== user.id) throw new GraphQLError('Attempt not found.', { extensions: { code: 'NOT_FOUND' } });
      if (attempt.completedAt) return attempt;

      const [answers, questions] = await Promise.all([
        prisma.quizAnswer.findMany({ where: { attemptId } }),
        prisma.quizQuestion.findMany({ where: { lessonId: attempt.lessonId } }),
      ]);
      const score = answers.reduce((sum: number, a: any) => sum + a.pointsAwarded, 0);
      const maxScore = questions.reduce((sum: number, q: any) => sum + q.points, 0);

      const updated = await prisma.quizAttempt.update({ where: { id: attemptId }, data: { score, maxScore, completedAt: new Date() } });

      // Finishing the quiz completes its lesson too - same progress/XP path
      // a video lesson uses when marked watched.
      await completeLessonForUser(prisma, user.id, attempt.lessonId);

      return updated;
    },
  },

  QuizQuestion: {
    async options(question: any, _: unknown, { prisma }: GraphQLContext) {
      if (question.options) return question.options;
      return prisma.quizOption.findMany({ where: { questionId: question.id }, orderBy: { order: 'asc' } });
    },
    async correctOptionIds(question: any, _: unknown, { prisma, user }: GraphQLContext) {
      const lesson = await prisma.lesson.findUnique({ where: { id: question.lessonId } });
      if (!lesson) return [];
      const { isOwner } = await resolveLessonAccess(prisma, user, lesson);
      if (!isOwner) return [];
      const options = question.options ?? (await prisma.quizOption.findMany({ where: { questionId: question.id } }));
      return options.filter((o: any) => o.isCorrect).map((o: any) => o.id);
    },
  },

  QuizAttempt: {
    async answers(attempt: any, _: unknown, { prisma }: GraphQLContext) {
      const [answers, lesson] = await Promise.all([
        prisma.quizAnswer.findMany({ where: { attemptId: attempt.id }, orderBy: { answeredAt: 'asc' } }),
        prisma.lesson.findUnique({ where: { id: attempt.lessonId } }),
      ]);
      const revealed = Boolean(attempt.completedAt) || lesson?.feedbackMode === 'IMMEDIATE';
      return answers.map((a: any) => withReveal(a, revealed));
    },
  },

  QuizAnswer: {
    isCorrect: (answer: any) => (answer._revealed ? answer.isCorrect : null),
    pointsAwarded: (answer: any) => (answer._revealed ? answer.pointsAwarded : null),
  },
};
