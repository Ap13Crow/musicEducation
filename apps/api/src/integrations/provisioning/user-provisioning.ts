import type { MoodleAdapter } from '../adapters/moodle.js';
import type { ProvisioningResult, UserProvisioningParams } from '../types/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Provisions a platform user into all configured external systems.
 *
 * Call this after a user registers or when an admin triggers re-provisioning.
 * The function is idempotent — existing external accounts are looked up first.
 */
export async function provisionUser(
  params: UserProvisioningParams,
  adapters: {
    moodle?: MoodleAdapter;
  },
): Promise<ProvisioningResult[]> {
  const results: ProvisioningResult[] = [];

  // ── Moodle ─────────────────────────────────────────────────
  if (adapters.moodle) {
    try {
      const existing = await adapters.moodle.getUserByEmail(params.email);
      if (existing) {
        results.push({ system: 'moodle', externalId: existing.id, success: true });
      } else {
        const [firstName, ...rest] = params.displayName.split(' ');
        const lastName = rest.join(' ') || firstName;
        const moodleId = await adapters.moodle.createUser({
          username: params.email,
          email: params.email,
          firstName,
          lastName,
        });
        results.push({ system: 'moodle', externalId: moodleId, success: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err, userId: params.userId }, 'Moodle provisioning failed');
      results.push({ system: 'moodle', externalId: '', success: false, error: message });
    }
  }

  // LibreBooking and pretix provisioning is deferred to container-level
  // SSO (Keycloak OIDC/SAML). User accounts are created on first login
  // via the IdP. We record the mapping when we receive a webhook or
  // on the first API call from the external system.

  return results;
}
