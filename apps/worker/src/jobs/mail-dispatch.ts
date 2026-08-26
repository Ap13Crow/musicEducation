import { sendMail } from '../lib/mailer.js';
import type { Job } from './types.js';

const BATCH_SIZE = 25;
// Exponential backoff between delivery attempts, capped at 6 hours - a
// dead Google Workspace relay shouldn't be hammered every minute, but a
// transient blip should retry well within the same day.
const BASE_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 6 * 60 * 60_000;

function nextBackoff(attempts: number): Date {
  const ms = Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1), MAX_BACKOFF_MS);
  return new Date(Date.now() + ms);
}

/**
 * Delivers durable outbox messages written by apps/api (booking
 * confirmations for lessons and events - see apps/api/src/lib/mailOutbox.ts). Polls
 * PENDING/FAILED rows whose nextAttemptAt is due, sends each via the SMTP
 * relay, and records the outcome:
 *   - success -> SENT
 *   - failure, attempts remaining -> FAILED, backoff applied to nextAttemptAt
 *   - failure, attempts exhausted -> DEAD_LETTER (visible to admins via
 *     Query.mailOutbox, never silently dropped)
 *
 * One message failing never blocks the rest of the batch. Only a single
 * worker replica runs in the current dev topology (deploy/README.md), so
 * there is no cross-replica claim/lease here yet - scaling the worker out
 * would need one (e.g. a short-lived "claimed" marker or `FOR UPDATE SKIP
 * LOCKED`) to avoid two replicas picking up the same due row.
 */
export const mailDispatchJob: Job = {
  key: 'mail-dispatch',
  schedule: '*/1 * * * *',
  async run(ctx) {
    const due = await ctx.prisma.mailOutboxMessage.findMany({
      where: { status: { in: ['PENDING', 'FAILED'] }, nextAttemptAt: { lte: new Date() } },
      orderBy: { nextAttemptAt: 'asc' },
      take: BATCH_SIZE,
    });
    if (due.length === 0) return;

    let sent = 0;
    let deadLettered = 0;
    let retried = 0;
    for (const message of due) {
      const attempts = message.attempts + 1;
      try {
        await sendMail({
          to: message.recipients.join(', '),
          subject: message.subject,
          html: message.html,
          ...(message.icsContent && (message.icsMethod === 'REQUEST' || message.icsMethod === 'CANCEL')
            ? { icalEvent: { method: message.icsMethod, content: message.icsContent } }
            : {}),
        });
        await ctx.prisma.mailOutboxMessage.update({
          where: { id: message.id },
          data: { status: 'SENT', attempts, sentAt: new Date(), lastError: null },
        });
        sent += 1;
      } catch (error) {
        // nodemailer's SMTP errors carry structured detail beyond
        // .message (a bare AUTH failure's .message is often just "Invalid
        // login", while .code/.responseCode/.command pinpoint whether this
        // is a credentials problem (EAUTH/535), a connectivity problem to
        // the relay itself (ECONNECTION/ETIMEDOUT), or something else) -
        // folding them into the one lastError string (the schema has no
        // structured field for this) means the admin Mail Queue tab shows
        // the actionable detail on first read, not just "Invalid login".
        const base = error instanceof Error ? error.message : String(error);
        const code = (error as any)?.code;
        const responseCode = (error as any)?.responseCode;
        const command = (error as any)?.command;
        const detail = [code && `code=${code}`, responseCode && `responseCode=${responseCode}`, command && `command=${command}`].filter(Boolean).join(' ');
        const lastError = detail ? `${base} (${detail})` : base;
        const exhausted = attempts >= message.maxAttempts;
        await ctx.prisma.mailOutboxMessage.update({
          where: { id: message.id },
          data: {
            status: exhausted ? 'DEAD_LETTER' : 'FAILED',
            attempts,
            lastError,
            nextAttemptAt: exhausted ? message.nextAttemptAt : nextBackoff(attempts),
          },
        });
        if (exhausted) {
          deadLettered += 1;
          ctx.logger.error({ messageId: message.id, kind: message.kind, bookingId: message.bookingId, attempts }, 'Mail message moved to dead letter');
        } else {
          retried += 1;
          ctx.logger.warn({ messageId: message.id, attempts, error: lastError }, 'Mail delivery attempt failed; will retry');
        }
      }
    }
    ctx.logger.info({ due: due.length, sent, retried, deadLettered }, 'Mail dispatch batch complete');
  },
};
