// Unit tests for payment/payout resolver logic (permission checks and pure calculations)

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { requireAuth, requireRole } from '../middleware/auth';
import { calculateApplicationFee, getFrontendUrl, PLATFORM_FEE_BPS } from '../resolvers/payments';

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
