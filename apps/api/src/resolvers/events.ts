import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { awardXpOnce } from './xp.js';
import { eventBookingConfirmedEmailContent, eventBookingCancelledEmailContent } from '../lib/emails.js';
import { enqueueMail, recipientAddresses } from '../lib/mailOutbox.js';
import { displayNameOf } from '../lib/displayName.js';
import type { GraphQLContext } from '../types.js';
import type { Prisma } from '@my-music-coach/database';

const EVENT_ATTENDED_XP = 40;

function eventLocation(event: {
  format: string;
  venueName?: string | null;
  venueAddress?: string | null;
  city?: string | null;
  onlineMeetingUrl?: string | null;
}): string {
  if (event.format === 'ONLINE') return event.onlineMeetingUrl || 'Online';
  return [event.venueName, event.venueAddress, event.city].filter(Boolean).join(', ') || 'See MyMusic.Coach for venue details';
}

async function eventBookingNotificationData(tx: Prisma.TransactionClient, eventBookingId: string) {
  const booking = await tx.eventBooking.findUnique({
    where: { id: eventBookingId },
    include: {
      user: { include: { profile: true } },
      event: { include: { publisher: { include: { profile: true } } } },
    },
  });
  if (!booking) return null;

  const attendeeName = booking.user
    ? displayNameOf(booking.user)
    : booking.email?.split('@')[0] || 'attendee';
  return {
    booking,
    attendeeName,
    organizerName: displayNameOf(booking.event.publisher),
    location: eventLocation(booking.event),
    attendeeRecipients: booking.user
      ? recipientAddresses(booking.user.email, booking.user.profile?.notificationEmail)
      : recipientAddresses(booking.email, null),
    organizerRecipients: recipientAddresses(
      booking.event.publisher.email,
      booking.event.publisher.profile?.notificationEmail,
    ),
  };
}

export async function notifyEventBookingConfirmed(tx: Prisma.TransactionClient, eventBookingId: string) {
  const notification = await eventBookingNotificationData(tx, eventBookingId);
  if (!notification) return;
  const { booking, attendeeName, organizerName, location, attendeeRecipients, organizerRecipients } = notification;
  const content = eventBookingConfirmedEmailContent({
    attendeeName,
    organizerName,
    eventTitle: booking.event.title,
    startsAt: booking.event.startsAt,
    location,
  });
  await enqueueMail(tx, {
    kind: 'EVENT_CONFIRMATION',
    eventBookingId,
    recipients: attendeeRecipients,
    ...content.attendee,
  });
  await enqueueMail(tx, {
    kind: 'EVENT_CONFIRMATION',
    eventBookingId,
    recipients: organizerRecipients,
    ...content.organizer,
  });
}

export async function notifyEventBookingCancelled(tx: Prisma.TransactionClient, eventBookingId: string) {
  const notification = await eventBookingNotificationData(tx, eventBookingId);
  if (!notification) return;
  const { booking, attendeeName, organizerName, location, attendeeRecipients, organizerRecipients } = notification;
  const content = eventBookingCancelledEmailContent({
    attendeeName,
    organizerName,
    eventTitle: booking.event.title,
    startsAt: booking.event.startsAt,
    location,
  });
  await enqueueMail(tx, {
    kind: 'EVENT_CANCELLED',
    eventBookingId,
    recipients: attendeeRecipients,
    ...content.attendee,
  });
  await enqueueMail(tx, {
    kind: 'EVENT_CANCELLED',
    eventBookingId,
    recipients: organizerRecipients,
    ...content.organizer,
  });
}

export const eventResolvers = {
  Query: {
    async events(_: unknown, { filter, page = 1, limit = 20 }: any, { prisma }: GraphQLContext) {
      const where: any = { isPublished: true };

      if (filter) {
        if (filter.type) where.type = filter.type;
        if (filter.format) where.format = filter.format;
        if (filter.city) where.city = { contains: filter.city, mode: 'insensitive' };
        if (filter.country) where.country = filter.country;
        if (filter.instrument) where.instruments = { has: filter.instrument };
        if (filter.musicStyle) where.musicStyles = { has: filter.musicStyle };
        if (filter.skillLevel) where.skillLevels = { has: filter.skillLevel };
        if (filter.minDate || filter.maxDate) {
          where.startsAt = {};
          if (filter.minDate) where.startsAt.gte = new Date(filter.minDate);
          if (filter.maxDate) where.startsAt.lte = new Date(filter.maxDate);
        }
        if (filter.maxPrice !== undefined) where.price = { lte: filter.maxPrice };
        if (filter.search) {
          where.OR = [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
          ];
        }
      }

      const skip = (page - 1) * limit;
      const [nodes, totalCount] = await Promise.all([
        prisma.event.findMany({ where, skip, take: limit, orderBy: { startsAt: 'asc' } }),
        prisma.event.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },

    async event(_: unknown, { id, slug }: any, { prisma }: GraphQLContext) {
      const where = id ? { id } : { slug };
      const event = await prisma.event.findUnique({ where });
      if (!event) throw new GraphQLError('Event not found.', { extensions: { code: 'NOT_FOUND' } });
      return event;
    },

    async nearbyEvents(_: unknown, { latitude, longitude, radiusKm, page = 1, limit = 20 }: any, { prisma }: GraphQLContext) {
      // PostgreSQL haversine approximation using raw query
      const skip = (page - 1) * limit;
      const nodes = await prisma.$queryRaw<any[]>`
        SELECT
          "id", "title", "slug", "description", "type", "format",
          "instruments", "musicStyles", "skillLevels",
          "thumbnailUrl", "videoStreamUrl",
          "startsAt", "endsAt", "timezone",
          "venueName", "venueAddress", "city", "country",
          "latitude", "longitude", "onlineMeetingUrl",
          "price", "currency",
          "maxCapacity", "currentCapacity",
          "isPublished", "publisherId", "createdAt", "updatedAt"
        FROM "Event"
        WHERE "isPublished" = true
          AND "latitude" IS NOT NULL
          AND (
            6371 * acos(
              cos(radians(${latitude})) *
              cos(radians("latitude")) *
              cos(radians("longitude") - radians(${longitude})) +
              sin(radians(${latitude})) *
              sin(radians("latitude"))
            )
          ) <= ${radiusKm}
        ORDER BY "startsAt" ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
      return { nodes, pageInfo: { hasNextPage: nodes.length === limit, hasPreviousPage: page > 1, totalCount: nodes.length } };
    },

    async myEvents(_: unknown, { page = 1, limit = 20 }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const skip = (page - 1) * limit;
      const where = user!.role === 'ADMIN' ? {} : { publisherId: user!.id };
      const [nodes, totalCount] = await Promise.all([
        prisma.event.findMany({ where, skip, take: limit, orderBy: { startsAt: 'desc' } }),
        prisma.event.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },

    async myEventBookings(_: unknown, { page = 1, limit = 20 }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const skip = (page - 1) * limit;
      return prisma.eventBooking.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        orderBy: { bookedAt: 'desc' },
        include: { event: true },
      });
    },
  },

  Mutation: {
    async createEvent(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const slug = input.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      return prisma.event.create({
        data: { ...input, publisherId: user!.id, slug },
      });
    },

    async updateEvent(_: unknown, { id, input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) throw new GraphQLError('Event not found.', { extensions: { code: 'NOT_FOUND' } });
      if (event.publisherId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      return prisma.event.update({ where: { id }, data: input });
    },

    async publishEvent(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) throw new GraphQLError('Event not found.', { extensions: { code: 'NOT_FOUND' } });
      if (event.publisherId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      return prisma.event.update({ where: { id }, data: { isPublished: true } });
    },

    async bookEvent(_: unknown, { eventId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) throw new GraphQLError('Event not found.', { extensions: { code: 'NOT_FOUND' } });
      if (!event.isPublished) throw new GraphQLError('Event not available.', { extensions: { code: 'BAD_USER_INPUT' } });
      if (event.maxCapacity !== null && event.currentCapacity >= event.maxCapacity) {
        throw new GraphQLError('Event is fully booked.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (Number(event.price) > 0) throw new GraphQLError('Please complete payment first.', { extensions: { code: 'PAYMENT_REQUIRED' } });

      const booking = await prisma.$transaction(async (tx) => {
        const created = await tx.eventBooking.create({
          data: { userId: user.id, eventId, status: 'CONFIRMED' },
        });
        await tx.event.update({ where: { id: eventId }, data: { currentCapacity: { increment: 1 } } });
        await notifyEventBookingConfirmed(tx, created.id);
        return created;
      });
      // Once per event (refId=eventId), not per-user-globally - a paid event's
      // equivalent award fires from the Stripe webhook in payments.ts instead.
      await awardXpOnce(prisma, user.id, 'EVENT_ATTENDED', eventId, EVENT_ATTENDED_XP);
      return booking;
    },

    async cancelEventBooking(_: unknown, { bookingId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const booking = await prisma.eventBooking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new GraphQLError('Booking not found.', { extensions: { code: 'NOT_FOUND' } });
      if (booking.userId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      if (booking.status === 'CANCELLED') return booking;
      return prisma.$transaction(async (tx) => {
        await tx.event.update({ where: { id: booking.eventId }, data: { currentCapacity: { decrement: 1 } } });
        const cancelled = await tx.eventBooking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
        await notifyEventBookingCancelled(tx, bookingId);
        return cancelled;
      });
    },
  },

  Event: {
    async publisher(event: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.user.findUnique({ where: { id: event.publisherId } });
    },
    async reviews(event: any, { page = 1, limit = 10 }: any, { prisma }: GraphQLContext) {
      const skip = (page - 1) * limit;
      const where = { eventId: event.id, isPublic: true };
      const [nodes, totalCount] = await Promise.all([
        prisma.review.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.review.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },
  },

  EventBooking: {
    async event(booking: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.event.findUnique({ where: { id: booking.eventId } });
    },
    async user(booking: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.user.findUnique({ where: { id: booking.userId } });
    },
  },
};
