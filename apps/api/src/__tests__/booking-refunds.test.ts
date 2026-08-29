process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.STRIPE_SECRET_KEY = 'sk_test_key';

const mockRefundCreate = jest.fn();

jest.mock('stripe', () => jest.fn().mockImplementation(() => ({
  checkout: { sessions: { retrieve: jest.fn() } },
  refunds: { create: mockRefundCreate },
})));

import { refundStripePaymentForBooking } from '../resolvers/bookings';

describe('booking cart refunds', () => {
  beforeEach(() => {
    mockRefundCreate.mockReset().mockResolvedValue({ id: 're_test' });
  });

  it('refunds the snapshotted order-item amount and preserves a partial order payout hold', async () => {
    const prisma: any = {
      booking: { findUnique: jest.fn().mockResolvedValue({
        id: 'booking-1', paymentId: 'payment-1',
        checkoutOrder: {
          id: 'order-1',
          bookings: [
            { id: 'booking-1', status: 'CONFIRMED' },
            { id: 'booking-2', status: 'CONFIRMED' },
          ],
          items: [
            { type: 'BOOKING', refId: 'booking-1', totalAmount: '95.00' },
            { type: 'BOOKING', refId: 'booking-2', totalAmount: '50.00' },
          ],
        },
      }) },
      payment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'payment-1', provider: 'STRIPE', status: 'PAID', providerPaymentIntentId: 'pi_test' }),
        update: jest.fn().mockResolvedValue({}),
      },
      checkoutOrder: { update: jest.fn().mockResolvedValue({}) },
    };

    await refundStripePaymentForBooking(prisma, 'booking-1');

    expect(mockRefundCreate).toHaveBeenCalledWith(
      { payment_intent: 'pi_test', amount: 9500 },
      { idempotencyKey: 'booking-cancellation-booking-1' },
    );
    expect(prisma.payment.update).toHaveBeenCalledWith({ where: { id: 'payment-1' }, data: { status: 'PARTIALLY_REFUNDED' } });
    expect(prisma.checkoutOrder.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: expect.not.objectContaining({ teacherTransferStatus: 'REVERSED' }),
    });
  });

  it('marks the payout state reversed when the complete order is refunded', async () => {
    const prisma: any = {
      booking: { findUnique: jest.fn().mockResolvedValue({
        id: 'booking-1', paymentId: 'payment-1',
        checkoutOrder: {
          id: 'order-1',
          bookings: [{ id: 'booking-1', status: 'CONFIRMED' }],
          items: [{ type: 'BOOKING', refId: 'booking-1', totalAmount: '80.00' }],
        },
      }) },
      payment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'payment-1', provider: 'STRIPE', status: 'PAID', providerPaymentIntentId: 'pi_test' }),
        update: jest.fn().mockResolvedValue({}),
      },
      checkoutOrder: { update: jest.fn().mockResolvedValue({}) },
    };

    await refundStripePaymentForBooking(prisma, 'booking-1');

    expect(prisma.checkoutOrder.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: expect.objectContaining({ status: 'REFUNDED', teacherTransferStatus: 'REVERSED' }),
    });
  });
});
