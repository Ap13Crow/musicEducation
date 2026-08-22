import { GraphQLError } from 'graphql';
import { requireAuth } from '../middleware/auth.js';
import { awardXpOnce } from './xp.js';
import { bookingConfirmedEmailContent } from '../lib/emails.js';
import { enqueueMail, recipientAddresses } from '../lib/mailOutbox.js';
import type { GraphQLContext } from '../types.js';
import type { Prisma } from '@my-music-coach/database';

const TEACHER_FOUND_XP = 30;

// Shared by bookSession (auto-confirmed when the teacher has no hourly rate)
// and confirmBooking (a paid booking the teacher just accepted) - both are
// "this booking just became CONFIRMED" moments, and both notify the same
// two people. Writes into the durable mail outbox (apps/worker delivers it)
// inside the SAME transaction as the booking write, rather than calling the
// SMTP relay directly - actual delivery (the thing that can be "temporarily
// unavailable") now happens entirely out-of-band in the worker, so this
// booking transaction never touches the mail provider at all. It commits
// atomically with the booking create/update: a booking is never left
// CONFIRMED with no queued notification, and a rolled-back booking never
// leaves an orphan outbox row. Pass the active transaction client.
export async function notifyBookingConfirmed(tx: Prisma.TransactionClient, bookingId: string) {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    include: { user: { include: { profile: true } }, teacherProfile: { include: { user: { include: { profile: true } } } } },
  });
  if (!booking) return;
  // Same displayName fallback chain as the User.displayName field resolver
  // in users.ts (profile.displayName -> local part of the email -> generic).
  const studentName = booking.user.profile?.displayName || booking.user.email?.split('@')[0] || 'there';
  const teacherName = booking.teacherProfile.user.profile?.displayName || booking.teacherProfile.user.email?.split('@')[0] || 'there';
  const content = bookingConfirmedEmailContent({
    studentName,
    teacherName,
    startsAt: booking.startsAt,
    durationMin: booking.durationMin,
    format: booking.format,
    instrument: booking.instrument,
  });
  const studentRecipients = recipientAddresses(booking.user.email, booking.user.profile?.notificationEmail);
  const teacherRecipients = recipientAddresses(booking.teacherProfile.user.email, booking.teacherProfile.user.profile?.notificationEmail);
  await enqueueMail(tx, { kind: 'BOOKING_CONFIRMATION', bookingId, recipients: studentRecipients, ...content.student });
  await enqueueMail(tx, { kind: 'BOOKING_CONFIRMATION', bookingId, recipients: teacherRecipients, ...content.teacher });
}

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
      // current role is what decides whether they can still be booked. Same
      // TEACHER-or-ADMIN rule as the public teachers/teacher queries in
      // users.ts - an admin discoverable there as a teacher must also be
      // bookable here, or they'd be a dead end in the UI.
      if (teacherProfile.user.role !== 'TEACHER' && teacherProfile.user.role !== 'ADMIN') {
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

      // Booking creation and (when immediately CONFIRMED) the mail-outbox
      // insert commit atomically - see notifyBookingConfirmed's comment.
      const booking = await prisma.$transaction(async (tx) => {
        const created = await tx.booking.create({
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
        // A free teacher's booking is CONFIRMED immediately above - that's
        // the moment to notify, same as confirmBooking below for a paid one.
        if (created.status === 'CONFIRMED') {
          await notifyBookingConfirmed(tx, created.id);
        }
        return created;
      });
      // "Found a teacher" - the achievement is booking one at all, not
      // waiting on payment/confirmation; the 'self' key makes this one-time.
      // Deliberately outside the transaction above (its own idempotency
      // guard, unrelated to whether the mail outbox insert succeeds).
      await awardXpOnce(prisma, user.id, 'TEACHER_FOUND', 'self', TEACHER_FOUND_XP);
      return booking;
    },

    async confirmBooking(_: unknown, { bookingId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { teacherProfile: true } });
      if (!booking) throw new GraphQLError('Booking not found.', { extensions: { code: 'NOT_FOUND' } });
      if (booking.teacherProfile.userId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      return prisma.$transaction(async (tx) => {
        const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } });
        await notifyBookingConfirmed(tx, bookingId);
        return updated;
      });
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
