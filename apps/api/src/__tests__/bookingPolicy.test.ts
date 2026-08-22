import {
  isValidLeadDays, isValidCancellationDays, isValidPolicyPair,
  bookingDeadline, isWithinBookingWindow, cancellationDeadline, isLateCancellation,
} from '../lib/bookingPolicy';

describe('isValidLeadDays / isValidCancellationDays boundaries', () => {
  it.each([0, 1, 7])('accepts leadDays=%d', (v) => expect(isValidLeadDays(v)).toBe(true));
  it.each([-1, 8, 1.5, NaN])('rejects leadDays=%p', (v) => expect(isValidLeadDays(v)).toBe(false));

  it.each([2, 5, 7])('accepts cancellationDays=%d', (v) => expect(isValidCancellationDays(v)).toBe(true));
  it.each([0, 1, 8, 3.5])('rejects cancellationDays=%p', (v) => expect(isValidCancellationDays(v)).toBe(false));
});

describe('isValidPolicyPair (cancellationDays >= leadDays + 1)', () => {
  it('leadDays=0 requires cancellationDays >= 1, trivially satisfied by the 2-7 minimum', () => {
    expect(isValidPolicyPair(0, 2)).toBe(true);
  });
  it('leadDays=7 requires cancellationDays >= 8, which is above the 7 maximum - always invalid', () => {
    expect(isValidPolicyPair(7, 7)).toBe(false);
  });
  it('leadDays=6 allows cancellationDays=7 exactly at the boundary', () => {
    expect(isValidPolicyPair(6, 7)).toBe(true);
    expect(isValidPolicyPair(6, 6)).toBe(false);
  });
});

describe('bookingDeadline / isWithinBookingWindow', () => {
  const lessonStart = new Date('2026-09-10T14:00:00Z'); // a Thursday, 14:00 UTC

  it('leadDays=0: deadline is local midnight on the lesson day itself (Europe/Zurich, CEST +2 in September)', () => {
    const deadline = bookingDeadline(lessonStart, 0, 'Europe/Zurich');
    expect(deadline.toISOString()).toBe('2026-09-09T22:00:00.000Z');
  });

  it('leadDays=7: deadline is exactly 7x24h before the lesson start, timezone-independent', () => {
    const deadline = bookingDeadline(lessonStart, 7, 'Europe/Zurich');
    expect(deadline.toISOString()).toBe('2026-09-03T14:00:00.000Z');
  });

  it('a request one second before the leadDays=0 deadline is within the window', () => {
    const now = new Date('2026-09-09T21:59:59.000Z');
    expect(isWithinBookingWindow(lessonStart, 0, 'Europe/Zurich', now)).toBe(true);
  });

  it('a request exactly at (or after) the leadDays=0 deadline is rejected', () => {
    const atDeadline = new Date('2026-09-09T22:00:00.000Z');
    expect(isWithinBookingWindow(lessonStart, 0, 'Europe/Zurich', atDeadline)).toBe(false);
    const afterDeadline = new Date('2026-09-09T22:00:01.000Z');
    expect(isWithinBookingWindow(lessonStart, 0, 'Europe/Zurich', afterDeadline)).toBe(false);
  });

  it('leadDays=7 just-before/just-after the exact 7x24h boundary', () => {
    const justBefore = new Date('2026-09-03T13:59:59.000Z');
    const justAfter = new Date('2026-09-03T14:00:00.000Z');
    expect(isWithinBookingWindow(lessonStart, 7, 'Europe/Zurich', justBefore)).toBe(true);
    expect(isWithinBookingWindow(lessonStart, 7, 'Europe/Zurich', justAfter)).toBe(false);
  });
});

describe('cancellationDeadline / isLateCancellation', () => {
  const lessonStart = new Date('2026-09-10T14:00:00Z');

  it('cancellationDays=2: deadline is exactly 48h before the lesson', () => {
    expect(cancellationDeadline(lessonStart, 2).toISOString()).toBe('2026-09-08T14:00:00.000Z');
  });

  it('cancellationDays=7: deadline is exactly 168h before the lesson', () => {
    expect(cancellationDeadline(lessonStart, 7).toISOString()).toBe('2026-09-03T14:00:00.000Z');
  });

  it('cancelling before the deadline is on-time (not late)', () => {
    const beforeDeadline = new Date('2026-09-08T13:59:59.000Z');
    expect(isLateCancellation(lessonStart, 2, beforeDeadline)).toBe(false);
  });

  it('cancelling at or after the deadline is late', () => {
    const atDeadline = new Date('2026-09-08T14:00:00.000Z');
    expect(isLateCancellation(lessonStart, 2, atDeadline)).toBe(true);
    const afterDeadline = new Date('2026-09-10T13:00:00.000Z'); // same day, right before the lesson
    expect(isLateCancellation(lessonStart, 2, afterDeadline)).toBe(true);
  });
});
