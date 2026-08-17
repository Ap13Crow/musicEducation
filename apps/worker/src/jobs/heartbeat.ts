import type { Job } from './types.js';

/**
 * Confirms the worker process and its schedule are alive. Also useful as a
 * template for future jobs (webhook processing, email, external-event
 * ingestion) — see `docs/development.md` for how jobs are registered.
 */
export const heartbeatJob: Job = {
  key: 'heartbeat',
  schedule: '*/1 * * * *',
  async run(ctx) {
    ctx.logger.info('heartbeat');
  },
};
