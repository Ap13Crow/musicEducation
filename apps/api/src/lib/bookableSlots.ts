import type { PrismaClient } from '@my-music-coach/database';
import { isWithinBookingWindow } from './bookingPolicy.js';
import { zonedTimeToUtc, zonedYmd } from './timezone.js';

export const LESSON_DURATION_MINUTES = 60;
export const MAX_BOOKABLE_RANGE_DAYS = 63;

export type AvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone?: string | null;
};

export type BusyInterval = {
  startsAt: Date;
  endsAt: Date;
};

export type BookableLessonSlot = {
  startsAt: Date;
  endsAt: Date;
  timezone: string;
};

type DeriveBookableSlotsInput = {
  availability: AvailabilityRule[];
  busyIntervals: BusyInterval[];
  from: Date;
  to: Date;
  leadDays: number;
  now?: Date;
  limit?: number;
};

function minutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function localDateSequence(from: Date, to: Date, timezone: string) {
  const first = zonedYmd(from, timezone);
  const last = zonedYmd(new Date(to.getTime() - 1), timezone);
  const firstUtc = Date.UTC(first.year, first.month - 1, first.day);
  const lastUtc = Date.UTC(last.year, last.month - 1, last.day);
  const dates: Array<{ year: number; month: number; day: number; dayOfWeek: number }> = [];

  for (let cursor = firstUtc; cursor <= lastUtc; cursor += 24 * 60 * 60 * 1000) {
    const date = new Date(cursor);
    dates.push({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      dayOfWeek: date.getUTCDay(),
    });
  }
  return dates;
}

function overlaps(start: Date, end: Date, interval: BusyInterval): boolean {
  return start.getTime() < interval.endsAt.getTime() && end.getTime() > interval.startsAt.getTime();
}

/**
 * Turns recurring wall-clock rules into concrete one-hour openings. The
 * first lesson starts exactly at the teacher's chosen start time, so a
 * 09:15–13:15 rule produces 09:15, 10:15, 11:15 and 12:15 — never the
 * whole-hour-only cells that previously made a valid saved rule disappear
 * from the student calendar.
 */
export function deriveBookableSlots({
  availability,
  busyIntervals,
  from,
  to,
  leadDays,
  now = new Date(),
  limit = 500,
}: DeriveBookableSlotsInput): BookableLessonSlot[] {
  const unique = new Map<string, BookableLessonSlot>();

  for (const rule of availability) {
    const timezone = rule.timezone || 'Europe/Zurich';
    const startMinute = minutes(rule.startTime);
    const endMinute = minutes(rule.endTime);

    for (const date of localDateSequence(from, to, timezone)) {
      if (date.dayOfWeek !== rule.dayOfWeek) continue;

      for (
        let minute = startMinute;
        minute + LESSON_DURATION_MINUTES <= endMinute;
        minute += LESSON_DURATION_MINUTES
      ) {
        const startsAt = zonedTimeToUtc(
          date.year,
          date.month,
          date.day,
          Math.floor(minute / 60),
          minute % 60,
          0,
          timezone,
        );
        const endsAt = new Date(startsAt.getTime() + LESSON_DURATION_MINUTES * 60_000);

        if (startsAt < from || endsAt > to || startsAt <= now) continue;
        if (!isWithinBookingWindow(startsAt, leadDays, timezone, now)) continue;
        if (busyIntervals.some((interval) => overlaps(startsAt, endsAt, interval))) continue;

        unique.set(startsAt.toISOString(), { startsAt, endsAt, timezone });
      }
    }
  }

  return [...unique.values()]
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, Math.max(0, Math.min(limit, 500)));
}

export function validateBookableRange(from: Date, to: Date): void {
  const rangeMs = to.getTime() - from.getTime();
  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    rangeMs <= 0 ||
    rangeMs > MAX_BOOKABLE_RANGE_DAYS * 24 * 60 * 60 * 1000
  ) {
    throw new Error(`Availability range must be between 1 minute and ${MAX_BOOKABLE_RANGE_DAYS} days.`);
  }
}

export async function getBookableSlots(
  prisma: PrismaClient,
  teacherProfileId: string,
  from: Date,
  to: Date,
  options: { instrument?: string | null; limit?: number; now?: Date } = {},
): Promise<BookableLessonSlot[]> {
  validateBookableRange(from, to);
  const now = options.now ?? new Date();

  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    include: {
      availability: true,
      instrumentCapacities: true,
      user: { include: { profile: true } },
    },
  });

  if (
    !teacher ||
    !teacher.isAvailable ||
    teacher.user.status !== 'ACTIVE' ||
    !['TEACHER', 'ADMIN'].includes(teacher.user.role)
  ) {
    return [];
  }

  const instrument = options.instrument?.trim() || null;
  if (instrument && !teacher.instruments.includes(instrument)) return [];

  if (instrument) {
    const capacity = teacher.instrumentCapacities.find((item) => item.instrument === instrument);
    if (capacity?.maxActiveStudents != null) {
      const activeStudents = await prisma.booking.findMany({
        where: {
          teacherProfileId,
          instrument,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        distinct: ['userId'],
        select: { userId: true },
      });
      if (activeStudents.length >= capacity.maxActiveStudents) return [];
    }
  }

  const [bookings, unavailable, appointments, externalBusy] = await Promise.all([
    prisma.booking.findMany({
      where: {
        teacherProfileId,
        startsAt: { lt: to },
        endsAt: { gt: from },
        OR: [
          { status: 'CONFIRMED' },
          { status: 'PENDING', OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: now } }] },
        ],
      },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.teacherUnavailability.findMany({
      where: { teacherProfileId, startsAt: { lt: to }, endsAt: { gt: from } },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.personalAppointment.findMany({
      where: { userId: teacher.userId, startsAt: { lt: to }, endsAt: { gt: from } },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.externalBusyInterval.findMany({
      where: {
        connection: { userId: teacher.userId, status: 'CONNECTED' },
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  const busyIntervals: BusyInterval[] = [
    ...bookings.map((booking) => ({
      startsAt: booking.startsAt,
      endsAt: booking.endsAt ?? new Date(booking.startsAt.getTime() + LESSON_DURATION_MINUTES * 60_000),
    })),
    ...unavailable,
    ...appointments,
    ...externalBusy,
  ];

  return deriveBookableSlots({
    availability: teacher.availability,
    busyIntervals,
    from,
    to,
    leadDays: teacher.leadDays,
    now,
    limit: options.limit,
  });
}
