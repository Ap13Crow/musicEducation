import type { Request } from 'express';
import type { PrismaClient } from '@my-music-coach/database';
import { verifyKeycloakToken, provisionKeycloakUser } from './keycloak.js';
import type { KeycloakAuthDiagnostic } from './keycloak.js';

/** Lightweight user stub attached to every authenticated request */
export interface AuthUser {
  id: string;
  role: string;
}

/** Pull the bearer token out of the Authorization header, if present. */
export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

/**
 * Resolve the authenticated user for a request from a Keycloak SSO access
 * token. Keycloak is the sole identity authority (see AGENTS.md/CLAUDE.md) -
 * the local bcrypt+JWT auth system this used to also accept was dead code
 * (the web app only ever signed in through NextAuth's Keycloak provider) and
 * was removed. Keycloak users are just-in-time provisioned/linked to a local
 * account. Returns null for anonymous or invalid-token requests.
 */
export async function resolveRequestUser(
  req: Request,
  prisma: PrismaClient,
  report?: (diagnostic: KeycloakAuthDiagnostic) => void,
): Promise<AuthUser | null> {
  const token = extractBearerToken(req);
  if (!token) return null;

  const claims = await verifyKeycloakToken(token, report);
  if (!claims) return null;

  const user = await provisionKeycloakUser(prisma, claims);
  // A still-valid browser token must stop working immediately after the
  // local projection is deactivated, and recreating the same email in
  // Keycloak must not silently regain access to preserved history.
  if (user.status !== 'ACTIVE') return null;
  return { id: user.id, role: user.role };
}

/** Throw if the context has no authenticated user */
export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
  if (!user) {
    throw new Error('UNAUTHENTICATED: You must be logged in.');
  }
}

/** Throw if the user does not have the required role */
export function requireRole(user: AuthUser | null, ...roles: string[]) {
  requireAuth(user);
  if (!roles.includes(user.role)) {
    throw new Error(`FORBIDDEN: Requires role ${roles.join(' or ')}.`);
  }
}
