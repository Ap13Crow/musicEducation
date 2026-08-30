import type { PrismaClient } from '@my-music-coach/database';
import { ClassicticAdapter, classicticConfigurationSource, isClassicticConfigured } from './classictic.js';
import type { ClassicticIngestResult, IngestLogger, NormalizedExternalEvent } from './types.js';

const FEATURE_FLAG_SETTING_KEY = 'classictic_discovery_enabled';
const HORIZON_DAYS = 180;
const TOTAL_RANGE = 1_000;

const adapter = new ClassicticAdapter();

async function isFeatureEnabled(prisma: PrismaClient): Promise<boolean> {
  const setting = await prisma.adminSetting.findUnique({ where: { key: FEATURE_FLAG_SETTING_KEY } });
  return setting ? setting.value !== 'false' : true;
}

async function upsertProjection(prisma: PrismaClient, event: NormalizedExternalEvent) {
  await prisma.externalEventProjection.upsert({
    where: { provider_providerId: { provider: event.provider, providerId: event.providerId } },
    create: {
      provider: event.provider,
      providerId: event.providerId,
      title: event.title,
      description: event.description ?? undefined,
      url: event.url,
      imageUrl: event.imageUrl ?? undefined,
      startsAt: event.startsAt,
      endsAt: event.endsAt ?? undefined,
      timezone: event.timezone ?? undefined,
      venueName: event.venueName ?? undefined,
      city: event.city ?? undefined,
      country: event.country ?? undefined,
      latitude: event.latitude ?? undefined,
      longitude: event.longitude ?? undefined,
      minPrice: event.minPrice ?? undefined,
      maxPrice: event.maxPrice ?? undefined,
      currency: event.currency ?? undefined,
      classifications: event.classifications,
      attribution: event.attribution,
      raw: event.raw as any,
      fetchedAt: event.fetchedAt,
      expiresAt: event.expiresAt ?? undefined,
    },
    update: {
      title: event.title,
      description: event.description ?? undefined,
      url: event.url,
      imageUrl: event.imageUrl ?? undefined,
      startsAt: event.startsAt,
      endsAt: event.endsAt ?? undefined,
      timezone: event.timezone ?? undefined,
      venueName: event.venueName ?? undefined,
      city: event.city ?? undefined,
      country: event.country ?? undefined,
      latitude: event.latitude ?? undefined,
      longitude: event.longitude ?? undefined,
      minPrice: event.minPrice ?? undefined,
      maxPrice: event.maxPrice ?? undefined,
      currency: event.currency ?? undefined,
      classifications: event.classifications,
      attribution: event.attribution,
      raw: event.raw as any,
      fetchedAt: event.fetchedAt,
      expiresAt: event.expiresAt ?? undefined,
    },
  });
}

async function markMissingAsWithdrawn(prisma: PrismaClient, seenProviderIds: Set<string>, now: Date): Promise<number> {
  const result = await prisma.externalEventProjection.updateMany({
    where: {
      provider: 'CLASSICTIC',
      providerId: { notIn: [...seenProviderIds] },
      startsAt: { gte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    data: { expiresAt: now },
  });
  return result.count;
}

export async function runClassicticIngest(prisma: PrismaClient, logger?: IngestLogger): Promise<ClassicticIngestResult> {
  const source = classicticConfigurationSource();
  if (!isClassicticConfigured()) {
    return {
      provider: 'CLASSICTIC',
      configured: false,
      enabled: true,
      source,
      fetched: 0,
      upserted: 0,
      withdrawn: 0,
      message: 'CLASSICTIC_API_TOKEN is not configured.',
    };
  }
  if (!(await isFeatureEnabled(prisma))) {
    return {
      provider: 'CLASSICTIC',
      configured: true,
      enabled: false,
      source,
      fetched: 0,
      upserted: 0,
      withdrawn: 0,
      message: 'classictic_discovery_enabled=false.',
    };
  }

  const startDateTime = new Date();
  const endDateTime = new Date(startDateTime.getTime() + HORIZON_DAYS * 24 * 60 * 60 * 1000);
  const events = await adapter.search({ countryCode: '', startDateTime, endDateTime, size: TOTAL_RANGE });

  let upserted = 0;
  const seenProviderIds = new Set<string>();
  for (const event of events) {
    seenProviderIds.add(event.providerId);
    try {
      await upsertProjection(prisma, event);
      upserted += 1;
    } catch (error) {
      logger?.warn({ error, providerId: event.providerId }, 'Failed to upsert one Classictic event; skipping it');
    }
  }

  const reachedResultCap = events.length >= TOTAL_RANGE;
  // A capped Classictic response is only a partial view of the provider's
  // catalog. Do not expire rows missing from a partial page; the provider
  // may simply have returned the first 1000 upcoming listings.
  const withdrawn = events.length > 0 && !reachedResultCap ? await markMissingAsWithdrawn(prisma, seenProviderIds, new Date()) : 0;
  return {
    provider: 'CLASSICTIC',
    configured: true,
    enabled: true,
    source,
    fetched: events.length,
    upserted,
    withdrawn,
    message: reachedResultCap
      ? `Classictic ${source} ingest completed at the ${TOTAL_RANGE}-event result cap; withdrawal skipped.`
      : `Classictic ${source} ingest completed.`,
  };
}
