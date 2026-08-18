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
  },
};
