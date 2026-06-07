import { requireAuth } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const reviewResolvers = {
  Mutation: {
    async createReview(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const { rating, body, courseId, eventId, bookingId } = input;

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

      const review = await prisma.review.create({
        data: { userId: user.id, rating, body, courseId, eventId, bookingId },
      });

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
  },
};
