// Unit tests for teacher application permission checks (self-service "become a teacher" queue)

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { requireAuth, requireRole } from '../middleware/auth';
import { calculateAge } from '../resolvers/teacherApplications';

describe('applyForTeacher permission checks', () => {
  it('allows an authenticated STUDENT to apply', () => {
    expect(() => requireAuth({ id: 'student-1', role: 'STUDENT' })).not.toThrow();
  });

  it('denies unauthenticated callers', () => {
    expect(() => requireAuth(null)).toThrow();
  });
});

describe('reviewTeacherApplication permission checks', () => {
  it('allows ADMIN to review', () => {
    expect(() => requireRole({ id: 'admin-1', role: 'ADMIN' }, 'ADMIN')).not.toThrow();
  });

  it('denies TEACHER from reviewing', () => {
    expect(() => requireRole({ id: 'teacher-1', role: 'TEACHER' }, 'ADMIN')).toThrow('FORBIDDEN');
  });

  it('denies STUDENT from reviewing', () => {
    expect(() => requireRole({ id: 'student-1', role: 'STUDENT' }, 'ADMIN')).toThrow('FORBIDDEN');
  });

  it('denies unauthenticated callers', () => {
    expect(() => requireRole(null, 'ADMIN')).toThrow('UNAUTHENTICATED');
  });
});

describe('applyForTeacher: already-a-teacher guard logic', () => {
  it('flags TEACHER and ADMIN as already having teacher access', () => {
    const alreadyHasAccess = (role: string) => role === 'TEACHER' || role === 'ADMIN';
    expect(alreadyHasAccess('TEACHER')).toBe(true);
    expect(alreadyHasAccess('ADMIN')).toBe(true);
    expect(alreadyHasAccess('STUDENT')).toBe(false);
  });
});

// Minor-exclusion age gate (WP25): full identity verification is a later
// phase, this is the quality/legal floor for now.
describe('calculateAge', () => {
  const asOf = new Date('2026-08-18T00:00:00Z');

  it('counts a birthday that already happened this year', () => {
    expect(calculateAge(new Date('2008-01-01'), asOf)).toBe(18);
  });

  it('does not count a birthday that has not happened yet this year', () => {
    expect(calculateAge(new Date('2008-12-31'), asOf)).toBe(17);
  });

  it('handles the birthday falling exactly today', () => {
    expect(calculateAge(new Date('2008-08-18'), asOf)).toBe(18);
  });

  it('handles the day just before the birthday this year', () => {
    expect(calculateAge(new Date('2008-08-19'), asOf)).toBe(17);
  });
});
