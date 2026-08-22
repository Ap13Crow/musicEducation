// Shared synchronous displayName fallback chain (profile.displayName -> local
// part of the email -> generic), for call sites that already have `profile`
// included on their query and don't need users.ts's async
// User.displayName field resolver (which does its own DB lookup when
// `profile` wasn't loaded). Used by bookings.ts's confirmation/cancellation
// email content and by the calendar feed (calendarFeed.ts).
export function displayNameOf(user: { email: string | null; profile?: { displayName?: string | null } | null }): string {
  return user.profile?.displayName || user.email?.split('@')[0] || 'there';
}
