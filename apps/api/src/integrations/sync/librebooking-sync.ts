import type { PrismaClient } from '@my-music-coach/database';
import type { LibreBookingAdapter } from '../adapters/librebooking.js';
import { logger } from '../../utils/logger.js';

/**
 * Poll LibreBooking for updated reservations and sync them to the platform.
 */
export async function syncLibreBookingReservations(
  prisma: PrismaClient,
  libreBooking: LibreBookingAdapter,
): Promise<void> {
  // As a fallback to native webhooks, we query the database for all upcoming LibreBooking bookings and verify their status.
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      startsAt: { gte: new Date() },
      externalBookingId: { not: null },
    },
  });

  for (const booking of upcomingBookings) {
    try {
      if (!booking.externalBookingId) continue;
      const externalBooking = await libreBooking.getBooking(booking.externalBookingId);
      if (!externalBooking) {
        // Cancelled or deleted externally
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });
      } else {
        // If times changed, sync them
        if (
          booking.startsAt.getTime() !== externalBooking.start.getTime() ||
          booking.endsAt?.getTime() !== externalBooking.end.getTime()
        ) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              startsAt: externalBooking.start,
              endsAt: externalBooking.end,
            },
          });
        }
      }
    } catch (err) {
      logger.error({ err, bookingId: booking.id }, 'Failed to sync booking');
    }
  }
  logger.info({ count: upcomingBookings.length }, 'LibreBooking sync complete');
}
