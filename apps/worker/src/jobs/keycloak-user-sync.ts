import { keycloakAdminConfigured, listKeycloakUserIds } from '../lib/keycloakAdmin.js';
import type { Job } from './types.js';

/**
 * Safety net for Keycloak-side deletions that bypass the app's own
 * adminDeactivateUser mutation (apps/api/src/resolvers/admin.ts) - e.g. an
 * admin still deleting a user directly in the Keycloak console. Daily
 * (identity churn is low; this is a reconciliation pass, not anything
 * latency-sensitive) diff of every ACTIVE user's linked Keycloak identity
 * against the realm's actual user list; anything missing gets marked
 * DEACTIVATED. Never touches Postgres rows for users with no
 * UserExternalIdentity(provider: 'keycloak') link at all (e.g. seed/test
 * data) - there is nothing in Keycloak to have gone missing for those.
 */
export const keycloakUserSyncJob: Job = {
  key: 'keycloak-user-sync',
  schedule: '0 3 * * *',
  async run(ctx) {
    if (!keycloakAdminConfigured()) {
      ctx.logger.info('Keycloak admin client is not configured; skipping keycloak-user-sync.');
      return;
    }

    const liveIds = await listKeycloakUserIds();

    const linked = await ctx.prisma.userExternalIdentity.findMany({
      where: { provider: 'keycloak', user: { status: 'ACTIVE' } },
      select: { userId: true, externalId: true },
    });

    const orphanedUserIds = linked.filter((identity) => !liveIds.has(identity.externalId)).map((identity) => identity.userId);
    if (orphanedUserIds.length === 0) {
      ctx.logger.info({ checked: linked.length }, 'keycloak-user-sync: no orphaned identities found');
      return;
    }

    const { count } = await ctx.prisma.user.updateMany({
      where: { id: { in: orphanedUserIds }, status: 'ACTIVE' },
      data: { status: 'DEACTIVATED' },
    });
    ctx.logger.warn(
      { checked: linked.length, deactivated: count, userIds: orphanedUserIds },
      'keycloak-user-sync: deactivated users whose Keycloak identity no longer exists',
    );
  },
};
