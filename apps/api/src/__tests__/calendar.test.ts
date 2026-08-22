process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { bookingResolvers } from '../resolvers/bookings';

const teacherUser = { id: 'teacher-1', role: 'TEACHER' } as const;
const otherTeacherUser = { id: 'teacher-2', role: 'TEACHER' } as const;
const adminUser = { id: 'admin-1', role: 'ADMIN' } as const;
const studentUser = { id: 'student-1', role: 'STUDENT' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

describe('TeacherUnavailability.note privacy', () => {
  const resolver = (bookingResolvers as any).TeacherUnavailability.note;

  it('is visible to the owning teacher', () => {
    const block = { note: 'Dentist appointment', teacherProfile: { userId: 'teacher-1' } };
    expect(resolver(block, {}, { user: teacherUser })).toBe('Dentist appointment');
  });

  it('is visible to an admin', () => {
    const block = { note: 'Dentist appointment', teacherProfile: { userId: 'teacher-1' } };
    expect(resolver(block, {}, { user: adminUser })).toBe('Dentist appointment');
  });

  it('is hidden from a different teacher (never leaked to a student either)', () => {
    const block = { note: 'Dentist appointment', teacherProfile: { userId: 'teacher-1' } };
    expect(resolver(block, {}, { user: otherTeacherUser })).toBeNull();
    expect(resolver(block, {}, { user: studentUser })).toBeNull();
  });

  it('is hidden from an unauthenticated/guest caller', () => {
    const block = { note: 'Dentist appointment', teacherProfile: { userId: 'teacher-1' } };
    expect(resolver(block, {}, { user: null })).toBeNull();
  });
});

describe('deleteUnavailability IDOR protection', () => {
  it('an ADMIN can delete any teacher\'s block', async () => {
    const del = jest.fn().mockResolvedValue({});
    const prisma = fakePrisma({
      teacherUnavailability: {
        findUnique: jest.fn().mockResolvedValue({ id: 'block-1', teacherProfile: { userId: 'teacher-1' } }),
        delete: del,
      },
    });
    const result = await bookingResolvers.Mutation.deleteUnavailability(null, { id: 'block-1' }, { prisma, user: adminUser } as any);
    expect(result).toBe(true);
    expect(del).toHaveBeenCalledWith({ where: { id: 'block-1' } });
  });

  it('a different teacher cannot delete someone else\'s block', async () => {
    const del = jest.fn();
    const prisma = fakePrisma({
      teacherUnavailability: {
        findUnique: jest.fn().mockResolvedValue({ id: 'block-1', teacherProfile: { userId: 'teacher-1' } }),
        delete: del,
      },
    });
    await expect(
      bookingResolvers.Mutation.deleteUnavailability(null, { id: 'block-1' }, { prisma, user: otherTeacherUser } as any),
    ).rejects.toThrow('Access denied');
    expect(del).not.toHaveBeenCalled();
  });

  it('deleting an already-gone block is a harmless no-op (idempotent)', async () => {
    const prisma = fakePrisma({ teacherUnavailability: { findUnique: jest.fn().mockResolvedValue(null) } });
    await expect(
      bookingResolvers.Mutation.deleteUnavailability(null, { id: 'gone' }, { prisma, user: teacherUser } as any),
    ).resolves.toBe(true);
  });
});

describe('personal appointment IDOR protection', () => {
  it('updateAppointment rejects a caller who does not own the appointment', async () => {
    const prisma = fakePrisma({
      personalAppointment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'appt-1', userId: 'student-1', startsAt: new Date(), endsAt: new Date(Date.now() + 3600_000) }),
      },
    });
    await expect(
      bookingResolvers.Mutation.updateAppointment(null, { id: 'appt-1', title: 'Hacked' }, { prisma, user: { id: 'student-2', role: 'STUDENT' } } as any),
    ).rejects.toThrow('Access denied');
  });

  it('deleteAppointment rejects a caller who does not own the appointment', async () => {
    const del = jest.fn();
    const prisma = fakePrisma({
      personalAppointment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'appt-1', userId: 'student-1' }),
        delete: del,
      },
    });
    await expect(
      bookingResolvers.Mutation.deleteAppointment(null, { id: 'appt-1' }, { prisma, user: { id: 'student-2', role: 'STUDENT' } } as any),
    ).rejects.toThrow('Access denied');
    expect(del).not.toHaveBeenCalled();
  });

  it('createAppointment rejects an end time at or before the start time', async () => {
    const prisma = fakePrisma({ personalAppointment: { create: jest.fn() } });
    const sameInstant = new Date().toISOString();
    await expect(
      bookingResolvers.Mutation.createAppointment(
        null,
        { title: 'Practice', startsAt: sameInstant, endsAt: sameInstant },
        { prisma, user: studentUser } as any,
      ),
    ).rejects.toThrow('Invalid date range');
  });
});
