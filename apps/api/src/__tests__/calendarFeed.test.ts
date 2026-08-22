import { buildUserCalendarFeed } from '../lib/calendarFeed';

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

const student = {
  id: 'user-student',
  email: 'ada@example.com',
  profile: { displayName: 'Ada Student' },
};
const teacherUser = {
  id: 'user-teacher',
  email: 'jens@example.com',
  profile: { displayName: 'Jens Teacher' },
};

describe('buildUserCalendarFeed', () => {
  it('includes the caller\'s own bookings as a student, using the teacher\'s display name as the summary', async () => {
    const prisma = fakePrisma({
      teacherProfile: { findUnique: jest.fn().mockResolvedValue(null) },
      booking: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'b1',
            startsAt: new Date('2026-09-01T14:00:00.000Z'),
            endsAt: new Date('2026-09-01T15:00:00.000Z'),
            durationMin: 60,
            status: 'CONFIRMED',
            instrument: 'Piano',
            meetingUrl: 'https://meet.example/xyz',
            user: student,
            teacherProfile: { user: teacherUser },
          },
        ]),
      },
      personalAppointment: { findMany: jest.fn().mockResolvedValue([]) },
    });

    const ics = await buildUserCalendarFeed(prisma, student.id);
    expect(ics).toContain('SUMMARY:Lesson with Jens Teacher');
    expect(ics).toContain('LOCATION:https://meet.example/xyz');
    expect(ics).toContain('UID:booking-b1@mymusic.coach');
  });

  it('queries both directions (as student and, when the caller is also a teacher, as teacher)', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = fakePrisma({
      teacherProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'tp-1', userId: teacherUser.id }) },
      booking: { findMany },
      personalAppointment: { findMany: jest.fn().mockResolvedValue([]) },
    });

    await buildUserCalendarFeed(prisma, teacherUser.id);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ userId: teacherUser.id }, { teacherProfileId: 'tp-1' }],
        }),
      }),
    );
  });

  it('excludes cancelled bookings', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = fakePrisma({
      teacherProfile: { findUnique: jest.fn().mockResolvedValue(null) },
      booking: { findMany },
      personalAppointment: { findMany: jest.fn().mockResolvedValue([]) },
    });

    await buildUserCalendarFeed(prisma, student.id);
    expect(findMany.mock.calls[0][0].where.status).toEqual({ not: 'CANCELLED' });
  });

  it('falls back to startsAt + durationMin when endsAt is null', async () => {
    const prisma = fakePrisma({
      teacherProfile: { findUnique: jest.fn().mockResolvedValue(null) },
      booking: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'b2',
            startsAt: new Date('2026-09-01T14:00:00.000Z'),
            endsAt: null,
            durationMin: 45,
            status: 'CONFIRMED',
            instrument: null,
            meetingUrl: null,
            user: student,
            teacherProfile: { user: teacherUser },
          },
        ]),
      },
      personalAppointment: { findMany: jest.fn().mockResolvedValue([]) },
    });

    const ics = await buildUserCalendarFeed(prisma, student.id);
    expect(ics).toContain('DTSTART:20260901T140000Z');
    expect(ics).toContain('DTEND:20260901T144500Z');
  });

  it('includes the caller\'s personal appointments', async () => {
    const prisma = fakePrisma({
      teacherProfile: { findUnique: jest.fn().mockResolvedValue(null) },
      booking: { findMany: jest.fn().mockResolvedValue([]) },
      personalAppointment: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'a1',
            title: 'Practice session',
            startsAt: new Date('2026-09-02T09:00:00.000Z'),
            endsAt: new Date('2026-09-02T10:00:00.000Z'),
            notes: null,
          },
        ]),
      },
    });

    const ics = await buildUserCalendarFeed(prisma, student.id);
    expect(ics).toContain('UID:appointment-a1@mymusic.coach');
    expect(ics).toContain('SUMMARY:Practice session');
  });
});
