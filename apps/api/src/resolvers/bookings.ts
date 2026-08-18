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

      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
        include: { user: { select: { role: true } } },
      });
      if (!teacherProfile) throw new GraphQLError('Teacher not found.', { extensions: { code: 'NOT_FOUND' } });
      if (teacherProfile.userId === user.id) {
        throw new GraphQLError('You cannot book a lesson with yourself.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // The TeacherProfile row outlives a demotion (it's history); the
      // current role is what decides whether they can still be booked.
      if (teacherProfile.user.role !== 'TEACHER') {
        throw new GraphQLError('Teacher not found.', { extensions: { code: 'NOT_FOUND' } });
      }
      if (!teacherProfile.isAvailable) throw new GraphQLError('Teacher is not available.', { extensions: { code: 'BAD_USER_INPUT' } });

      if (durationMin !== 60) {
        throw new GraphQLError('Lessons are booked in one-hour slots.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const startsAtDate = new Date(startsAt);
      if (Number.isNaN(startsAtDate.getTime()) || startsAtDate <= new Date()) {
        throw new GraphQLError('Choose a future lesson slot.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const endsAt = new Date(startsAtDate.getTime() + 60 * 60 * 1000);
      const availability = await prisma.teacherAvailability.findMany({ where: { teacherProfileId } });
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const matchesAvailability = availability.some((slot) => {
        const timezone = slot.timezone ?? 'Europe/Zurich';
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
        }).formatToParts(startsAtDate);
        const weekday = weekdayNames.indexOf(parts.find((part) => part.type === 'weekday')?.value ?? '');
        const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? -1);
        const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? -1);
        const requestedMinutes = hour * 60 + minute;
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        const slotStart = startHour * 60 + startMinute;
        const slotEnd = endHour * 60 + endMinute;
        return weekday === slot.dayOfWeek &&
          requestedMinutes >= slotStart &&
          requestedMinutes + 60 <= slotEnd &&
          (requestedMinutes - slotStart) % 60 === 0;
      });
      if (!matchesAvailability) {
        throw new GraphQLError('This time was not offered by the teacher.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

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
