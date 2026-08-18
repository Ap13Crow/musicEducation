import type { PrismaClient } from '@my-music-coach/database';
import { TicketmasterAdapter } from '../discovery/ticketmaster.js';
import type { NormalizedExternalEvent } from '../discovery/types.js';
import type { Job } from './types.js';

// The Swiss + neighbouring region CLAUDE.md/WP4 target.
const REGION_COUNTRY_CODES = ['CH', 'DE', 'AT', 'FR', 'IT'];
// Slice the horizon into ~monthly windows per country: each request stays
// well under the deep-paging cap without us paging past it, and re-running
// the job (upsert by provider+providerId) keeps this idempotent.
const HORIZON_DAYS = 90;
const WINDOW_DAYS = 30;

const adapter = new TicketmasterAdapter();

function buildWindows(now: Date): Array<{ startDateTime: Date; endDateTime: Date }> {
  const windows: Array<{ startDateTime: Date; endDateTime: Date }> = [];
  for (let offset = 0; offset < HORIZON_DAYS; offset += WINDOW_DAYS) {
    const start = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() + Math.min(offset + WINDOW_DAYS, HORIZON_DAYS) * 24 * 60 * 60 * 1000);
    windows.push({ startDateTime: start, endDateTime: end });
  }
  return windows;
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

export const ticketmasterIngestJob: Job = {
  key: 'ticketmaster-ingest',
  // Every 6 hours: comfortably inside the ~5000 req/day budget for
  // 5 countries x 3 date windows x 1 page per run (well under 50 req/run).
  schedule: '0 */6 * * *',
  async run(ctx) {
    if (!adapter.isConfigured()) {
      ctx.logger.info('TICKETMASTER_API_KEY not configured; ticketmaster-ingest is disabled.');
      return;
    }

    const windows = buildWindows(new Date());
    let fetched = 0;
    let upserted = 0;
    let failedSlices = 0;

    for (const countryCode of REGION_COUNTRY_CODES) {
      for (const window of windows) {
        try {
          const events = await adapter.search({ countryCode, ...window });
          fetched += events.length;
          for (const event of events) {
            try {
              await upsertProjection(ctx.prisma, event);
              upserted += 1;
            } catch (error) {
              // One malformed/conflicting row shouldn't drop the rest of the batch.
              ctx.logger.warn({ error, providerId: event.providerId }, 'Failed to upsert one external event; skipping it');
            }
          }
        } catch (error) {
          failedSlices += 1;
          ctx.logger.warn({ error, countryCode, window }, 'Ticketmaster slice failed; continuing with the next one');
        }
      }
    }

    ctx.logger.info({ fetched, upserted, failedSlices }, 'ticketmaster-ingest run complete');
  },
};
