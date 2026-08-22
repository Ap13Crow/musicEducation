import { zonedMidnight, zonedYmd, zonedTimeToUtc } from '../lib/timezone';

describe('zonedYmd', () => {
  it('reads the correct calendar day across a UTC offset (Europe/Zurich, winter CET +1)', () => {
    // 23:30 UTC on Jan 14 is already 00:30 local (Jan 15) in CET.
    expect(zonedYmd(new Date('2026-01-14T23:30:00Z'), 'Europe/Zurich')).toEqual({ year: 2026, month: 1, day: 15 });
  });
});

describe('zonedTimeToUtc / zonedMidnight - Europe/Zurich', () => {
  it('winter (CET, UTC+1): local midnight is 23:00 UTC the previous day', () => {
    const midnight = zonedMidnight(new Date('2026-01-15T10:00:00Z'), 'Europe/Zurich');
    expect(midnight.toISOString()).toBe('2026-01-14T23:00:00.000Z');
  });

  it('summer (CEST, UTC+2): local midnight is 22:00 UTC the previous day', () => {
    const midnight = zonedMidnight(new Date('2026-07-15T10:00:00Z'), 'Europe/Zurich');
    expect(midnight.toISOString()).toBe('2026-07-14T22:00:00.000Z');
  });

  it('spring-forward day (2026-03-29, CET->CEST at 01:00 UTC): local midnight that same morning is still CET (+1)', () => {
    // Local midnight on March 29 happens BEFORE that day's 2am-local
    // transition to CEST, so it's still the +1 offset even though later
    // that same calendar day becomes +2.
    const midnight = zonedMidnight(new Date('2026-03-29T14:00:00Z'), 'Europe/Zurich');
    expect(midnight.toISOString()).toBe('2026-03-28T23:00:00.000Z');
  });

  it('the day after spring-forward is fully CEST (+2)', () => {
    const midnight = zonedMidnight(new Date('2026-03-30T10:00:00Z'), 'Europe/Zurich');
    expect(midnight.toISOString()).toBe('2026-03-29T22:00:00.000Z');
  });

  it('fall-back day (2026-10-25, CEST->CET at 01:00 UTC): local midnight that same morning is still CEST (+2)', () => {
    const midnight = zonedMidnight(new Date('2026-10-25T14:00:00Z'), 'Europe/Zurich');
    expect(midnight.toISOString()).toBe('2026-10-24T22:00:00.000Z');
  });

  it('the day after fall-back is fully CET (+1)', () => {
    const midnight = zonedMidnight(new Date('2026-10-26T10:00:00Z'), 'Europe/Zurich');
    expect(midnight.toISOString()).toBe('2026-10-25T23:00:00.000Z');
  });

  it('zonedTimeToUtc round-trips an arbitrary wall-clock time', () => {
    const utc = zonedTimeToUtc(2026, 6, 1, 9, 30, 0, 'Europe/Zurich'); // summer, CEST +2
    expect(utc.toISOString()).toBe('2026-06-01T07:30:00.000Z');
  });
});
