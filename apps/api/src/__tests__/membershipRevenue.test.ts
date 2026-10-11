import { settleMembershipSlices, slicesForPeriod, splitPool, teacherPool } from '../lib/membershipRevenue';

// The Plus revenue share, with the owner's own examples: a CHF 15 month is
// CHF 10 for teachers and CHF 5 for mymusic.coach; the 10 go to the courses a
// member completed that month, equally; nothing completed - all to the site.

describe('membership slices', () => {
  it('a monthly invoice is one slice: 10 for teachers, 5 for the site', () => {
    const [slice] = slicesForPeriod('MONTHLY', new Date('2026-11-15T00:00:00Z'), new Date('2026-12-15T00:00:00Z'), 1500);
    expect(slice).toMatchObject({ sliceIndex: 0, amountCents: 1500, teacherPoolCents: 1000 });
  });

  it('a yearly invoice is twelve monthly slices, same 1/3 : 2/3 split', () => {
    const slices = slicesForPeriod('YEARLY', new Date('2026-01-31T00:00:00Z'), new Date('2027-01-31T00:00:00Z'), 15000);
    expect(slices).toHaveLength(12);
    expect(slices.reduce((sum, slice) => sum + slice.amountCents, 0)).toBe(15000);
    expect(slices[0]).toMatchObject({ amountCents: 1250, teacherPoolCents: 833 });
    // Month ends stay at month ends (31 January -> 28 February).
    expect(slices[0].periodEnd.toISOString().slice(0, 10)).toBe('2026-02-28');
    expect(slices[11].periodEnd.toISOString().slice(0, 10)).toBe('2027-01-31');
    expect(teacherPool(1250)).toBe(833);
  });

  it('splits the pool per completed course', () => {
    expect(splitPool(1000, 1)).toEqual([1000]);
    expect(splitPool(1000, 2)).toEqual([500, 500]);
    expect(splitPool(1000, 3)).toEqual([333, 333, 333]);
    expect(splitPool(1000, 0)).toEqual([]);
  });
});

describe('settling a month', () => {
  const start = new Date('2026-11-01T00:00:00Z');
  const end = new Date('2026-12-01T00:00:00Z');
  const now = new Date('2026-12-02T00:00:00Z');

  function fakePrisma(slices: any[], completions: Record<string, any[]>) {
    const shares: any[] = [];
    const updates: any[] = [];
    const prisma: any = {
      membershipRevenueSlice: {
        findMany: jest.fn(async () => slices),
        update: jest.fn((args: any) => (updates.push(args), args)),
      },
      enrollment: { findMany: jest.fn(async ({ where }: any) => completions[where.userId] ?? []) },
      membershipTeacherShare: { create: jest.fn((args: any) => (shares.push(args.data), args)) },
      $transaction: jest.fn(async (operations: any[]) => operations),
    };
    return { prisma, shares, updates };
  }
  const slice = (id: string, userId: string) => ({ id, userId, periodStart: start, periodEnd: end, amountCents: 1500, teacherPoolCents: 1000 });
  const done = (id: string, courseId: string, teacher: string) => ({ id, courseId, course: { teacherProfileId: teacher } });
  const earned = (shares: any[]) =>
    shares.reduce((acc: Record<string, number>, share: any) => ({ ...acc, [share.teacherProfileId]: (acc[share.teacherProfileId] ?? 0) + share.amountCents }), {});

  it('one course of one teacher: the teacher alone gets 10', async () => {
    const { prisma, shares, updates } = fakePrisma([slice('s1', 'u1')], { u1: [done('e1', 'c1', 'A')] });
    await settleMembershipSlices(prisma, now);
    expect(earned(shares)).toEqual({ A: 1000 });
    expect(updates[0].data.platformCents).toBe(500);
  });

  it('two courses of two teachers: 5 each; three teachers: 3.33 each', async () => {
    let run = fakePrisma([slice('s1', 'u1')], { u1: [done('e1', 'c1', 'A'), done('e2', 'c2', 'B')] });
    await settleMembershipSlices(run.prisma, now);
    expect(earned(run.shares)).toEqual({ A: 500, B: 500 });

    run = fakePrisma([slice('s1', 'u1')], { u1: [done('e1', 'c1', 'A'), done('e2', 'c2', 'B'), done('e3', 'c3', 'C')] });
    await settleMembershipSlices(run.prisma, now);
    expect(earned(run.shares)).toEqual({ A: 333, B: 333, C: 333 });
    expect(run.updates[0].data.platformCents).toBe(501);
  });

  it('nothing completed: the whole month goes to mymusic.coach', async () => {
    const { prisma, shares, updates } = fakePrisma([slice('s1', 'u1')], {});
    await settleMembershipSlices(prisma, now);
    expect(shares).toHaveLength(0);
    expect(updates[0].data.platformCents).toBe(1500);
  });

  it('two students completing the same two courses: each teacher earns 10, the site 10', async () => {
    const { prisma, shares, updates } = fakePrisma([slice('s1', 'u1'), slice('s2', 'u2')], {
      u1: [done('e1', 'c1', 'A'), done('e2', 'c2', 'B')],
      u2: [done('e3', 'c1', 'A'), done('e4', 'c2', 'B')],
    });
    await settleMembershipSlices(prisma, now);
    expect(earned(shares)).toEqual({ A: 1000, B: 1000 });
    expect(updates.reduce((sum: number, update: any) => sum + update.data.platformCents, 0)).toBe(1000);
  });

  it('two completed courses by the same teacher earn that teacher both parts', async () => {
    const { prisma, shares } = fakePrisma([slice('s1', 'u1')], { u1: [done('e1', 'c1', 'A'), done('e2', 'c2', 'A'), done('e3', 'c3', 'B')] });
    await settleMembershipSlices(prisma, now);
    expect(earned(shares)).toEqual({ A: 666, B: 333 });
  });

  it('only counts completions through the membership, inside the month', async () => {
    const { prisma } = fakePrisma([slice('s1', 'u1')], {});
    await settleMembershipSlices(prisma, now);
    const where = prisma.enrollment.findMany.mock.calls[0][0].where;
    expect(where).toMatchObject({ userId: 'u1', accessReason: 'MEMBERSHIP', completedAt: { gte: start, lt: end } });
  });
});
