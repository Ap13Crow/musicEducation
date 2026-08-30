import type { DiscoveryAdapter, DiscoverySearchWindow, ClassicticSource, NormalizedExternalEvent } from './types.js';

const API_BASE_URL = 'https://www.classictic.com';
const API_SEARCH_PATH_PREFIX = '/en/api/search/json/';
const API_COUNTRY_PATH_PREFIX = '/en/api/country/json/';
const WIDGET_BASE_URL = 'https://account.classictic.com/en/whitelabel/customized/search/result/';
const ALLOWED_HOST = 'classictic.com';
const API_PAGE_SIZE = 50;
const DEFAULT_TOTAL_RANGE = 500;
const MAX_TOTAL_RANGE = 2_500;
const MAX_COUNTRY_FALLBACK_SEARCHES = 75;
const REQUEST_TIMEOUT_MS = 30_000;

const ATTRIBUTION =
  'Events by Classictic. Tickets are sold by Classictic - this listing links out to their site to complete purchase.';

function classicticApiToken(): string | undefined {
  return process.env.CLASSICTIC_API_TOKEN;
}

function classicticAffiliateId(): string | undefined {
  return process.env.CLASSICTIC_AFFILIATE_ID;
}

export function classicticConfigurationSource(): ClassicticSource {
  if (classicticApiToken()) return 'api';
  if (classicticAffiliateId()) return 'widget';
  return 'none';
}

export function isClassicticConfigured(): boolean {
  return classicticConfigurationSource() !== 'none';
}

export function isSafeClassicticUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    if (url.pathname.includes('/api/')) return false;
    return url.hostname === ALLOWED_HOST || url.hostname.endsWith(`.${ALLOWED_HOST}`);
  } catch {
    return false;
  }
}

function stringValue(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

function nestedName(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return stringValue(record.name, record.title, record.label);
  }
  return null;
}

function numberValue(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.replace(',', '.'));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function dateValue(...values: unknown[]): Date | null {
  for (const value of values) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === 'number' && Number.isFinite(value)) {
      const date = new Date(value < 10_000_000_000 ? value * 1000 : value);
      if (!Number.isNaN(date.getTime())) return date;
    }
    if (typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric) && /^\d{9,13}$/.test(trimmed)) {
        const date = new Date(numeric < 10_000_000_000 ? numeric * 1000 : numeric);
        if (!Number.isNaN(date.getTime())) return date;
      }
      const date = new Date(trimmed);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }
  return null;
}

function structuredDateValue(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  const iso = stringValue(record.iso, record.datetime, record.date_time);
  if (iso) return iso;
  const date = stringValue(record.date);
  const time = stringValue(record.time);
  return date && time ? `${date}T${time}` : date;
}

function firstArrayItem(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : undefined;
}

function pickImage(raw: Record<string, unknown>): string | null {
  const pictures = raw.pictures as any;
  const picture = raw.picture as any;
  return stringValue(
    pictures?.desktop?.[0]?.url,
    pictures?.mobile?.[0]?.url,
    picture?.large,
    picture?.medium,
    picture?.small,
    picture?.url,
    raw.imageUrl,
    raw.image_url,
    raw.image,
    raw.picture,
    raw.thumbnail,
    (firstArrayItem(raw.images) as any)?.url,
  );
}

function collectClassifications(...values: unknown[]): string[] {
  const seen = new Set<string>();
  for (const value of values) {
    const items = Array.isArray(value) ? value : value ? [value] : [];
    for (const item of items) {
      const label = nestedName(item);
      if (!label || /^undefined$/i.test(label)) continue;
      seen.add(label);
    }
  }
  return [...seen];
}

function extractPrice(raw: Record<string, unknown>): { minPrice: number | null; maxPrice: number | null; currency: string | null } {
  const price = raw.price as any;
  const priceRange = Array.isArray(raw.priceRanges) ? (raw.priceRanges[0] as any) : undefined;
  const minPrice = numberValue(raw.min_price, raw.price_min, raw.priceFrom, raw.price_from, price?.min, price?.amount, price?.value, priceRange?.min);
  const maxPrice = numberValue(raw.max_price, raw.price_max, raw.priceTo, raw.price_to, price?.max, priceRange?.max);
  const currency = stringValue(raw.currency, price?.currency, priceRange?.currency);
  return { minPrice, maxPrice: maxPrice ?? minPrice, currency };
}

function publicUrl(raw: Record<string, unknown>, providerId: string): string {
  const candidate = stringValue(raw.link, raw.url, raw.event_url, raw.eventUrl, raw.event_link, raw.eventLink, raw.booking_url, raw.href);
  if (isSafeClassicticUrl(candidate)) return candidate;
  return `https://www.classictic.com/en/event/${encodeURIComponent(providerId)}/`;
}

export function normalizeEvent(rawEvent: unknown, fetchedAt: Date): NormalizedExternalEvent | null {
  if (!rawEvent || typeof rawEvent !== 'object') return null;
  const raw = rawEvent as Record<string, unknown>;
  const providerId = stringValue(raw.event_date_id, raw.eventDateId, raw.eventdate_id, raw.date_id, raw.dateId, raw.event_id, raw.eventId, raw.id);
  const title = stringValue(raw.event, raw.title, raw.name, raw.event_name, raw.eventName, raw.event_title, raw.eventTitle);
  const startsAt = dateValue(
    structuredDateValue(raw.start),
    structuredDateValue(raw.start_time),
    structuredDateValue(raw.start_datetime),
    structuredDateValue(raw.startDateTime),
    raw.date_time,
    raw.datetime,
    raw.event_date,
    raw.date,
    raw.start_stamp,
    raw.start_timestamp,
    raw.startTimestamp,
    raw.date_stamp,
    raw.date_timestamp,
    raw.event_date_timestamp,
    raw.timestamp,
    raw.from_timestamp,
  );
  if (!providerId || !title || !startsAt) return null;

  const endsAt = dateValue(raw.end_time, raw.end_datetime, raw.endDateTime, raw.end, raw.until_timestamp);
  const expiresAt = dateValue(raw.sale_end_time, raw.sale_end_datetime, raw.saleEndTime, raw.sale_end_stamp, raw.expiresAt, raw.expire_at);
  const { minPrice, maxPrice, currency } = extractPrice(raw);
  const location = raw.location as Record<string, unknown> | undefined;
  const venue = raw.venue as Record<string, unknown> | string | undefined;
  const city = raw.city as Record<string, unknown> | string | undefined;
  const country = raw.country as Record<string, unknown> | string | undefined;

  return {
    provider: 'CLASSICTIC',
    providerId,
    title,
    description: stringValue(raw.description, raw.short_description, raw.summary),
    url: publicUrl(raw, providerId),
    imageUrl: pickImage(raw),
    startsAt,
    endsAt,
    timezone: stringValue(raw.timezone, raw.time_zone),
    venueName: nestedName(venue) ?? stringValue(raw.venue_name, raw.venueName, location?.venue, location?.venue_hall),
    city: nestedName(city) ?? stringValue(raw.city_name, raw.cityName, location?.city),
    country: stringValue(raw.country_code, raw.countryCode) ?? nestedName(country) ?? stringValue(raw.country_name, raw.countryName, location?.country),
    latitude: numberValue(raw.latitude, raw.lat, location?.latitude, location?.lat),
    longitude: numberValue(raw.longitude, raw.lng, raw.lon, location?.longitude, location?.lng, location?.lon),
    minPrice,
    maxPrice,
    currency,
    classifications: collectClassifications(raw.tag, raw.tags, raw.genre, raw.genres, raw.category, raw.categories),
    attribution: ATTRIBUTION,
    raw,
    fetchedAt,
    expiresAt,
  };
}

function extractArrayByKeys(payload: unknown, keys: string[], depth = 0): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') {
      const nested = extractArrayByKeys(value, keys, depth + 1);
      if (nested.length > 0) return nested;
    }
  }

  if (depth < 3) {
    for (const value of Object.values(record)) {
      if (!value || typeof value !== 'object') continue;
      const nested = extractArrayByKeys(value, keys, depth + 1);
      if (nested.length > 0) return nested;
    }
  }

  const objectValues = Object.values(record).filter((value) => value && typeof value === 'object' && !Array.isArray(value));
  return objectValues.length > 0 ? objectValues : [];
}

function extractEvents(payload: unknown): unknown[] {
  return extractArrayByKeys(payload, [
    'event_dates',
    'event_date',
    'eventDates',
    'eventDate',
    'search',
    'events',
    'event',
    'results',
    'items',
    'data',
  ]);
}

async function fetchJson(url: URL): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers: { accept: 'application/json' }, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } catch (error) {
    throw new ClassicticRequestError(error);
  } finally {
    clearTimeout(timeout);
  }
}

function officialApiSearchUrl(token: string, window: DiscoverySearchWindow, page: number, range: number, countryId?: string): URL {
  const url = new URL(`${API_SEARCH_PATH_PREFIX}${encodeURIComponent(token)}/`, API_BASE_URL);
  url.searchParams.set('from_timestamp', String(Math.floor(window.startDateTime.getTime() / 1000)));
  url.searchParams.set('until_timestamp', String(Math.floor(window.endDateTime.getTime() / 1000)));
  url.searchParams.set('page', String(page));
  url.searchParams.set('range', String(range));
  if (countryId) url.searchParams.set('country_id', countryId);
  return url;
}

function officialApiCountryUrl(token: string): URL {
  return new URL(`${API_COUNTRY_PATH_PREFIX}${encodeURIComponent(token)}/`, API_BASE_URL);
}

function extractCountryIds(payload: unknown): string[] {
  const countries = extractArrayByKeys(payload, ['countries', 'country', 'salable', 'results', 'items', 'data']);
  const ids = new Set<string>();
  for (const country of countries) {
    if (!country || typeof country !== 'object') continue;
    const record = country as Record<string, unknown>;
    const id = stringValue(record.country_id, record.countryId, record.id);
    if (id) {
      ids.add(id);
      continue;
    }
    for (const [key, value] of Object.entries(record)) {
      if (/^\d+$/.test(key) && (typeof value === 'string' || (value && typeof value === 'object'))) {
        ids.add(key);
      }
    }
  }
  return [...ids];
}

function sampleKeys(rawEvents: unknown[]): string[] {
  const sample = rawEvents.find((event) => event && typeof event === 'object' && !Array.isArray(event)) as Record<string, unknown> | undefined;
  return sample ? Object.keys(sample).slice(0, 20) : [];
}

function summarizeNormalizationMiss(rawCount: number, keys: string[]): string {
  return keys.length > 0
    ? `Classictic returned ${rawCount} raw rows but none could be normalized. Sample keys: ${keys.join(', ')}.`
    : `Classictic returned ${rawCount} raw rows but none could be normalized.`;
}

function appendEvents(results: NormalizedExternalEvent[], rawEvents: unknown[], fetchedAt: Date, limit: number): number {
  let normalized = 0;
  for (const raw of rawEvents) {
    const event = normalizeEvent(raw, fetchedAt);
    if (event) {
      results.push(event);
      normalized += 1;
    }
    if (results.length >= limit) break;
  }
  return normalized;
}

async function fetchOfficialPages(token: string, window: DiscoverySearchWindow, requestedTotal: number, countryId?: string) {
  const pageSize = Math.min(API_PAGE_SIZE, requestedTotal);
  const maxPages = Math.ceil(requestedTotal / pageSize);
  const results: NormalizedExternalEvent[] = [];
  let rawCount = 0;
  let firstRawKeys: string[] = [];

  for (let page = 1; page <= maxPages && results.length < requestedTotal; page += 1) {
    const payload = await fetchJson(officialApiSearchUrl(token, window, page, pageSize, countryId));
    const rawEvents = extractEvents(payload);
    if (rawEvents.length === 0) break;

    rawCount += rawEvents.length;
    if (firstRawKeys.length === 0) firstRawKeys = sampleKeys(rawEvents);
    appendEvents(results, rawEvents, new Date(), requestedTotal);
    if (rawEvents.length < pageSize) break;
  }

  return { events: results, rawCount, firstRawKeys };
}

async function fetchCountryIds(token: string): Promise<string[]> {
  const payload = await fetchJson(officialApiCountryUrl(token));
  return extractCountryIds(payload);
}

async function searchByCountries(token: string, window: DiscoverySearchWindow, requestedTotal: number) {
  const results: NormalizedExternalEvent[] = [];
  let rawCount = 0;
  let firstRawKeys: string[] = [];
  let countrySearches = 0;

  for (const countryId of await fetchCountryIds(token)) {
    if (results.length >= requestedTotal || countrySearches >= MAX_COUNTRY_FALLBACK_SEARCHES) break;
    countrySearches += 1;
    const remaining = requestedTotal - results.length;
    const page = await fetchOfficialPages(token, window, remaining, countryId);
    rawCount += page.rawCount;
    if (firstRawKeys.length === 0) firstRawKeys = page.firstRawKeys;
    results.push(...page.events);
  }
  return { events: results, rawCount, firstRawKeys, countrySearches };
}

function widgetSearchUrl(affiliateId: string, size: number): URL {
  const url = new URL(WIDGET_BASE_URL);
  url.searchParams.set('affiliate_id', affiliateId);
  url.searchParams.set('link_on_image', 'true');
  url.searchParams.set('format', 'json');
  url.searchParams.set('range', String(size));
  return url;
}

function dedupeEvents(events: NormalizedExternalEvent[]): NormalizedExternalEvent[] {
  const byId = new Map<string, NormalizedExternalEvent>();
  for (const event of events) byId.set(event.providerId, event);
  return [...byId.values()].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export class ClassicticAdapter implements DiscoveryAdapter {
  readonly provider = 'CLASSICTIC' as const;

  isConfigured(): boolean {
    return isClassicticConfigured();
  }

  async search(window: DiscoverySearchWindow): Promise<NormalizedExternalEvent[]> {
    const token = classicticApiToken();
    if (token) return this.searchOfficialApi(token, window);

    const affiliateId = classicticAffiliateId();
    if (affiliateId) return this.searchWidget(affiliateId, window);

    return [];
  }

  private async searchOfficialApi(token: string, window: DiscoverySearchWindow): Promise<NormalizedExternalEvent[]> {
    const requestedTotal = Math.max(1, Math.min(window.size ?? DEFAULT_TOTAL_RANGE, MAX_TOTAL_RANGE));
    const globalSearch = await fetchOfficialPages(token, window, requestedTotal);
    if (globalSearch.events.length > 0) return dedupeEvents(globalSearch.events);

    const countrySearch = await searchByCountries(token, window, requestedTotal);
    if (countrySearch.events.length > 0) return dedupeEvents(countrySearch.events);

    const rawCount = globalSearch.rawCount + countrySearch.rawCount;
    const firstRawKeys = globalSearch.firstRawKeys.length > 0 ? globalSearch.firstRawKeys : countrySearch.firstRawKeys;
    if (rawCount > 0) {
      throw new ClassicticRequestError(new Error(summarizeNormalizationMiss(rawCount, firstRawKeys)));
    }

    return [];
  }

  private async searchWidget(affiliateId: string, window: DiscoverySearchWindow): Promise<NormalizedExternalEvent[]> {
    const size = Math.max(1, Math.min(window.size ?? 300, 300));
    const payload = await fetchJson(widgetSearchUrl(affiliateId, size));
    const fetchedAt = new Date();
    return dedupeEvents(extractEvents(payload).map((raw) => normalizeEvent(raw, fetchedAt)).filter(Boolean) as NormalizedExternalEvent[]);
  }
}

export class ClassicticRequestError extends Error {
  constructor(public readonly cause: unknown) {
    super(`Classictic request failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'ClassicticRequestError';
  }
}
