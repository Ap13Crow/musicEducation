import type { PrismaClient } from '@my-music-coach/database';
import { buildCalendarFeedIcs, type CalendarFeedEventInput } from './ics.js';
import { displayNameOf } from './displayName.js';

/**
 * Builds a live snapshot of a user's own calendar (booked lessons, both as
 * a student and - if they're also a teacher - as the teacher; plus their
 * private personal appointments) as one RFC 5545 feed, for the
 * `/calendar/feed/:token.ics` subscription route. Regenerated fresh on
 * every request rather than cached: a subscribing calendar app (Apple
 * Calendar, Google Calendar, Outlook) re-polls this URL on its own
 * schedule, so "current state, computed on demand" is simpler and never
 * goes stale, unlike the per-booking invitation emails (buildBookingIcs)
 * which must be re-sent to reflect a change.
 */
export async function buildUserCalendarFeed(prisma: PrismaClient, userId: string): Promise<string> {
  const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId } });

  const [bookings, appointments] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { not: 'CANCELLED' },
        OR: [{ userId }, ...(teacherProfile ? [{ teacherProfileId: teacherProfile.id }] : [])],
      },
      include: { user: { include: { profile: true } }, teacherProfile: { include: { user: { include: { profile: true } } } } },
    }),
    prisma.personalAppointment.findMany({ where: { userId } }),
  ]);

  const bookingEvents: CalendarFeedEventInput[] = bookings.map((booking) => {
    const viewerIsTeacher = Boolean(teacherProfile) && booking.teacherProfileId === teacherProfile!.id;
    const counterpart = viewerIsTeacher ? displayNameOf(booking.user) : displayNameOf(booking.teacherProfile.user);
    return {
      uid: `booking-${booking.id}@mymusic.coach`,
      startsAt: booking.startsAt,
      endsAt: booking.endsAt ?? new Date(booking.startsAt.getTime() + booking.durationMin * 60_000),
      summary: `Lesson with ${counterpart}`,
      description: [booking.instrument, `Status: ${booking.status}`].filter(Boolean).join(' · '),
      location: booking.meetingUrl ?? null,
    };
  });

  const appointmentEvents: CalendarFeedEventInput[] = appointments.map((appointment) => ({
    uid: `appointment-${appointment.id}@mymusic.coach`,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
    summary: appointment.title,
    description: appointment.notes ?? null,
  }));

  return buildCalendarFeedIcs('MyMusic.Coach', [...bookingEvents, ...appointmentEvents]);
}
