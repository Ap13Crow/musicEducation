// Small timezone helpers built on Intl.DateTimeFormat (no date library is a
// dependency of this repo - see the same pattern already used in
// bookSession's matchesAvailability check in bookings.ts). These are the
// only two primitives Phase 4's leadDays/cancellationDays rules need:
// "what Y-M-D is this instant in timezone X" and "what UTC instant is
// midnight on Y-M-D in timezone X."

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second') };
}

/** The calendar date (Y-M-D) `date` falls on when viewed in `timeZone`. */
export function zonedYmd(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const { year, month, day } = zonedParts(date, timeZone);
  return { year, month, day };
}

/**
 * The UTC instant corresponding to a specific wall-clock time (year/month/
 * day/hour/minute/second) as read in `timeZone`. Converges in two rounds,
 * which is enough for every real IANA zone including ones with a DST
 * transition on the target day (a target wall-clock time that falls inside
 * a "spring forward" gap or a "fall back" overlap resolves to whichever
 * side the browser/ICU engine's own formatter picks for that instant -
 * acceptable here since leadDays=0's deadline is always midnight, which is
 * never inside a transition gap for any real-world zone's rules).
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  let guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  for (let i = 0; i < 2; i++) {
    const read = zonedParts(guess, timeZone);
    const readAsUtc = Date.UTC(read.year, read.month - 1, read.day, read.hour, read.minute, read.second);
    const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
    const drift = readAsUtc - targetAsUtc;
    guess = new Date(guess.getTime() - drift);
  }
  return guess;
}

/** UTC instant of 00:00:00 on the calendar day `date` falls on, in `timeZone`. */
export function zonedMidnight(date: Date, timeZone: string): Date {
  const { year, month, day } = zonedYmd(date, timeZone);
  return zonedTimeToUtc(year, month, day, 0, 0, 0, timeZone);
}
