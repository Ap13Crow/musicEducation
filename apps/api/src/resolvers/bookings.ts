import { GraphQLError } from 'graphql';
import { requireAuth } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const bookingResolvers = {
  Query: {
    async myBookings(_: unknown, { status, page = 1, limit = 20 }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      // Include both bookings where user is the student (userId) and where user is the teacher
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
      const where: any = {
        OR: [
          { userId: user.id },
          ...(teacherProfile ? [{ teacherProfileId: teacherProfile.id }] : []),
        ],
      };
      if (status) where.status = status;
      const skip = (page - 1) * limit;
      return prisma.booking.findMany({ where, skip, take: limit, orderBy: { startsAt: 'desc' } });
    },

    async booking(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const booking = await prisma.booking.findUnique({ where: { id }, include: { teacherProfile: true } });
      if (!booking) throw new GraphQLError('Booking not found.', { extensions: { code: 'NOT_FOUND' } });
      const isStudent = booking.userId === user.id;
      const isTeacher = booking.teacherProfile.userId === user.id;
      if (!isStudent && !isTeacher) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      return booking;
    },

    async teacherAvailability(_: unknown, { teacherProfileId }: any, { prisma }: GraphQLContext) {
      return prisma.teacherAvailability.findMany({ where: { teacherProfileId } });
    },
  },

  Mutation: {
    async bookSession(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const { teacherProfileId, startsAt, durationMin, format, instrument, notes } = input;

      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { id: teacherProfileId } });
      if (!teacherProfile) throw new GraphQLError('Teacher not found.', { extensions: { code: 'NOT_FOUND' } });
      if (!teacherProfile.isAvailable) throw new GraphQLError('Teacher is not available.', { extensions: { code: 'BAD_USER_INPUT' } });

      const startsAtDate = new Date(startsAt);
      const endsAt = new Date(startsAtDate.getTime() + durationMin * 60 * 1000);

      const conflict = await prisma.booking.findFirst({
        where: {
          teacherProfileId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAtDate } }],
        },
      });
      if (conflict) throw new GraphQLError('Time slot not available.', { extensions: { code: 'BAD_USER_INPUT' } });

      return prisma.booking.create({
        data: {
          userId: user.id,
          teacherProfileId,
          startsAt: startsAtDate,
          endsAt,
          durationMin,
          format,
          instrument,
          notes,
          status: teacherProfile.hourlyRate ? 'PENDING' : 'CONFIRMED',
        },
      });
    },

    async confirmBooking(_: unknown, { bookingId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { teacherProfile: true } });
      if (!booking) throw new GraphQLError('Booking not found.', { extensions: { code: 'NOT_FOUND' } });
      if (booking.teacherProfile.userId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      return prisma.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } });
    },

    async cancelBooking(_: unknown, { bookingId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { teacherProfile: true } });
      if (!booking) throw new GraphQLError('Booking not found.', { extensions: { code: 'NOT_FOUND' } });
      const isStudent = booking.userId === user.id;
      const isTeacher = booking.teacherProfile.userId === user.id;
      if (!isStudent && !isTeacher) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      return prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
    },

    async createZoomMeeting(_: unknown, { bookingId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { teacherProfile: true } });
      if (!booking) throw new GraphQLError('Booking not found.', { extensions: { code: 'NOT_FOUND' } });
      if (booking.teacherProfile.userId !== user.id) throw new GraphQLError('Only the teacher can create the Zoom meeting.', { extensions: { code: 'FORBIDDEN' } });

      const meetingId = `zoom-${bookingId}`;
      const joinUrl = `https://zoom.us/j/${meetingId}`;
      const startUrl = `https://zoom.us/s/${meetingId}`;

      await prisma.booking.update({
        where: { id: bookingId },
        data: { zoomMeetingId: meetingId, zoomJoinUrl: joinUrl, zoomStartUrl: startUrl },
      });

      return { meetingId, joinUrl, startUrl };
    },
  },

  Booking: {
    async student(booking: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.user.findUnique({ where: { id: booking.userId } });
    },
    async teacher(booking: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.teacherProfile.findUnique({ where: { id: booking.teacherProfileId } });
    },
    async payment(booking: any, _: unknown, { prisma }: GraphQLContext) {
      if (!booking.paymentId) return null;
      return prisma.payment.findUnique({ where: { id: booking.paymentId } });
    },
    async review(booking: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.review.findUnique({ where: { bookingId: booking.id } });
    },
  },
};
