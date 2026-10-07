import pino from 'pino';

const ingestLibraryTopic = jest.fn();
const acquireLibraryIngestLock = jest.fn();
const releaseLibraryIngestLock = jest.fn();

jest.mock('@my-music-coach/bnf-gallica', () => ({
  ingestLibraryTopic: (...args: unknown[]) => ingestLibraryTopic(...args),
  acquireLibraryIngestLock: (...args: unknown[]) => acquireLibraryIngestLock(...args),
  releaseLibraryIngestLock: (...args: unknown[]) => releaseLibraryIngestLock(...args),
}));

import {
  bnfLibraryIngestJob,
  LIBRARY_SEED_DOCUMENT_TYPES,
  LIBRARY_SEED_TOPICS,
} from '../jobs/bnf-library-ingest.js';

describe('bnfLibraryIngestJob', () => {
  const prisma = {} as any;
  const logger = pino({ level: 'silent' });
  const originalDelay = process.env.BNF_LIBRARY_INGEST_DELAY_MS;
  const totalCalls = LIBRARY_SEED_TOPICS.length * LIBRARY_SEED_DOCUMENT_TYPES.length;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BNF_LIBRARY_INGEST_DELAY_MS = '0';
    acquireLibraryIngestLock.mockResolvedValue(true);
    releaseLibraryIngestLock.mockResolvedValue(undefined);
    ingestLibraryTopic.mockResolvedValue({ query: 'x', fetched: 2, upserted: 2, message: '' });
  });

  afterAll(() => {
    if (originalDelay === undefined) delete process.env.BNF_LIBRARY_INGEST_DELAY_MS;
    else process.env.BNF_LIBRARY_INGEST_DELAY_MS = originalDelay;
  });

  it('is registered with a valid cron schedule', () => {
    expect(bnfLibraryIngestJob.key).toBe('bnf-library-ingest');
    expect(bnfLibraryIngestJob.schedule).toMatch(/^[\d*/,\- ]+$/);
  });

  it('skips the run entirely when another ingest holds the lock', async () => {
    acquireLibraryIngestLock.mockResolvedValue(false);
    await bnfLibraryIngestJob.run({ prisma, logger });
    expect(ingestLibraryTopic).not.toHaveBeenCalled();
    expect(releaseLibraryIngestLock).not.toHaveBeenCalled();
  });

  it('ingests every topic x document type and releases the lock', async () => {
    await bnfLibraryIngestJob.run({ prisma, logger });
    expect(ingestLibraryTopic).toHaveBeenCalledTimes(totalCalls);
    expect(ingestLibraryTopic).toHaveBeenCalledWith(prisma, 'Bach', 'partition', logger);
    expect(releaseLibraryIngestLock).toHaveBeenCalledTimes(1);
  });

  it('never overlaps Gallica requests', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    ingestLibraryTopic.mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setImmediate(resolve));
      inFlight -= 1;
      return { query: 'x', fetched: 0, upserted: 0, message: '' };
    });
    await bnfLibraryIngestJob.run({ prisma, logger });
    expect(maxInFlight).toBe(1);
  });

  it('continues past a failing topic and still releases the lock', async () => {
    ingestLibraryTopic.mockRejectedValueOnce(new Error('Gallica 503'));
    await expect(bnfLibraryIngestJob.run({ prisma, logger })).resolves.toBeUndefined();
    expect(ingestLibraryTopic).toHaveBeenCalledTimes(totalCalls);
    expect(releaseLibraryIngestLock).toHaveBeenCalledTimes(1);
  });
});
