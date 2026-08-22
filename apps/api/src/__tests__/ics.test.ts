import { buildBookingIcs } from '../lib/ics';

// Parses an ICS VEVENT into a plain property map rather than asserting on
// substrings - unfolds RFC 5545 continuation lines first (a line starting
// with a single space is a continuation of the previous line), which is
// exactly the mechanic a real client relies on and a naive substring check
// would never exercise.
function parseIcs(ics: string): Record<string, string> {
  const unfolded = ics.replace(/\r\n /g, '');
  const props: Record<string, string> = {};
  for (const rawLine of unfolded.split('\r\n')) {
    if (!rawLine) continue;
    const idx = rawLine.indexOf(':');
    if (idx === -1) continue;
    const key = rawLine.slice(0, idx).split(';')[0]; // strip params like ;CN=...
    const value = rawLine.slice(idx + 1);
    props[key] = value;
  }
  return props;
}

const baseInput = {
  uid: 'booking-b1@mymusic.coach',
  sequence: 0,
  startsAt: new Date('2026-09-01T14:00:00.000Z'),
  endsAt: new Date('2026-09-01T15:00:00.000Z'),
  organizer: { name: 'MyMusic.Coach', email: 'no-reply@mymusic.coach' },
  attendees: [
    { name: 'Ada Student', email: 'ada@example.com' },
    { name: 'Jens Teacher', email: 'jens@example.com' },
  ],
  summary: 'Lesson: Ada Student with Jens Teacher',
  description: 'Piano lesson booked via MyMusic.Coach.',
  location: 'Online',
};

describe('buildBookingIcs', () => {
  it('produces a well-formed REQUEST VEVENT with every required RFC 5545 field', () => {
    const ics = buildBookingIcs({ ...baseInput, method: 'REQUEST' });
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics.trim()).toMatch(/END:VCALENDAR$/);
    expect(ics).toContain('METHOD:REQUEST\r\n');

    const props = parseIcs(ics);
    expect(props.UID).toBe('booking-b1@mymusic.coach');
    expect(props.SEQUENCE).toBe('0');
    expect(props.STATUS).toBe('CONFIRMED');
    expect(props.DTSTART).toBe('20260901T140000Z');
    expect(props.DTEND).toBe('20260901T150000Z');
    expect(props.SUMMARY).toBe('Lesson: Ada Student with Jens Teacher');
    expect(props.LOCATION).toBe('Online');
    expect(props.ORGANIZER).toBe('mailto:no-reply@mymusic.coach');
    // Both attendees present - only ORGANIZER's line survives the plain
    // props map above (ATTENDEE repeats), so check the raw text for both.
    expect(ics).toContain('mailto:ada@example.com');
    expect(ics).toContain('mailto:jens@example.com');
  });

  it('a cancellation reuses the same UID with an incremented SEQUENCE and METHOD:CANCEL', () => {
    const created = buildBookingIcs({ ...baseInput, method: 'REQUEST', sequence: 0 });
    const cancelled = buildBookingIcs({ ...baseInput, method: 'CANCEL', sequence: 1 });

    const createdProps = parseIcs(created);
    const cancelledProps = parseIcs(cancelled);

    expect(cancelledProps.UID).toBe(createdProps.UID);
    expect(Number(cancelledProps.SEQUENCE)).toBeGreaterThan(Number(createdProps.SEQUENCE));
    expect(cancelledProps.STATUS).toBe('CANCELLED');
    expect(cancelled).toContain('METHOD:CANCEL\r\n');
  });

  it('an update to the same booking increments SEQUENCE again while keeping the UID stable', () => {
    const first = parseIcs(buildBookingIcs({ ...baseInput, method: 'REQUEST', sequence: 0 }));
    const second = parseIcs(buildBookingIcs({ ...baseInput, method: 'REQUEST', sequence: 1, summary: 'Rescheduled lesson' }));
    expect(second.UID).toBe(first.UID);
    expect(Number(second.SEQUENCE)).toBe(Number(first.SEQUENCE) + 1);
    expect(second.SUMMARY).toBe('Rescheduled lesson');
  });

  it('escapes commas, semicolons, and newlines in TEXT properties (RFC 5545 §3.3.11)', () => {
    const ics = buildBookingIcs({
      ...baseInput,
      method: 'REQUEST',
      summary: 'Lesson: Jazz, Blues; Advanced',
      description: 'Line one\nLine two',
    });
    expect(ics).toContain('SUMMARY:Lesson: Jazz\\, Blues\\; Advanced');
    expect(ics).toContain('DESCRIPTION:Line one\\nLine two');
  });

  it('folds content lines longer than 75 octets per RFC 5545 §3.1', () => {
    const longSummary = 'A'.repeat(200);
    const ics = buildBookingIcs({ ...baseInput, method: 'REQUEST', summary: longSummary });
    const rawLines = ics.split('\r\n');
    for (const line of rawLines) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
    // Unfolding and re-parsing must recover the original, un-truncated value.
    expect(parseIcs(ics).SUMMARY).toBe(longSummary);
  });

  it('omits LOCATION entirely when none is given, rather than an empty property', () => {
    const ics = buildBookingIcs({ ...baseInput, method: 'REQUEST', location: null });
    expect(ics).not.toContain('LOCATION');
  });
});
