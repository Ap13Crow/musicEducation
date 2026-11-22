import type { AuthUser } from '../middleware/auth.js';

/**
 * Contact details are private: the account email, the email-derived
 * username, the notification email and a user's course enrollments. Public
 * queries (teachers, teacher, user, feed, reviews...) all hand out User
 * objects, so the check lives on those fields rather than on the queries.
 *
 * Readers: the user themself, an admin, or a viewer that a parent resolver
 * has already vouched for by stamping CONTACT_VISIBLE_TO with that viewer's
 * id (Booking.student does this for the booking's own teacher).
 */
export const CONTACT_VISIBLE_TO = '__contactVisibleTo';

export function canSeeContact(userId: string | null | undefined, viewer: AuthUser | null, stampedFor?: string): boolean {
  if (!viewer || !userId) return false;
  return viewer.id === userId || viewer.role === 'ADMIN' || stampedFor === viewer.id;
}
