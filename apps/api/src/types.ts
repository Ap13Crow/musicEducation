import type { PrismaClient, User } from '@music-edu/database';
import type { Request } from 'express';

export interface GraphQLContext {
  prisma: PrismaClient;
  user: User | null;
  req: Request;
}
