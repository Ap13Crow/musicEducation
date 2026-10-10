/** Native routes for the three product pillars. */
export const externalLinks = {
  learn: '/courses',
  booking: '/teachers',
  tickets: '/events',
};

/** Whether the frontend should issue live GraphQL queries (vs. typed fallbacks). */
export const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';

/**
 * Keycloak admin console URL. Derived from NEXT_PUBLIC_KEYCLOAK_ISSUER if set,
 * otherwise falls back to the production default.
 */
export const keycloakIssuer =
  process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ?? 'https://auth.mymusic.coach/realms/mymusic-coach';
export const keycloakAccountUrl = `${keycloakIssuer}/account`;
// Keycloak 26 account console: passkeys, authenticator app, password.
export const keycloakSigningInUrl = `${keycloakAccountUrl}/account-security/signing-in`;
export const keycloakAdminUrl = keycloakIssuer.replace(
  /\/realms\/([^/]+)$/,
  (_match, realm) => `/admin/${realm}/console`,
);
