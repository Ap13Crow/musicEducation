/**
 * Public base URLs of the three external pillar systems.
 *
 * All three are publicly accessible so users and administrators can navigate
 * directly into each system from the dashboard:
 *   learn   → Moodle    (learn.mymusic.coach)
 *   booking → LibreBooking (booking.mymusic.coach)
 *   tickets → pretix    (tickets.mymusic.coach, also hosts the JS widget)
 *
 * Set via NEXT_PUBLIC_* build args; components guard against undefined for
 * environments where a service is intentionally disabled.
 */
export const externalLinks = {
  /** Moodle — Theory pillar (learn.mymusic.coach in production). */
  learn: process.env.NEXT_PUBLIC_LEARN_URL || undefined,
  /** LibreBooking — Practice pillar (booking.mymusic.coach in production). */
  booking: process.env.NEXT_PUBLIC_BOOKING_URL || undefined,
  /** pretix — Performance pillar (tickets.mymusic.coach in production). */
  tickets: process.env.NEXT_PUBLIC_TICKETS_URL ?? 'http://tickets.mymusic-coach.test',
};

/** Whether the frontend should issue live GraphQL queries (vs. typed fallbacks). */
export const liveApiEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true';

/**
 * Keycloak admin console URL. Derived from NEXT_PUBLIC_KEYCLOAK_ISSUER if set,
 * otherwise falls back to the production default.
 */
const issuer =
  process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ?? 'https://auth.mymusic.coach/realms/mymusic-coach';
export const keycloakAdminUrl = issuer.replace(
  /\/realms\/([^/]+)$/,
  (_match, realm) => `/admin/${realm}/console`,
);
