import type { Prisma } from '@my-music-coach/database';

// Very small syntactic check - callers already source these from
// User.email (Keycloak-verified, DB-unique) or UserProfile.notificationEmail
// (free-text user input). This exists only to keep obvious garbage
// (empty string, a stray space) out of the outbox rather than to be a
// complete RFC 5322 validator.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string | null | undefined): value is string {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

// The unique set of valid addresses for one recipient "party" (a student or
// a teacher on a booking): their account email plus, when set and
// different, their own private notification email. Never returns
// duplicates, and silently drops anything that isn't a plausible address
// rather than letting a malformed notificationEmail break delivery to the
// account email that IS valid.
export function recipientAddresses(accountEmail: string | null | undefined, notificationEmail: string | null | undefined): string[] {
  const set = new Set<string>();
  for (const candidate of [accountEmail, notificationEmail]) {
    if (isValidEmail(candidate)) set.add(candidate.trim().toLowerCase());
  }
  return [...set];
}

type OutboxTx = Pick<Prisma.TransactionClient, 'mailOutboxMessage'>;

// Writes a durable outbox row instead of calling the SMTP relay directly.
// Callers pass the transaction they're already using for the booking state
// change (booking create/update), so the notification is committed
// atomically with the event it announces - a crash between the two can
// never leave a CONFIRMED booking with no queued notification, and a
// rolled-back booking transaction never leaves an orphan outbox row either.
// apps/worker's mail-dispatch job is the only thing that ever calls
// sendMail() for these; recipients with no valid address are skipped
// (nothing enqueued) rather than creating a row nothing can ever deliver.
export async function enqueueMail(
  tx: OutboxTx,
  message: { kind: 'BOOKING_CONFIRMATION' | 'BOOKING_CANCELLED'; bookingId?: string; recipients: string[]; subject: string; html: string },
): Promise<void> {
  if (message.recipients.length === 0) return;
  await tx.mailOutboxMessage.create({
    data: {
      kind: message.kind,
      bookingId: message.bookingId ?? null,
      recipients: message.recipients,
      subject: message.subject,
      html: message.html,
    },
  });
}
