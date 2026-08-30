process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { discoveryResolvers } from '../resolvers/discovery';

const studentUser = { id: 'student-1', role: 'STUDENT' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

describe('recordExternalEventView', () => {
  it('rejects an unauthenticated caller', async () => {
    const prisma = fakePrisma();
    await expect(
      discoveryResolvers.Mutation.recordExternalEventView(null, { id: 'evt-1' }, { prisma, user: null } as any),
    ).rejects.toThrow();
  });

  it('404s when the projection does not exist', async () => {
    const prisma = fakePrisma({ externalEventProjection: { findUnique: jest.fn().mockResolvedValue(null) } });
    await expect(
      discoveryResolvers.Mutation.recordExternalEventView(null, { id: 'gone' }, { prisma, user: studentUser } as any),
    ).rejects.toThrow('Event not found.');
  });

  it('upserts an engagement row, creating on first view and bumping lastViewedAt on a repeat', async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 'eng-1' });
    const prisma = fakePrisma({
      externalEventProjection: { findUnique: jest.fn().mockResolvedValue({ id: 'evt-1' }) },
      externalEventEngagement: { upsert },
    });
    await discoveryResolvers.Mutation.recordExternalEventView(null, { id: 'evt-1' }, { prisma, user: studentUser } as any);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_externalEventProjectionId: { userId: 'student-1', externalEventProjectionId: 'evt-1' } },
        create: { userId: 'student-1', externalEventProjectionId: 'evt-1' },
      }),
    );
    expect(upsert.mock.calls[0][0].update).toHaveProperty('lastViewedAt');
  });
});

describe('confirmExternalEventAttendance', () => {
  it('404s when the projection does not exist', async () => {
    const prisma = fakePrisma({ externalEventProjection: { findUnique: jest.fn().mockResolvedValue(null) } });
    await expect(
      discoveryResolvers.Mutation.confirmExternalEventAttendance(null, { id: 'gone' }, { prisma, user: studentUser } as any),
    ).rejects.toThrow('Event not found.');
  });

  it('rejects confirmation before the event has started', async () => {
    const prisma = fakePrisma({
      externalEventProjection: {
        findUnique: jest.fn().mockResolvedValue({ id: 'evt-1', startsAt: new Date(Date.now() + 3600_000) }),
      },
    });
    await expect(
      discoveryResolvers.Mutation.confirmExternalEventAttendance(null, { id: 'evt-1' }, { prisma, user: studentUser } as any),
    ).rejects.toThrow('once the event has started');
  });

  it('confirms attendance once the event has started', async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 'eng-1', attendanceConfirmedAt: new Date() });
    const prisma = fakePrisma({
      externalEventProjection: {
        findUnique: jest.fn().mockResolvedValue({ id: 'evt-1', startsAt: new Date(Date.now() - 3600_000) }),
      },
      externalEventEngagement: { upsert },
    });
    await discoveryResolvers.Mutation.confirmExternalEventAttendance(null, { id: 'evt-1' }, { prisma, user: studentUser } as any);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ userId: 'student-1', externalEventProjectionId: 'evt-1', attendanceConfirmedAt: expect.any(Date) }),
        update: expect.objectContaining({ attendanceConfirmedAt: expect.any(Date), attendanceDeclinedAt: null }),
      }),
    );
  });
});

describe('declineExternalEventAttendance', () => {
  it('rejects decline before the event has started', async () => {
    const prisma = fakePrisma({
      externalEventProjection: {
        findUnique: jest.fn().mockResolvedValue({ id: 'evt-1', startsAt: new Date(Date.now() + 3600_000) }),
      },
    });
    await expect(
      discoveryResolvers.Mutation.declineExternalEventAttendance(null, { id: 'evt-1' }, { prisma, user: studentUser } as any),
    ).rejects.toThrow('once the event has started');
  });

  it('refuses to decline an event after XP has been awarded', async () => {
    const prisma = fakePrisma({
      externalEventProjection: {
        findUnique: jest.fn().mockResolvedValue({ id: 'evt-1', startsAt: new Date(Date.now() - 3600_000) }),
      },
      externalEventEngagement: {
        findUnique: jest.fn().mockResolvedValue({ id: 'eng-1', xpAwardedAt: new Date() }),
      },
    });
    await expect(
      discoveryResolvers.Mutation.declineExternalEventAttendance(null, { id: 'evt-1' }, { prisma, user: studentUser } as any),
    ).rejects.toThrow('already been evaluated');
  });

  it('marks a started event as not attended and clears a prior confirmation', async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 'eng-1', attendanceDeclinedAt: new Date() });
    const prisma = fakePrisma({
      externalEventProjection: {
        findUnique: jest.fn().mockResolvedValue({ id: 'evt-1', startsAt: new Date(Date.now() - 3600_000) }),
      },
      externalEventEngagement: { findUnique: jest.fn().mockResolvedValue(null), upsert },
    });
    await discoveryResolvers.Mutation.declineExternalEventAttendance(null, { id: 'evt-1' }, { prisma, user: studentUser } as any);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ userId: 'student-1', externalEventProjectionId: 'evt-1', attendanceDeclinedAt: expect.any(Date) }),
        update: expect.objectContaining({ attendanceDeclinedAt: expect.any(Date), attendanceConfirmedAt: null }),
      }),
    );
  });
});

describe('ExternalEventProjection fields', () => {
  it('returns null recommendationScore for a guest', async () => {
    const score = await discoveryResolvers.ExternalEventProjection.recommendationScore(
      { instruments: ['Piano'], musicStyles: ['Classical'], skillLevels: [] },
      {},
      { prisma: fakePrisma(), user: null } as any,
    );
    expect(score).toBeNull();
  });

  it('scores a signed-in user against profile interests and exposes attendance XP', async () => {
    const prisma = fakePrisma({
      userProfile: {
        findUnique: jest.fn().mockResolvedValue({ instruments: ['Piano'], musicStyles: ['Classical'], skillLevel: 'BEGINNER' }),
      },
    });
    const score = await discoveryResolvers.ExternalEventProjection.recommendationScore(
      { instruments: ['Piano'], musicStyles: ['Classical'], skillLevels: ['BEGINNER'] },
      {},
      { prisma, user: studentUser } as any,
    );
    expect(score).toBe(10);
    expect(discoveryResolvers.ExternalEventProjection.attendanceXp()).toBe(40);
  });
});

describe('myRecentlyViewedExternalEvents', () => {
  it('rejects an unauthenticated caller', async () => {
    const prisma = fakePrisma();
    await expect(
      discoveryResolvers.Query.myRecentlyViewedExternalEvents(null, {}, { prisma, user: null } as any),
    ).rejects.toThrow();
  });

  it('scopes to the caller and orders most-recently-viewed first', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = fakePrisma({ externalEventEngagement: { findMany } });
    await discoveryResolvers.Query.myRecentlyViewedExternalEvents(null, {}, { prisma, user: studentUser } as any);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'student-1' }, orderBy: { lastViewedAt: 'desc' } }),
    );
  });

  it('clamps an out-of-range limit into [1, 50]', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = fakePrisma({ externalEventEngagement: { findMany } });
    await discoveryResolvers.Query.myRecentlyViewedExternalEvents(null, { limit: 500 }, { prisma, user: studentUser } as any);
    expect(findMany.mock.calls[0][0].take).toBe(50);
  });
});
