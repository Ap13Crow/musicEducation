import cron from 'node-cron';
import type { PrismaClient } from '@my-music-coach/database';
import { syncPretixOrders } from './sync/event-sync.js';
import { syncLibreBookingReservations } from './sync/librebooking-sync.js';
import { syncMoodleProgress } from './sync/moodle-sync.js';
import { logger } from '../utils/logger.js';
import type { PretixAdapter } from './adapters/pretix.js';
import type { LibreBookingAdapter } from './adapters/librebooking.js';
import type { MoodleAdapter } from './adapters/moodle.js';

export function startScheduler(
  prisma: PrismaClient,
  adapters: {
    pretix?: PretixAdapter;
    libreBooking?: LibreBookingAdapter;
    moodle?: MoodleAdapter;
  },
  config: { pretixOrganiserSlug?: string },
) {
  logger.info('Starting integrations scheduler');

  // Pretix Order Sync: Every 5 minutes
  if (adapters.pretix && config.pretixOrganiserSlug) {
    cron.schedule('*/5 * * * *', async () => {
      try {
        await syncPretixOrders(prisma, adapters.pretix!, config.pretixOrganiserSlug!);
      } catch (err) {
        logger.error({ err }, 'Pretix sync job failed');
      }
    });
  }

  // LibreBooking Reservation Sync: Every 15 minutes
  if (adapters.libreBooking) {
    cron.schedule('*/15 * * * *', async () => {
      try {
        await syncLibreBookingReservations(prisma, adapters.libreBooking!);
      } catch (err) {
        logger.error({ err }, 'LibreBooking sync job failed');
      }
    });
  }

  // Moodle Progress Sync: Every hour
  if (adapters.moodle) {
    cron.schedule('0 * * * *', async () => {
      try {
        await syncMoodleProgress(prisma, adapters.moodle!);
      } catch (err) {
        logger.error({ err }, 'Moodle progress sync job failed');
      }
    });
  }
}
