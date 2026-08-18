// Unit tests for the XP ledger (WP11): permission checks and the pure
// course-bonus bounds check. Idempotency of awardXpOnce (the P2002-swallow
// behavior for one-time reasons) and end-to-end schema application were
// verified against a real local Postgres during development - see the
// session's deploy/database/identity validation ritual.

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { requireAuth, requireRole } from '../middleware/auth';
import { isValidCourseBonusAmount } from '../resolvers/xp';

describe('awardCourseXp permission checks', () => {
  it('allows TEACHER and ADMIN to award a course bonus', () => {
    expect(() => requireRole({ id: 'teacher-1', role: 'TEACHER' }, 'TEACHER', 'ADMIN')).not.toThrow();
    expect(() => requireRole({ id: 'admin-1', role: 'ADMIN' }, 'TEACHER', 'ADMIN')).not.toThrow();
  });

  it('denies STUDENT from awarding a course bonus', () => {
    expect(() => requireRole({ id: 'student-1', role: 'STUDENT' }, 'TEACHER', 'ADMIN')).toThrow('FORBIDDEN');
  });

  it('denies unauthenticated callers', () => {
    expect(() => requireAuth(null)).toThrow('UNAUTHENTICATED');
  });
});

describe('isValidCourseBonusAmount', () => {
  it('accepts a whole number within bounds', () => {
    expect(isValidCourseBonusAmount(50, 5, 200)).toBe(true);
  });

  it('accepts the boundary values themselves', () => {
    expect(isValidCourseBonusAmount(5, 5, 200)).toBe(true);
    expect(isValidCourseBonusAmount(200, 5, 200)).toBe(true);
  });

  it('rejects below the minimum', () => {
    expect(isValidCourseBonusAmount(4, 5, 200)).toBe(false);
  });

  it('rejects above the maximum', () => {
    expect(isValidCourseBonusAmount(201, 5, 200)).toBe(false);
  });

  it('rejects a fractional amount', () => {
    expect(isValidCourseBonusAmount(50.5, 5, 200)).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(isValidCourseBonusAmount('50', 5, 200)).toBe(false);
    expect(isValidCourseBonusAmount(NaN, 5, 200)).toBe(false);
    expect(isValidCourseBonusAmount(undefined, 5, 200)).toBe(false);
  });
});
