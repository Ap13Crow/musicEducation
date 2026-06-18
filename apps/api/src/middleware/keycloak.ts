import jwt from 'jsonwebtoken';
import type { JwksClient } from 'jwks-rsa';
import type { PrismaClient, User } from '@my-music-coach/database';

/**
 * Bridges Keycloak (central SSO / OIDC) access tokens to local application
 * users. The web app signs in through Keycloak via NextAuth and forwards the
 * Keycloak access token to the API; this module verifies that token against the
 * realm's published JWKS and maps (or just-in-time provisions) a local user.
 */

/** Claims we rely on from a Keycloak access token. */
export interface KeycloakClaims {
  sub: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles?: string[] };
}

const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER?.replace(/\/$/, '');

// Lazily-created JWKS client so the JWKS endpoint is only contacted when a
// Keycloak token is actually presented (local-JWT-only deployments pay nothing).
let jwksClient: JwksClient | null = null;

function getJwksClient(): JwksClient | null {
  if (!KEYCLOAK_ISSUER) return null;
  if (!jwksClient) {
    // Loaded lazily (and via require) so the JWKS/crypto dependency tree is only
    // pulled in when SSO tokens are actually verified.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JwksClient: JwksClientCtor } = require('jwks-rsa') as typeof import('jwks-rsa');
    jwksClient = new JwksClientCtor({
      jwksUri: `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`,
      cache: true,
      rateLimit: true,
    });
  }
  return jwksClient;
}

/** Whether Keycloak SSO verification is configured for this deployment. */
export function isKeycloakConfigured(): boolean {
  return Boolean(KEYCLOAK_ISSUER);
}

/**
 * Verify a Keycloak (RS256) access token against the realm JWKS.
 * Returns the decoded claims, or null when the token is missing/invalid or
 * Keycloak is not configured.
 */
export async function verifyKeycloakToken(token: string): Promise<KeycloakClaims | null> {
  const client = getJwksClient();
  if (!client || !KEYCLOAK_ISSUER) return null;

  const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
    if (!header.kid) {
      callback(new Error('Missing key id'));
      return;
    }
    client
      .getSigningKey(header.kid)
      .then((key) => callback(null, key.getPublicKey()))
      .catch((err) => callback(err as Error));
  };

  return new Promise((resolve) => {
    jwt.verify(
      token,
      getKey,
      { algorithms: ['RS256'], issuer: KEYCLOAK_ISSUER },
      (err, decoded) => {
        if (err || !decoded || typeof decoded === 'string' || !decoded.sub) {
          resolve(null);
          return;
        }
        resolve(decoded as unknown as KeycloakClaims);
      },
    );
  });
}

/** Map Keycloak realm roles to a local application role. */
export function mapKeycloakRole(claims: KeycloakClaims): 'STUDENT' | 'TEACHER' | 'ADMIN' {
  const roles = (claims.realm_access?.roles ?? []).map((r) => r.toLowerCase());
  if (roles.includes('admin')) return 'ADMIN';
  if (roles.includes('teacher')) return 'TEACHER';
  return 'STUDENT';
}

function displayNameFromClaims(claims: KeycloakClaims): string {
  return (
    claims.name ||
    [claims.given_name, claims.family_name].filter(Boolean).join(' ').trim() ||
    claims.preferred_username ||
    claims.email ||
    'Music Coach Member'
  );
}

/**
 * Resolve the local user for a verified Keycloak token, just-in-time
 * provisioning one on first SSO login. Identities are linked through
 * UserExternalIdentity (provider = "keycloak", externalId = the Keycloak `sub`)
 * so an account survives email changes in Keycloak.
 */
export async function provisionKeycloakUser(
  prisma: PrismaClient,
  claims: KeycloakClaims,
): Promise<User> {
  const provider = 'keycloak';
  const role = mapKeycloakRole(claims);

  // 1. Already linked? Use the linked account (keep role in sync with Keycloak).
  const identity = await prisma.userExternalIdentity.findUnique({
    where: { provider_externalId: { provider, externalId: claims.sub } },
    include: { user: true },
  });
  if (identity) {
    if (identity.user.role !== role) {
      return prisma.user.update({ where: { id: identity.userId }, data: { role } });
    }
    return identity.user;
  }

  // 2. Link to an existing local account that shares the verified email.
  if (claims.email) {
    const existing = await prisma.user.findUnique({ where: { email: claims.email } });
    if (existing) {
      await prisma.userExternalIdentity.create({
        data: { userId: existing.id, provider, externalId: claims.sub },
      });
      if (existing.role !== role) {
        return prisma.user.update({ where: { id: existing.id }, data: { role } });
      }
      return existing;
    }
  }

  // 3. First time we see this person — create a fully-formed local account.
  // Keycloak normally provides a verified email; the noreply fallback only
  // applies to edge-case tokens minted without one (it uses a domain the
  // platform controls and never receives mail).
  const email = claims.email ?? `keycloak-${claims.sub}@users.noreply.mymusic.coach`;
  return prisma.user.create({
    data: {
      email,
      emailVerified: claims.email_verified ?? false,
      role,
      externalIdentities: { create: { provider, externalId: claims.sub } },
      profile: { create: { displayName: displayNameFromClaims(claims), onboardingDone: false } },
      gamification: { create: {} },
    },
  });
}
