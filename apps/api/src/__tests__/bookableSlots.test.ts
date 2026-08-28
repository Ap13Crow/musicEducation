process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { deriveBookableSlots, getBookableSlots, validateBookableRange } from '../lib/bookableSlots';

describe('deriveBookableSlots', () => {
  it('preserves a recurring rule\'s 15-minute anchor instead of rounding to whole hours', () => {
    const slots = deriveBookableSlots({
      availability: [{ dayOfWeek: 1, startTime: '09:15', endTime: '13:15', timezone: 'Europe/Zurich' }],
      busyIntervals: [],
      from: new Date('2026-09-07T00:00:00.000Z'),
      to: new Date('2026-09-08T00:00:00.000Z'),
      leadDays: 0,
      now: new Date('2026-09-01T00:00:00.000Z'),
    });

    expect(slots.map((slot) => slot.startsAt.toISOString())).toEqual([
      '2026-09-07T07:15:00.000Z',
      '2026-09-07T08:15:00.000Z',
      '2026-09-07T09:15:00.000Z',
      '2026-09-07T10:15:00.000Z',
    ]);
  });

  it('removes every slot overlapping a booking, hold, time-off or private busy interval', () => {
    const slots = deriveBookableSlots({
      availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '13:00', timezone: 'Europe/Zurich' }],
      busyIntervals: [
        { startsAt: new Date('2026-09-07T08:30:00.000Z'), endsAt: new Date('2026-09-07T10:30:00.000Z') },
      ],
      from: new Date('2026-09-07T00:00:00.000Z'),
      to: new Date('2026-09-08T00:00:00.000Z'),
      leadDays: 0,
      now: new Date('2026-09-01T00:00:00.000Z'),
    });

    expect(slots.map((slot) => slot.startsAt.toISOString())).toEqual([
      '2026-09-07T07:00:00.000Z',
    ]);
  });

  it('uses the rule timezone across a daylight-saving transition', () => {
    const slots = deriveBookableSlots({
      availability: [{ dayOfWeek: 0, startTime: '09:00', endTime: '10:00', timezone: 'Europe/Zurich' }],
      busyIntervals: [],
      from: new Date('2026-10-25T00:00:00.000Z'),
      to: new Date('2026-10-26T00:00:00.000Z'),
      leadDays: 0,
      now: new Date('2026-10-01T00:00:00.000Z'),
    });

    expect(slots[0]?.startsAt.toISOString()).toBe('2026-10-25T08:00:00.000Z');
  });

  it('deduplicates overlapping recurring rules', () => {
    const rule = { dayOfWeek: 1, startTime: '09:00', endTime: '11:00', timezone: 'Europe/Zurich' };
    const slots = deriveBookableSlots({
      availability: [rule, rule],
      busyIntervals: [],
      from: new Date('2026-09-07T00:00:00.000Z'),
      to: new Date('2026-09-08T00:00:00.000Z'),
      leadDays: 0,
      now: new Date('2026-09-01T00:00:00.000Z'),
    });

    expect(slots).toHaveLength(2);
  });
});

describe('validateBookableRange', () => {
  it('rejects unbounded and inverted ranges', () => {
    expect(() => validateBookableRange(new Date('2026-01-01'), new Date('2026-04-01'))).toThrow(/63 days/);
    expect(() => validateBookableRange(new Date('2026-01-02'), new Date('2026-01-01'))).toThrow(/63 days/);
  });
});

describe('getBookableSlots', () => {
  it('returns no slots when the selected instrument has reached its distinct-student cap', async () => {
    const prisma: any = {
      teacherProfile: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'teacher-1',
          userId: 'user-1',
          isAvailable: true,
          leadDays: 0,
          instruments: ['Piano'],
          availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '12:00', timezone: 'Europe/Zurich' }],
          instrumentCapacities: [{ instrument: 'Piano', maxActiveStudents: 1 }],
          user: { role: 'TEACHER', status: 'ACTIVE', profile: { timezone: 'Europe/Zurich' } },
        }),
      },
      booking: { findMany: jest.fn().mockResolvedValue([{ userId: 'student-1' }]) },
    };

    await expect(getBookableSlots(
      prisma,
      'teacher-1',
      new Date('2026-09-07T00:00:00.000Z'),
      new Date('2026-09-08T00:00:00.000Z'),
      { instrument: 'Piano', now: new Date('2026-09-01T00:00:00.000Z') },
    )).resolves.toEqual([]);
  });
});
