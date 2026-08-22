// Regression coverage for a Copilot review finding on PR #47: the
// 'booking' branch of handleStripeWebhook (apps/api/src/resolvers/
// payments.ts) used to update the booking with the plain `prisma` client
// and then fire-and-forget notifyBookingConfirmed(prisma, ...) - two
// separate, non-atomic writes. A crash between them left the booking
// CONFIRMED with confirmationEmailAt already claimed and no outbox row
// ever written, and no Stripe retry could repair it (the claim's own
// `WHERE confirmationEmailAt IS NULL` guard had already been consumed).
// Fixed to run the booking-status transition, the claim, and the
// (conditional) notifyBookingConfirmed call inside one prisma.$transaction,
// matching every other confirm path in bookings.ts.
//
// Uses Stripe's own generateTestHeaderString helper (no network call, no
// mocking) to build a real, verifiable webhook signature, so this exercises
// handleStripeWebhook exactly as it runs in production rather than
// stubbing around it.

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_key_for_unit_tests';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_dummy_secret_for_unit_tests';

import Stripe from 'stripe';
import { handleStripeWebhook } from '../resolvers/payments';

function buildWebhookRequest(payload: object) {
  const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
  const header = Stripe.webhooks.generateTestHeaderString({
    payload: rawBody.toString('utf8'),
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  return { rawBody, header };
}

function checkoutSessionCompletedEvent(metadata: Record<string, string>) {
  return {
    id: 'evt_test_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: `cs_test_${metadata.refId}`,
        amount_total: 6000,
        currency: 'chf',
        metadata,
      },
    },
  };
}

// Only the shape handleStripeWebhook's booking branch actually touches.
function fakePrismaForBookingWebhook(overrides: {
  paymentCreateThrowsP2002?: boolean;
  claimSucceeds: boolean;
}) {
  const paymentRow = { id: 'payment-1', amount: { toNumber: () => 60 }, currency: 'CHF' };
  const bookingUpdate = jest.fn().mockResolvedValue({});
  const paymentUpdateMany = jest.fn().mockResolvedValue({ count: overrides.claimSucceeds ? 1 : 0 });
  // Mirrors notifyBookingConfirmed's own early-return-on-not-found guard -
  // this test only needs to prove *whether* it was invoked (via this call
  // being made), not exercise its own email-content logic (see ics.test.ts/
  // schema-wiring.test.ts for that).
  const txBookingFindUnique = jest.fn().mockResolvedValue(null);

  const tx = {
    booking: { update: bookingUpdate, findUnique: txBookingFindUnique },
    payment: { updateMany: paymentUpdateMany },
  };

  const prisma: any = {
    payment: {
      create: overrides.paymentCreateThrowsP2002
        ? jest.fn().mockRejectedValue({ code: 'P2002' })
        : jest.fn().mockResolvedValue(paymentRow),
      findUniqueOrThrow: jest.fn().mockResolvedValue(paymentRow),
    },
    $transaction: jest.fn(async (callback: (tx: unknown) => Promise<void>) => callback(tx)),
  };

  return { prisma, tx, bookingUpdate, paymentUpdateMany, txBookingFindUnique };
}

describe('handleStripeWebhook - booking branch atomicity', () => {
  it('updates the booking and enqueues the confirmation email inside the same transaction when the claim succeeds', async () => {
    const { prisma, bookingUpdate, paymentUpdateMany, txBookingFindUnique } = fakePrismaForBookingWebhook({ claimSucceeds: true });
    const { rawBody, header } = buildWebhookRequest(
      checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }),
    );

    await handleStripeWebhook(prisma, rawBody, header);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(bookingUpdate).toHaveBeenCalledWith({
      where: { id: 'booking-1' },
      data: { paymentId: 'payment-1', status: 'CONFIRMED' },
    });
    expect(paymentUpdateMany).toHaveBeenCalledWith({
      where: { id: 'payment-1', confirmationEmailAt: null },
      data: { confirmationEmailAt: expect.any(Date) },
    });
    // notifyBookingConfirmed(tx, 'booking-1') was actually invoked, using
    // the *transaction* client, not the plain prisma client.
    expect(txBookingFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'booking-1' } }));
  });

  it('still confirms the booking, but skips notifyBookingConfirmed, when the email was already claimed (e.g. a Stripe retry)', async () => {
    const { prisma, bookingUpdate, txBookingFindUnique } = fakePrismaForBookingWebhook({ claimSucceeds: false });
    const { rawBody, header } = buildWebhookRequest(
      checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }),
    );

    await handleStripeWebhook(prisma, rawBody, header);

    expect(bookingUpdate).toHaveBeenCalled();
    expect(txBookingFindUnique).not.toHaveBeenCalled();
  });

  it('a redelivered webhook (Payment already exists, P2002 on create) still runs the transactional confirm path', async () => {
    const { prisma, bookingUpdate, txBookingFindUnique } = fakePrismaForBookingWebhook({
      paymentCreateThrowsP2002: true,
      claimSucceeds: true,
    });
    const { rawBody, header } = buildWebhookRequest(
      checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }),
    );

    await handleStripeWebhook(prisma, rawBody, header);

    expect(prisma.payment.findUniqueOrThrow).toHaveBeenCalled();
    expect(bookingUpdate).toHaveBeenCalled();
    expect(txBookingFindUnique).toHaveBeenCalled();
  });
});
