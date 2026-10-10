import { GraphQLError } from 'graphql';
import {
  ingestLibraryTopic,
  acquireLibraryIngestLock,
  releaseLibraryIngestLock,
} from '@my-music-coach/bnf-gallica';
import { requireRole } from '../middleware/auth.js';
import { ingestOpenScoreCorpus } from '../lib/openscore.js';
import { ARCHIVE_DOWNLOAD_PREFIX } from '../lib/openSources.js';
import { LIBRARY_IMPORT_SOURCES, getLibraryImportStatus, startLibraryImport } from '../lib/libraryImports.js';
import { SHORT_ID_PATTERN, libraryShareUrl } from '../lib/libraryLinks.js';
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
const OPENSCORE_CORPORA = ['LIEDER', 'STRING_QUARTETS'] as const;
let openScoreIngestRunning = false;

export const libraryResolvers = {
  LibraryItem: {
    shareUrl: (item: { shortId: string }) => libraryShareUrl(item.shortId),
    // Same-origin route (apps/web proxies /api/library/* to apps/api's
    // /library/*), so the browser never fetches the upstream file itself.
    scoreUrl: (item: { id: string; musicXmlSourceUrl?: string | null }) =>
      item.musicXmlSourceUrl ? `/api/library/items/${item.id}/score.mxl` : null,
    // Gallica page scans / tracks (served by index.ts's /library/items/:id/*
    // routes) - only once the operator has enabled BnF library media.
    // Gallica's own embeddable player (the "share > embed" iframe BnF offers on
    // every document): content stays on gallica.bnf.fr in BnF's player with
    // its credit, loaded by the visitor's browser - so no rehosting, no
    // licence flag, and no load on our IP's Gallica rate limit.
    embedUrl: (item: { source: string; ark: string }) =>
      item.source === 'BNF' && /^[a-z0-9]+$/i.test(item.ark) ? `https://gallica.bnf.fr/ark:/12148/${item.ark}/f1.media.mini` : null,
    // PDFs go through our cached same-origin route; archive.org audio is
    // streamed straight from the Internet Archive (public domain, built for
    // direct range-request streaming - no reason to relay MBs through us).
    // Once the item has a local copy (lib/libraryMirror.ts) every file is
    // served from our own store.
    files: (item: { id: string; shortId: string; files?: unknown; mirroredAt?: Date | null }) =>
      (Array.isArray(item.files) ? item.files : []).map((file: any, index: number) => {
        const contentType = String(file?.contentType ?? 'application/pdf');
        const audio = contentType.startsWith('audio/');
        const direct = audio && String(file?.sourceUrl ?? '').startsWith(ARCHIVE_DOWNLOAD_PREFIX);
        const url = audio && item.mirroredAt
          ? `/api/library/items/${item.id}/files/${index}.audio`
          : direct ? file.sourceUrl : `/api/library/items/${item.id}/files/${index}.pdf`;
        return {
          label: String(file?.label ?? `File ${index + 1}`),
          url,
          contentType,
          durationSeconds: Number.isFinite(file?.durationSeconds) ? file.durationSeconds : null,
          shareUrl: libraryShareUrl(item.shortId, index + 1),
        };
      }),
    // Only from our local copy: our server never fetches Gallica for a
    // visitor (Gallica blocks IPs that send unattended bursts). Until the
    // copy exists the viewer loads Gallica in the visitor's browser.
    pagesUrl: (item: { id: string; source: string; mirroredAt?: Date | null }) =>
      item.source === 'BNF' && item.mirroredAt ? `/api/library/items/${item.id}/pages.json` : null,
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

    // Resolves a permanent /l/<shortId> link. A hidden item still resolves
    // (available: false) so the link shows "no longer available", not a 404.
    async libraryPermalink(_: unknown, { shortId }: { shortId: string }, { prisma }: GraphQLContext) {
      if (!SHORT_ID_PATTERN.test(shortId)) return null;
      const item = await prisma.libraryItem.findUnique({
        where: { shortId },
        select: { id: true, shortId: true, title: true, hiddenAt: true },
      });
      if (!item) return null;
      return { shortId: item.shortId, itemId: item.id, title: item.title, available: !item.hiddenAt };
    },

    async libraryImportStatuses(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      return Promise.all(LIBRARY_IMPORT_SOURCES.map((source) => getLibraryImportStatus(prisma, source)));
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
      const header = 'id,source,ark,category,title,creator,date,documentType,isPublicDomainWork,permalink,hiddenAt,shareUrl';
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
          libraryShareUrl(item.shortId),
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
        const result = await ingestLibraryTopic(prisma, query.trim(), documentType ?? undefined);
        // Thumbnails for the pulled items, in the background.
        void startLibraryImport(prisma, 'THUMBNAILS').catch(() => undefined);
        return result;
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Library ingest failed.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      } finally {
        await releaseLibraryIngestLock(prisma);
      }
    },

    async startLibraryImport(_: unknown, { source }: { source: string }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const key = LIBRARY_IMPORT_SOURCES.find((candidate) => candidate === source);
      if (!key) throw new GraphQLError('Unknown library source.', { extensions: { code: 'BAD_USER_INPUT' } });
      const status = await startLibraryImport(prisma, key);
      if (!status) {
        throw new GraphQLError('This import is already running - its progress is shown below.', { extensions: { code: 'CONFLICT' } });
      }
      return status;
    },

    async runOpenScoreIngest(_: unknown, { corpus = 'LIEDER' }: { corpus?: string | null }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const corpusKey = OPENSCORE_CORPORA.find((key) => key === (corpus ?? 'LIEDER'));
      if (!corpusKey) throw new GraphQLError('Unknown OpenScore corpus.', { extensions: { code: 'BAD_USER_INPUT' } });
      if (openScoreIngestRunning) {
        throw new GraphQLError('An OpenScore import is already running - try again shortly.', {
          extensions: { code: 'CONFLICT' },
        });
      }
      openScoreIngestRunning = true;
      try {
        return await ingestOpenScoreCorpus(prisma, corpusKey);
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
