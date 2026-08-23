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
  // The booking this resolver's own capacity-reservation lookup should see
  // (its first tx.booking.findUnique call). notifyBookingConfirmed makes
  // its own separate findUnique call right after - always stubbed to null
  // (its early-return-on-not-found guard), since this test file isn't
  // exercising its email-content logic (see ics.test.ts/schema-wiring.test.ts
  // for that) and a bare {teacherProfileId, instrument, userId} row would
  // crash it (it also reads booking.user/booking.teacherProfile.user).
  bookingForCapacity?: { teacherProfileId: string; instrument: string | null; userId: string } | null;
}) {
  const paymentRow = { id: 'payment-1', amount: { toNumber: () => 60 }, currency: 'CHF' };
  const bookingUpdate = jest.fn().mockResolvedValue({});
  const paymentUpdateMany = jest.fn().mockResolvedValue({ count: overrides.claimSucceeds ? 1 : 0 });
  const txBookingFindUnique = jest.fn()
    .mockResolvedValueOnce(overrides.bookingForCapacity ?? null)
    .mockResolvedValue(null);
  // No TeacherInstrumentCapacity row configured -> reserveInstrumentCapacity
  // reads it, finds nothing, and no-ops (see capacity.test.ts for its own
  // enforcement logic) - this test only needs to prove the call happened.
  const queryRaw = jest.fn().mockResolvedValue([]);

  const tx = {
    booking: { update: bookingUpdate, findUnique: txBookingFindUnique },
    payment: { updateMany: paymentUpdateMany },
    $queryRaw: queryRaw,
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

  return { prisma, tx, bookingUpdate, paymentUpdateMany, txBookingFindUnique, queryRaw };
}

describe('handleStripeWebhook - booking branch atomicity', () => {
  it('updates the booking and enqueues the confirmation email inside the same transaction when the claim succeeds', async () => {
    const { prisma, bookingUpdate, paymentUpdateMany, txBookingFindUnique } = fakePrismaForBookingWebhook({ claimSucceeds: true });
    const { rawBody, header } = buildWebhookRequest(
      checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }),
    );

    await handleStripeWebhook(prisma, rawBody, header);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    // holdExpiresAt cleared here too - a payment-pending booking has one set
    // (bookSession), stale/irrelevant once CONFIRMED (matches confirmBooking's
    // manual-approval path, which also clears it).
    expect(bookingUpdate).toHaveBeenCalledWith({
      where: { id: 'booking-1' },
      data: { paymentId: 'payment-1', status: 'CONFIRMED', holdExpiresAt: null },
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
    // Exactly once - the capacity-reservation lookup (this resolver's own,
    // runs on every delivery regardless of the email claim) still fires;
    // only notifyBookingConfirmed's separate lookup is skipped.
    expect(txBookingFindUnique).toHaveBeenCalledTimes(1);
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

  // A paid booking is never created CONFIRMED (see bookSession's
  // requiresPayment in bookings.ts) - nothing has reserved a capacity seat
  // for it yet, so this webhook, the true confirmation moment, must do it.
  it('reserves instrument capacity when the booking has an instrument', async () => {
    const bookingForCapacity = { teacherProfileId: 'teacher-1', instrument: 'Piano', userId: 'user-1' };
    const { prisma, queryRaw } = fakePrismaForBookingWebhook({ claimSucceeds: true, bookingForCapacity });
    const { rawBody, header } = buildWebhookRequest(
      checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }),
    );

    await handleStripeWebhook(prisma, rawBody, header);

    // reserveInstrumentCapacity's own TeacherInstrumentCapacity lookup -
    // proves it actually ran for this booking's teacher/instrument.
    expect(queryRaw).toHaveBeenCalled();
  });

  // Copilot review finding on PR #58: reserveInstrumentCapacity used to run
  // AFTER the booking.update that sets status: 'CONFIRMED'. Its own "already
  // active" check matches on {teacherProfileId, userId, instrument, status:
  // CONFIRMED|COMPLETED} - with the update already applied, this booking
  // matched itself and short-circuited the very capacity check it exists to
  // enforce, silently admitting a student past a full cap.
  it('reserves capacity before updating the booking to CONFIRMED, never after', async () => {
    const bookingForCapacity = { teacherProfileId: 'teacher-1', instrument: 'Piano', userId: 'user-1' };
    const { prisma, queryRaw, bookingUpdate } = fakePrismaForBookingWebhook({ claimSucceeds: true, bookingForCapacity });
    const { rawBody, header } = buildWebhookRequest(
      checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }),
    );

    await handleStripeWebhook(prisma, rawBody, header);

    const capacityCallOrder = queryRaw.mock.invocationCallOrder[0];
    const updateCallOrder = bookingUpdate.mock.invocationCallOrder[0];
    expect(capacityCallOrder).toBeLessThan(updateCallOrder);
  });

  // A Stripe retry redelivering this event finds the booking already
  // CONFIRMED from the first delivery - reserveInstrumentCapacity's own
  // "already active" self-match makes a second call here a harmless no-op
  // (it still runs; it just doesn't reserve a second seat), the same
  // idempotency the email claim gives the notification side.
  it('still calls the capacity lookup on a redelivery, even though the email claim was already made', async () => {
    const bookingForCapacity = { teacherProfileId: 'teacher-1', instrument: 'Piano', userId: 'user-1' };
    const { prisma, queryRaw } = fakePrismaForBookingWebhook({ claimSucceeds: false, bookingForCapacity });
    const { rawBody, header } = buildWebhookRequest(
      checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }),
    );

    await handleStripeWebhook(prisma, rawBody, header);

    expect(queryRaw).toHaveBeenCalled();
  });
});
