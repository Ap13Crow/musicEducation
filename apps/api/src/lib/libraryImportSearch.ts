import type { PrismaClient } from '@my-music-coach/database';
import {
  GALLICA_MAX_PAGE_SIZE,
  bnfAttribution,
  categorizeDocumentTypes,
  searchCataloguePage,
  type BnfCatalogueRecord,
} from '@my-music-coach/bnf-gallica';
import { DNB_MAX_PAGE_SIZE, fetchDnbRecords, isDnbIdn, searchDnb, type DnbRecord } from './dnb.js';
import { possiblySameWork, titleKey } from './libraryMatch.js';
import { bnfPausedUntil, pauseBnf } from './libraryMirror.js';

// The admin's federated import: one query runs against Gallica and the DNB
// side by side, page by page, and the admin ticks what to bring into the
// Library. Our server talks to the sources only here (search, import) and in
// the media mirror - never for a visitor.
//
// Double imports are impossible: (source, ark) is unique, rows already in the
// Library come back flagged and are skipped on import, and a record that
// looks like a work we already hold from another source is marked as a
// possible duplicate for the admin to decide.

export type ImportSource = 'BNF' | 'DNB';
export const IMPORT_SOURCES: ImportSource[] = ['BNF', 'DNB'];
export type SearchMode = 'ALL' | 'ANY' | 'PHRASE';
export type Category = 'SHEET_MUSIC' | 'AUDIO_RECORDING' | 'BOOK' | 'OTHER';

export interface ImportSearchInput {
  query: string;
  sources?: ImportSource[] | null;
  mode?: SearchMode | null;
  category?: Category | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  page?: number | null;
  pageSize?: number | null;
}

export interface ImportCandidate {
  source: ImportSource;
  externalId: string;
  title: string;
  creator: string | null;
  date: string | null;
  category: Category;
  documentType: string | null;
  // What the Library will hold: "PDF", "Page scans", "Audio".
  format: string;
  summary: string | null;
  permalink: string;
  publicDomain: boolean;
  // Kept for the import step (never sent to the browser).
  raw: { kind: 'BNF'; record: BnfCatalogueRecord } | { kind: 'DNB'; record: DnbRecord };
}

export interface ItemRef {
  id: string;
  shortId: string;
  title: string;
  source: string;
}

export interface SourceResults {
  source: ImportSource;
  total: number;
  error: string | null;
  candidates: (ImportCandidate & { inLibrary: ItemRef | null; possibleDuplicates: ItemRef[] })[];
}

export const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = Math.min(GALLICA_MAX_PAGE_SIZE, DNB_MAX_PAGE_SIZE);

// Gallica dc.type words per category (single words only - see
// packages/bnf-gallica/src/libraryIngest.ts).
const GALLICA_TYPE: Partial<Record<Category, string>> = { SHEET_MUSIC: 'partition', AUDIO_RECORDING: 'sonore', BOOK: 'monographie' };

const FORMAT: Record<Category, string> = { SHEET_MUSIC: 'Page scans', AUDIO_RECORDING: 'Audio', BOOK: 'Page scans', OTHER: 'Page scans' };

export function fromBnf(record: BnfCatalogueRecord): ImportCandidate {
  const category = categorizeDocumentTypes(record.documentTypes?.length ? record.documentTypes : [record.documentType]) as Category;
  return {
    source: 'BNF',
    externalId: record.ark,
    title: record.title,
    creator: record.creator ?? null,
    date: record.date ?? null,
    category,
    documentType: record.documentType ?? null,
    format: FORMAT[category],
    summary: null,
    permalink: record.permalink,
    publicDomain: record.isPublicDomainWork,
    raw: { kind: 'BNF', record },
  };
}

export function fromDnb(record: DnbRecord): ImportCandidate {
  return {
    source: 'DNB',
    externalId: record.idn,
    title: record.title,
    creator: record.creator,
    date: record.date,
    category: record.category,
    documentType: record.documentType,
    format: 'PDF',
    summary: record.summary,
    permalink: record.permalink,
    publicDomain: false,
    raw: { kind: 'DNB', record },
  };
}

// Search results stay here for a few hours, so importing a ticked Gallica
// row never needs a second Gallica request (one API replica; after a
// restart the admin simply searches again). DNB rows are re-read from the
// DNB at import time anyway.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_MAX = 20_000;
const cache = new Map<string, { candidate: ImportCandidate; at: number }>();
const cacheKey = (source: string, externalId: string) => `${source}:${externalId}`;

function remember(candidate: ImportCandidate) {
  const key = cacheKey(candidate.source, candidate.externalId);
  cache.delete(key);
  cache.set(key, { candidate, at: Date.now() });
  while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string);
}

function recall(source: string, externalId: string): ImportCandidate | null {
  const hit = cache.get(cacheKey(source, externalId));
  return hit && Date.now() - hit.at < CACHE_TTL_MS ? hit.candidate : null;
}

export function __clearImportCache() {
  cache.clear();
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function searchSource(
  prisma: PrismaClient,
  source: ImportSource,
  input: ImportSearchInput,
  page: number,
  pageSize: number,
): Promise<{ total: number; error: string | null; candidates: ImportCandidate[] }> {
  const mode = input.mode ?? 'ALL';
  try {
    if (source === 'DNB') {
      // The DNB has no free recordings (its Musikarchiv is reading-room only).
      if (input.category === 'AUDIO_RECORDING' || input.category === 'OTHER') return { total: 0, error: null, candidates: [] };
      const result = await searchDnb(
        { query: input.query, mode, category: input.category, yearFrom: input.yearFrom, yearTo: input.yearTo },
        page,
        pageSize,
      );
      return { total: result.total, error: null, candidates: result.records.map(fromDnb) };
    }
    const pausedUntil = await bnfPausedUntil(prisma);
    if (pausedUntil > Date.now()) {
      return {
        total: 0,
        error: `Gallica is refusing our server right now - we're leaving it alone until ${new Date(pausedUntil).toISOString().slice(0, 16).replace('T', ' ')} UTC.`,
        candidates: [],
      };
    }
    const result = await searchCataloguePage(
      {
        query: input.query,
        mode,
        documentType: input.category ? GALLICA_TYPE[input.category] ?? null : null,
        yearFrom: input.yearFrom,
        yearTo: input.yearTo,
      },
      page,
      pageSize,
    );
    return { total: result.total, error: null, candidates: result.records.map(fromBnf) };
  } catch (error) {
    const message = errorMessage(error);
    // Gallica answers bursts with 403/429 - back off for every Gallica
    // caller (the mirror too), not just this search.
    if (source === 'BNF' && /HTTP (403|429)/.test(message)) {
      await pauseBnf(prisma);
      return { total: 0, error: 'Gallica refused our server (HTTP 403/429). Gallica searches and downloads pause for 6 hours.', candidates: [] };
    }
    return { total: 0, error: message, candidates: [] };
  }
}

const REF_SELECT = { id: true, shortId: true, title: true, source: true, ark: true, creator: true, titleKey: true } as const;

export async function searchImportSources(prisma: PrismaClient, input: ImportSearchInput) {
  const query = input.query?.trim() ?? '';
  if (!query) throw new Error('Enter something to search for.');
  const page = Math.max(1, Math.trunc(input.page ?? 1));
  const pageSize = Math.max(5, Math.min(Math.trunc(input.pageSize ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE));
  const sources = (input.sources?.length ? input.sources : IMPORT_SOURCES).filter((source) => IMPORT_SOURCES.includes(source));

  const results = await Promise.all(
    sources.map(async (source) => ({ source, ...(await searchSource(prisma, source, { ...input, query }, page, pageSize)) })),
  );
  const all = results.flatMap((result) => result.candidates);
  all.forEach(remember);

  // What we already hold: the same record, or the same work from elsewhere.
  const keys = [...new Set(all.map((candidate) => titleKey(candidate.title)).filter((key) => key.length >= 3))];
  const existing = all.length
    ? await prisma.libraryItem.findMany({
        where: {
          OR: [
            ...IMPORT_SOURCES.map((source) => ({
              source,
              ark: { in: all.filter((candidate) => candidate.source === source).map((candidate) => candidate.externalId) },
            })),
            ...(keys.length ? [{ titleKey: { in: keys } }] : []),
          ],
        } as any,
        select: REF_SELECT,
      })
    : [];

  const ref = (item: any): ItemRef => ({ id: item.id, shortId: item.shortId, title: item.title, source: item.source });
  const sourceResults: SourceResults[] = results.map((result) => ({
    source: result.source,
    total: result.total,
    error: result.error,
    candidates: result.candidates.map((candidate) => {
      const same = existing.find((item: any) => item.source === candidate.source && item.ark === candidate.externalId);
      const lookalikes = existing.filter((item: any) => item !== same && possiblySameWork(candidate, item));
      // A lookalike in the other source's results on this page counts too.
      const pageTwins = all.filter((other) => other.source !== candidate.source && possiblySameWork(candidate, other));
      return {
        ...candidate,
        inLibrary: same ? ref(same) : null,
        possibleDuplicates: [
          ...lookalikes.map(ref),
          ...pageTwins.map((other) => ({ id: '', shortId: '', title: other.title, source: other.source })),
        ].slice(0, 5),
      };
    }),
  }));

  const totalPages = Math.max(1, ...sourceResults.map((result) => Math.ceil(result.total / pageSize)));
  return { query, page, pageSize, totalPages, sources: sourceResults };
}

export interface ImportSelection {
  source: ImportSource;
  externalId: string;
}

export interface ImportSelectionResult {
  imported: ItemRef[];
  alreadyInLibrary: ItemRef[];
  failed: { source: string; externalId: string; reason: string }[];
}

export const MAX_IMPORT_SELECTION = 500;

function itemData(candidate: ImportCandidate, seedQuery: string | null) {
  if (candidate.raw.kind === 'BNF') {
    const record = candidate.raw.record;
    return {
      source: 'BNF' as const,
      ark: record.ark,
      category: candidate.category,
      title: record.title,
      creator: record.creator ?? null,
      date: record.date ?? null,
      documentType: record.documentType ?? null,
      isPublicDomainWork: record.isPublicDomainWork,
      catalogueUrl: record.catalogueUrl ?? null,
      permalink: record.permalink,
      attribution: bnfAttribution(record.title),
      seedQuery,
    };
  }
  const record = candidate.raw.record;
  return {
    source: 'DNB' as const,
    ark: record.idn,
    category: record.category,
    title: record.title,
    creator: record.creator,
    date: record.date,
    documentType: record.documentType,
    isPublicDomainWork: false,
    permalink: record.permalink,
    description: record.summary,
    // "kostenfrei" online access - credited, linked back, not relicensed.
    license: 'Free online access (DNB)',
    attribution: `Source: Deutsche Nationalbibliothek${record.publisher ? ` · ${record.publisher}` : ''}`,
    seedQuery,
  };
}

// Imports the ticked rows. Only creates - an item already in the Library is
// never touched or duplicated. Files follow in the background (MIRROR).
export async function importSelection(
  prisma: PrismaClient,
  selections: ImportSelection[],
  seedQuery: string | null,
): Promise<ImportSelectionResult> {
  const unique = [...new Map(selections.map((selection) => [cacheKey(selection.source, selection.externalId), selection])).values()];
  if (unique.length > MAX_IMPORT_SELECTION) throw new Error(`Import at most ${MAX_IMPORT_SELECTION} items at a time.`);
  const result: ImportSelectionResult = { imported: [], alreadyInLibrary: [], failed: [] };

  const existing = await prisma.libraryItem.findMany({
    where: { OR: IMPORT_SOURCES.map((source) => ({ source, ark: { in: unique.filter((s) => s.source === source).map((s) => s.externalId) } })) } as any,
    select: REF_SELECT,
  });
  const held = new Map(existing.map((item: any) => [cacheKey(item.source, item.ark), item]));

  // DNB rows come from the DNB itself, not from what the browser sent.
  const dnbIds = unique.filter((s) => s.source === 'DNB' && !held.has(cacheKey('DNB', s.externalId))).map((s) => s.externalId);
  const dnb = new Map<string, DnbRecord>();
  if (dnbIds.length) {
    try {
      for (const record of await fetchDnbRecords(dnbIds)) dnb.set(record.idn, record);
    } catch (error) {
      for (const externalId of dnbIds) result.failed.push({ source: 'DNB', externalId, reason: `DNB lookup failed: ${errorMessage(error)}` });
    }
  }

  for (const selection of unique) {
    const key = cacheKey(selection.source, selection.externalId);
    const already = held.get(key);
    if (already) {
      result.alreadyInLibrary.push({ id: already.id, shortId: already.shortId, title: already.title, source: already.source });
      continue;
    }
    if (result.failed.some((failure) => cacheKey(failure.source, failure.externalId) === key)) continue;

    let candidate: ImportCandidate | null = null;
    if (selection.source === 'DNB') {
      const record = isDnbIdn(selection.externalId) ? dnb.get(selection.externalId) : undefined;
      candidate = record ? fromDnb(record) : null;
      if (!candidate) {
        result.failed.push({ ...selection, reason: 'Not found at the DNB as a free online title.' });
        continue;
      }
    } else {
      candidate = recall('BNF', selection.externalId);
      if (!candidate) {
        result.failed.push({ ...selection, reason: 'Search results expired - search again, then import.' });
        continue;
      }
    }

    try {
      const item = await prisma.libraryItem.create({ data: itemData(candidate, seedQuery) as any, select: REF_SELECT });
      result.imported.push({ id: item.id, shortId: item.shortId, title: item.title, source: item.source });
    } catch (error: any) {
      // Someone imported it a moment ago.
      if (error?.code === 'P2002') {
        const item = await prisma.libraryItem.findUnique({
          where: { source_ark: { source: selection.source, ark: selection.externalId } } as any,
          select: REF_SELECT,
        });
        if (item) result.alreadyInLibrary.push({ id: item.id, shortId: item.shortId, title: item.title, source: item.source });
        continue;
      }
      result.failed.push({ ...selection, reason: errorMessage(error) });
    }
  }
  return result;
}
