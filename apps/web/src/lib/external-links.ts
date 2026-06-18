/**
 * Public base URLs of the three external pillar systems.
 *
 * learn / booking: headless in production — no public Caddy route. These are
 * undefined unless NEXT_PUBLIC_LEARN_URL / NEXT_PUBLIC_BOOKING_URL are set
 * (e.g. in local dev). Components must guard against undefined before rendering
 * an anchor tag.
 *
 * tickets: always public — Pretix keeps its own subdomain so the JS widget can
 * load in the browser.
 */
export const externalLinks = {
  /** Moodle — Theory pillar. Undefined in production (headless / API-only). */
  learn: process.env.NEXT_PUBLIC_LEARN_URL || undefined,
  /** LibreBooking — Practice pillar. Undefined in production (headless / API-only). */
  booking: process.env.NEXT_PUBLIC_BOOKING_URL || undefined,
  /** pretix — Performance pillar (always public for the JS widget). */
  tickets: process.env.NEXT_PUBLIC_TICKETS_URL ?? 'http://tickets.mymusic-coach.test',
};

/** Whether the frontend should issue live GraphQL queries (vs. typed fallbacks). */
export const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';
