import type { PrismaClient } from '@my-music-coach/database';
import { ingestOpenScoreCorpus } from './openscore.js';
import { fetchMusopenRecords, fetchMutopiaRecords, upsertOpenSourceRecords } from './openSources.js';
import { backfillLibraryThumbnails } from './libraryThumbnails.js';
import { runLibraryMirror } from './libraryMirror.js';
import { libraryMediaStoreConfigured } from './libraryMediaStore.js';
import { logger } from '../utils/logger.js';

// Admin-started imports of the openly licensed Library sources. They run in
// the background (Mutopia alone is ~1,300 paced RDF fetches - minutes, far
// past a GraphQL request's patience) and record progress in AdminSetting,
// the schema's existing key-value store, so the admin card can poll it and
// it survives a pod restart. A "running" row older than STALE_MS is treated
// as a crashed run and may be restarted.

// THUMBNAILS isn't a source but runs the same way: it fills in card images
// for every item still missing one (lib/libraryThumbnails.ts). MIRROR
// downloads every item's files into the local media store
// (lib/libraryMirror.ts) - it runs for hours, paced per source.
export const LIBRARY_IMPORT_SOURCES = ['OPENSCORE_LIEDER', 'OPENSCORE_STRING_QUARTETS', 'MUSOPEN', 'MUTOPIA', 'THUMBNAILS', 'MIRROR'] as const;
export type LibraryImportSource = (typeof LIBRARY_IMPORT_SOURCES)[number];

export interface LibraryImportStatus {
  source: LibraryImportSource;
  state: 'idle' | 'running' | 'done' | 'failed';
  done: number;
  total: number;
  upserted: number;
  message: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  // Bumped on every progress save - a long run (MIRROR) stays "running" as
  // long as it keeps reporting, however long ago it started.
  heartbeatAt?: string | null;
}

const STALE_MS = 30 * 60 * 1000;
const key = (source: LibraryImportSource) => `library_import:${source}`;

function idle(source: LibraryImportSource): LibraryImportStatus {
  return { source, state: 'idle', done: 0, total: 0, upserted: 0, message: null, startedAt: null, finishedAt: null };
}

export async function getLibraryImportStatus(prisma: PrismaClient, source: LibraryImportSource): Promise<LibraryImportStatus> {
  const row = await prisma.adminSetting.findUnique({ where: { key: key(source) } });
  if (!row) return idle(source);
  try {
    return { ...idle(source), ...JSON.parse(row.value), source };
  } catch {
    return idle(source);
  }
}

async function saveStatus(prisma: PrismaClient, status: LibraryImportStatus) {
  const value = JSON.stringify(status);
  await prisma.adminSetting.upsert({ where: { key: key(status.source) }, create: { key: key(status.source), value }, update: { value } });
}

function isRunning(status: LibraryImportStatus): boolean {
  const lastSign = status.heartbeatAt ?? status.startedAt;
  return status.state === 'running' && !!lastSign && Date.now() - new Date(lastSign).getTime() < STALE_MS;
}

async function runImport(prisma: PrismaClient, source: LibraryImportSource, status: LibraryImportStatus) {
  const progress = async (done: number, total: number) => {
    // Every 40 pieces is plenty for a polling admin card; MIRROR items are
    // slow (a Gallica book is minutes), so it reports every item.
    if (done === total || done % 40 === 0 || source === 'MIRROR') {
      await saveStatus(prisma, { ...status, done, total, heartbeatAt: new Date().toISOString() });
    }
  };
  switch (source) {
    case 'OPENSCORE_LIEDER':
    case 'OPENSCORE_STRING_QUARTETS': {
      const result = await ingestOpenScoreCorpus(prisma, source === 'OPENSCORE_LIEDER' ? 'LIEDER' : 'STRING_QUARTETS');
      return { total: result.fetched, upserted: result.upserted, message: result.message };
    }
    case 'MUSOPEN': {
      const records = await fetchMusopenRecords();
      const upserted = await upsertOpenSourceRecords(prisma, 'MUSOPEN', records);
      const tracks = records.reduce((sum, record) => sum + record.files.length, 0);
      return { total: records.length, upserted, message: `Musopen import completed: ${upserted}/${records.length} recordings (${tracks} tracks).` };
    }
    case 'THUMBNAILS': {
      const result = await backfillLibraryThumbnails(prisma, progress);
      return {
        total: result.total,
        upserted: result.created,
        message: `Thumbnails: ${result.created} created${result.failed ? `, ${result.failed} without an image` : ''}.`,
      };
    }
    case 'MIRROR': {
      const result = await runLibraryMirror(prisma, progress);
      const blocked = result.blocked.length ? ` Paused (source refused us): ${result.blocked.join(', ')}.` : '';
      return {
        total: result.total,
        upserted: result.mirrored,
        message: `Local copies: ${result.mirrored} items stored${result.failed ? `, ${result.failed} failed` : ''}.${blocked}`,
      };
    }
    case 'MUTOPIA': {
      const records = await fetchMutopiaRecords(progress);
      const upserted = await upsertOpenSourceRecords(prisma, 'MUTOPIA', records);
      return { total: records.length, upserted, message: `Mutopia import completed: ${upserted}/${records.length} scores upserted.` };
    }
  }
}

export async function startLibraryImport(prisma: PrismaClient, source: LibraryImportSource): Promise<LibraryImportStatus | null> {
  const current = await getLibraryImportStatus(prisma, source);
  if (isRunning(current)) return null;
  const status: LibraryImportStatus = { ...idle(source), state: 'running', startedAt: new Date().toISOString(), message: 'Import started.' };
  await saveStatus(prisma, status);

  void runImport(prisma, source, status)
    .then(async ({ total, upserted, message }) => {
      await saveStatus(prisma, { ...status, state: 'done', done: total, total, upserted, message, finishedAt: new Date().toISOString() });
      // New items need card images - Musopen has none to fetch - and a
      // local copy of their files.
      if (source !== 'THUMBNAILS' && source !== 'MUSOPEN' && source !== 'MIRROR') await startLibraryImport(prisma, 'THUMBNAILS');
      if (source !== 'MIRROR' && libraryMediaStoreConfigured()) await startLibraryImport(prisma, 'MIRROR');
    })
    .catch(async (error) => {
      logger.error({ error, source }, 'Library import failed');
      await saveStatus(prisma, {
        ...status,
        state: 'failed',
        message: error instanceof Error ? error.message : 'Import failed.',
        finishedAt: new Date().toISOString(),
      }).catch(() => undefined);
    });
  return status;
}
