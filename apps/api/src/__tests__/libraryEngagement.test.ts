jest.mock('../resolvers/xp', () => ({ awardXpOnce: jest.fn() }));

import { awardXpOnce } from '../resolvers/xp';
import { creditedSeconds, isComplete, requiredSeconds, xpForLength } from '../lib/libraryEngagement';
import { libraryEngagementResolvers } from '../resolvers/libraryEngagement';

const student = { id: 'student-1', role: 'STUDENT' } as const;

describe('library engagement rules', () => {
  it('credits real elapsed time between heartbeats, capped, never for an idle reader', () => {
    const last = new Date('2026-10-10T10:00:00Z');
    expect(creditedSeconds(last, new Date('2026-10-10T10:00:15Z'), true)).toBe(15);
    expect(creditedSeconds(last, new Date('2026-10-10T11:00:00Z'), true)).toBe(20);
    expect(creditedSeconds(last, new Date('2026-10-10T10:00:15Z'), false)).toBe(0);
    expect(creditedSeconds(null, new Date(), true)).toBe(0);
  });

  it('needs at least 30 s, 15 s per page, or 85 % of a recording', () => {
    expect(requiredSeconds('READ', 1)).toBe(30);
    expect(requiredSeconds('READ', 12)).toBe(180);
    expect(requiredSeconds('LISTEN', 600)).toBe(510);
  });

  it('gives 1 XP for short and 2 XP for long works', () => {
    expect(xpForLength('READ', 10)).toBe(1);
    expect(xpForLength('READ', 11)).toBe(2);
    expect(xpForLength('LISTEN', 599)).toBe(1);
    expect(xpForLength('LISTEN', 600)).toBe(2);
  });

  it('needs both the end and the time', () => {
    expect(isComplete('READ', 1, 29, 1)).toBe(false);
    expect(isComplete('READ', 0.9, 999, 1)).toBe(false);
    expect(isComplete('READ', 1, 30, 1)).toBe(true);
    expect(isComplete('LISTEN', 0.96, 510, 600)).toBe(true);
  });
});

function fakePrisma(existing: any, item: any = { id: 'i1', files: [], hiddenAt: null }, pages = 0) {
  let row = existing;
  return {
    libraryItem: { findUnique: jest.fn(async () => item) },
    libraryItemMedia: { count: jest.fn(async () => pages) },
    libraryEngagement: {
      findUnique: jest.fn(async () => row),
      upsert: jest.fn(async ({ create, update }: any) => (row = row ? { ...row, ...update } : { ...create, completedAt: null, xpAwarded: 0 })),
      updateMany: jest.fn(async () => ({ count: row.completedAt ? 0 : 1 })),
    },
  } as any;
}

const heartbeat = (overrides: any = {}) => ({ input: { itemId: 'i1', mode: 'READ', progress: 1, length: 3, active: true, ...overrides } });

describe('Mutation.recordLibraryEngagement', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requires a signed-in user', async () => {
    await expect(libraryEngagementResolvers.Mutation.recordLibraryEngagement(null, heartbeat(), { prisma: fakePrisma(null), user: null } as any)).rejects.toThrow('UNAUTHENTICATED');
  });

  it('awards XP once the end is reached with enough active time', async () => {
    const lastHeartbeatAt = new Date(Date.now() - 15_000);
    const prisma = fakePrisma({ itemId: 'i1', mode: 'READ', activeSeconds: 40, progress: 0.6, length: 3, lastHeartbeatAt, completedAt: null, xpAwarded: 0 });
    const result = await libraryEngagementResolvers.Mutation.recordLibraryEngagement(null, heartbeat(), { prisma, user: student } as any);
    expect(result).toMatchObject({ completed: true, xpAwarded: 1, requiredSeconds: 45, activeSeconds: 55 });
    expect(awardXpOnce).toHaveBeenCalledWith(prisma, 'student-1', 'LIBRARY_READ', 'i1', 1);
  });

  it('does not award on the very first heartbeat, however far the client claims to be', async () => {
    const prisma = fakePrisma(null);
    const result = await libraryEngagementResolvers.Mutation.recordLibraryEngagement(null, heartbeat(), { prisma, user: student } as any);
    expect(result).toMatchObject({ completed: false, activeSeconds: 0 });
    expect(awardXpOnce).not.toHaveBeenCalled();
  });

  it('uses the stored page count instead of the client-reported length', async () => {
    const lastHeartbeatAt = new Date(Date.now() - 15_000);
    const prisma = fakePrisma({ itemId: 'i1', mode: 'READ', activeSeconds: 40, progress: 0, length: 1, lastHeartbeatAt, completedAt: null, xpAwarded: 0 }, undefined, 20);
    const result = await libraryEngagementResolvers.Mutation.recordLibraryEngagement(null, heartbeat({ length: 1 }), { prisma, user: student } as any);
    expect(result).toMatchObject({ length: 20, requiredSeconds: 300, completed: false, xpAvailable: 2 });
  });

  it('never awards twice', async () => {
    const prisma = fakePrisma({ itemId: 'i1', mode: 'READ', activeSeconds: 400, progress: 1, length: 3, lastHeartbeatAt: new Date(Date.now() - 15_000), completedAt: new Date(), xpAwarded: 1 });
    await libraryEngagementResolvers.Mutation.recordLibraryEngagement(null, heartbeat(), { prisma, user: student } as any);
    expect(awardXpOnce).not.toHaveBeenCalled();
  });
});
