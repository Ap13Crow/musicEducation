import pino from 'pino';
import { ticketmasterIngestJob } from '../jobs/ticketmaster-ingest.js';

describe('ticketmasterIngestJob', () => {
  const originalKey = process.env.TICKETMASTER_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.TICKETMASTER_API_KEY;
    else process.env.TICKETMASTER_API_KEY = originalKey;
  });

  it('is registered with a valid cron schedule', () => {
    expect(ticketmasterIngestJob.key).toBe('ticketmaster-ingest');
    expect(ticketmasterIngestJob.schedule).toMatch(/^[\d*/,\- ]+$/);
  });

  it('disables itself silently — no crash, no DB call — when the API key is missing', async () => {
    delete process.env.TICKETMASTER_API_KEY;
    const upsert = jest.fn();
    const prisma = { externalEventProjection: { upsert } } as any;
    const logger = pino({ level: 'silent' });

    await expect(ticketmasterIngestJob.run({ prisma, logger })).resolves.toBeUndefined();
    expect(upsert).not.toHaveBeenCalled();
  });
});
