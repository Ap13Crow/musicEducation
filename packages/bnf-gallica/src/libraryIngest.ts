import type { PrismaClient, LibraryItemCategory } from '@my-music-coach/database';
import { searchCatalogue } from './sru.js';
import type { BnfCatalogueRecord } from './types.js';

export interface IngestLogger {
  info(fields: unknown, message?: string): void;
  warn(fields: unknown, message?: string): void;
}

export interface LibraryIngestResult {
  query: string;
  fetched: number;
  upserted: number;
  message: string;
}

// dc:type mixes a document-nature label with genre/subject classifications
// (see sru.ts's pickDocumentType) - confirmed live against Gallica's own SRU:
// single, unaccented word fragments reliably match ("partition", "sonore",
// "monographie"), but the full accented multi-word phrase ("document
// sonore", "monographie imprimée") used as a `dc.type all` filter combined
// with "and" returns zero results even when records with that exact value
// exist - a CQL/indexing quirk, not a documentType someone removed. Keep
// filters single-word for this reason; this mapping checks substrings so it
// still recognizes the full phrases that come back in dc:type values.

// Decided from ALL of a record's dc:type values, not the one display label
// pickDocumentType keeps - confirmed live, a manuscript score's list is
// ["Genre musical : sonate", "manuscript music", "musique manuscrite"] and
// some scores carry nothing but a genre ("Genre musical : rondo"). Order
// matters: a printed score also lists "text", so notated music wins first.
const SHEET_MUSIC_TYPE = /partition|\bscore\b|manuscript music|printed music|notated music|musique (manuscrite|imprim|not)/;
const AUDIO_TYPE = /sonore|\bsound\b/;
const BOOK_TYPE = /monographie|monograph|texte|\btext\b|\blivre\b|\bbook\b/;
// A genre classification with no other nature label is notated music in
// practice: Gallica recordings always also carry "document sonore".
const MUSIC_GENRE_TYPE = /^genre musical\s*:/;

export function categorizeDocumentTypes(types: ReadonlyArray<string | null | undefined>): LibraryItemCategory {
  const values = types.filter((t): t is string => Boolean(t)).map((t) => t.trim().toLowerCase());
  const has = (pattern: RegExp) => values.some((value) => pattern.test(value));
  if (has(SHEET_MUSIC_TYPE)) return 'SHEET_MUSIC';
  if (has(AUDIO_TYPE)) return 'AUDIO_RECORDING';
  if (has(BOOK_TYPE)) return 'BOOK';
  if (has(MUSIC_GENRE_TYPE)) return 'SHEET_MUSIC';
  return 'OTHER';
}

export function mapDocumentTypeToCategory(documentType: string | null | undefined): LibraryItemCategory {
  return categorizeDocumentTypes([documentType]);
}

async function upsertLibraryItem(prisma: PrismaClient, record: BnfCatalogueRecord, seedQuery: string) {
  const category = categorizeDocumentTypes(record.documentTypes?.length ? record.documentTypes : [record.documentType]);
  await prisma.libraryItem.upsert({
    where: { source_ark: { source: 'BNF', ark: record.ark } },
    create: {
      source: 'BNF',
      ark: record.ark,
      category,
      title: record.title,
      creator: record.creator ?? undefined,
      date: record.date ?? undefined,
      documentType: record.documentType ?? undefined,
      isPublicDomainWork: record.isPublicDomainWork,
      catalogueUrl: record.catalogueUrl ?? undefined,
      permalink: record.permalink,
      seedQuery,
    },
    update: {
      category,
      title: record.title,
      creator: record.creator ?? undefined,
      date: record.date ?? undefined,
      documentType: record.documentType ?? undefined,
      isPublicDomainWork: record.isPublicDomainWork,
      catalogueUrl: record.catalogueUrl ?? undefined,
      permalink: record.permalink,
      seedQuery,
    },
  });
}

// Cooperative advisory lock so the scheduled worker job (one process) and
// the admin's on-demand pull (a different process, apps/api) never run
// Gallica call sequences concurrently against each other - reuses the
// existing generic AdminSetting key-value store rather than a new table,
// matching this schema's established feature-toggle convention. Not a hard
// distributed lock (there's a small find-then-upsert race window) - fine for
// a low-frequency admin action; a stale lock (a crashed run) expires itself
// after LOCK_STALE_MS rather than wedging ingestion forever.
const LOCK_KEY = 'bnf_library_ingest_running';
const LOCK_STALE_MS = 30 * 60 * 1000;

export async function acquireLibraryIngestLock(prisma: PrismaClient): Promise<boolean> {
  const existing = await prisma.adminSetting.findUnique({ where: { key: LOCK_KEY } });
  if (existing && Date.now() - new Date(existing.value).getTime() < LOCK_STALE_MS) return false;
  await prisma.adminSetting.upsert({
    where: { key: LOCK_KEY },
    create: { key: LOCK_KEY, value: new Date().toISOString() },
    update: { value: new Date().toISOString() },
  });
  return true;
}

export async function releaseLibraryIngestLock(prisma: PrismaClient): Promise<void> {
  await prisma.adminSetting.deleteMany({ where: { key: LOCK_KEY } });
}

// Shared by the scheduled worker job (apps/worker/src/jobs/bnf-library-ingest.ts)
// and the admin on-demand pull (Mutation.runLibraryIngest) - exactly one
// Gallica SRU request per call, never a loop over pages, so callers control
// their own pacing (see packages/bnf-gallica/src/retry.ts for per-request
// 429 backoff, and the job's own inter-topic delay for pacing across calls).
export async function ingestLibraryTopic(
  prisma: PrismaClient,
  query: string,
  documentType: string | undefined,
  logger?: IngestLogger,
): Promise<LibraryIngestResult> {
  const records = await searchCatalogue(query, { documentType });
  let upserted = 0;
  for (const record of records) {
    try {
      await upsertLibraryItem(prisma, record, query);
      upserted += 1;
    } catch (error) {
      logger?.warn({ error, ark: record.ark }, 'Failed to upsert one library item; skipping it');
    }
  }
  return {
    query,
    fetched: records.length,
    upserted,
    message: `Library ingest for "${query}"${documentType ? ` (${documentType})` : ''} completed: ${upserted}/${records.length} upserted.`,
  };
}
