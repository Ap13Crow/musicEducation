import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { payOutMembershipShares, runMembershipSettlement } from '../lib/membershipRevenue.js';
import type { GraphQLContext } from '../types.js';

// Plus revenue share - teachers' earnings and the admin overview
// (rules: lib/membershipRevenue.ts).

const monthOf = (date: Date) => date.toISOString().slice(0, 7);

export const membershipRevenueResolvers = {
  Query: {
    async myMembershipEarnings(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
      if (!teacher) return [];
      const shares = await prisma.membershipTeacherShare.findMany({
        where: { teacherProfileId: teacher.id },
        include: { slice: { select: { periodStart: true } }, course: { select: { id: true, title: true } } },
      });
      const months = new Map<string, { month: string; amountCents: number; paidCents: number; completions: number; courses: Map<string, any> }>();
      for (const share of shares) {
        const key = monthOf(share.slice.periodStart);
        const month = months.get(key) ?? { month: key, amountCents: 0, paidCents: 0, completions: 0, courses: new Map() };
        month.amountCents += share.amountCents;
        if (share.paidAt) month.paidCents += share.amountCents;
        month.completions += 1;
        const course = month.courses.get(share.courseId) ?? { courseId: share.courseId, title: share.course.title, completions: 0, amountCents: 0 };
        course.completions += 1;
        course.amountCents += share.amountCents;
        month.courses.set(share.courseId, course);
        months.set(key, month);
      }
      return [...months.values()]
        .sort((a, b) => b.month.localeCompare(a.month))
        .map((month) => ({ ...month, courses: [...month.courses.values()].sort((a, b) => b.amountCents - a.amountCents) }));
    },

    async membershipRevenue(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const slices = await prisma.membershipRevenueSlice.findMany({
        include: { shares: { select: { amountCents: true, paidAt: true } } },
      });
      const months = new Map<string, any>();
      for (const slice of slices) {
        const key = monthOf(slice.periodStart);
        const month = months.get(key) ?? {
          month: key, memberMonths: 0, revenueCents: 0, teachersCents: 0, platformCents: 0, unsettledCents: 0, unpaidTeacherCents: 0, completions: 0,
        };
        month.memberMonths += 1;
        month.revenueCents += slice.amountCents;
        if (slice.settledAt) {
          const teachers = slice.shares.reduce((sum: number, share: { amountCents: number }) => sum + share.amountCents, 0);
          month.teachersCents += teachers;
          month.platformCents += slice.platformCents ?? slice.amountCents - teachers;
          month.unpaidTeacherCents += slice.shares
            .filter((share: { paidAt: Date | null }) => !share.paidAt)
            .reduce((sum: number, share: { amountCents: number }) => sum + share.amountCents, 0);
          month.completions += slice.shares.length;
        } else {
          month.unsettledCents += slice.amountCents;
        }
        months.set(key, month);
      }
      return [...months.values()].sort((a, b) => b.month.localeCompare(a.month));
    },
  },

  Mutation: {
    async runMembershipSettlement(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      try {
        return await runMembershipSettlement(prisma);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Settlement failed.');
      }
    },

    async payOutMembershipShares(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      try {
        return await payOutMembershipShares(prisma);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Payout failed.');
      }
    },
  },
};
