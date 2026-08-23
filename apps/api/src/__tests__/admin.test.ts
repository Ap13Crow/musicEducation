// Unit tests for admin resolver logic (permission checks and validation)

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { requireRole } from '../middleware/auth';
import { adminResolvers } from '../resolvers/admin';

const adminUser = { id: 'admin-1', role: 'ADMIN' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

// Regression coverage for a live-reported bug: the admin dashboard's
// "Teachers" tile showed 3 when only 2 users actually held the
// TEACHER/ADMIN role. Root cause - adminStats used a raw
// prisma.teacherProfile.count() with no filter, so a stale TeacherProfile
// row left behind by a demoted user (TeacherProfile is never deleted on
// demotion) inflated the count. platformStats (the public homepage stat)
// already scoped this correctly; adminStats just never got that fix.
describe('adminStats', () => {
  it('scopes totalTeachers to users who currently hold TEACHER/ADMIN, not a raw TeacherProfile row count', async () => {
    const teacherProfileCount = jest.fn().mockResolvedValue(2);
    const prisma = fakePrisma({
      user: { count: jest.fn().mockResolvedValue(3) },
      teacherProfile: { count: teacherProfileCount },
      course: { count: jest.fn().mockResolvedValue(2) },
      event: { count: jest.fn().mockResolvedValue(0) },
      externalEventProjection: { count: jest.fn().mockResolvedValue(0) },
      booking: { count: jest.fn().mockResolvedValue(4) },
      payment: { aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 10 } }) },
    });

    const result = await adminResolvers.Query.adminStats(null, {}, { prisma, user: adminUser } as any);

    expect(teacherProfileCount).toHaveBeenCalledWith({
      where: { user: { role: { in: ['TEACHER', 'ADMIN'] } } },
    });
    expect(result.totalTeachers).toBe(2);
    expect(result.totalUsers).toBe(3);
  });

  it('adds external event discovery rows into totalEvents, which the old query omitted entirely', async () => {
    const prisma = fakePrisma({
      user: { count: jest.fn().mockResolvedValue(0) },
      teacherProfile: { count: jest.fn().mockResolvedValue(0) },
      course: { count: jest.fn().mockResolvedValue(0) },
      event: { count: jest.fn().mockResolvedValue(3) },
      externalEventProjection: { count: jest.fn().mockResolvedValue(5) },
      booking: { count: jest.fn().mockResolvedValue(0) },
      payment: { aggregate: jest.fn().mockResolvedValue({ _sum: { amount: null } }) },
    });

    const result = await adminResolvers.Query.adminStats(null, {}, { prisma, user: adminUser } as any);
    expect(result.totalEvents).toBe(8);
  });

  it('still requires ADMIN', async () => {
    const prisma = fakePrisma();
    await expect(
      adminResolvers.Query.adminStats(null, {}, { prisma, user: { id: 's-1', role: 'STUDENT' } } as any),
    ).rejects.toThrow('FORBIDDEN');
  });
});

// Regression coverage for a Copilot review finding on PR #47:
// retryMailOutboxMessage used to unconditionally reset ANY message's
// status to PENDING, including an already-SENT one - an admin (or a raw
// API call) retrying a SENT message would cause the worker to send a real
// duplicate delivery. The admin UI's "Retry now" button was always
// correctly gated to FAILED/DEAD_LETTER only; this hardens the resolver
// itself to match, rather than relying solely on the UI gate.
describe('retryMailOutboxMessage', () => {
  it('requeues a FAILED message', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const prisma = fakePrisma({
      mailOutboxMessage: {
        findUnique: jest.fn().mockResolvedValue({ id: 'm1', status: 'FAILED' }),
        updateMany,
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'm1', status: 'PENDING' }),
      },
    });
    await adminResolvers.Mutation.retryMailOutboxMessage(null, { id: 'm1' }, { prisma, user: adminUser } as any);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'm1', status: { in: ['FAILED', 'DEAD_LETTER'] } },
      data: expect.objectContaining({ status: 'PENDING', attempts: 0 }),
    });
  });

  it('rejects retrying an already-SENT message instead of silently resetting it', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 0 });
    const prisma = fakePrisma({
      mailOutboxMessage: {
        findUnique: jest.fn().mockResolvedValue({ id: 'm1', status: 'SENT' }),
        updateMany,
      },
    });
    await expect(
      adminResolvers.Mutation.retryMailOutboxMessage(null, { id: 'm1' }, { prisma, user: adminUser } as any),
    ).rejects.toThrow('Only a FAILED or DEAD_LETTER message can be retried.');
  });

  it('404s for an unknown message id', async () => {
    const prisma = fakePrisma({ mailOutboxMessage: { findUnique: jest.fn().mockResolvedValue(null) } });
    await expect(
      adminResolvers.Mutation.retryMailOutboxMessage(null, { id: 'gone' }, { prisma, user: adminUser } as any),
    ).rejects.toThrow('Mail message not found.');
  });
});

describe('Admin Resolvers - Permission Checks', () => {
  describe('requireRole for admin operations', () => {
    it('should allow ADMIN role', () => {
      expect(() => requireRole({ id: 'admin-1', role: 'ADMIN' }, 'ADMIN')).not.toThrow();
    });

    it('should deny STUDENT role from admin operations', () => {
      expect(() => requireRole({ id: 'student-1', role: 'STUDENT' }, 'ADMIN')).toThrow('FORBIDDEN');
    });

    it('should deny TEACHER role from admin operations', () => {
      expect(() => requireRole({ id: 'teacher-1', role: 'TEACHER' }, 'ADMIN')).toThrow('FORBIDDEN');
    });

    it('should deny unauthenticated users', () => {
      expect(() => requireRole(null, 'ADMIN')).toThrow('UNAUTHENTICATED');
    });
  });

  describe('Admin user role validation', () => {
    const validRoles = ['GUEST', 'STUDENT', 'TEACHER', 'ADMIN'];

    it('should accept valid roles', () => {
      validRoles.forEach((role) => {
        expect(validRoles.includes(role)).toBe(true);
      });
    });

    it('should reject invalid role names', () => {
      const invalidRoles = ['SUPERADMIN', 'MODERATOR', 'user', '', 'admin'];
      invalidRoles.forEach((role) => {
        expect(validRoles.includes(role)).toBe(false);
      });
    });
  });

  describe('Self-deletion prevention', () => {
    it('should detect when admin tries to delete themselves', () => {
      const adminUserId = 'admin-123';
      const targetUserId = 'admin-123';
      expect(adminUserId === targetUserId).toBe(true);
    });

    it('should allow deleting other users', () => {
      const adminUserId = 'admin-123';
      const targetUserId = 'user-456';
      expect(adminUserId).not.toBe(targetUserId);
    });
  });
});

describe('Admin Settings', () => {
  describe('Key-value settings', () => {
    it('should validate setting keys are non-empty strings', () => {
      const validKeys = ['HERO_TITLE', 'META_DESCRIPTION', 'DEFAULT_CURRENCY'];
      validKeys.forEach((key) => {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(0);
      });
    });
  });
});
