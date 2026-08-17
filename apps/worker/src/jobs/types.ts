import type { PrismaClient } from '@my-music-coach/database';
import type { Logger } from 'pino';

/** Per-run context handed to every job. */
export interface JobContext {
  prisma: PrismaClient;
  logger: Logger;
}

/**
 * A scheduled unit of async work. `schedule` is a standard cron expression
 * (evaluated by node-cron); `run` should be idempotent and safe to retry —
 * the registry isolates failures per job and retries with backoff.
 */
export interface Job {
  key: string;
  schedule: string;
  run(ctx: JobContext): Promise<void>;
}
