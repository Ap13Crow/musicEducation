import type { ExternalEventProvider } from '@my-music-coach/database';

/** Normalized shape every discovery adapter maps its provider's response into. */
export interface NormalizedExternalEvent {
  provider: ExternalEventProvider;
  providerId: string;
  title: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  startsAt: Date;
  endsAt?: Date | null;
  timezone?: string | null;
  venueName?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  currency?: string | null;
  classifications: string[];
  attribution: string;
  raw?: unknown;
  fetchedAt: Date;
  expiresAt?: Date | null;
}

/** One provider/date-window/location slice to search. */
export interface DiscoverySearchWindow {
  countryCode: string;
  startDateTime: Date;
  endDateTime: Date;
  city?: string;
  size?: number;
}

/**
 * Uniform interface so a new provider (Classictic, per the roadmap) is a
 * drop-in: implement this, register it in the ingestion job, done — no
 * schema change beyond adding the enum value.
 */
export interface DiscoveryAdapter {
  readonly provider: ExternalEventProvider;
  /** False when the provider's API key isn't configured — the caller should skip it, not error. */
  isConfigured(): boolean;
  search(window: DiscoverySearchWindow): Promise<NormalizedExternalEvent[]>;
}
