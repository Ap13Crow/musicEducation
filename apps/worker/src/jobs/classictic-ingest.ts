import type { PrismaClient } from '@my-music-coach/database';
import { ClassicticAdapter } from '../discovery/classictic.js';
import type { NormalizedExternalEvent } from '../discovery/types.js';
import type { Job } from './types.js';

const adapter = new ClassicticAdapter();

// Admin-editable feature flag (AdminSetting key) so Classictic inventory can
// be turned off without a redeploy if it's ever incomplete/unhealthy -
// separate from CLASSICTIC_AFFILIATE_ID being configured at all. Defaults
// to enabled once the affiliate id is present, matching "disabled" being
// the deliberate/explicit action, not the default state.
const FEATURE_FLAG_SETTING_KEY = 'classictic_discovery_enabled';

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
      venueName: event.venueName ?? undefined,
      city: event.city ?? undefined,
      raw: event.raw as any,
      fetchedAt: event.fetchedAt,
      // Re-set every run so an event that disappears from the feed (sold
      // out slot removed, or its sale window already recorded) keeps its
      // real expiry rather than one going stale from a previous run.
      expiresAt: event.expiresAt ?? undefined,
    },
  });
}

// Marks Classictic rows that vanished from this run's feed but haven't
// already expired as unavailable "now" - the widget has no documented
// deletion/removal signal beyond simply not appearing in the current
// range, so absence-plus-not-yet-expired is the best available withdrawal
// signal without guessing at an undocumented status field. A row that was
// already correctly future-expiresAt-dated from its own sale_end_time is
// left alone even if it briefly drops out of one run's `range` window.
async function markMissingAsWithdrawn(prisma: PrismaClient, seenProviderIds: Set<string>, now: Date) {
  await prisma.externalEventProjection.updateMany({
    where: {
      provider: 'CLASSICTIC',
      providerId: { notIn: [...seenProviderIds] },
      startsAt: { gte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    data: { expiresAt: now },
  });
}

export const classicticIngestJob: Job = {
  key: 'classictic-ingest',
  // Every 6 hours, same cadence as ticketmaster-ingest - one bounded
  // request per run (see classictic.ts's DEFAULT_RANGE), well within any
  // reasonable rate limit for a single affiliate-widget GET.
  schedule: '0 */6 * * *',
  async run(ctx) {
    if (!adapter.isConfigured()) {
      ctx.logger.info('CLASSICTIC_AFFILIATE_ID not configured; classictic-ingest is disabled.');
      return;
    }
    if (!(await isFeatureEnabled(ctx.prisma))) {
      ctx.logger.info('classictic_discovery_enabled=false; classictic-ingest is disabled.');
      return;
    }

    let events: NormalizedExternalEvent[];
    try {
      events = await adapter.search({ countryCode: '', startDateTime: new Date(), endDateTime: new Date() });
    } catch (error) {
      ctx.logger.warn({ error }, 'Classictic ingest request failed; will retry on the next scheduled run');
      return;
    }

    let upserted = 0;
    const seenProviderIds = new Set<string>();
    for (const event of events) {
      seenProviderIds.add(event.providerId);
      try {
        await upsertProjection(ctx.prisma, event);
        upserted += 1;
      } catch (error) {
        // One malformed/conflicting row shouldn't drop the rest of the batch.
        ctx.logger.warn({ error, providerId: event.providerId }, 'Failed to upsert one Classictic event; skipping it');
      }
    }

    const now = new Date();
    await markMissingAsWithdrawn(ctx.prisma, seenProviderIds, now);

    ctx.logger.info({ fetched: events.length, upserted }, 'classictic-ingest run complete');
  },
};
