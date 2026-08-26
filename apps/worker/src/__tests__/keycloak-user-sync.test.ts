const mockKeycloakAdminConfigured = jest.fn();
const mockListKeycloakUserIds = jest.fn();

jest.mock('../lib/keycloakAdmin.js', () => ({
  keycloakAdminConfigured: () => mockKeycloakAdminConfigured(),
  listKeycloakUserIds: () => mockListKeycloakUserIds(),
}));

import { keycloakUserSyncJob } from '../jobs/keycloak-user-sync';

describe('keycloak-user-sync', () => {
  it('reconciles direct Keycloak deletions at least every five minutes', () => {
    expect(keycloakUserSyncJob.schedule).toBe('*/5 * * * *');
  });

  it('deactivates missing identities and hides their teacher profiles atomically', async () => {
    mockKeycloakAdminConfigured.mockReturnValue(true);
    mockListKeycloakUserIds.mockResolvedValue(new Set(['still-live']));
    const teacherUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const userUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      userExternalIdentity: {
        findMany: jest.fn().mockResolvedValue([
          { userId: 'active-user', externalId: 'still-live' },
          { userId: 'deleted-user', externalId: 'gone' },
        ]),
      },
      $transaction: jest.fn(async (callback: any) => callback({
        teacherProfile: { updateMany: teacherUpdateMany },
        user: { updateMany: userUpdateMany },
      })),
    };
    const logger = { info: jest.fn(), warn: jest.fn() };

    await keycloakUserSyncJob.run({ prisma, logger } as any);

    expect(teacherUpdateMany).toHaveBeenCalledWith({
      where: { userId: { in: ['deleted-user'] } },
      data: { isPublic: false, isAvailable: false },
    });
    expect(userUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ['deleted-user'] }, status: 'ACTIVE' },
      data: { status: 'DEACTIVATED', calendarFeedToken: null },
    });
  });
});
