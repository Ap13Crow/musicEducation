import { reserveInstrumentCapacity } from '../lib/capacity';

function fakeTx({ cap, alreadyActive, distinctActiveUserIds }: { cap: { maxActiveStudents: number | null } | undefined; alreadyActive: boolean; distinctActiveUserIds: string[] }) {
  return {
    $queryRaw: jest.fn().mockResolvedValue(cap ? [{ id: 'cap-1', maxActiveStudents: cap.maxActiveStudents }] : []),
    booking: {
      findFirst: jest.fn().mockResolvedValue(alreadyActive ? { id: 'existing-booking' } : null),
      findMany: jest.fn().mockResolvedValue(distinctActiveUserIds.map((id) => ({ userId: id }))),
    },
  } as any;
}

describe('reserveInstrumentCapacity', () => {
  it('no-ops when the booking has no instrument', async () => {
    const tx = fakeTx({ cap: undefined, alreadyActive: false, distinctActiveUserIds: [] });
    await reserveInstrumentCapacity(tx, 'teacher-1', null, 'student-1');
    expect(tx.$queryRaw).not.toHaveBeenCalled();
  });

  it('no-ops when no capacity row is configured for this instrument (unlimited by default)', async () => {
    const tx = fakeTx({ cap: undefined, alreadyActive: false, distinctActiveUserIds: [] });
    await expect(reserveInstrumentCapacity(tx, 'teacher-1', 'Violin', 'student-1')).resolves.toBeUndefined();
  });

  it('no-ops when maxActiveStudents is explicitly null (unlimited)', async () => {
    const tx = fakeTx({ cap: { maxActiveStudents: null }, alreadyActive: false, distinctActiveUserIds: ['a', 'b', 'c', 'd', 'e'] });
    await expect(reserveInstrumentCapacity(tx, 'teacher-1', 'Piano', 'student-1')).resolves.toBeUndefined();
  });

  it('allows a booking when under capacity', async () => {
    const tx = fakeTx({ cap: { maxActiveStudents: 3 }, alreadyActive: false, distinctActiveUserIds: ['a', 'b'] });
    await expect(reserveInstrumentCapacity(tx, 'teacher-1', 'Violin', 'student-1')).resolves.toBeUndefined();
  });

  it('rejects a new student once capacity is exactly full', async () => {
    const tx = fakeTx({ cap: { maxActiveStudents: 3 }, alreadyActive: false, distinctActiveUserIds: ['a', 'b', 'c'] });
    await expect(reserveInstrumentCapacity(tx, 'teacher-1', 'Violin', 'student-new')).rejects.toThrow(/capacity is full/);
  });

  it('an explicit 0 cap is a real zero, not unlimited', async () => {
    const tx = fakeTx({ cap: { maxActiveStudents: 0 }, alreadyActive: false, distinctActiveUserIds: [] });
    await expect(reserveInstrumentCapacity(tx, 'teacher-1', 'Violin', 'student-1')).rejects.toThrow(/capacity is full/);
  });

  it('does not block a student who is already an active occupant (e.g. booking a second lesson)', async () => {
    const tx = fakeTx({ cap: { maxActiveStudents: 1 }, alreadyActive: true, distinctActiveUserIds: ['student-1'] });
    await expect(reserveInstrumentCapacity(tx, 'teacher-1', 'Violin', 'student-1')).resolves.toBeUndefined();
  });

  it('locks the capacity row with SELECT ... FOR UPDATE before counting', async () => {
    const tx = fakeTx({ cap: { maxActiveStudents: 5 }, alreadyActive: false, distinctActiveUserIds: [] });
    await reserveInstrumentCapacity(tx, 'teacher-1', 'Violin', 'student-1');
    const [sqlParts] = tx.$queryRaw.mock.calls[0];
    expect(sqlParts.join('')).toContain('FOR UPDATE');
  });
});
