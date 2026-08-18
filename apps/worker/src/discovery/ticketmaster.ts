import axios from 'axios';
import type { DiscoveryAdapter, DiscoverySearchWindow, NormalizedExternalEvent } from './types.js';

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/';
const MUSIC_SEGMENT_ID = 'KZFzniwnSyZfZ7v7nJ';
const MAX_SIZE = 200;
// Ticketmaster's own cap: deep paging beyond page*size > 1000 is rejected.
const MAX_PAGE_TIMES_SIZE = 1000;
// Throttle to comfortably under the documented 5 req/s ceiling.
const MIN_REQUEST_INTERVAL_MS = 250;
// Ticketmaster's caching guidance: treat a cached row as stale after this long.
const PROJECTION_TTL_MS = 6 * 60 * 60 * 1000;

const ATTRIBUTION =
  'Event data provided by Ticketmaster. Tickets are sold by Ticketmaster — this listing links out to their site to complete purchase.';

let lastRequestAt = 0;

async function throttle(): Promise<void> {
  const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

function pickImage(images: Array<{ url: string; width: number; height: number }> | undefined): string | null {
  if (!images?.length) return null;
  // Prefer a large-ish 16:9 image; fall back to the largest available.
  const widescreen = images
    .filter((img) => Math.abs(img.width / img.height - 16 / 9) < 0.05 && img.width >= 640)
    .sort((a, b) => b.width - a.width)[0];
  if (widescreen) return widescreen.url;
  return [...images].sort((a, b) => b.width - a.width)[0]?.url ?? null;
}

function normalizeUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function parseCoordinate(value: unknown): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeEvent(raw: any, fetchedAt: Date): NormalizedExternalEvent | null {
  const id: string | undefined = raw?.id;
  const startsAtRaw: string | undefined = raw?.dates?.start?.dateTime;
  const normalizedUrl = normalizeUrl(raw?.url);
  if (!id || !raw?.name || !normalizedUrl || !startsAtRaw) return null;

  const venue = raw?._embedded?.venues?.[0];
  const priceRange = raw?.priceRanges?.[0];
  const classifications: string[] = (raw?.classifications ?? [])
    .flatMap((c: any) => [c?.segment?.name, c?.genre?.name])
    .filter((name: unknown): name is string => typeof name === 'string' && name.length > 0 && name !== 'Undefined');

  return {
    provider: 'TICKETMASTER',
    providerId: id,
    title: raw.name,
    description: raw.info ?? raw.pleaseNote ?? null,
    url: normalizedUrl,
    imageUrl: pickImage(raw.images),
    startsAt: new Date(startsAtRaw),
    endsAt: raw?.dates?.end?.dateTime ? new Date(raw.dates.end.dateTime) : null,
    timezone: raw?.dates?.timezone ?? null,
    venueName: venue?.name ?? null,
    city: venue?.city?.name ?? null,
    country: venue?.country?.countryCode ?? null,
    latitude: parseCoordinate(venue?.location?.latitude),
    longitude: parseCoordinate(venue?.location?.longitude),
    minPrice: priceRange?.min ?? null,
    maxPrice: priceRange?.max ?? null,
    currency: priceRange?.currency ?? null,
    classifications: [...new Set(classifications)],
    attribution: ATTRIBUTION,
    raw,
    fetchedAt,
    expiresAt: new Date(fetchedAt.getTime() + PROJECTION_TTL_MS),
  };
}

export class TicketmasterAdapter implements DiscoveryAdapter {
  readonly provider = 'TICKETMASTER' as const;

  isConfigured(): boolean {
    return Boolean(process.env.TICKETMASTER_API_KEY);
  }

  async search(window: DiscoverySearchWindow): Promise<NormalizedExternalEvent[]> {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) return [];

    const size = Math.min(window.size ?? MAX_SIZE, MAX_SIZE);
    const fetchedAt = new Date();
    const results: NormalizedExternalEvent[] = [];
    let page = 0;

    // page*size must stay within Ticketmaster's deep-paging cap; the caller
    // is expected to slice by date window/country rather than page past it,
    // but this loop stops safely regardless.
    while (page * size < MAX_PAGE_TIMES_SIZE) {
      await throttle();
      let response;
      try {
        response = await axios.get(`${BASE_URL}events.json`, {
          params: {
            apikey: apiKey,
            segmentId: MUSIC_SEGMENT_ID,
            classificationName: 'music',
            countryCode: window.countryCode,
            city: window.city,
            startDateTime: window.startDateTime.toISOString().replace(/\.\d{3}Z$/, 'Z'),
            endDateTime: window.endDateTime.toISOString().replace(/\.\d{3}Z$/, 'Z'),
            size,
            page,
            sort: 'date,asc',
          },
          timeout: 10_000,
        });
      } catch (error) {
        // Network/4xx/5xx: stop this slice, keep whatever we already have.
        // The job isolates errors per slice so one bad request doesn't lose
        // events already normalized from earlier pages/countries.
        throw new TicketmasterRequestError(window, page, error);
      }

      const events: any[] = response.data?._embedded?.events ?? [];
      for (const raw of events) {
        const normalized = normalizeEvent(raw, fetchedAt);
        if (normalized) results.push(normalized);
      }

      const totalPages: number | undefined = response.data?.page?.totalPages;
      const isLastPage = events.length === 0 || (totalPages !== undefined && page + 1 >= totalPages);
      if (isLastPage) break;
      page += 1;
    }

    return results;
  }
}

export class TicketmasterRequestError extends Error {
  constructor(
    public readonly window: DiscoverySearchWindow,
    public readonly page: number,
    public readonly cause: unknown,
  ) {
    super(
      `Ticketmaster request failed for ${window.countryCode} page ${page}: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    this.name = 'TicketmasterRequestError';
  }
}
