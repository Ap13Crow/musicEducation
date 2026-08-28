// Minimal Keycloak Admin REST client, used only for reconciling application
// user state into the MyMusic.Coach realm. adminDeactivateUser deletes one
// identity synchronously when an admin uses the "Deactivate" action in the
// app; role changes mirror the application's STUDENT/TEACHER/ADMIN role back
// into Keycloak so the next login token is stable.
//
// Authenticates as a dedicated confidential client in the application realm.
// It receives only realm-management query/view/manage-users roles; the
// application never receives Keycloak's master-realm superadmin password.
//
// The realm to operate on, and the Keycloak server's base URL, are derived
// from KEYCLOAK_ISSUER (already required for verifying SSO tokens - see
// middleware/keycloak.ts) rather than adding yet another URL/realm env var
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
    process.env.KEYCLOAK_ADMIN_CLIENT_ID &&
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
  );
}

let cachedToken: { value: string; expiresAt: number } | null = null;

const APPLICATION_REALM_ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;
export type ApplicationRealmRole = (typeof APPLICATION_REALM_ROLES)[number];

type KeycloakRoleRepresentation = {
  id: string;
  name: string;
  description?: string;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string;
};

async function getAdminToken(baseUrl: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5_000) return cachedToken.value;

  const realm = keycloakRealm();
  const clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET;
  if (!realm || !clientId || !clientSecret) {
    throw new Error('KEYCLOAK_ADMIN_CLIENT_ID/KEYCLOAK_ADMIN_CLIENT_SECRET are not configured.');
  }

  const res = await fetch(`${baseUrl}/realms/${realm}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Keycloak admin token request failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

/**
 * Deletes one user's Keycloak identity outright - the admin-facing action
 * that calls this (adminDeactivateUser) already treats the deletion as
 * final and irreversible from the app's side; only the Postgres row is kept
 * (marked DEACTIVATED), never the Keycloak identity.
 *
 * A 404 (already gone - e.g. deleted moments ago directly in the Keycloak
 * console) is treated as success, not an error.
 */
export async function deleteKeycloakUser(keycloakUserId: string): Promise<void> {
  const baseUrl = keycloakBaseUrl();
  const realm = keycloakRealm();
  if (!baseUrl || !realm) throw new Error('Keycloak admin client is not configured (KEYCLOAK_ISSUER missing).');

  const token = await getAdminToken(baseUrl);
  const res = await fetch(`${baseUrl}/admin/realms/${realm}/users/${keycloakUserId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Keycloak admin delete-user failed: ${res.status} ${await res.text()}`);
  }
}

async function keycloakAdminJson<T>(
  baseUrl: string,
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Keycloak admin request failed: ${res.status} ${await res.text()}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * Makes the Keycloak account carry the same application role that the
 * Postgres user row now owns. This intentionally removes the other
 * MyMusic.Coach realm roles first so a user never drifts into
 * STUDENT+TEACHER or TEACHER+ADMIN ambiguity; Keycloak's own realm-management
 * roles are unrelated and left untouched.
 */
export async function setKeycloakUserRealmRole(
  keycloakUserId: string,
  role: ApplicationRealmRole,
): Promise<void> {
  if (!APPLICATION_REALM_ROLES.includes(role)) {
    throw new Error(`Invalid Keycloak application role: ${role}`);
  }

  const baseUrl = keycloakBaseUrl();
  const realm = keycloakRealm();
  if (!baseUrl || !realm) throw new Error('Keycloak admin client is not configured (KEYCLOAK_ISSUER missing).');

  const token = await getAdminToken(baseUrl);
  const realmPath = encodeURIComponent(realm);
  const userPath = encodeURIComponent(keycloakUserId);
  const roleMappingsPath = `/admin/realms/${realmPath}/users/${userPath}/role-mappings/realm`;

  const [currentRoles, targetRole] = await Promise.all([
    keycloakAdminJson<KeycloakRoleRepresentation[]>(baseUrl, token, roleMappingsPath),
    keycloakAdminJson<KeycloakRoleRepresentation>(
      baseUrl,
      token,
      `/admin/realms/${realmPath}/roles/${encodeURIComponent(role)}`,
    ),
  ]);

  const rolesToRemove = currentRoles.filter(
    (currentRole) =>
      APPLICATION_REALM_ROLES.includes(currentRole.name as ApplicationRealmRole) &&
      currentRole.name !== role,
  );
  if (rolesToRemove.length) {
    await keycloakAdminJson<void>(baseUrl, token, roleMappingsPath, {
      method: 'DELETE',
      body: JSON.stringify(rolesToRemove),
    });
  }

  if (!currentRoles.some((currentRole) => currentRole.name === role)) {
    await keycloakAdminJson<void>(baseUrl, token, roleMappingsPath, {
      method: 'POST',
      body: JSON.stringify([targetRole]),
    });
  }
}
