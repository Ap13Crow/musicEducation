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

const pretixSlug = config.pretixOrganiserSlug;

  // Pretix Order Sync: Every 5 minutes
if (adapters.pretix && pretixSlug) {
    const pretixAdapter = adapters.pretix;
    cron.schedule('*/5 * * * *', async () => {
      try {
      await syncPretixOrders(prisma, pretixAdapter, pretixSlug);
      } catch (err) {
        logger.error({ err }, 'Pretix sync job failed');
      }
    });
  }

  // LibreBooking Reservation Sync: Every 15 minutes
  if (adapters.libreBooking) {
    const libreBookingAdapter = adapters.libreBooking;
    cron.schedule('*/15 * * * *', async () => {
      try {
        await syncLibreBookingReservations(prisma, libreBookingAdapter);
      } catch (err) {
        logger.error({ err }, 'LibreBooking sync job failed');
      }
    });
  }

  // Moodle Progress Sync: Every hour
  if (adapters.moodle) {
    const moodleAdapter = adapters.moodle;
    cron.schedule('0 * * * *', async () => {
      try {
        await syncMoodleProgress(prisma, moodleAdapter);
      } catch (err) {
        logger.error({ err }, 'Moodle progress sync job failed');
      }
    });
  }
}
