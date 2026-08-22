import { zonedMidnight } from './timezone.js';

export const LEAD_DAYS_MIN = 0;
export const LEAD_DAYS_MAX = 7;
export const CANCELLATION_DAYS_MIN = 2;
export const CANCELLATION_DAYS_MAX = 7;
// A manual-approval request holds its slot (blocks other bookings) for this
// long before being treated as expired - bounded per Phase 3's "prevent
// unbounded queries" spirit and Phase 4's "bounded configurable/
// system-defined period."
export const APPROVAL_HOLD_HOURS = 48;

export function isValidLeadDays(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= LEAD_DAYS_MIN && (value as number) <= LEAD_DAYS_MAX;
}
export function isValidCancellationDays(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= CANCELLATION_DAYS_MIN && (value as number) <= CANCELLATION_DAYS_MAX;
}

/**
 * cancellationDays must leave at least one day of room past leadDays - the
 * teacher UI explanation: "this leaves time for another student to book
 * the released slot." Because cancellationDays' own minimum is 2, leadDays
 * = 0 still requires cancellationDays >= 1, trivially satisfied - but the
 * check is written generally, not special-cased to leadDays=0.
 */
export function isValidPolicyPair(leadDays: number, cancellationDays: number): boolean {
  return cancellationDays >= leadDays + 1;
}

/**
 * The advance-booking deadline for a lesson starting at `startsAt`, given
 * the teacher's leadDays and timezone:
 *   - leadDays 0: open until 23:59:59 local time the day before the lesson
 *     (i.e. the deadline is local midnight *on* the lesson's own calendar
 *     day - anything at or after that is too late).
 *   - leadDays 1-7: closes exactly leadDays x 24h before the lesson start,
 *     a fixed rolling window regardless of calendar days/DST.
 */
export function bookingDeadline(startsAt: Date, leadDays: number, teacherTimezone: string): Date {
  if (leadDays === 0) {
    return zonedMidnight(startsAt, teacherTimezone);
  }
  return new Date(startsAt.getTime() - leadDays * 24 * 60 * 60 * 1000);
}

/** True when a booking request made `now` for a lesson at `startsAt` is still within the teacher's lead-time window. */
export function isWithinBookingWindow(startsAt: Date, leadDays: number, teacherTimezone: string, now: Date = new Date()): boolean {
  return now.getTime() < bookingDeadline(startsAt, leadDays, teacherTimezone).getTime();
}

/**
 * The cancellation deadline (on-time up to, but not including, this
 * instant) - always a fixed rolling window from the lesson start,
 * regardless of cancellationDays value (2-7 only, no "0 means calendar
 * day" special case the way leadDays has).
 */
export function cancellationDeadline(startsAt: Date, cancellationDays: number): Date {
  return new Date(startsAt.getTime() - cancellationDays * 24 * 60 * 60 * 1000);
}

/** True when cancelling at `now` for a lesson at `startsAt` is late (inside the cancellation window) - charges/consumes a credit. */
export function isLateCancellation(startsAt: Date, cancellationDays: number, now: Date = new Date()): boolean {
  return now.getTime() >= cancellationDeadline(startsAt, cancellationDays).getTime();
}
