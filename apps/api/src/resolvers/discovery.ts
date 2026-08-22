import { GraphQLError } from 'graphql';
import { requireAuth } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

/**
 * Read-only surface over ExternalEventProjection (see packages/database
 * schema.prisma). The worker's ticketmaster-ingest job populates this table;
 * the API only ever reads it — external rows never enter the authored Event
 * flow (createEvent/publishEvent), and this resolver never calls a provider
 * directly.
 */
export const discoveryResolvers = {
  Query: {
    async externalEvents(_: unknown, { filter, page = 1, limit = 20 }: any, { prisma }: GraphQLContext) {
      const safeLimit = Math.max(1, Math.min(limit, 100));
      const safePage = Math.max(1, page);
      const where: any = {
        // Don't resurface a cached row past the provider's own cache guidance.
        // Two independent OR clauses (this one and search, below) must
        // compose with AND, not overwrite each other under the same `where.OR`
        // key - each gets its own AND-list entry instead.
        AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] }],
      };
      if (filter?.city) where.city = { contains: filter.city, mode: 'insensitive' };
      if (filter?.country) where.country = filter.country;
      if (filter?.classification) where.classifications = { has: filter.classification };
      if (filter?.instrument) where.instruments = { has: filter.instrument };
      if (filter?.musicStyle) where.musicStyles = { has: filter.musicStyle };
      if (filter?.skillLevel) where.skillLevels = { has: filter.skillLevel };
      if (filter?.search) {
        where.AND.push({
          OR: [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
          ],
        });
      }

      where.startsAt = {};
      if (filter?.minDate) where.startsAt.gte = new Date(filter.minDate);
      else where.startsAt.gte = new Date(); // never surface events already in the past
      if (filter?.maxDate) where.startsAt.lte = new Date(filter.maxDate);

      const skip = (safePage - 1) * safeLimit;
      const [nodes, totalCount] = await Promise.all([
        prisma.externalEventProjection.findMany({
          where,
          skip,
          take: safeLimit,
          orderBy: { startsAt: 'asc' },
        }),
        prisma.externalEventProjection.count({ where }),
      ]);
      return {
        nodes,
        pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: safePage > 1, totalCount },
      };
    },

    async recommendedExternalEvents(_: unknown, { limit = 6 }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
      const instruments = profile?.instruments ?? [];
      const musicStyles = profile?.musicStyles ?? [];
      // No stated preferences yet - nothing to recommend against, and an
      // unfiltered "recommendation" would just be the full catalog again.
      if (instruments.length === 0 && musicStyles.length === 0) return [];

      const safeLimit = Math.max(1, Math.min(limit, 20));
      return prisma.externalEventProjection.findMany({
        where: {
          startsAt: { gte: new Date() },
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          AND: [
            {
              OR: [
                ...(instruments.length > 0 ? [{ instruments: { hasSome: instruments } }] : []),
                ...(musicStyles.length > 0 ? [{ musicStyles: { hasSome: musicStyles } }] : []),
              ],
            },
          ],
        },
        take: safeLimit,
        orderBy: { startsAt: 'asc' },
      });
    },

    async myRecentlyViewedExternalEvents(_: unknown, { limit = 10 }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const safeLimit = Math.max(1, Math.min(limit, 50));
      return prisma.externalEventEngagement.findMany({
        where: { userId: user.id },
        orderBy: { lastViewedAt: 'desc' },
        take: safeLimit,
      });
    },
  },

  Mutation: {
    // Called when a student actually clicks through to an external event
    // (e.g. "View tickets on Classictic") - upserts the engagement row so
    // it shows up in "recently visited," bumping lastViewedAt on a repeat
    // view rather than creating a duplicate row.
    async recordExternalEventView(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const projection = await prisma.externalEventProjection.findUnique({ where: { id } });
      if (!projection) throw new GraphQLError('Event not found.', { extensions: { code: 'NOT_FOUND' } });
      return prisma.externalEventEngagement.upsert({
        where: { userId_externalEventProjectionId: { userId: user.id, externalEventProjectionId: id } },
        create: { userId: user.id, externalEventProjectionId: id },
        update: { lastViewedAt: new Date() },
      });
    },

    // Self-reported attendance, only allowed once the event has actually
    // started - there's no scanned-ticket signal available for an external
    // provider's event, this is the same trust level as any other
    // self-attested confirmation. Gates leaving a review (see reviews.ts).
    async confirmExternalEventAttendance(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const projection = await prisma.externalEventProjection.findUnique({ where: { id } });
      if (!projection) throw new GraphQLError('Event not found.', { extensions: { code: 'NOT_FOUND' } });
      if (projection.startsAt > new Date()) {
        throw new GraphQLError('You can confirm attendance once the event has started.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      return prisma.externalEventEngagement.upsert({
        where: { userId_externalEventProjectionId: { userId: user.id, externalEventProjectionId: id } },
        create: { userId: user.id, externalEventProjectionId: id, attendanceConfirmedAt: new Date() },
        update: { attendanceConfirmedAt: new Date() },
      });
    },
  },

  ExternalEventEngagement: {
    async externalEventProjection(engagement: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.externalEventProjection.findUnique({ where: { id: engagement.externalEventProjectionId } });
    },
  },
};
