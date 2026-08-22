// Regression coverage: UserProfile.notificationEmail (schema.prisma) had no
// GraphQL field and updateProfile never read/wrote it - a Copilot review
// finding on PR #47, since mailOutbox.ts's recipientAddresses already
// consumed the column but nothing could ever set it.
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { userResolvers } from '../resolvers/users';

const studentUser = { id: 'user-1', role: 'STUDENT' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

describe('updateProfile - notificationEmail', () => {
  it('rejects a malformed notification email without writing anything', async () => {
    const update = jest.fn();
    const prisma = fakePrisma({ user: { update } });
    await expect(
      userResolvers.Mutation.updateProfile(
        null,
        { input: { notificationEmail: 'not-an-email' } },
        { prisma, user: studentUser } as any,
      ),
    ).rejects.toThrow('valid notification email');
    expect(update).not.toHaveBeenCalled();
  });

  it('persists a valid notification email', async () => {
    const update = jest.fn().mockResolvedValue({ profile: { displayName: 'Ada', bio: 'x', instruments: ['Piano'] } });
    const prisma = fakePrisma({
      user: { update },
      gamificationProfile: { update: jest.fn() },
      xpAward: { create: jest.fn() },
      $transaction: jest.fn(),
    });

    await userResolvers.Mutation.updateProfile(
      null,
      { input: { notificationEmail: 'second@example.com' } },
      { prisma, user: studentUser } as any,
    );

    const call = update.mock.calls[0][0];
    expect(call.data.profile.upsert.update.notificationEmail).toBe('second@example.com');
    expect(call.data.profile.upsert.create.notificationEmail).toBe('second@example.com');
  });

  it('an empty string clears a previously-set notification email (writes null, not the empty string)', async () => {
    const update = jest.fn().mockResolvedValue({ profile: { displayName: 'Ada', bio: 'x', instruments: ['Piano'] } });
    const prisma = fakePrisma({
      user: { update },
      gamificationProfile: { update: jest.fn() },
      xpAward: { create: jest.fn() },
      $transaction: jest.fn(),
    });

    await userResolvers.Mutation.updateProfile(
      null,
      { input: { notificationEmail: '' } },
      { prisma, user: studentUser } as any,
    );

    const call = update.mock.calls[0][0];
    expect(call.data.profile.upsert.update.notificationEmail).toBeNull();
  });

  it('omitting notificationEmail entirely leaves the stored value untouched (undefined, not null)', async () => {
    // Incomplete profile (no bio) - skips the PROFILE_COMPLETED XP award
    // path entirely, which is irrelevant to what this test is checking.
    const update = jest.fn().mockResolvedValue({ profile: { displayName: 'Ada', bio: null, instruments: [] } });
    const prisma = fakePrisma({ user: { update } });

    await userResolvers.Mutation.updateProfile(
      null,
      { input: { displayName: 'Ada' } },
      { prisma, user: studentUser } as any,
    );

    const call = update.mock.calls[0][0];
    expect(call.data.profile.upsert.update.notificationEmail).toBeUndefined();
  });
});
