import { createLoaders } from '../lib/loaders';

// Regression coverage for Phase 2's "add DataLoader batching for directory
// aggregates so the overview does not introduce N+1 queries" requirement:
// asserts that N calls to .load() for N different teacherProfileIds issue
// exactly one underlying Prisma query, not N.

describe('createLoaders', () => {
  it('teacherDistinctStudentCount batches multiple .load() calls into one findMany', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { teacherProfileId: 'teacher-a' },
      { teacherProfileId: 'teacher-a' },
      { teacherProfileId: 'teacher-b' },
    ]);
    const loaders = createLoaders({ booking: { findMany } } as any);

    const [a, b, c] = await Promise.all([
      loaders.teacherDistinctStudentCount.load('teacher-a'),
      loaders.teacherDistinctStudentCount.load('teacher-b'),
      loaders.teacherDistinctStudentCount.load('teacher-c'),
    ]);

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          teacherProfileId: { in: ['teacher-a', 'teacher-b', 'teacher-c'] },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        }),
      }),
    );
    expect(a).toBe(2);
    expect(b).toBe(1);
    expect(c).toBe(0);
  });

  it('teacherPublishedResourceCount batches multiple .load() calls into one groupBy', async () => {
    const groupBy = jest.fn().mockResolvedValue([
      { teacherProfileId: 'teacher-a', _count: { _all: 3 } },
    ]);
    const loaders = createLoaders({ course: { groupBy } } as any);

    const [a, b] = await Promise.all([
      loaders.teacherPublishedResourceCount.load('teacher-a'),
      loaders.teacherPublishedResourceCount.load('teacher-b'),
    ]);

    expect(groupBy).toHaveBeenCalledTimes(1);
    expect(a).toBe(3);
    expect(b).toBe(0);
  });

  it('a fresh set of loaders never reuses another request\'s cache', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const groupBy = jest.fn().mockResolvedValue([]);
    const requestOne = createLoaders({ booking: { findMany }, course: { groupBy } } as any);
    const requestTwo = createLoaders({ booking: { findMany }, course: { groupBy } } as any);

    await requestOne.teacherDistinctStudentCount.load('teacher-a');
    await requestTwo.teacherDistinctStudentCount.load('teacher-a');

    expect(findMany).toHaveBeenCalledTimes(2);
  });
});
