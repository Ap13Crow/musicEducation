// Unit tests for payment/payout resolver logic (permission checks and pure calculations)

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.STRIPE_SECRET_KEY = 'sk_test_key';

const mockStripeCreateSession = jest.fn();
const mockStripeRetrieveAccount = jest.fn();

jest.mock('stripe', () => jest.fn().mockImplementation(() => ({
  checkout: {
    sessions: {
      create: mockStripeCreateSession,
      retrieve: jest.fn(),
    },
  },
  webhooks: { constructEvent: jest.fn() },
  v2: {
    core: {
      accounts: {
        retrieve: mockStripeRetrieveAccount,
        create: jest.fn(),
      },
      accountLinks: { create: jest.fn() },
    },
  },
})));

import { requireAuth, requireRole } from '../middleware/auth';
import { calculateApplicationFee, getFrontendUrl, paymentResolvers, PLATFORM_FEE_BPS } from '../resolvers/payments';

describe('Stripe Connect onboarding permission checks', () => {
  it('allows TEACHER to start onboarding', () => {
    expect(() => requireRole({ id: 'teacher-1', role: 'TEACHER' }, 'TEACHER', 'ADMIN')).not.toThrow();
  });

  it('allows ADMIN to start onboarding', () => {
    expect(() => requireRole({ id: 'admin-1', role: 'ADMIN' }, 'TEACHER', 'ADMIN')).not.toThrow();
  });

  it('denies STUDENT from starting onboarding', () => {
    expect(() => requireRole({ id: 'student-1', role: 'STUDENT' }, 'TEACHER', 'ADMIN')).toThrow('FORBIDDEN');
  });

  it('denies unauthenticated callers', () => {
    expect(() => requireRole(null, 'TEACHER', 'ADMIN')).toThrow('UNAUTHENTICATED');
  });
});

describe('createCheckoutSession auth', () => {
  it('requires an authenticated user', () => {
    expect(() => requireAuth(null)).toThrow();
  });

  it('does not let a student create Checkout for another student\'s booking', async () => {
    const prisma: any = {
      booking: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'booking-1', userId: 'other-student', status: 'PENDING', paymentId: null,
          durationMin: 60, startsAt: new Date(), teacherProfile: { hourlyRate: 60, currency: 'CHF' },
        }),
      },
    };
    await expect(
      paymentResolvers.Mutation.createCheckoutSession(
        null,
        { type: 'booking', refId: 'booking-1' },
        { prisma, user: { id: 'student-1', role: 'STUDENT' } } as any,
      ),
    ).rejects.toThrow('Access denied');
  });
});

describe('createCheckoutSession Stripe Connect routing', () => {
  beforeEach(() => {
    mockStripeCreateSession.mockReset().mockResolvedValue({ id: 'cs_test_1', url: 'https://checkout.stripe.test/session' });
    mockStripeRetrieveAccount.mockReset().mockResolvedValue({
      configuration: {
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: { status: 'active' },
            },
          },
        },
      },
    });
    process.env.FRONTEND_URL = 'https://mymusic.test';
  });

  it('checks a connected teacher account live but holds booking revenue on the platform', async () => {
    const startsAt = new Date('2026-09-02T11:00:00.000Z');
    const booking = {
      id: 'booking-1',
      userId: 'student-1',
      status: 'PENDING',
      paymentId: null,
      durationMin: 60,
      startsAt,
      teacherProfile: {
        id: 'tp-1',
        userId: 'teacher-1',
        hourlyRate: 100,
        currency: 'CHF',
        stripeAccountId: 'acct_teacher_123',
        stripePayoutsEnabled: false,
      },
    };
    const prisma: any = {
      booking: { findUnique: jest.fn().mockResolvedValue(booking) },
      teacherProfile: { update: jest.fn() },
    };

    const result = await paymentResolvers.Mutation.createCheckoutSession(
      null,
      { type: 'booking', refId: 'booking-1' },
      { prisma, user: { id: 'student-1', role: 'STUDENT' } } as any,
    );

    expect(result.checkoutUrl).toBe('https://checkout.stripe.test/session');
    expect(mockStripeRetrieveAccount).toHaveBeenCalledWith('acct_teacher_123', {
      include: ['configuration.recipient'],
    });
    expect(prisma.teacherProfile.update).toHaveBeenCalledWith({
      where: { id: 'tp-1' },
      data: { stripePayoutsEnabled: true },
    });
    expect(mockStripeCreateSession).toHaveBeenCalledWith(expect.objectContaining({
      metadata: expect.objectContaining({
        userId: 'student-1',
        type: 'booking',
        refId: 'booking-1',
        teacherProfileId: 'tp-1',
        teacherUserId: 'teacher-1',
        stripeConnectedAccountId: 'acct_teacher_123',
      }),
      payment_intent_data: expect.objectContaining({
        metadata: expect.objectContaining({
          teacherProfileId: 'tp-1',
          stripeConnectedAccountId: 'acct_teacher_123',
        }),
      }),
    }));
    expect(mockStripeCreateSession.mock.calls[0][0].payment_intent_data).not.toHaveProperty('transfer_data');
    expect(mockStripeCreateSession.mock.calls[0][0].payment_intent_data).not.toHaveProperty('application_fee_amount');
  });
});

// Regression test for the bug where an unset FRONTEND_URL silently produced
// "undefined/payment/success..." and Stripe rejected the session with
// "Invalid URL: An explicit scheme (such as https) must be provided" - the
// enroll button did nothing but log an opaque ApolloError. Now it fails
// loudly and specifically instead, and deploy/workloads/application/api.yaml
// sets FRONTEND_URL so this never fires in the deployed environment.
describe('getFrontendUrl', () => {
  const original = process.env.FRONTEND_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = original;
  });

  it('throws a clear, specific error when FRONTEND_URL is unset', () => {
    delete process.env.FRONTEND_URL;
    expect(() => getFrontendUrl()).toThrow('FRONTEND_URL');
  });

  it('returns the configured value when set', () => {
    process.env.FRONTEND_URL = 'https://dev.mymusic.coach';
    expect(getFrontendUrl()).toBe('https://dev.mymusic.coach');
  });
});

describe('calculateApplicationFee', () => {
  it('takes PLATFORM_FEE_BPS basis points of the charge', () => {
    expect(PLATFORM_FEE_BPS).toBe(1500); // 15%
    expect(calculateApplicationFee(10000)).toBe(1500); // CHF 100.00 → CHF 15.00 fee
  });

  it('rounds to the nearest cent', () => {
    expect(calculateApplicationFee(999)).toBe(150); // 149.85 → 150
    expect(calculateApplicationFee(1)).toBe(0); // 0.15 → 0
  });

  it('returns zero for a zero-amount charge', () => {
    expect(calculateApplicationFee(0)).toBe(0);
  });
});
