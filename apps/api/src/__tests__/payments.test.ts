// Unit tests for payment/payout resolver logic (permission checks and pure calculations)

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { requireAuth, requireRole } from '../middleware/auth';
import { calculateApplicationFee, PLATFORM_FEE_BPS } from '../resolvers/payments';

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
