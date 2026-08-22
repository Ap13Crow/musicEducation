// RFC 5545 calendar invitations for bookings. UTC ("Z"-suffixed) DTSTART/
// DTEND rather than a VTIMEZONE block: every mainstream client (Google
// Calendar, Apple Calendar, Outlook) converts a UTC time to the viewer's
// own local zone correctly on import, and this avoids shipping a full IANA
// tzdata VTIMEZONE definition. The booking's own timezone context lives in
// the platform UI, not the invitation - the invitation only has to be
// unambiguous, which UTC already is.

export interface IcsAttendee {
  email: string;
  name: string;
}

export interface BookingIcsInput {
  /** Stable per-booking id, e.g. `booking-${bookingId}`. Same UID is reused for every update/cancel. */
  uid: string;
  /** RFC 5545 SEQUENCE - increment on every re-send for the same UID so a client applies changes, not duplicates. */
  sequence: number;
  method: 'REQUEST' | 'CANCEL';
  startsAt: Date;
  endsAt: Date;
  organizer: IcsAttendee;
  attendees: IcsAttendee[];
  summary: string;
  description: string;
  /** Physical address for an IN_PERSON/HYBRID lesson, or a join URL for ONLINE - freeform, both go in LOCATION. */
  location?: string | null;
}

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0');
}

// RFC 5545 §3.3.5 form #2: UTC time, e.g. 20260901T140000Z.
function formatIcsUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

// RFC 5545 §3.3.11: backslash-escape comma, semicolon, backslash, and
// encode newlines as literal "\n" - required for TEXT-valued properties
// (SUMMARY, DESCRIPTION, LOCATION) or a value containing any of these
// characters produces an invalid/misparsed calendar file.
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// RFC 5545 §3.1: a content line longer than 75 octets must be "folded" by
// inserting CRLF followed by a single space before continuing - a client
// that doesn't unfold long lines will otherwise truncate or reject them.
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(' ' + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return parts.join('\r\n');
}

/**
 * Builds a single-VEVENT RFC 5545 calendar object for a booking. Returns
 * CRLF-terminated ICS text ready to hand to nodemailer's `icalEvent`
 * option (method must match the returned METHOD).
 */
export function buildBookingIcs(input: BookingIcsInput): string {
  const now = formatIcsUtc(new Date());
  const status = input.method === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyMusic.Coach//Booking//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${input.method}`,
    'BEGIN:VEVENT',
    `UID:${input.uid}`,
    `SEQUENCE:${input.sequence}`,
    `STATUS:${status}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcsUtc(input.startsAt)}`,
    `DTEND:${formatIcsUtc(input.endsAt)}`,
    `SUMMARY:${escapeText(input.summary)}`,
    `DESCRIPTION:${escapeText(input.description)}`,
    ...(input.location ? [`LOCATION:${escapeText(input.location)}`] : []),
    `ORGANIZER;CN=${escapeText(input.organizer.name)}:mailto:${input.organizer.email}`,
    ...input.attendees.map(
      (a) =>
        `ATTENDEE;CN=${escapeText(a.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=${input.method === 'CANCEL' ? 'DECLINED' : 'NEEDS-ACTION'};RSVP=TRUE:mailto:${a.email}`,
    ),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
