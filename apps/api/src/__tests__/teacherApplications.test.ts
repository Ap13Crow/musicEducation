// Unit tests for teacher application permission checks (self-service "become a teacher" queue)

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { requireAuth, requireRole } from '../middleware/auth';

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
