import { requireAuth } from '../middleware/auth.js';
import { awardXpOnce } from './xp.js';
import type { GraphQLContext } from '../types.js';

// Matches the same reason/amount used for a native ticketed event in
// payments.ts's handleStripeWebhook - one shared "attended and reviewed an
// event" award regardless of whether the event was native or external.
// refId is namespaced ("external:<id>") so it can never collide with a
// native Event.id under the same (userId, reason, refId) idempotency key.
const EVENT_ATTENDED_XP = 40;

export const reviewResolvers = {
  Query: {
    // Root-level browsing query, filtered by a course, event, booking or
    // teacher profile (schema.graphql) - same shape and same
    // isPublic-only visibility as the nested Course.reviews/Event.reviews
    // field resolvers (courses.ts/events.ts), just reachable without
    // already holding a Course/Event object. Found orphaned (declared
    // non-null in the SDL, no resolver at all) during the Phase 8
    // schema/resolver audit - unused by the current frontend (which reads
    // through the nested fields instead), but a real
    // "Cannot return null for non-nullable field" trap for any other client.
    async reviews(_: unknown, { courseId, eventId, bookingId, teacherProfileId, page = 1, limit = 10 }: any, { prisma }: GraphQLContext) {
      const where: any = { isPublic: true };
      if (courseId) where.courseId = courseId;
      if (eventId) where.eventId = eventId;
      if (bookingId) where.bookingId = bookingId;
      if (teacherProfileId) where.booking = { teacherProfileId };
      const skip = (page - 1) * limit;
      const [nodes, totalCount] = await Promise.all([
        prisma.review.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.review.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },
  },

  Mutation: {
    async createReview(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const { rating, comment, courseId, eventId, bookingId, externalEventProjectionId } = input;

      if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5.');

      if (courseId) {
        const enrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: user.id, courseId } },
        });
        if (!enrollment) throw new Error('You must be enrolled in this course to review it.');
      }
      if (bookingId) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.userId !== user.id) throw new Error('Access denied.');
        if (booking.status !== 'COMPLETED') throw new Error('You can only review completed bookings.');
      }
      if (externalEventProjectionId) {
        const engagement = await prisma.externalEventEngagement.findUnique({
          where: { userId_externalEventProjectionId: { userId: user.id, externalEventProjectionId } },
        });
        if (!engagement?.attendanceConfirmedAt) {
          throw new Error('Confirm your attendance before evaluating this event.');
        }
      }

      const review = await prisma.review.create({
        // Prisma/DB column is `body` - the public GraphQL field is `comment`
        // (see Review.comment field resolver below, which reads it back out).
        data: { userId: user.id, rating, body: comment, courseId, eventId, bookingId, externalEventProjectionId },
      });

      // Evaluating a confirmed-attended external event is what credits XP
      // (confirm participation -> evaluate -> get points) - awardXpOnce's
      // own (userId, reason, refId) uniqueness makes this safe even if the
      // review mutation is somehow retried.
      if (externalEventProjectionId) {
        await awardXpOnce(prisma, user.id, 'EVENT_ATTENDED', `external:${externalEventProjectionId}`, EVENT_ATTENDED_XP);
        await prisma.externalEventEngagement.update({
          where: { userId_externalEventProjectionId: { userId: user.id, externalEventProjectionId } },
          data: { xpAwardedAt: new Date() },
        });
      }

      if (courseId) {
        const agg = await prisma.review.aggregate({ where: { courseId }, _avg: { rating: true }, _count: true });
        await prisma.course.update({
          where: { id: courseId },
          data: { avgRating: agg._avg.rating ?? 0, totalReviews: agg._count },
        });
      }
      if (bookingId) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (booking) {
          const teacherProfile = await prisma.teacherProfile.findUnique({ where: { id: booking.teacherProfileId } });
          if (teacherProfile) {
            const teacherBookingIds = await prisma.booking
              .findMany({ where: { teacherProfileId: teacherProfile.id, status: 'COMPLETED' }, select: { id: true } })
              .then((b) => b.map((x) => x.id));
            const agg = await prisma.review.aggregate({
              where: { bookingId: { in: teacherBookingIds } },
              _avg: { rating: true },
              _count: true,
            });
            await prisma.teacherProfile.update({
              where: { id: teacherProfile.id },
              data: { avgRating: agg._avg.rating ?? 0, totalReviews: agg._count },
            });
          }
        }
      }

      return review;
    },
  },

  Review: {
    async author(review: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.user.findUnique({ where: { id: review.userId } });
    },
    // Pre-existing field-name mismatch: the DB column is `body` (see
    // schema.prisma), the public GraphQL field is `comment` - the default
    // resolver would otherwise always read the nonexistent `review.comment`
    // and return null regardless of what was actually saved.
    comment(review: any) {
      return review.body ?? null;
    },
  },
};
