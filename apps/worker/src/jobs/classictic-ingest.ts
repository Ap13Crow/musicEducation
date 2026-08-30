import { isClassicticConfigured, runClassicticIngest } from '@my-music-coach/external-events';
import type { Job } from './types.js';

export const classicticIngestJob: Job = {
  key: 'classictic-ingest',
  // Daily: Classictic caps the useful search window around 1000 results per
  // pull, so this behaves like a rolling "new/changed events" refresh instead
  // of hammering the same capped page four times a day.
  schedule: '15 2 * * *',
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
