// Phase 6 (scoped) - the OAuth-backed direction of calendar sync (Google/
// Microsoft busy-time, read INTO the platform to block a teacher's
// availability). See the ExternalCalendarConnection model comment in
// schema.prisma for why this stays a contract, not a live integration:
// CLAUDE.md is explicit that Google Calendar coupling is out of scope
// unless a task explicitly reintroduces it, and there is no
// GOOGLE_CALENDAR_CLIENT_ID / MICROSOFT_CALENDAR_CLIENT_ID anywhere in this
// codebase or its deploy manifests to actually perform an OAuth exchange
// with. Fabricating one would violate "never hardcode/invent credentials."
//
// What exists here is the shape a real implementation would fill in:
// - isProviderConfigured() reports whether this server could even attempt
//   the OAuth flow for a given provider (checks env vars only - never
//   returns true today).
// - ExternalCalendarSyncAdapter is the interface a real per-provider sync
//   job would implement (mirroring apps/worker/src/discovery's
//   DiscoveryAdapter shape), so adding Google/Microsoft later is a
//   drop-in, not a redesign.
export type ExternalCalendarProviderName = 'GOOGLE' | 'MICROSOFT';

const CONFIG_ENV_VARS: Record<ExternalCalendarProviderName, readonly string[]> = {
  GOOGLE: ['GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET'],
  MICROSOFT: ['MICROSOFT_CALENDAR_CLIENT_ID', 'MICROSOFT_CALENDAR_CLIENT_SECRET'],
};

export function isProviderConfigured(provider: ExternalCalendarProviderName): boolean {
  return CONFIG_ENV_VARS[provider].every((name) => Boolean(process.env[name]));
}

export class CalendarProviderNotConfiguredError extends Error {
  constructor(provider: ExternalCalendarProviderName) {
    super(`${provider} calendar sync is not configured on this server.`);
    this.name = 'CalendarProviderNotConfiguredError';
  }
}

/** One externally-synced busy interval, normalized the same way regardless of provider. */
export interface NormalizedBusyInterval {
  startsAt: Date;
  endsAt: Date;
}

/**
 * Contract a real Google/Microsoft sync job would implement. No
 * implementation exists yet (see file header) - this interface exists so
 * the schema and resolver layer above it (externalCalendar.ts resolvers)
 * have a stable shape to call into once one does, without a breaking
 * change to the GraphQL API.
 */
export interface ExternalCalendarSyncAdapter {
  readonly provider: ExternalCalendarProviderName;
  isConfigured(): boolean;
  /** Exchanges an OAuth authorization code for stored tokens and creates the connection row. */
  connect(userId: string, authorizationCode: string): Promise<void>;
  /** Refreshes this connection's ExternalBusyInterval rows from the provider. */
  syncBusyIntervals(connectionId: string): Promise<NormalizedBusyInterval[]>;
}
