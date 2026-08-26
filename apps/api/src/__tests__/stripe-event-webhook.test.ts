process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_key_for_unit_tests';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_dummy_secret_for_unit_tests';

const mockAwardXpOnce = jest.fn().mockResolvedValue(undefined);
jest.mock('../resolvers/xp.js', () => ({
  awardXpOnce: (...args: any[]) => mockAwardXpOnce(...args),
}));

import Stripe from 'stripe';
import { handleStripeWebhook } from '../resolvers/payments';

function webhookRequest() {
  const payload = JSON.stringify({
    id: 'evt_event_booking_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_event_booking_1',
        amount_total: 2500,
        currency: 'chf',
        metadata: { userId: 'student-1', type: 'event', refId: 'event-1' },
      },
    },
  });
  return {
    rawBody: Buffer.from(payload, 'utf8'),
    signature: Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    }),
  };
}

function fakePrisma(claimSucceeds: boolean) {
  const payment = { id: 'payment-1', amount: { toNumber: () => 25 }, currency: 'CHF' };
  const outboxCreate = jest.fn().mockResolvedValue({});
  const eventBookingUpsert = jest.fn().mockResolvedValue({ id: 'event-booking-1' });
  const paymentUpdateMany = jest.fn().mockResolvedValue({ count: claimSucceeds ? 1 : 0 });
  const tx = {
    eventBooking: {
      upsert: eventBookingUpsert,
      findUnique: jest.fn().mockResolvedValue({
        id: 'event-booking-1',
        email: null,
        user: {
          email: 'student@example.com',
          profile: { displayName: 'Student Name', notificationEmail: null },
        },
        event: {
          title: 'Paid Masterclass',
          startsAt: new Date('2026-11-12T18:00:00.000Z'),
          format: 'ONLINE',
          venueName: null,
          venueAddress: null,
          city: null,
          onlineMeetingUrl: 'https://meet.example.test/masterclass',
          publisher: {
            email: 'teacher@example.com',
            profile: { displayName: 'Teacher Name', notificationEmail: null },
          },
        },
      }),
    },
    payment: { updateMany: paymentUpdateMany },
    mailOutboxMessage: { create: outboxCreate },
  };
  const prisma: any = {
    payment: {
      create: jest.fn().mockResolvedValue(payment),
      findUniqueOrThrow: jest.fn(),
    },
    $transaction: jest.fn(async (callback: any) => callback(tx)),
  };
  return { prisma, eventBookingUpsert, paymentUpdateMany, outboxCreate };
}

describe('paid event webhook email delivery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('confirms the booking, claims the payment marker, and queues both emails atomically', async () => {
    const { prisma, eventBookingUpsert, paymentUpdateMany, outboxCreate } = fakePrisma(true);
    const { rawBody, signature } = webhookRequest();

    await handleStripeWebhook(prisma, rawBody, signature);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(eventBookingUpsert).toHaveBeenCalledWith({
      where: { userId_eventId: { userId: 'student-1', eventId: 'event-1' } },
      update: { paymentId: 'payment-1', status: 'CONFIRMED' },
      create: {
        userId: 'student-1',
        eventId: 'event-1',
        paymentId: 'payment-1',
        status: 'CONFIRMED',
      },
    });
    expect(paymentUpdateMany).toHaveBeenCalledWith({
      where: { id: 'payment-1', confirmationEmailAt: null },
      data: { confirmationEmailAt: expect.any(Date) },
    });
    expect(outboxCreate).toHaveBeenCalledTimes(2);
    expect(outboxCreate.mock.calls.map(([call]) => call.data.kind)).toEqual([
      'EVENT_CONFIRMATION',
      'EVENT_CONFIRMATION',
    ]);
  });

  it('does not queue duplicate emails when Stripe redelivers an already-claimed payment', async () => {
    const { prisma, eventBookingUpsert, outboxCreate } = fakePrisma(false);
    const { rawBody, signature } = webhookRequest();

    await handleStripeWebhook(prisma, rawBody, signature);

    expect(eventBookingUpsert).toHaveBeenCalled();
    expect(outboxCreate).not.toHaveBeenCalled();
  });
});
