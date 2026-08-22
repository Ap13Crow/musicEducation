import pino from 'pino';
import { classicticIngestJob } from '../jobs/classictic-ingest.js';

describe('classicticIngestJob', () => {
  const originalId = process.env.CLASSICTIC_AFFILIATE_ID;

  afterEach(() => {
    if (originalId === undefined) delete process.env.CLASSICTIC_AFFILIATE_ID;
    else process.env.CLASSICTIC_AFFILIATE_ID = originalId;
  });

  it('is registered with a valid cron schedule', () => {
    expect(classicticIngestJob.key).toBe('classictic-ingest');
    expect(classicticIngestJob.schedule).toMatch(/^[\d*/,\- ]+$/);
  });

  it('disables itself silently — no crash, no DB call — when the affiliate id is missing', async () => {
    delete process.env.CLASSICTIC_AFFILIATE_ID;
    const upsert = jest.fn();
    const adminSettingFindUnique = jest.fn();
    const prisma = { externalEventProjection: { upsert, updateMany: jest.fn() }, adminSetting: { findUnique: adminSettingFindUnique } } as any;
    const logger = pino({ level: 'silent' });

    await expect(classicticIngestJob.run({ prisma, logger })).resolves.toBeUndefined();
    expect(upsert).not.toHaveBeenCalled();
    // Doesn't even bother checking the feature-flag setting when the
    // affiliate id itself isn't configured.
    expect(adminSettingFindUnique).not.toHaveBeenCalled();
  });

  it('respects the classictic_discovery_enabled=false feature flag even when configured', async () => {
    process.env.CLASSICTIC_AFFILIATE_ID = 'test-affiliate-id';
    const upsert = jest.fn();
    const prisma = {
      externalEventProjection: { upsert, updateMany: jest.fn() },
      adminSetting: { findUnique: jest.fn().mockResolvedValue({ value: 'false' }) },
    } as any;
    const logger = pino({ level: 'silent' });

    await expect(classicticIngestJob.run({ prisma, logger })).resolves.toBeUndefined();
    expect(upsert).not.toHaveBeenCalled();
  });
});
