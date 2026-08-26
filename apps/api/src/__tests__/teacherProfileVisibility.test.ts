// Regression coverage for two reported defects:
//   1. "Public-teacher setting missing" - isAvailable used to gate BOTH
//      booking eligibility (bookSession) and public directory/search
//      visibility (the `teachers` query), so a teacher pausing new bookings
//      silently vanished from the directory too. isPublic now owns
//      directory visibility on its own; isAvailable stays booking-only (see
//      bookings.ts, unchanged by this file).
//   2. "Blank admin teacher profile" - an ADMIN could reach the
//      TEACHER/ADMIN-gated teacher workspace with no TeacherProfile row at
//      all (applyAsTeacher only auto-runs for the TEACHER role - see the
//      `teachers` query's self-heal loop). The fix routes the profile
//      page's empty state through applyAsTeacher, which must default an
//      ADMIN-created profile to isPublic: false (holding ADMIN is not
//      itself an expression of intent to be publicly listed) while real
//      applicants/promotions (reviewTeacherApplication/adminSetRole) keep
//      the schema's isPublic: true default untouched.

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { userResolvers } from '../resolvers/users';

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

describe('teachers query directory visibility', () => {
  it('filters on isPublic, not isAvailable', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = fakePrisma({
      user: { findMany: jest.fn().mockResolvedValue([]) },
      teacherProfile: { findMany, count, upsert: jest.fn() },
    });

    await userResolvers.Query.teachers(null, {}, { prisma, user: null } as any);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublic: true,
          user: { role: { in: ['TEACHER', 'ADMIN'] }, status: 'ACTIVE' },
        }),
      }),
    );
    expect(findMany.mock.calls[0][0].where).not.toHaveProperty('isAvailable');
  });

  it('never exposes a deactivated teacher profile', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const prisma = fakePrisma({ teacherProfile: { findFirst } });

    await userResolvers.Query.teacher(null, { id: 'profile-1' }, { prisma, user: null } as any);

    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: 'profile-1',
        isPublic: true,
        user: { role: { in: ['TEACHER', 'ADMIN'] }, status: 'ACTIVE' },
      }),
    }));
  });

  it('still lets a caller filter results down to isAvailable-only within the public set', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = fakePrisma({
      user: { findMany: jest.fn().mockResolvedValue([]) },
      teacherProfile: { findMany, count: jest.fn().mockResolvedValue(0), upsert: jest.fn() },
    });

    await userResolvers.Query.teachers(null, { filter: { isAvailable: true } }, { prisma, user: null } as any);

    expect(findMany.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ isPublic: true, isAvailable: true }),
    );
  });
});

describe('applyAsTeacher isPublic default', () => {
  it('defaults a self-provisioned ADMIN profile to isPublic: false (not publicly listed until explicitly opted in)', async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 'tp-1' });
    const prisma = fakePrisma({ teacherProfile: { upsert } });

    await userResolvers.Mutation.applyAsTeacher(null, {}, { prisma, user: { id: 'admin-1', role: 'ADMIN' } } as any);

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ isPublic: false }) }),
    );
  });

  it('defaults a TEACHER applicant profile to isPublic: true', async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 'tp-1' });
    const prisma = fakePrisma({ teacherProfile: { upsert } });

    await userResolvers.Mutation.applyAsTeacher(null, {}, { prisma, user: { id: 'teacher-1', role: 'TEACHER' } } as any);

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ isPublic: true }) }),
    );
  });
});

describe('updateTeacherProfile isPublic writes', () => {
  it('writes isPublic independently of isAvailable', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'tp-1' });
    const prisma = fakePrisma({ teacherProfile: { update } });

    await userResolvers.Mutation.updateTeacherProfile(
      null,
      { isPublic: false },
      { prisma, user: { id: 'teacher-1', role: 'TEACHER' } } as any,
    );

    expect(update).toHaveBeenCalledWith({ where: { userId: 'teacher-1' }, data: { isPublic: false } });
  });
});
