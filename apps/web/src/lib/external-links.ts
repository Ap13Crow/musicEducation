/**
 * Public base URLs of the three external pillar systems.
 *
 * These come from NEXT_PUBLIC_* env vars so nothing bakes a hostname into the
 * bundle. In production they resolve to the https://*.mymusic.coach hosts that
 * Caddy + the Cloudflare tunnel route to each container; the defaults below are
 * the local dev hostnames.
 */
export const externalLinks = {
  /** Moodle — Theory pillar (courses, lessons, quizzes). */
  learn: process.env.NEXT_PUBLIC_LEARN_URL ?? 'http://learn.mymusic-coach.test',
  /** LibreBooking — Practice pillar (in-person room/resource scheduling). */
  booking: process.env.NEXT_PUBLIC_BOOKING_URL ?? 'http://booking.mymusic-coach.test',
  /** pretix — Performance pillar (event ticketing, orders, check-in). */
  tickets: process.env.NEXT_PUBLIC_TICKETS_URL ?? 'http://tickets.mymusic-coach.test',
} as const;

/** Whether the frontend should issue live GraphQL queries (vs. typed fallbacks). */
export const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';
