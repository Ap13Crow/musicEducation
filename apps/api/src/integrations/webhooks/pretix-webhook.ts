import type { Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import type { PrismaClient } from '@my-music-coach/database';
import type { PretixAdapter } from '../adapters/pretix.js';
import type { PretixWebhookPayload } from '../types/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Verify the pretix webhook signature.
 * pretix signs payloads with HMAC-SHA256 using the shared secret.
 */
function verifyPretixSignature(req: Request, secret: string): boolean {
  const signature = req.headers['x-pretix-signature'] as string | undefined;
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
 * Express handler for pretix webhook callbacks.
 *
 * pretix sends POST requests when orders change state.
 * We sync these into the platform's EventBooking records.
 */
export function createPretixWebhookHandler(
  prisma: PrismaClient,
  pretix: PretixAdapter | null,
) {
  const webhookSecret = process.env.PRETIX_WEBHOOK_SECRET ?? '';

  return async (req: Request, res: Response): Promise<void> => {
    if (!pretix) {
      res.status(503).json({ error: 'pretix integration not configured' });
      return;
    }

    // Verify webhook signature when a secret is configured
    if (webhookSecret && !verifyPretixSignature(req, webhookSecret)) {
      logger.warn('pretix webhook: invalid signature — rejecting request');
      res.status(401).json({ error: 'invalid webhook signature' });
      return;
    }

    const payload = req.body as PretixWebhookPayload;
    const { action, organizer, event, code } = payload;

    logger.info({ action, organizer, event, code }, 'pretix webhook received');

    try {
      switch (action) {
        case 'pretix.event.order.placed':
        case 'pretix.event.order.paid':
          await handleOrderPaid(prisma, pretix, organizer, event, code!);
          break;

        case 'pretix.event.order.canceled':
          await handleOrderCancelled(prisma, organizer, event, code!);
          break;

        case 'pretix.event.order.refunded':
          await handleOrderRefunded(prisma, organizer, event, code!);
          break;

        case 'pretix.event.checkin':
          await handleCheckIn(prisma, organizer, event, code!);
          break;

        default:
          logger.info({ action }, 'pretix webhook: unhandled action');
      }

      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err, action }, 'pretix webhook processing error');
      res.status(500).json({ error: 'webhook processing failed' });
    }
  };
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleOrderPaid(
  prisma: PrismaClient,
  pretix: PretixAdapter,
  organiser: string,
  eventSlug: string,
  orderCode: string,
): Promise<void> {
  const order = await pretix.getOrder(organiser, eventSlug, orderCode);
  if (!order) {
    logger.warn({ orderCode }, 'pretix webhook: order not found in pretix API');
    return;
  }

  // Look up the platform event by its pretix mapping
  const mapping = await (prisma as unknown as Record<string, any>).externalEventMapping?.findFirst?.({
    where: { pretixOrganiserSlug: organiser, pretixEventSlug: eventSlug },
  }) as { eventId: string } | null | undefined;

  if (!mapping) {
    logger.warn({ organiser, eventSlug }, 'pretix webhook: no platform event mapping found');
    return;
  }

  // Upsert the EventBooking record
  await (prisma as unknown as Record<string, any>).eventBooking?.upsert?.({
    where: { pretixOrderCode: orderCode },
    create: {
      eventId: mapping.eventId,
      pretixOrderCode: orderCode,
      status: order.status === 'paid' ? 'CONFIRMED' : 'PENDING',
      email: order.email,
      total: parseFloat(order.total),
      currency: order.currency,
    },
    update: {
      status: order.status === 'paid' ? 'CONFIRMED' : 'PENDING',
    },
  });

  logger.info({ orderCode, eventSlug }, 'pretix webhook: order synced');
}

async function handleOrderCancelled(
  prisma: PrismaClient,
  _organiser: string,
  _eventSlug: string,
  orderCode: string,
): Promise<void> {
  await (prisma as unknown as Record<string, any>).eventBooking?.updateMany?.({
    where: { pretixOrderCode: orderCode },
    data: { status: 'CANCELLED' },
  });
  logger.info({ orderCode }, 'pretix webhook: order cancelled');
}

async function handleOrderRefunded(
  prisma: PrismaClient,
  _organiser: string,
  _eventSlug: string,
  orderCode: string,
): Promise<void> {
  await (prisma as unknown as Record<string, any>).eventBooking?.updateMany?.({
    where: { pretixOrderCode: orderCode },
    data: { status: 'REFUNDED' },
  });
  logger.info({ orderCode }, 'pretix webhook: order refunded');
}

async function handleCheckIn(
  prisma: PrismaClient,
  _organiser: string,
  _eventSlug: string,
  orderCode: string,
): Promise<void> {
  await (prisma as unknown as Record<string, any>).eventBooking?.updateMany?.({
    where: { pretixOrderCode: orderCode },
    data: { checkedIn: true },
  });
  logger.info({ orderCode }, 'pretix webhook: check-in recorded');
}
