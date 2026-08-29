import { isClassicticConfigured, runClassicticIngest } from '@my-music-coach/external-events';
import type { Job } from './types.js';

export const classicticIngestJob: Job = {
  key: 'classictic-ingest',
  // Every 6 hours, same cadence as ticketmaster-ingest. The official
  // Classictic API is paginated at 50 rows/page, so the shared runner keeps
  // each sync bounded and idempotent.
  schedule: '0 */6 * * *',
  async run(ctx) {
    if (!isClassicticConfigured()) {
      ctx.logger.info('CLASSICTIC_API_TOKEN not configured; classictic-ingest is disabled.');
      return;
    }

    const result = await runClassicticIngest(ctx.prisma, ctx.logger);
    if (!result.enabled) {
      ctx.logger.info(result.message);
      return;
    }
    ctx.logger.info(result, 'classictic-ingest run complete');
  },
};
