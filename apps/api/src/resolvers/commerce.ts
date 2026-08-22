import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  isValidPackageSize, isValidSubscriptionTermMonths,
  computeSubscriptionTotal, computeSubscriptionUndiscountedTotal, currentSubscriptionDiscountPct,
} from '../lib/pricing.js';
import { creditBalance } from '../lib/lessonCredits.js';
import type { GraphQLContext } from '../types.js';

async function requireOwnTeacherProfile(prisma: GraphQLContext['prisma'], userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId } });
  if (!teacherProfile) throw new GraphQLError('Teacher profile required.', { extensions: { code: 'BAD_USER_INPUT' } });
  return teacherProfile;
}

export const commerceResolvers = {
  Query: {
    async teacherPackageOffers(_: unknown, { teacherProfileId }: any, { prisma, user }: GraphQLContext) {
      const isOwnerOrAdmin = Boolean(user) && (user!.role === 'ADMIN' || await prisma.teacherProfile.findUnique({ where: { id: teacherProfileId } }).then((tp) => tp?.userId === user!.id));
      return prisma.lessonPackageOffer.findMany({
        where: { teacherProfileId, ...(isOwnerOrAdmin ? {} : { isPublished: true }) },
        orderBy: { lessonCount: 'asc' },
      });
    },

    async teacherSubscriptionOffers(_: unknown, { teacherProfileId }: any, { prisma, user }: GraphQLContext) {
      const isOwnerOrAdmin = Boolean(user) && (user!.role === 'ADMIN' || await prisma.teacherProfile.findUnique({ where: { id: teacherProfileId } }).then((tp) => tp?.userId === user!.id));
      return prisma.subscriptionOffer.findMany({
        where: { teacherProfileId, ...(isOwnerOrAdmin ? {} : { isPublished: true }) },
        orderBy: { termMonths: 'asc' },
      });
    },

    async myPackagePurchases(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.lessonPackagePurchase.findMany({ where: { userId: user.id }, orderBy: { purchasedAt: 'desc' } });
    },

    async mySubscriptionPurchases(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.subscriptionPurchase.findMany({ where: { userId: user.id }, orderBy: { startsAt: 'desc' } });
    },
  },

  Mutation: {
    async createPackageOffer(_: unknown, { instrument, lessonCount, pricePerPackage, currency }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      if (!isValidPackageSize(lessonCount)) {
        throw new GraphQLError('lessonCount must be 5, 10, or 20.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (!(pricePerPackage > 0)) throw new GraphQLError('pricePerPackage must be positive.', { extensions: { code: 'BAD_USER_INPUT' } });
      const teacherProfile = await requireOwnTeacherProfile(prisma, user!.id);
      return prisma.lessonPackageOffer.create({
        data: { teacherProfileId: teacherProfile.id, instrument: instrument?.trim() || null, lessonCount, pricePerPackage, currency: currency ?? teacherProfile.currency },
      });
    },

    async updatePackageOffer(_: unknown, { id, pricePerPackage, isPublished }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const offer = await prisma.lessonPackageOffer.findUnique({ where: { id }, include: { teacherProfile: true } });
      if (!offer) throw new GraphQLError('Offer not found.', { extensions: { code: 'NOT_FOUND' } });
      if (user!.role !== 'ADMIN' && offer.teacherProfile.userId !== user!.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      const data: Record<string, unknown> = {};
      if (pricePerPackage !== undefined) {
        if (!(pricePerPackage > 0)) throw new GraphQLError('pricePerPackage must be positive.', { extensions: { code: 'BAD_USER_INPUT' } });
        data.pricePerPackage = pricePerPackage;
      }
      if (isPublished !== undefined) data.isPublished = isPublished;
      // Editing/unpublishing an offer never touches LessonPackagePurchase
      // rows already sold - each one snapshotted its own terms at checkout.
      return prisma.lessonPackageOffer.update({ where: { id }, data });
    },

    async deletePackageOffer(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const offer = await prisma.lessonPackageOffer.findUnique({ where: { id }, include: { teacherProfile: true, _count: { select: { purchases: true } } } });
      if (!offer) return true;
      if (user!.role !== 'ADMIN' && offer.teacherProfile.userId !== user!.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      if (offer._count.purchases > 0) {
        throw new GraphQLError('This offer has purchases and cannot be deleted - unpublish it instead.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      await prisma.lessonPackageOffer.delete({ where: { id } });
      return true;
    },

    async createSubscriptionOffer(_: unknown, { includedHoursPerMonth, termMonths, monthlyPrice, currency, includedCourseIds }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      if (!isValidSubscriptionTermMonths(termMonths)) {
        throw new GraphQLError('termMonths must be 6 or 12.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (!Number.isInteger(includedHoursPerMonth) || includedHoursPerMonth <= 0) {
        throw new GraphQLError('includedHoursPerMonth must be a positive integer.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (!(monthlyPrice > 0)) throw new GraphQLError('monthlyPrice must be positive.', { extensions: { code: 'BAD_USER_INPUT' } });
      const teacherProfile = await requireOwnTeacherProfile(prisma, user!.id);
      // Bundled courses must actually belong to this teacher - otherwise a
      // subscription could grant access to someone else's paid content.
      if (includedCourseIds?.length) {
        const owned = await prisma.course.count({ where: { id: { in: includedCourseIds }, teacherProfileId: teacherProfile.id } });
        if (owned !== includedCourseIds.length) {
          throw new GraphQLError('includedCourseIds must all belong to this teacher.', { extensions: { code: 'BAD_USER_INPUT' } });
        }
      }
      return prisma.subscriptionOffer.create({
        data: {
          teacherProfileId: teacherProfile.id, includedHoursPerMonth, termMonths, monthlyPrice,
          currency: currency ?? teacherProfile.currency, includedCourseIds: includedCourseIds ?? [],
        },
      });
    },

    async updateSubscriptionOffer(_: unknown, { id, monthlyPrice, includedCourseIds, isPublished }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const offer = await prisma.subscriptionOffer.findUnique({ where: { id }, include: { teacherProfile: true } });
      if (!offer) throw new GraphQLError('Offer not found.', { extensions: { code: 'NOT_FOUND' } });
      if (user!.role !== 'ADMIN' && offer.teacherProfile.userId !== user!.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      const data: Record<string, unknown> = {};
      if (monthlyPrice !== undefined) {
        if (!(monthlyPrice > 0)) throw new GraphQLError('monthlyPrice must be positive.', { extensions: { code: 'BAD_USER_INPUT' } });
        data.monthlyPrice = monthlyPrice;
      }
      if (includedCourseIds !== undefined) {
        if (includedCourseIds.length) {
          const owned = await prisma.course.count({ where: { id: { in: includedCourseIds }, teacherProfileId: offer.teacherProfileId } });
          if (owned !== includedCourseIds.length) {
            throw new GraphQLError('includedCourseIds must all belong to this teacher.', { extensions: { code: 'BAD_USER_INPUT' } });
          }
        }
        data.includedCourseIds = includedCourseIds;
      }
      if (isPublished !== undefined) data.isPublished = isPublished;
      // Same rule as packages: existing SubscriptionPurchase rows keep
      // their own snapshot regardless of later offer edits.
      return prisma.subscriptionOffer.update({ where: { id }, data });
    },

    async deleteSubscriptionOffer(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const offer = await prisma.subscriptionOffer.findUnique({ where: { id }, include: { teacherProfile: true, _count: { select: { purchases: true } } } });
      if (!offer) return true;
      if (user!.role !== 'ADMIN' && offer.teacherProfile.userId !== user!.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      if (offer._count.purchases > 0) {
        throw new GraphQLError('This offer has purchases and cannot be deleted - unpublish it instead.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      await prisma.subscriptionOffer.delete({ where: { id } });
      return true;
    },

    async cancelSubscription(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const purchase = await prisma.subscriptionPurchase.findUnique({ where: { id } });
      if (!purchase) throw new GraphQLError('Subscription not found.', { extensions: { code: 'NOT_FOUND' } });
      if (purchase.userId !== user.id && user.role !== 'ADMIN') throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      if (purchase.status !== 'ACTIVE') return purchase;
      // Immediate cancellation, no proration/refund - see the decision
      // list in apps/api/src/lib/pricing.ts.
      return prisma.subscriptionPurchase.update({ where: { id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
    },
  },

  LessonPackageOffer: {
    pricePerLesson(offer: any) {
      return Math.round((Number(offer.pricePerPackage) / offer.lessonCount) * 100) / 100;
    },
  },

  LessonPackagePurchase: {
    async creditBalance(purchase: any, _: unknown, { prisma }: GraphQLContext) {
      return creditBalance(prisma as any, purchase.id);
    },
    async teacherProfile(purchase: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.teacherProfile.findUnique({ where: { id: purchase.teacherProfileId } });
    },
  },

  SubscriptionOffer: {
    async upfrontDiscountPct(offer: any, _: unknown, { prisma }: GraphQLContext) {
      return currentSubscriptionDiscountPct(prisma, offer.termMonths as 6 | 12);
    },
    async upfrontTotal(offer: any, _: unknown, { prisma }: GraphQLContext) {
      const pct = await currentSubscriptionDiscountPct(prisma, offer.termMonths as 6 | 12);
      return computeSubscriptionTotal(Number(offer.monthlyPrice), offer.termMonths, pct);
    },
    undiscountedTotal(offer: any) {
      return computeSubscriptionUndiscountedTotal(Number(offer.monthlyPrice), offer.termMonths);
    },
  },

  SubscriptionPurchase: {
    async teacherProfile(purchase: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.teacherProfile.findUnique({ where: { id: purchase.teacherProfileId } });
    },
  },
};
