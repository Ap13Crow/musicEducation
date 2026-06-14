import type { PrismaClient } from '@my-music-coach/database';
import type { Request } from 'express';
import type { AuthUser } from './middleware/auth.js';

export type { AuthUser };

export interface GraphQLContext {
  prisma: PrismaClient;
  user: AuthUser | null;
  req: Request;
}
