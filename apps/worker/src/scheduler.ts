import cron, { type ScheduledTask } from 'node-cron';
import type { PrismaClient } from '@my-music-coach/database';
import type { Logger } from 'pino';
import type { Job } from './jobs/types.js';

const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 5 * 60_000;

/**
 * Registers and runs {@link Job}s on their cron schedules.
 *
 * Each job runs in isolation: one job throwing never stops another job's
 * schedule or crashes the process. A failed run is retried with exponential
 * backoff (capped) up to `MAX_ATTEMPTS`, after which the registry gives up
 * on that run and waits for the job's next scheduled tick.
 */
export class JobRegistry {
  private readonly jobs = new Map<string, Job>();
  private readonly tasks = new Map<string, ScheduledTask>();
  private readonly timers = new Set<NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: Logger,
  ) {}

  register(job: Job): void {
    if (this.jobs.has(job.key)) {
      throw new Error(`Job "${job.key}" is already registered`);
    }
    if (!cron.validate(job.schedule)) {
      throw new Error(`Job "${job.key}" has an invalid cron schedule: ${job.schedule}`);
    }
    this.jobs.set(job.key, job);
  }

  /** Starts every registered job on its schedule. Idempotent per job. */
  start(): void {
    for (const job of this.jobs.values()) {
      if (this.tasks.has(job.key)) continue;
      const task = cron.schedule(job.schedule, () => {
        void this.runWithIsolation(job);
      });
      this.tasks.set(job.key, task);
      this.logger.info({ job: job.key, schedule: job.schedule }, 'Job scheduled');
    }
  }

  /** Stops all schedules and cancels any pending retry timers. */
  stop(): void {
    for (const task of this.tasks.values()) task.stop();
    this.tasks.clear();
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
  }

  /** Runs one job immediately, outside its schedule (e.g. for tests or manual triggers). */
  async runNow(key: string): Promise<void> {
    const job = this.jobs.get(key);
    if (!job) throw new Error(`Unknown job "${key}"`);
    await this.runWithIsolation(job);
  }

  get registeredJobKeys(): string[] {
    return [...this.jobs.keys()];
  }

  private async runWithIsolation(job: Job, attempt = 1): Promise<void> {
    const jobLogger = this.logger.child({ job: job.key, attempt });
    const startedAt = Date.now();
    try {
      await job.run({ prisma: this.prisma, logger: jobLogger });
      jobLogger.info({ durationMs: Date.now() - startedAt }, 'Job run succeeded');
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS) {
        jobLogger.error({ error }, 'Job run failed; retry attempts exhausted for this tick');
        return;
      }
      const backoffMs = Math.min(BASE_BACKOFF_MS * 2 ** (attempt - 1), MAX_BACKOFF_MS);
      jobLogger.error({ error, backoffMs, nextAttempt: attempt + 1 }, 'Job run failed; retrying with backoff');
      const timer = setTimeout(() => {
        this.timers.delete(timer);
        void this.runWithIsolation(job, attempt + 1);
      }, backoffMs);
      this.timers.add(timer);
    }
  }
}
