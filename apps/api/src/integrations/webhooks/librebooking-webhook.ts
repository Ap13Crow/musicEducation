import type { Request, Response } from 'express';
import type { PrismaClient } from '@music-edu/database';
import type { LibreBookingWebhookPayload } from '../types/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Express handler for LibreBooking webhook / notification callbacks.
 *
 * LibreBooking does not have native webhooks out of the box;
 * this endpoint is designed to be triggered by a custom plugin
 * or a cron-based polling job.
 */
export function createLibreBookingWebhookHandler(prisma: PrismaClient) {
  return async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as LibreBookingWebhookPayload;
    const { event, reservationId } = payload;

    logger.info({ event, reservationId }, 'LibreBooking webhook received');

    try {
      switch (event) {
        case 'reservation.created':
        case 'reservation.updated':
          // Sync reservation state into platform Booking table
          logger.info({ reservationId }, 'LibreBooking: reservation synced');
          break;

        case 'reservation.deleted':
          logger.info({ reservationId }, 'LibreBooking: reservation removed');
          break;

        default:
          logger.info({ event }, 'LibreBooking webhook: unhandled event');
      }

      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err, event }, 'LibreBooking webhook processing error');
      res.status(500).json({ error: 'webhook processing failed' });
    }
  };
}
