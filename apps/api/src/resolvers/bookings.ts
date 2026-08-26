import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { awardXpOnce } from './xp.js';
import { bookingConfirmedEmailContent, bookingCancelledEmailContent } from '../lib/emails.js';
import { enqueueMail, recipientAddresses } from '../lib/mailOutbox.js';
import { buildBookingIcs } from '../lib/ics.js';
import { isWithinBookingWindow, isLateCancellation, APPROVAL_HOLD_HOURS } from '../lib/bookingPolicy.js';
import { reserveInstrumentCapacity } from '../lib/capacity.js';
import { consumeCredit, restoreCredit } from '../lib/lessonCredits.js';
import { displayNameOf } from '../lib/displayName.js';
import type { GraphQLContext } from '../types.js';
import type { Prisma, PrismaClient } from '@my-music-coach/database';

// A "recurring" student (Phase 4): has at least one CONFIRMED or COMPLETED
// booking with this teacher already, from before this request. Used to
// pick which of the teacher's two auto-approve switches applies. Kept in
// one place so the definition can't drift between call sites (bookSession,
// confirmBooking's future use, UI help text).
export async function isRecurringStudent(prisma: PrismaClient, teacherProfileId: string, studentUserId: string): Promise<boolean> {
  const existing = await prisma.booking.findFirst({
    where: { teacherProfileId, userId: studentUserId, status: { in: ['CONFIRMED', 'COMPLETED'] } },
  });
  return Boolean(existing);
}

const TEACHER_FOUND_XP = 30;

const PLATFORM_ORGANIZER = { name: 'MyMusic.Coach', email: process.env.SMTP_FROM ?? 'no-reply@mymusic.coach' };

function bookingLocation(format: string, meetingUrl: string | null | undefined): string | null {
  if (format === 'ONLINE') return meetingUrl || 'Online';
  return null;
}

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
  const studentName = displayNameOf(booking.user);
  const teacherName = displayNameOf(booking.teacherProfile.user);
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

  // Same VEVENT (organizer=platform, both parties as attendees) attached to
  // both copies - one UID per booking, SEQUENCE 0 for the first invitation
  // (this only runs once per booking: immediately on a free-teacher booking,
  // or once when a paid booking is first confirmed).
  const ics = buildBookingIcs({
    uid: `booking-${booking.id}@mymusic.coach`,
    sequence: booking.icsSequence,
    method: 'REQUEST',
    startsAt: booking.startsAt,
    endsAt: booking.endsAt ?? new Date(booking.startsAt.getTime() + booking.durationMin * 60_000),
    organizer: PLATFORM_ORGANIZER,
    attendees: [
      { name: studentName, email: booking.user.email },
      { name: teacherName, email: booking.teacherProfile.user.email },
    ],
    summary: `Lesson: ${studentName} with ${teacherName}`,
    description: `${booking.instrument ? `${booking.instrument} lesson` : 'Lesson'} booked via MyMusic.Coach.`,
    location: bookingLocation(booking.format, booking.meetingUrl),
  });

  await enqueueMail(tx, { kind: 'BOOKING_CONFIRMATION', bookingId, recipients: studentRecipients, ...content.student, icsContent: ics, icsMethod: 'REQUEST' });
  await enqueueMail(tx, { kind: 'BOOKING_CONFIRMATION', bookingId, recipients: teacherRecipients, ...content.teacher, icsContent: ics, icsMethod: 'REQUEST' });
}

// Mirrors notifyBookingConfirmed for the cancel path: same UID, SEQUENCE
// incremented (persisted onto the booking) and METHOD:CANCEL so a calendar
// client removes the earlier invitation instead of adding a second event.
export async function notifyBookingCancelled(tx: Prisma.TransactionClient, bookingId: string) {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    include: { user: { include: { profile: true } }, teacherProfile: { include: { user: { include: { profile: true } } } } },
  });
  if (!booking) return;
  const studentName = displayNameOf(booking.user);
  const teacherName = displayNameOf(booking.teacherProfile.user);
  const content = bookingCancelledEmailContent({
    studentName,
    teacherName,
    startsAt: booking.startsAt,
    durationMin: booking.durationMin,
    format: booking.format,
    instrument: booking.instrument,
  });
  const studentRecipients = recipientAddresses(booking.user.email, booking.user.profile?.notificationEmail);
  const teacherRecipients = recipientAddresses(booking.teacherProfile.user.email, booking.teacherProfile.user.profile?.notificationEmail);

  const nextSequence = booking.icsSequence + 1;
  await tx.booking.update({ where: { id: booking.id }, data: { icsSequence: nextSequence } });
  const ics = buildBookingIcs({
    uid: `booking-${booking.id}@mymusic.coach`,
    sequence: nextSequence,
    method: 'CANCEL',
    startsAt: booking.startsAt,
    endsAt: booking.endsAt ?? new Date(booking.startsAt.getTime() + booking.durationMin * 60_000),
    organizer: PLATFORM_ORGANIZER,
    attendees: [
      { name: studentName, email: booking.user.email },
      { name: teacherName, email: booking.teacherProfile.user.email },
    ],
    summary: `Lesson: ${studentName} with ${teacherName}`,
    description: `${booking.instrument ? `${booking.instrument} lesson` : 'Lesson'} cancelled.`,
    location: bookingLocation(booking.format, booking.meetingUrl),
  });

  await enqueueMail(tx, { kind: 'BOOKING_CANCELLED', bookingId, recipients: studentRecipients, ...content.student, icsContent: ics, icsMethod: 'CANCEL' });
  await enqueueMail(tx, { kind: 'BOOKING_CANCELLED', bookingId, recipients: teacherRecipients, ...content.teacher, icsContent: ics, icsMethod: 'CANCEL' });
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

    async teacherUnavailability(_: unknown, { teacherProfileId, from, to }: any, { prisma }: GraphQLContext) {
      const [start, end] = [new Date(from), new Date(to)];
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        throw new GraphQLError('Invalid date range.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // Same "overlaps the range" test as the booking conflict check below -
      // any block that overlaps [from, to] at all, not just ones fully inside it.
      return prisma.teacherUnavailability.findMany({
        where: { teacherProfileId, startsAt: { lt: end }, endsAt: { gt: start } },
        orderBy: { startsAt: 'asc' },
        // Needed by the TeacherUnavailability.note field resolver's
        // owner/admin check below - without it block.teacherProfile is
        // undefined and note would always resolve null, even for the owner.
        include: { teacherProfile: { select: { userId: true } } },
      });
    },

    async myAppointments(_: unknown, { from, to }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const [start, end] = [new Date(from), new Date(to)];
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        throw new GraphQLError('Invalid date range.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      return prisma.personalAppointment.findMany({
        where: { userId: user.id, startsAt: { lt: end }, endsAt: { gt: start } },
        orderBy: { startsAt: 'asc' },
      });
    },
  },

  Mutation: {
    async bookSession(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const { teacherProfileId, startsAt, durationMin, format, instrument, notes, packagePurchaseId } = input;

      let packagePurchase = null as Awaited<ReturnType<typeof prisma.lessonPackagePurchase.findUnique>>;
      if (packagePurchaseId) {
        packagePurchase = await prisma.lessonPackagePurchase.findUnique({ where: { id: packagePurchaseId } });
        if (!packagePurchase || packagePurchase.userId !== user.id) {
          throw new GraphQLError('Package not found.', { extensions: { code: 'NOT_FOUND' } });
        }
        if (packagePurchase.teacherProfileId !== teacherProfileId) {
          throw new GraphQLError('This package is not for this teacher.', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        if (packagePurchase.instrument && packagePurchase.instrument !== instrument) {
          throw new GraphQLError(`This package only covers ${packagePurchase.instrument}.`, { extensions: { code: 'BAD_USER_INPUT' } });
        }
      }

      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
        include: { user: { select: { role: true, status: true, profile: { select: { timezone: true } } } } },
      });
      if (!teacherProfile) throw new GraphQLError('Teacher not found.', { extensions: { code: 'NOT_FOUND' } });
      if (teacherProfile.userId === user.id) {
        throw new GraphQLError('You cannot book a lesson with yourself.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // The TeacherProfile row outlives a demotion (it's history); active
      // TEACHER/ADMIN status decides whether it can still be booked.
      // isPublic controls directory discovery only: an unlisted teacher may
      // still accept bookings from returning students or a direct profile URL.
      if (
        teacherProfile.user.status !== 'ACTIVE' ||
        (teacherProfile.user.role !== 'TEACHER' && teacherProfile.user.role !== 'ADMIN')
      ) {
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
      // Advance-booking rule (Phase 4) - enforced server-side regardless of
      // what the booking UI does or doesn't disable. See
      // apps/api/src/lib/bookingPolicy.ts for the exact leadDays semantics.
      const teacherTimezone = teacherProfile.user.profile?.timezone ?? 'Europe/Zurich';
      if (!isWithinBookingWindow(startsAtDate, teacherProfile.leadDays, teacherTimezone)) {
        throw new GraphQLError(
          `This teacher requires booking at least ${teacherProfile.leadDays === 0 ? 'by the end of the day before the lesson' : `${teacherProfile.leadDays} day(s)`} in advance.`,
          { extensions: { code: 'BAD_USER_INPUT' } },
        );
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
          AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAtDate } }],
          OR: [
            { status: 'CONFIRMED' },
            // A PENDING hold blocks the slot only while it's still live -
            // an expired manual-approval request (see holdExpiresAt) no
            // longer counts, matching "prevent double booking during the
            // hold" without blocking the slot forever once it lapses.
            { status: 'PENDING', OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: new Date() } }] },
          ],
        },
      });
      if (conflict) throw new GraphQLError('Time slot not available.', { extensions: { code: 'BAD_USER_INPUT' } });

      // Unavailability overrides availability: a block covering any part of
      // this slot removes it from bookable discovery, same rule the
      // teacherUnavailability query enforces for display. Never leaks the
      // block's private `note` here - just makes the slot unbookable.
      const unavailable = await prisma.teacherUnavailability.findFirst({
        where: { teacherProfileId, startsAt: { lt: endsAt }, endsAt: { gt: startsAtDate } },
      });
      if (unavailable) throw new GraphQLError('Time slot not available.', { extensions: { code: 'BAD_USER_INPUT' } });

      // A booking needs its own Stripe payment only when it isn't already
      // covered by a prepaid package credit and the teacher actually
      // charges for lessons (hourlyRate 0/null - a free/trial lesson -
      // skips payment entirely, same as before this check existed).
      // "Payment state is a state machine; the signed webhook - never the
      // browser redirect - confirms payment" (see CLAUDE.md), so a booking
      // that requires payment is NEVER created CONFIRMED here, regardless
      // of the teacher's auto-approve setting - payment itself is the
      // confirmation for this kind of booking. Only handleStripeWebhook's
      // 'booking' branch (payments.ts) performs that transition, once
      // Stripe actually reports the charge succeeded. Before this check,
      // every paid booking with auto-approve on was created CONFIRMED with
      // no payment ever collected - a free-lesson loophole.
      const requiresPayment = !packagePurchase && Number(teacherProfile.hourlyRate ?? 0) > 0;
      const recurring = await isRecurringStudent(prisma, teacherProfileId, user.id);
      const autoApprove = !requiresPayment && (recurring ? teacherProfile.autoApproveRecurringStudents : teacherProfile.autoApproveNewStudents);

      // Booking creation, the capacity check for an immediately-CONFIRMED
      // booking, and (when CONFIRMED) the mail-outbox insert all commit
      // atomically - see notifyBookingConfirmed's and
      // reserveInstrumentCapacity's own comments.
      const booking = await prisma.$transaction(async (tx) => {
        if (autoApprove) {
          await reserveInstrumentCapacity(tx, teacherProfileId, instrument, user.id);
        }
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
            status: autoApprove ? 'CONFIRMED' : 'PENDING',
            // Same hold window covers both "awaiting teacher approval" and
            // "awaiting payment" - either way, an unresolved request
            // shouldn't lock the slot forever (the conflict check above
            // already ignores an expired hold either way).
            holdExpiresAt: autoApprove ? null : new Date(Date.now() + APPROVAL_HOLD_HOURS * 60 * 60 * 1000),
            packagePurchaseId: packagePurchase?.id ?? null,
          },
        });
        // Same "only at actual confirmation" rule as capacity - a credit is
        // only spent once the lesson is really on the books, not merely
        // requested. A manually-approved request spends it later, in
        // confirmBooking.
        if (autoApprove && packagePurchase) {
          await consumeCredit(tx, packagePurchase.id, created.id);
        }
        // Auto-approved (whether free or paid) is CONFIRMED immediately -
        // that's the moment to notify, same as confirmBooking below for a
        // manually-approved one.
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
      if (booking.holdExpiresAt && booking.holdExpiresAt <= new Date()) {
        throw new GraphQLError('This request has expired and can no longer be approved.', { extensions: { code: 'CONFLICT' } });
      }
      return prisma.$transaction(async (tx) => {
        // Atomic claim: only a booking that's still PENDING actually
        // transitions here, and only that transition reserves capacity,
        // consumes a credit, and enqueues the confirmation email/ICS. A
        // repeat call (double-click, client retry after a timeout) used to
        // re-run every one of those unconditionally - re-reserving
        // capacity that was never released, and worse, writing a second
        // MailOutboxMessage row (a duplicate confirmation email/invite)
        // every single time. updateMany's WHERE guard makes at most one
        // call ever win the transition, the same idempotency shape
        // claimConfirmationEmail (payments.ts) uses for the Stripe path.
        const claimed = await tx.booking.updateMany({
          where: { id: bookingId, status: 'PENDING' },
          data: { status: 'CONFIRMED', holdExpiresAt: null },
        });
        if (claimed.count > 0) {
          // Same capacity enforcement point as the auto-approved path in
          // bookSession - a manually-approved booking becomes an active
          // relationship right here, not at the original request.
          await reserveInstrumentCapacity(tx, booking.teacherProfileId, booking.instrument, booking.userId);
          if (booking.packagePurchaseId) {
            await consumeCredit(tx, booking.packagePurchaseId, booking.id);
          }
          await notifyBookingConfirmed(tx, bookingId);
          return tx.booking.findUniqueOrThrow({ where: { id: bookingId } });
        }
        // Lost the claim - either a concurrent/retried call already
        // confirmed it (harmless no-op, return the current state) or it
        // moved to some other status entirely (cancelled, completed) since
        // the read above, which this must not force back to CONFIRMED.
        const current = await tx.booking.findUniqueOrThrow({ where: { id: bookingId } });
        if (current.status !== 'CONFIRMED') {
          throw new GraphQLError('This booking is no longer pending approval.', { extensions: { code: 'CONFLICT' } });
        }
        return current;
      });
    },

    async cancelBooking(_: unknown, { bookingId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { teacherProfile: true } });
      if (!booking) throw new GraphQLError('Booking not found.', { extensions: { code: 'NOT_FOUND' } });
      const isStudent = booking.userId === user.id;
      const isTeacher = booking.teacherProfile.userId === user.id;
      if (!isStudent && !isTeacher) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      const wasConfirmed = booking.status === 'CONFIRMED';
      // Only a confirmed lesson can be "late" or "on time" - a still-
      // PENDING request being withdrawn/rejected was never a commitment to
      // charge against.
      const lateCancellation = wasConfirmed
        ? isLateCancellation(booking.startsAt, booking.teacherProfile.cancellationDays)
        : null;
      return prisma.$transaction(async (tx) => {
        const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED', lateCancellation } });
        // Package credit: on-time restores the credit the confirmation
        // consumed (the released slot can go to another student); late
        // keeps it consumed - that consumption *is* the charge for a
        // package-booked lesson. A one-off (non-package) paid booking's
        // "charge the full price" side isn't implemented this phase - it
        // needs an off-session Stripe charge against a saved payment
        // method, a materially bigger integration than restoring a ledger
        // entry; lateCancellation is still recorded so that charge can be
        // added later without re-deriving which cancellations qualify.
        if (wasConfirmed && booking.packagePurchaseId && lateCancellation === false) {
          await restoreCredit(tx, booking.packagePurchaseId, booking.id);
        }
        // A PENDING booking never had a confirmation/invitation sent, so
        // there is nothing to cancel a notice for - only a previously
        // CONFIRMED booking gets a cancellation email + METHOD:CANCEL ICS.
        if (wasConfirmed) {
          await notifyBookingCancelled(tx, bookingId);
        }
        return updated;
      });
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

    async createUnavailability(_: unknown, { startsAt, endsAt, label, note }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
      if (!teacherProfile) throw new GraphQLError('Teacher profile required.', { extensions: { code: 'BAD_USER_INPUT' } });
      const start = new Date(startsAt);
      const end = new Date(endsAt);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        throw new GraphQLError('Invalid date range.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // Deliberately does NOT touch existing bookings inside this range -
      // "unavailability overrides availability and immediately removes
      // unbooked derived slots... existing bookings require an explicit
      // conflict-resolution flow; never silently delete them." A teacher
      // who needs to clear a conflicting booking cancels it explicitly via
      // cancelBooking (which sends its own cancellation notice).
      return prisma.teacherUnavailability.create({
        data: { teacherProfileId: teacherProfile.id, startsAt: start, endsAt: end, label, note: note?.trim() || null },
        include: { teacherProfile: { select: { userId: true } } },
      });
    },

    async deleteUnavailability(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const block = await prisma.teacherUnavailability.findUnique({ where: { id }, include: { teacherProfile: true } });
      if (!block) return true;
      if (user!.role !== 'ADMIN' && block.teacherProfile.userId !== user!.id) {
        throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      }
      await prisma.teacherUnavailability.delete({ where: { id } });
      return true;
    },

    async createAppointment(_: unknown, { title, startsAt, endsAt, notes }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const start = new Date(startsAt);
      const end = new Date(endsAt);
      if (!title?.trim()) throw new GraphQLError('Title is required.', { extensions: { code: 'BAD_USER_INPUT' } });
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        throw new GraphQLError('Invalid date range.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      return prisma.personalAppointment.create({
        data: { userId: user.id, title: title.trim(), startsAt: start, endsAt: end, notes: notes?.trim() || null },
      });
    },

    async updateAppointment(_: unknown, { id, title, startsAt, endsAt, notes }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const existing = await prisma.personalAppointment.findUnique({ where: { id } });
      if (!existing) throw new GraphQLError('Appointment not found.', { extensions: { code: 'NOT_FOUND' } });
      if (existing.userId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      const data: Record<string, unknown> = {};
      if (title !== undefined) {
        if (!title?.trim()) throw new GraphQLError('Title is required.', { extensions: { code: 'BAD_USER_INPUT' } });
        data.title = title.trim();
      }
      if (startsAt !== undefined) data.startsAt = new Date(startsAt);
      if (endsAt !== undefined) data.endsAt = new Date(endsAt);
      if (notes !== undefined) data.notes = notes?.trim() || null;
      const nextStart = (data.startsAt as Date) ?? existing.startsAt;
      const nextEnd = (data.endsAt as Date) ?? existing.endsAt;
      if (nextEnd <= nextStart) throw new GraphQLError('Invalid date range.', { extensions: { code: 'BAD_USER_INPUT' } });
      return prisma.personalAppointment.update({ where: { id }, data });
    },

    async deleteAppointment(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const existing = await prisma.personalAppointment.findUnique({ where: { id } });
      if (!existing) return true;
      if (existing.userId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      await prisma.personalAppointment.delete({ where: { id } });
      return true;
    },
  },

  TeacherUnavailability: {
    // Private detail - only the owning teacher or an admin ever sees it,
    // matching "never expose private appointment titles/descriptions... to
    // students. Students may see only the chosen safe label."
    note(block: any, _: unknown, { user }: GraphQLContext) {
      const isOwnerOrAdmin = Boolean(user) && (user!.role === 'ADMIN' || block.teacherProfile?.userId === user!.id);
      return isOwnerOrAdmin ? (block.note ?? null) : null;
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
