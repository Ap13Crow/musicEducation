import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { PrismaClient, User } from '@my-music-coach/database';
import { verifyKeycloakToken, provisionKeycloakUser } from './keycloak.js';

/** Lightweight user stub attached to every authenticated request */
export interface AuthUser {
  id: string;
  role: string;
}

// Merge AuthUser into Express.User so it's compatible with @types/passport
declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
    }
  }
}

// Fail fast if JWT_SECRET is not configured — never fall back to a weak default.
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but was not set.');
}
const JWT_SECRET = process.env.JWT_SECRET;

export interface TokenPayload {
  sub: string;  // userId
  role: string;
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getUser(token: string, prisma: PrismaClient): Promise<User | null> {
  const payload = verifyToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.sub } });
}

/**
 * Express middleware: extracts the JWT from Authorization header and attaches
 * the decoded user to req.user (if valid). Does NOT reject unauthenticated
 * requests — that is done at the resolver level.
 *
 * Only the local (HS256) token path runs here so the middleware stays
 * synchronous and DB-free. Keycloak SSO tokens are resolved in the GraphQL
 * context via {@link resolveRequestUser}, where Prisma is available.
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      // Attach a lightweight user stub; full object fetched in context if needed
      req.user = { id: payload.sub, role: payload.role };
    }
  }
  next();
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
 * Resolve the authenticated user for a request, accepting either a local
 * (HS256) application JWT or a Keycloak SSO (RS256) access token. Keycloak
 * users are just-in-time provisioned/linked to a local account. Returns null
 * for anonymous requests.
 */
export async function resolveRequestUser(
  req: Request,
  prisma: PrismaClient,
): Promise<AuthUser | null> {
  const token = extractBearerToken(req);
  if (!token) return null;

  // 1. Fast path: a token this API issued itself.
  const local = verifyToken(token);
  if (local) {
    return { id: local.sub, role: local.role };
  }

  // 2. SSO path: a Keycloak access token forwarded by the web app.
  const claims = await verifyKeycloakToken(token);
  if (claims) {
    const user = await provisionKeycloakUser(prisma, claims);
    return { id: user.id, role: user.role };
  }

  return null;
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
