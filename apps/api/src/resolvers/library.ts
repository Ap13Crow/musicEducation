import { GraphQLError } from 'graphql';
import {
  ingestLibraryTopic,
  acquireLibraryIngestLock,
  releaseLibraryIngestLock,
} from '@my-music-coach/bnf-gallica';
import { requireRole } from '../middleware/auth.js';
import { ingestOpenScoreLieder } from '../lib/openscore.js';
import type { GraphQLContext } from '../types.js';

// Library - public, no-login browsing of the persisted LibraryItem catalogue
// (apps/worker/src/jobs/bnf-library-ingest.ts fills it on a schedule). See
// docs/integration-architecture.md and resolvers/bnf.ts for the
// teacher/admin-only course-integration and licensing side of this feature.

const CATEGORIES = ['SHEET_MUSIC', 'AUDIO_RECORDING', 'BOOK', 'OTHER'] as const;

function csvField(value: string | null | undefined): string {
  const text = value ?? '';
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// One OpenScore import at a time per API process - it's an admin button,
// and a double click shouldn't run two 1,400-row upsert passes side by side.
let openScoreIngestRunning = false;

export const libraryResolvers = {
  LibraryItem: {
    // Same-origin route (apps/web proxies /api/library/* to apps/api's
    // /library/*), so the browser never fetches the upstream file itself.
    scoreUrl: (item: { id: string; musicXmlSourceUrl?: string | null }) =>
      item.musicXmlSourceUrl ? `/api/library/items/${item.id}/score.mxl` : null,
  },

  Query: {
    async libraryItems(_: unknown, { filter, page = 1, limit = 20 }: any, { prisma }: GraphQLContext) {
      const where: any = { hiddenAt: null };
      if (filter?.category) where.category = filter.category;
      if (filter?.query) {
        where.OR = [
          { title: { contains: filter.query, mode: 'insensitive' } },
          { creator: { contains: filter.query, mode: 'insensitive' } },
        ];
      }

      const skip = (page - 1) * limit;
      const [nodes, totalCount] = await Promise.all([
        prisma.libraryItem.findMany({ where, skip, take: limit, orderBy: { ingestedAt: 'desc' } }),
        prisma.libraryItem.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },

    async libraryItem(_: unknown, { id }: any, { prisma }: GraphQLContext) {
      const item = await prisma.libraryItem.findUnique({ where: { id } });
      if (!item || item.hiddenAt) return null;
      return item;
    },

    async libraryStats(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const [totalItems, byCategoryRaw, latest] = await Promise.all([
        prisma.libraryItem.count(),
        Promise.all(CATEGORIES.map(async (category) => ({ category, count: await prisma.libraryItem.count({ where: { category } }) }))),
        prisma.libraryItem.findFirst({ orderBy: { ingestedAt: 'desc' }, select: { ingestedAt: true } }),
      ]);
      return { totalItems, byCategory: byCategoryRaw, lastIngestedAt: latest?.ingestedAt ?? null };
    },

    async exportLibraryItemsCsv(_: unknown, { filter }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const where: any = {};
      if (filter?.category) where.category = filter.category;
      if (filter?.query) {
        where.OR = [
          { title: { contains: filter.query, mode: 'insensitive' } },
          { creator: { contains: filter.query, mode: 'insensitive' } },
        ];
      }
      const items = await prisma.libraryItem.findMany({ where, orderBy: { ingestedAt: 'desc' } });
      const header = 'id,source,ark,category,title,creator,date,documentType,isPublicDomainWork,permalink,hiddenAt';
      const rows = items.map((item: any) =>
        [
          item.id,
          item.source,
          item.ark,
          item.category,
          csvField(item.title),
          csvField(item.creator),
          csvField(item.date),
          csvField(item.documentType),
          String(item.isPublicDomainWork),
          item.permalink,
          item.hiddenAt?.toISOString() ?? '',
        ].join(','),
      );
      return [header, ...rows].join('\n');
    },
  },

  Mutation: {
    async runLibraryIngest(_: unknown, { query, documentType }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      if (!query?.trim()) throw new GraphQLError('query is required.', { extensions: { code: 'BAD_USER_INPUT' } });

      const acquired = await acquireLibraryIngestLock(prisma);
      if (!acquired) {
        throw new GraphQLError('A library ingest is already running - try again shortly.', {
          extensions: { code: 'CONFLICT' },
        });
      }
      try {
        return await ingestLibraryTopic(prisma, query.trim(), documentType ?? undefined);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Library ingest failed.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      } finally {
        await releaseLibraryIngestLock(prisma);
      }
    },

    async runOpenScoreIngest(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      if (openScoreIngestRunning) {
        throw new GraphQLError('An OpenScore import is already running - try again shortly.', {
          extensions: { code: 'CONFLICT' },
        });
      }
      openScoreIngestRunning = true;
      try {
        return await ingestOpenScoreLieder(prisma);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'OpenScore import failed.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      } finally {
        openScoreIngestRunning = false;
      }
    },
  },
};
