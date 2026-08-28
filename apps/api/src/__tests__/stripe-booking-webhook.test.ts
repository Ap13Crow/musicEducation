process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_key_for_unit_tests';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_dummy_secret_for_unit_tests';

import Stripe from 'stripe';
import { handleStripeWebhook } from '../resolvers/payments';

function buildWebhookRequest(payload: object) {
  const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
  const header = Stripe.webhooks.generateTestHeaderString({ payload: rawBody.toString('utf8'), secret: process.env.STRIPE_WEBHOOK_SECRET! });
  return { rawBody, header };
}

function checkoutSessionCompletedEvent(metadata: Record<string, string>) {
  return {
    id: 'evt_test_1', type: 'checkout.session.completed',
    data: { object: { id: `cs_test_${metadata.refId}`, amount_total: 6000, currency: 'chf', payment_status: 'paid', metadata } },
  };
}

function fakePrisma(overrides: { paymentCreateThrowsP2002?: boolean; claimSucceeds?: boolean; booking?: Record<string, unknown> | null } = {}) {
  const payment = { id: 'payment-1', amount: { toNumber: () => 60 }, currency: 'CHF' };
  const booking = overrides.booking === undefined
    ? { id: 'booking-1', userId: 'user-1', paymentId: null, status: 'PENDING' }
    : overrides.booking;
  const bookingUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
  const paymentUpdateMany = jest.fn().mockResolvedValue({ count: overrides.claimSucceeds === false ? 0 : 1 });
  const txBookingFindUnique = jest.fn().mockResolvedValueOnce(booking).mockResolvedValue(null);
  const tx = {
    booking: { findUnique: txBookingFindUnique, updateMany: bookingUpdateMany },
    payment: { updateMany: paymentUpdateMany },
    mailOutboxMessage: { create: jest.fn() },
  };
  const prisma: any = {
    payment: {
      create: overrides.paymentCreateThrowsP2002 ? jest.fn().mockRejectedValue({ code: 'P2002' }) : jest.fn().mockResolvedValue(payment),
      findUniqueOrThrow: jest.fn().mockResolvedValue(payment),
    },
    $transaction: jest.fn(async (callback: (client: unknown) => Promise<void>) => callback(tx)),
  };
  return { prisma, txBookingFindUnique, bookingUpdateMany, paymentUpdateMany };
}

describe('handleStripeWebhook - paid booking request', () => {
  it('attaches payment, keeps the booking pending, resets the approval hold, and queues request mail atomically', async () => {
    const { prisma, bookingUpdateMany, paymentUpdateMany, txBookingFindUnique } = fakePrisma();
    const { rawBody, header } = buildWebhookRequest(checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }));

    await handleStripeWebhook(prisma, rawBody, header);

    expect(bookingUpdateMany).toHaveBeenCalledWith({
      where: { id: 'booking-1', userId: 'user-1', status: 'PENDING', paymentId: null },
      data: { paymentId: 'payment-1', holdExpiresAt: expect.any(Date) },
    });
    expect(bookingUpdateMany.mock.calls[0][0].data).not.toHaveProperty('status');
    expect(paymentUpdateMany).toHaveBeenCalledWith({
      where: { id: 'payment-1', confirmationEmailAt: null },
      data: { confirmationEmailAt: expect.any(Date) },
    });
    expect(txBookingFindUnique).toHaveBeenCalledTimes(2);
  });

  it('does not enqueue duplicate request mail on a Stripe retry', async () => {
    const { prisma, txBookingFindUnique } = fakePrisma({ claimSucceeds: false });
    const { rawBody, header } = buildWebhookRequest(checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }));
    await handleStripeWebhook(prisma, rawBody, header);
    expect(txBookingFindUnique).toHaveBeenCalledTimes(1);
  });

  it('repairs processing after a duplicate Payment insert race', async () => {
    const { prisma, bookingUpdateMany } = fakePrisma({ paymentCreateThrowsP2002: true });
    const { rawBody, header } = buildWebhookRequest(checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }));
    await handleStripeWebhook(prisma, rawBody, header);
    expect(prisma.payment.findUniqueOrThrow).toHaveBeenCalled();
    expect(bookingUpdateMany).toHaveBeenCalled();
  });

  it('rejects metadata that points at another student\'s booking', async () => {
    const { prisma } = fakePrisma({ booking: { id: 'booking-1', userId: 'another-user', paymentId: null, status: 'PENDING' } });
    const { rawBody, header } = buildWebhookRequest(checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }));
    await expect(handleStripeWebhook(prisma, rawBody, header)).rejects.toThrow('does not belong');
  });

  it('never revives or notifies a request that was cancelled before payment completed', async () => {
    const { prisma, bookingUpdateMany, paymentUpdateMany } = fakePrisma({
      booking: { id: 'booking-1', userId: 'user-1', paymentId: null, status: 'CANCELLED' },
    });
    const { rawBody, header } = buildWebhookRequest(checkoutSessionCompletedEvent({ userId: 'user-1', type: 'booking', refId: 'booking-1' }));
    await handleStripeWebhook(prisma, rawBody, header);
    expect(bookingUpdateMany).not.toHaveBeenCalled();
    expect(paymentUpdateMany).not.toHaveBeenCalled();
  });
});
