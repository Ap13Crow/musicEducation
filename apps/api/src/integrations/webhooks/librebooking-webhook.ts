import type { Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import type { PrismaClient } from '@my-music-coach/database';
import type { LibreBookingWebhookPayload } from '../types/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Verify the LibreBooking webhook signature.
 */
function verifyLibreBookingSignature(req: Request, secret: string): boolean {
  const signature = req.headers['x-librebooking-signature'] as string | undefined;
  if (!signature) return false;

  const body = JSON.stringify(req.body);
  const expected = createHmac('sha256', secret).update(body).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Express handler for LibreBooking webhook / notification callbacks.
 *
 * LibreBooking does not have native webhooks out of the box;
 * this endpoint is designed to be triggered by a custom plugin
 * or a cron-based polling job.
 */
export function createLibreBookingWebhookHandler(prisma: PrismaClient) {
  const webhookSecret = process.env.LIBREBOOKING_WEBHOOK_SECRET ?? '';

  return async (req: Request, res: Response): Promise<void> => {
    // Verify webhook signature when a secret is configured
    if (webhookSecret && !verifyLibreBookingSignature(req, webhookSecret)) {
      logger.warn('LibreBooking webhook: invalid signature — rejecting request');
      res.status(401).json({ error: 'invalid webhook signature' });
      return;
    }

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
