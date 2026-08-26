// Minimal Keycloak Admin REST client, used only by the keycloak-user-sync
// job (../jobs/keycloak-user-sync.ts) to list every user currently in the
// realm, as the safety net for identities deleted directly in the Keycloak
// console (apps/api's adminDeactivateUser handles the in-app path
// synchronously and never needs to list users, only delete one - see
// apps/api/src/lib/keycloakAdmin.ts, which this deliberately duplicates
// rather than shares, matching this repo's existing convention for small
// per-app lib helpers - see apps/worker/src/lib/mailer.ts vs
// apps/api/src/lib/mailer.ts).
//
// Authenticates as the Keycloak Operator's own initial superadmin (master
// realm) via the `keycloak-initial-admin` Secret the operator creates
// automatically for every Keycloak CR - the same account
// .github/workflows/deploy-keycloak-dev.yml's "Configure realm SMTP" step
// already uses via kcadm.sh.
//
// The realm to operate on, and the Keycloak server's base URL, are derived
// from KEYCLOAK_ISSUER rather than adding yet another URL/realm env var
// that could drift out of sync with it.

function keycloakBaseUrl(): string | null {
  const issuer = process.env.KEYCLOAK_ISSUER;
  if (!issuer) return null;
  return issuer.replace(/\/realms\/[^/]+\/?$/, '');
}

function keycloakRealm(): string | null {
  const issuer = process.env.KEYCLOAK_ISSUER;
  return issuer?.match(/\/realms\/([^/]+)\/?$/)?.[1] ?? null;
}

export function keycloakAdminConfigured(): boolean {
  return Boolean(
    keycloakBaseUrl() &&
      keycloakRealm() &&
      process.env.KEYCLOAK_ADMIN_USERNAME &&
      process.env.KEYCLOAK_ADMIN_PASSWORD,
  );
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAdminToken(baseUrl: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5_000) return cachedToken.value;

  const username = process.env.KEYCLOAK_ADMIN_USERNAME;
  const password = process.env.KEYCLOAK_ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error('KEYCLOAK_ADMIN_USERNAME/KEYCLOAK_ADMIN_PASSWORD are not configured.');
  }

  const res = await fetch(`${baseUrl}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username, password }),
  });
  if (!res.ok) {
    throw new Error(`Keycloak admin token request failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

/** Lists every user id currently in the realm (paginated, id-only - all the diff in keycloak-user-sync needs). */
export async function listKeycloakUserIds(): Promise<Set<string>> {
  const baseUrl = keycloakBaseUrl();
  const realm = keycloakRealm();
  if (!baseUrl || !realm) throw new Error('Keycloak admin client is not configured (KEYCLOAK_ISSUER missing).');

  const token = await getAdminToken(baseUrl);
  const ids = new Set<string>();
  const pageSize = 100;
  for (let first = 0; ; first += pageSize) {
    const url = `${baseUrl}/admin/realms/${realm}/users?briefRepresentation=true&max=${pageSize}&first=${first}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Keycloak admin list-users failed: ${res.status} ${await res.text()}`);
    const page = (await res.json()) as Array<{ id: string }>;
    for (const u of page) ids.add(u.id);
    if (page.length < pageSize) break;
  }
  return ids;
}
