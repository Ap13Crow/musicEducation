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
      const where: any = {};
      if (filter?.city) where.city = { contains: filter.city, mode: 'insensitive' };
      if (filter?.country) where.country = filter.country;
      if (filter?.classification) where.classifications = { has: filter.classification };

      where.startsAt = {};
      if (filter?.minDate) where.startsAt.gte = new Date(filter.minDate);
      else where.startsAt.gte = new Date(); // never surface events already in the past
      if (filter?.maxDate) where.startsAt.lte = new Date(filter.maxDate);

      // Don't resurface a cached row past the provider's own cache guidance.
      where.OR = [{ expiresAt: null }, { expiresAt: { gte: new Date() } }];

      const effectivePage = Math.max(1, page);
      const effectiveLimit = Math.min(Math.max(1, limit), 100);
      const skip = (effectivePage - 1) * effectiveLimit;
      const [nodes, totalCount] = await Promise.all([
        prisma.externalEventProjection.findMany({
          where,
          skip,
          take: effectiveLimit,
          orderBy: { startsAt: 'asc' },
        }),
        prisma.externalEventProjection.count({ where }),
      ]);
      return {
        nodes,
        pageInfo: {
          hasNextPage: skip + nodes.length < totalCount,
          hasPreviousPage: effectivePage > 1,
          totalCount,
        },
      };
    },
  },
};
