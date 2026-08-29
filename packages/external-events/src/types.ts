import type { ExternalEventProvider } from '@my-music-coach/database';

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

export interface DiscoverySearchWindow {
  countryCode: string;
  startDateTime: Date;
  endDateTime: Date;
  city?: string;
  size?: number;
}

export interface DiscoveryAdapter {
  readonly provider: ExternalEventProvider;
  isConfigured(): boolean;
  search(window: DiscoverySearchWindow): Promise<NormalizedExternalEvent[]>;
}

export type ClassicticSource = 'api' | 'widget' | 'none';

export interface ClassicticIngestResult {
  provider: 'CLASSICTIC';
  configured: boolean;
  enabled: boolean;
  source: ClassicticSource;
  fetched: number;
  upserted: number;
  withdrawn: number;
  message: string;
}

export interface IngestLogger {
  info(fields: unknown, message?: string): void;
  warn(fields: unknown, message?: string): void;
}
