import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { PrismaClient, User } from '@music-edu/database';

/** Lightweight user stub attached to every authenticated request */
export interface AuthUser {
  id: string;
  role: string;
}

// Extend Express Request to include the authenticated user stub
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
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
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7);
    const payload = verifyToken(token);
    if (payload) {
      // Attach a lightweight user stub; full object fetched in context if needed
      req.user = { id: payload.sub, role: payload.role };
    }
  }
  next();
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
