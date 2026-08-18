import { GraphQLError } from 'graphql';
import { Prisma } from '@my-music-coach/database';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

const COURSE_BONUS_MIN_KEY = 'xp.courseBonus.min';
const COURSE_BONUS_MAX_KEY = 'xp.courseBonus.max';
const DEFAULT_COURSE_BONUS_MIN = 5;
const DEFAULT_COURSE_BONUS_MAX = 200;

// Automatic, one-time-per-key XP grants (profile completion, first teacher
// booking, event attendance). `refId` is the idempotency key: the unique
// index on (userId, reason, refId) makes a second call for the same key a
// silent no-op (P2002) rather than double-incrementing the ledger and
// GamificationProfile - callers don't need to check-before-award themselves.
export async function awardXpOnce(
  prisma: GraphQLContext['prisma'],
  userId: string,
  reason: 'PROFILE_COMPLETED' | 'TEACHER_FOUND' | 'EVENT_ATTENDED',
  refId: string,
  amount: number,
): Promise<void> {
  try {
    await prisma.$transaction([
      prisma.xpAward.create({ data: { userId, reason, refId, amount } }),
      prisma.gamificationProfile.update({
        where: { userId },
        data: { xp: { increment: amount }, totalPoints: { increment: amount } },
      }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return;
    throw err;
  }
}

export function isValidCourseBonusAmount(amount: unknown, min: number, max: number): boolean {
  return Number.isInteger(amount) && (amount as number) >= min && (amount as number) <= max;
}

// AdminSetting values are free-text (see updateAdminSetting) - normalize
// each bound to a non-negative integer, falling back to the default on
// anything unparseable, and finally clamp max >= min. Without this, a
// misconfigured pair (e.g. min=200, max=5) would make isValidCourseBonusAmount
// reject every possible amount, silently locking teachers/admins out of
// awarding course bonus XP at all.
function normalizeBound(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.round(parsed));
}

async function courseBonusBounds(prisma: GraphQLContext['prisma']) {
  const rows = await prisma.adminSetting.findMany({
    where: { key: { in: [COURSE_BONUS_MIN_KEY, COURSE_BONUS_MAX_KEY] } },
  });
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const min = normalizeBound(byKey[COURSE_BONUS_MIN_KEY], DEFAULT_COURSE_BONUS_MIN);
  const max = normalizeBound(byKey[COURSE_BONUS_MAX_KEY], DEFAULT_COURSE_BONUS_MAX);
  return { min, max: Math.max(min, max) };
}

export const xpResolvers = {
  Query: {
    async myXpAwards(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.xpAward.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    },

    async xpAwardBounds(_: unknown, __: unknown, { prisma }: GraphQLContext) {
      return courseBonusBounds(prisma);
    },
  },

  Mutation: {
    // Teacher/admin-awarded bonus for course engagement/completion - the one
    // XP source that's a human judgment call rather than an automatic
    // trigger, per product decision. Repeatable (no idempotency key): a
    // teacher may award it more than once over a course.
    async awardCourseXp(_: unknown, { enrollmentId, amount, note }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { course: { include: { teacherProfile: true } } },
      });
      if (!enrollment) throw new GraphQLError('Enrollment not found.', { extensions: { code: 'NOT_FOUND' } });
      if (user!.role !== 'ADMIN' && enrollment.course.teacherProfile?.userId !== user!.id) {
        throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      }

      const { min, max } = await courseBonusBounds(prisma);
      if (!isValidCourseBonusAmount(amount, min, max)) {
        throw new GraphQLError(`Amount must be a whole number between ${min} and ${max}.`, { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const [award] = await prisma.$transaction([
        prisma.xpAward.create({
          data: {
            userId: enrollment.userId,
            reason: 'COURSE_BONUS',
            enrollmentId,
            amount,
            note: note ?? null,
            awardedBy: user!.id,
          },
        }),
        prisma.gamificationProfile.update({
          where: { userId: enrollment.userId },
          data: { xp: { increment: amount }, totalPoints: { increment: amount } },
        }),
      ]);
      return award;
    },
  },
};
