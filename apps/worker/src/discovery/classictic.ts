import axios from 'axios';
import type { DiscoveryAdapter, DiscoverySearchWindow, NormalizedExternalEvent } from './types.js';

// Classictic's official affiliate "event list widget" (documented in the
// affiliate portal's marketing-materials section, alongside a banner
// widget) - not a general-purpose REST API. ?format=json returns the same
// data the embeddable iframe widget renders, keyed by the caller's own
// affiliate_id so every returned event's `link` already carries the
// tracking parameter. affiliate_id/link_on_image/format/range are the only
// parameters that are actually documented; no other query parameter is
// assumed or guessed (no scraping, no reverse-engineered contract - see
// docs/integration-architecture.md's Classictic section).
const BASE_URL = 'https://account.classictic.com/en/whitelabel/customized/search/result/';
const ALLOWED_HOST = 'classictic.com';
// The documented example uses range=20; range=300 was confirmed to work in
// ~3s during integration testing, range=1000 timed out - 300 is a safe,
// generous "as much as possible" without pushing into untested territory
// or hammering an endpoint with no documented pagination/offset parameter.
// There being no offset parameter is a real contract limitation: each sync
// only ever sees "the widget's first N events" in its own default
// ordering, not a way to page through the full catalog - see the ingest
// job's own comment.
const DEFAULT_RANGE = 300;
const REQUEST_TIMEOUT_MS = 30_000;

const ATTRIBUTION =
  'Events by Classictic. Tickets are sold by Classictic — this listing links out to their site to complete purchase.';

function classicticAffiliateId(): string | undefined {
  return process.env.CLASSICTIC_AFFILIATE_ID;
}

// Defensive validation, independent of trusting Classictic's own feed:
// only ever accept an https URL on classictic.com's own domain as an
// outbound affiliate link - "Generate the tracking URL exactly as
// documented; do not concatenate unvalidated arbitrary URLs" applies to
// what we render just as much as what we'd construct ourselves. A future
// bad/compromised payload (or a redirect to an unrelated domain) is
// rejected rather than silently sent to a student.
export function isSafeClassicticUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === ALLOWED_HOST || url.hostname.endsWith(`.${ALLOWED_HOST}`));
  } catch {
    return false;
  }
}

function pickImage(pictures: any): string | null {
  const desktop = pictures?.desktop?.[0]?.url;
  const mobile = pictures?.mobile?.[0]?.url;
  return typeof desktop === 'string' ? desktop : typeof mobile === 'string' ? mobile : null;
}

export function normalizeEvent(raw: any, fetchedAt: Date): NormalizedExternalEvent | null {
  const id: string | undefined = raw?.event_id;
  const title: string | undefined = raw?.event;
  const startsAtRaw: string | undefined = raw?.start_time;
  if (!id || !title || !startsAtRaw || !isSafeClassicticUrl(raw?.link)) return null;
  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) return null;

  // sale_end_time is the last moment the event is purchasable - the exact
  // "withdrawn/expired" signal the existing external-event visibility rule
  // already uses (see admin.ts platformStats / discovery.ts: expiresAt
  // null or in the future). No price/currency/category/performer field is
  // present anywhere in this widget's payload (confirmed across a sampled
  // batch) - left null/empty rather than guessed.
  const saleEndRaw: string | undefined = raw?.sale_end_time;
  const expiresAt = saleEndRaw ? new Date(saleEndRaw) : null;

  return {
    provider: 'CLASSICTIC',
    providerId: id,
    title,
    description: typeof raw?.description === 'string' ? raw.description : null,
    url: raw.link,
    imageUrl: pickImage(raw?.pictures),
    startsAt,
    endsAt: null,
    timezone: null,
    venueName: typeof raw?.venue === 'string' ? raw.venue : null,
    city: typeof raw?.city === 'string' ? raw.city : null,
    country: null,
    latitude: null,
    longitude: null,
    minPrice: null,
    maxPrice: null,
    currency: null,
    classifications: [],
    attribution: ATTRIBUTION,
    raw,
    fetchedAt,
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
  };
}

export class ClassicticAdapter implements DiscoveryAdapter {
  readonly provider = 'CLASSICTIC' as const;

  isConfigured(): boolean {
    return Boolean(classicticAffiliateId());
  }

  // window is accepted to satisfy DiscoveryAdapter, but this widget has no
  // documented country/date-window/pagination parameters to apply it
  // through - every call returns the same "first `range` events" slice.
  async search(window: DiscoverySearchWindow): Promise<NormalizedExternalEvent[]> {
    const affiliateId = classicticAffiliateId();
    if (!affiliateId) return [];

    const fetchedAt = new Date();
    let response;
    try {
      response = await axios.get(BASE_URL, {
        params: {
          affiliate_id: affiliateId,
          link_on_image: true,
          format: 'json',
          range: Math.min(window.size ?? DEFAULT_RANGE, DEFAULT_RANGE),
        },
        timeout: REQUEST_TIMEOUT_MS,
      });
    } catch (error) {
      throw new ClassicticRequestError(error);
    }

    const events = response.data?.events;
    if (!events || typeof events !== 'object') return [];
    const results: NormalizedExternalEvent[] = [];
    for (const raw of Object.values(events)) {
      const normalized = normalizeEvent(raw, fetchedAt);
      if (normalized) results.push(normalized);
    }
    return results;
  }
}

export class ClassicticRequestError extends Error {
  constructor(public readonly cause: unknown) {
    super(`Classictic widget request failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'ClassicticRequestError';
  }
}
