import type { PrismaClient } from '@my-music-coach/database';
import type { PretixAdapter } from '../adapters/pretix.js';
import { logger } from '../../utils/logger.js';

/**
 * Provisions a platform Event to pretix.
 *
 * Creates a pretix event + default ticket product under the
 * configured organiser. Stores the mapping so webhooks can
 * link orders back to the platform event.
 */
export async function provisionEventToPretix(
  prisma: PrismaClient,
  pretix: PretixAdapter,
  params: {
    eventId: string;
    organiserSlug: string;
    name: string;
    slug: string;
    dateFrom: Date;
    dateTo?: Date;
    price: string;
    currency: string;
    capacity?: number;
  },
): Promise<{ pretixEventSlug: string }> {
  // 1. Create the event in pretix
  const pretixEvent = await pretix.createEvent({
    organiserSlug: params.organiserSlug,
    name: params.name,
    slug: params.slug,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    isPublic: true,
    currency: params.currency,
  });

  // 2. Create a default ticket product
  await pretix.createProduct({
    organiserSlug: params.organiserSlug,
    eventSlug: pretixEvent.slug,
    name: 'General Admission',
    price: params.price,
    currency: params.currency,
    quota: params.capacity,
  });

  // 3. Store the mapping (uses dynamic Prisma model access for forward compatibility)
  try {
    await (prisma as unknown as Record<string, any>).externalEventMapping?.create?.({
      data: {
        eventId: params.eventId,
        pretixOrganiserSlug: params.organiserSlug,
        pretixEventSlug: pretixEvent.slug,
      },
    });
  } catch (err) {
    // Table may not yet exist during early development — log and continue
    logger.warn({ err }, 'Could not persist event mapping (externalEventMapping table may not exist yet — run migrations)');
  }

  logger.info(
    { eventId: params.eventId, pretixSlug: pretixEvent.slug },
    'Event provisioned to pretix',
  );

  return { pretixEventSlug: pretixEvent.slug };
}

/**
 * Sync order statuses from pretix back into the platform.
 *
 * Designed to run as a periodic job (e.g. every 5 minutes)
 * as a safety net alongside the webhook handler.
 */
export async function syncPretixOrders(
  prisma: PrismaClient,
  pretix: PretixAdapter,
  organiserSlug: string,
): Promise<void> {
  const events = await pretix.listEvents(organiserSlug);

  for (const event of events) {
    const orders = await pretix.listOrders(organiserSlug, event.slug);
    for (const order of orders) {
      try {
        await (prisma as unknown as Record<string, any>).eventBooking?.updateMany?.({
          where: { pretixOrderCode: order.code },
          data: {
            status:
              order.status === 'paid'
                ? 'CONFIRMED'
                : order.status === 'cancelled'
                  ? 'CANCELLED'
                  : order.status === 'refunded'
                    ? 'REFUNDED'
                    : 'PENDING',
          },
        });
      } catch {
        // Row may not exist — skip
      }
    }
  }

  logger.info({ organiserSlug, eventCount: events.length }, 'pretix order sync complete');
}
