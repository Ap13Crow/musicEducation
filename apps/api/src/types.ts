import type { PrismaClient } from '@my-music-coach/database';
import type { Request } from 'express';
import type { AuthUser } from './middleware/auth.js';
import type { Loaders } from './lib/loaders.js';

export type { AuthUser };

export interface GraphQLContext {
  prisma: PrismaClient;
  user: AuthUser | null;
  req: Request;
  loaders: Loaders;
}
