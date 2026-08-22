import { GraphQLError } from 'graphql';
import type { Prisma } from '@my-music-coach/database';

/**
 * The credit balance for a package purchase is always the sum of its
 * ledger entries (GRANT/RESTORE positive, CONSUME/EXPIRE negative) - never
 * a mutable counter column. Every grant, consumption, restoration, and
 * expiry is its own auditable row (LessonCreditLedgerEntry).
 */
export async function creditBalance(tx: Prisma.TransactionClient, purchaseId: string): Promise<number> {
  const agg = await tx.lessonCreditLedgerEntry.aggregate({ where: { purchaseId }, _sum: { amount: true } });
  return agg._sum.amount ?? 0;
}

/** Called once, at purchase grant time (see the checkout webhook handler). */
export async function grantCredits(tx: Prisma.TransactionClient, purchaseId: string, amount: number): Promise<void> {
  await tx.lessonCreditLedgerEntry.create({ data: { purchaseId, type: 'GRANT', amount, note: 'Package purchased.' } });
}

/**
 * Consumes exactly one lesson credit for a booking made against this
 * package. Locks the purchase row for the rest of the transaction (SELECT
 * ... FOR UPDATE) before computing the balance, so two concurrent bookings
 * against the same purchase's last credit can't both succeed - the second
 * blocks until the first commits, then re-reads the now-current balance
 * and correctly finds it exhausted. Call this INSIDE the same transaction
 * that creates/confirms the booking.
 */
export async function consumeCredit(tx: Prisma.TransactionClient, purchaseId: string, bookingId: string): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "LessonPackagePurchase" WHERE "id" = ${purchaseId} FOR UPDATE`;
  const balance = await creditBalance(tx, purchaseId);
  if (balance <= 0) {
    throw new GraphQLError('This lesson package has no remaining credits.', { extensions: { code: 'CONFLICT' } });
  }
  await tx.lessonCreditLedgerEntry.create({ data: { purchaseId, type: 'CONSUME', amount: -1, bookingId } });
}

/**
 * Restores one credit when a package-booked lesson is cancelled on time
 * (never for a late cancellation/no-show - the whole point of the
 * cancellation-window rule is that a late one still costs the credit).
 */
export async function restoreCredit(tx: Prisma.TransactionClient, purchaseId: string, bookingId: string): Promise<void> {
  await tx.lessonCreditLedgerEntry.create({ data: { purchaseId, type: 'RESTORE', amount: 1, bookingId, note: 'On-time cancellation.' } });
}
