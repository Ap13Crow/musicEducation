import type { PrismaClient } from '@my-music-coach/database';
import { ingestOpenScoreCorpus } from './openscore.js';
import { fetchMusopenRecords, fetchMutopiaRecords, upsertOpenSourceRecords } from './openSources.js';
import { logger } from '../utils/logger.js';

// Admin-started imports of the openly licensed Library sources. They run in
// the background (Mutopia alone is ~1,300 paced RDF fetches - minutes, far
// past a GraphQL request's patience) and record progress in AdminSetting,
// the schema's existing key-value store, so the admin card can poll it and
// it survives a pod restart. A "running" row older than STALE_MS is treated
// as a crashed run and may be restarted.

export const LIBRARY_IMPORT_SOURCES = ['OPENSCORE_LIEDER', 'OPENSCORE_STRING_QUARTETS', 'MUSOPEN', 'MUTOPIA'] as const;
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
  return status.state === 'running' && !!status.startedAt && Date.now() - new Date(status.startedAt).getTime() < STALE_MS;
}

async function runImport(prisma: PrismaClient, source: LibraryImportSource, status: LibraryImportStatus) {
  const progress = async (done: number, total: number) => {
    // Every 40 pieces is plenty for a polling admin card.
    if (done === total || done % 40 === 0) await saveStatus(prisma, { ...status, done, total });
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
    .then(({ total, upserted, message }) =>
      saveStatus(prisma, { ...status, state: 'done', done: total, total, upserted, message, finishedAt: new Date().toISOString() }),
    )
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
