process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { externalCalendarResolvers } from '../resolvers/externalCalendar';

const studentUser = { id: 'student-1', role: 'STUDENT' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

describe('connectExternalCalendar', () => {
  it('always rejects with NOT_CONFIGURED - there are no OAuth credentials configured for either provider', async () => {
    const original = { ...process.env };
    delete process.env.GOOGLE_CALENDAR_CLIENT_ID;
    delete process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    delete process.env.MICROSOFT_CALENDAR_CLIENT_ID;
    delete process.env.MICROSOFT_CALENDAR_CLIENT_SECRET;

    await expect(
      externalCalendarResolvers.Mutation.connectExternalCalendar(null, { provider: 'GOOGLE' }, { user: studentUser } as any),
    ).rejects.toThrow('GOOGLE calendar sync is not configured');
    await expect(
      externalCalendarResolvers.Mutation.connectExternalCalendar(null, { provider: 'MICROSOFT' }, { user: studentUser } as any),
    ).rejects.toThrow('MICROSOFT calendar sync is not configured');

    process.env = original;
  });

  it('rejects an unauthenticated caller', async () => {
    await expect(
      externalCalendarResolvers.Mutation.connectExternalCalendar(null, { provider: 'GOOGLE' }, { user: null } as any),
    ).rejects.toThrow();
  });
});

describe('disconnectExternalCalendar', () => {
  it('deletes only the caller\'s own connection for that provider', async () => {
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const prisma = fakePrisma({ externalCalendarConnection: { deleteMany } });
    const result = await externalCalendarResolvers.Mutation.disconnectExternalCalendar(
      null, { provider: 'GOOGLE' }, { prisma, user: studentUser } as any,
    );
    expect(result).toBe(true);
    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: 'student-1', provider: 'GOOGLE' } });
  });
});

describe('rotateCalendarFeedToken', () => {
  it('generates and persists a new token, returning it', async () => {
    const update = jest.fn().mockResolvedValue({});
    const prisma = fakePrisma({ user: { update } });
    const token = await externalCalendarResolvers.Mutation.rotateCalendarFeedToken(
      null, {}, { prisma, user: studentUser } as any,
    );
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
    expect(update).toHaveBeenCalledWith({ where: { id: 'student-1' }, data: { calendarFeedToken: token } });
  });

  it('produces a different token on each call (so a previously shared link can be invalidated)', async () => {
    const prisma = fakePrisma({ user: { update: jest.fn().mockResolvedValue({}) } });
    const first = await externalCalendarResolvers.Mutation.rotateCalendarFeedToken(null, {}, { prisma, user: studentUser } as any);
    const second = await externalCalendarResolvers.Mutation.rotateCalendarFeedToken(null, {}, { prisma, user: studentUser } as any);
    expect(first).not.toBe(second);
  });
});

describe('myCalendarFeedToken', () => {
  it('returns null before a token has ever been generated', async () => {
    const prisma = fakePrisma({ user: { findUnique: jest.fn().mockResolvedValue({ calendarFeedToken: null }) } });
    const result = await externalCalendarResolvers.Query.myCalendarFeedToken(null, {}, { prisma, user: studentUser } as any);
    expect(result).toBeNull();
  });

  it('returns the stored token once one exists', async () => {
    const prisma = fakePrisma({ user: { findUnique: jest.fn().mockResolvedValue({ calendarFeedToken: 'abc123' }) } });
    const result = await externalCalendarResolvers.Query.myCalendarFeedToken(null, {}, { prisma, user: studentUser } as any);
    expect(result).toBe('abc123');
  });
});

describe('myExternalCalendarConnections', () => {
  it('scopes to the caller only', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = fakePrisma({ externalCalendarConnection: { findMany } });
    await externalCalendarResolvers.Query.myExternalCalendarConnections(null, {}, { prisma, user: studentUser } as any);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'student-1' } }));
  });
});
