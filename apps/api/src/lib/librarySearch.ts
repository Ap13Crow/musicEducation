import { Prisma, type PrismaClient } from '@my-music-coach/database';

// The public Library search - Postgres only (migration 048): a stored,
// weighted tsvector (A title, B creator, C type/date, D description) over
// accent-folded text with the 'simple' configuration, so French, German and
// English titles match word for word without one language's stemming
// spoiling the others. On top of it:
//   - every word (ALL), any word (ANY) or the exact phrase (PHRASE); in ALL
//     mode the query also understands "quoted phrases", -excluded words and
//     OR, like a web search engine
//   - one field only (title, creator)
//   - case-sensitive: every term must also appear exactly as typed
//   - no hits: similar words instead (trigram similarity), plus a "did you
//     mean" built from the words that actually occur in the Library
//   - facets (source, type, format, century, licence, viewable here), each
//     counted with every other active filter applied

export type SearchMode = 'ALL' | 'ANY' | 'PHRASE';
export type SearchField = 'ANY' | 'TITLE' | 'CREATOR';
export type SearchSort = 'RELEVANCE' | 'NEWEST' | 'TITLE' | 'YEAR_ASC' | 'YEAR_DESC';

export interface LibrarySearchInput {
  query?: string | null;
  match?: SearchMode | null;
  field?: SearchField | null;
  caseSensitive?: boolean | null;
  sources?: string[] | null;
  categories?: string[] | null;
  formats?: string[] | null;
  licenses?: string[] | null;
  centuries?: string[] | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  availableOnly?: boolean | null;
  sort?: SearchSort | null;
  page?: number | null;
  limit?: number | null;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface LibrarySearchResult {
  ids: string[];
  totalCount: number;
  page: number;
  limit: number;
  fuzzy: boolean;
  suggestion: string | null;
  facets: {
    sources: FacetValue[];
    categories: FacetValue[];
    formats: FacetValue[];
    centuries: FacetValue[];
    licenses: FacetValue[];
    availability: FacetValue[];
  };
}

// ── query parsing ──────────────────────────────────────────────

export interface ParsedQuery {
  // Terms that must (ALL) / may (ANY) match: single words or "phrases".
  terms: string[];
  excluded: string[];
  // Plain single words, for "did you mean".
  words: string[];
}

export function parseQuery(raw: string): ParsedQuery {
  const terms: string[] = [];
  const excluded: string[] = [];
  const pattern = /(-?)"([^"]+)"|(-?)(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(raw))) {
    const negated = Boolean(match[1] || match[3]);
    const text = (match[2] ?? match[4] ?? '').trim();
    if (!text || (!match[2] && /^or$/i.test(text))) continue;
    (negated ? excluded : terms).push(text);
  }
  const words = terms.filter((term) => !/\s/.test(term));
  return { terms, excluded, words };
}

// What websearch_to_tsquery gets for each mode.
export function webSearchText(raw: string, mode: SearchMode): string {
  const parsed = parseQuery(raw);
  const quote = (term: string) => (/\s/.test(term) ? `"${term.replace(/"/g, '')}"` : term);
  const negations = parsed.excluded.map((term) => `-${quote(term)}`);
  if (mode === 'PHRASE') return `"${raw.replace(/"/g, ' ').replace(/\s+/g, ' ').trim()}"`;
  if (mode === 'ANY') return [parsed.terms.map(quote).join(' or '), ...negations].filter(Boolean).join(' ');
  return raw;
}

// ── "did you mean" ─────────────────────────────────────────────

export function foldWord(word: string): string {
  return word.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// pg_trgm-style trigrams: each word padded with two spaces in front, one behind.
export function trigrams(word: string): Set<string> {
  const padded = `  ${word} `;
  const set = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) set.add(padded.slice(i, i + 3));
  return set;
}

export function trigramSimilarity(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const gram of a) if (b.has(gram)) shared += 1;
  return shared / (a.size + b.size - shared || 1);
}

type Lexicon = { words: Map<string, number>; grams: Map<string, Set<string>> };
let lexicon: { value: Lexicon; at: number } | null = null;
const LEXICON_TTL_MS = 10 * 60 * 1000;

async function loadLexicon(prisma: PrismaClient): Promise<Lexicon> {
  if (lexicon && Date.now() - lexicon.at < LEXICON_TTL_MS) return lexicon.value;
  const rows: { word: string; ndoc: number }[] = await prisma.$queryRawUnsafe(
    `SELECT word, ndoc::int AS ndoc FROM ts_stat('SELECT "searchVector" FROM "LibraryItem" WHERE "hiddenAt" IS NULL') WHERE length(word) >= 3 AND word !~ '^[0-9]+$'`,
  );
  const value: Lexicon = { words: new Map(rows.map((row) => [row.word, row.ndoc])), grams: new Map() };
  lexicon = { value, at: Date.now() };
  return value;
}

export function closestWord(word: string, known: Lexicon): string | null {
  const grams = trigrams(word);
  let best: { word: string; score: number; ndoc: number } | null = null;
  for (const [candidate, ndoc] of known.words) {
    if (Math.abs(candidate.length - word.length) > 3) continue;
    let candidateGrams = known.grams.get(candidate);
    if (!candidateGrams) known.grams.set(candidate, (candidateGrams = trigrams(candidate)));
    const score = trigramSimilarity(grams, candidateGrams);
    if (score >= 0.4 && (!best || score > best.score || (score === best.score && ndoc > best.ndoc))) best = { word: candidate, score, ndoc };
  }
  return best?.word ?? null;
}

export function suggestQuery(raw: string, words: string[], known: Lexicon): string | null {
  let suggestion = raw;
  let changed = false;
  for (const word of words) {
    const folded = foldWord(word);
    if (folded.length < 3 || /^\d+$/.test(folded) || known.words.has(folded)) continue;
    const better = closestWord(folded, known);
    if (better && better !== folded) {
      suggestion = suggestion.replace(word, better);
      changed = true;
    }
  }
  return changed ? suggestion : null;
}

export function __setLexicon(words: Record<string, number> | null) {
  lexicon = words ? { value: { words: new Map(Object.entries(words)), grams: new Map() }, at: Date.now() } : null;
}

// ── SQL ────────────────────────────────────────────────────────

const FORMATS_SQL = Prisma.sql`array_remove(ARRAY[
  CASE WHEN "musicXmlSourceUrl" IS NOT NULL THEN 'MUSICXML' END,
  CASE WHEN jsonb_path_exists(coalesce("files", '[]'::jsonb), '$[*] ? (@.contentType == "application/pdf")') THEN 'PDF' END,
  CASE WHEN "category" = 'AUDIO_RECORDING' THEN 'AUDIO' END,
  CASE WHEN "source" = 'BNF' AND "category" <> 'AUDIO_RECORDING' THEN 'SCANS' END
], NULL)`;

// Gallica and DNB items can be shown here only once we hold a copy.
export const AVAILABLE_SQL = Prisma.sql`("source" NOT IN ('BNF', 'DNB') OR "mirroredAt" IS NOT NULL)`;

const LICENSE_SQL = Prisma.sql`CASE
  WHEN "license" ILIKE 'CC0%' OR "license" ILIKE 'Public Domain%' THEN 'PUBLIC_DOMAIN'
  WHEN "license" ILIKE '%ShareAlike%' THEN 'CC_BY_SA'
  WHEN "license" ILIKE 'Creative Commons Attribution%' THEN 'CC_BY'
  WHEN "source" = 'DNB' THEN 'FREE_ACCESS'
  WHEN "source" = 'BNF' THEN 'BNF_TERMS'
  ELSE 'OTHER' END`;

// "18" = the 1800s (19th century); "unknown" = no year in the record.
const CENTURY_SQL = Prisma.sql`coalesce(("year" / 100)::text, 'unknown')`;

const SEARCH_TEXT_SQL: Record<SearchField, Prisma.Sql> = {
  ANY: Prisma.sql`concat_ws(' ', "title", "creator", "documentType", "date", "description")`,
  TITLE: Prisma.sql`"title"`,
  CREATOR: Prisma.sql`coalesce("creator", '')`,
};

const FIELD_WEIGHT: Record<SearchField, string | null> = { ANY: null, TITLE: '{a}', CREATOR: '{b}' };

const likeEscape = (text: string) => text.replace(/[\\%_]/g, (char) => `\\${char}`);

function textConditions(input: LibrarySearchInput, fuzzy: boolean): { where: Prisma.Sql; rank: Prisma.Sql } | null {
  const raw = input.query?.trim() ?? '';
  if (!raw) return null;
  const mode = input.match ?? 'ALL';
  const field = input.field ?? 'ANY';
  const parsed = parseQuery(raw);
  if (!parsed.terms.length && !parsed.excluded.length) return null;
  const conditions: Prisma.Sql[] = [];

  const weight = FIELD_WEIGHT[field];
  const vector = weight ? Prisma.sql`ts_filter("searchVector", ${weight}::"char"[])` : Prisma.sql`"searchVector"`;
  const tsquery = Prisma.sql`websearch_to_tsquery('simple'::regconfig, library_unaccent(${webSearchText(raw, mode)}))`;

  if (fuzzy) {
    // Similar words: each typed word close to some word of the title/creator.
    const haystack = Prisma.sql`library_unaccent(lower("title" || ' ' || coalesce("creator", '')))`;
    const words = parsed.words.length ? parsed.words : parsed.terms;
    const each = words.map((word) => Prisma.sql`word_similarity(library_unaccent(lower(${word})), ${haystack}) >= 0.5`);
    if (!each.length) return null;
    conditions.push(Prisma.sql`(${Prisma.join(each, mode === 'ANY' ? ' OR ' : ' AND ')})`);
    const rank = Prisma.sql`(${Prisma.join(words.map((word) => Prisma.sql`word_similarity(library_unaccent(lower(${word})), ${haystack})`), ' + ')})`;
    return { where: Prisma.join(conditions, ' AND '), rank };
  }

  conditions.push(Prisma.sql`${vector} @@ ${tsquery}`);
  if (input.caseSensitive) {
    // Exactly as typed: case and accents both count.
    const text = SEARCH_TEXT_SQL[field];
    const terms = mode === 'PHRASE' ? [raw.replace(/"/g, '').replace(/\s+/g, ' ').trim()] : parsed.terms;
    const each = terms.map((term) => Prisma.sql`${text} LIKE ${`%${likeEscape(term)}%`} ESCAPE '\\'`);
    if (each.length) conditions.push(Prisma.sql`(${Prisma.join(each, mode === 'ANY' ? ' OR ' : ' AND ')})`);
  }
  return { where: Prisma.join(conditions, ' AND '), rank: Prisma.sql`ts_rank(${vector}, ${tsquery})` };
}

type FacetKey = 'source' | 'category' | 'format' | 'century' | 'license' | 'available';

function filterConditions(input: LibrarySearchInput, except?: FacetKey): Prisma.Sql[] {
  const list = (values?: string[] | null) => (values?.length ? values.map(String) : null);
  const conditions: Prisma.Sql[] = [];
  const sources = list(input.sources);
  const categories = list(input.categories);
  const formats = list(input.formats);
  const licenses = list(input.licenses);
  const centuries = list(input.centuries);
  if (sources && except !== 'source') conditions.push(Prisma.sql`"source"::text = ANY(${sources})`);
  if (categories && except !== 'category') conditions.push(Prisma.sql`"category"::text = ANY(${categories})`);
  if (formats && except !== 'format') conditions.push(Prisma.sql`formats && ${formats}::text[]`);
  if (licenses && except !== 'license') conditions.push(Prisma.sql`license_group = ANY(${licenses})`);
  if (centuries && except !== 'century') conditions.push(Prisma.sql`century = ANY(${centuries})`);
  if (except !== 'century') {
    if (input.yearFrom) conditions.push(Prisma.sql`"year" >= ${Math.trunc(input.yearFrom)}`);
    if (input.yearTo) conditions.push(Prisma.sql`"year" <= ${Math.trunc(input.yearTo)}`);
  }
  if (input.availableOnly && except !== 'available') conditions.push(Prisma.sql`available`);
  return conditions;
}

const and = (conditions: Prisma.Sql[]) => (conditions.length ? Prisma.join(conditions, ' AND ') : Prisma.sql`TRUE`);

const ORDER: Record<Exclude<SearchSort, 'RELEVANCE'>, Prisma.Sql> = {
  NEWEST: Prisma.sql`"ingestedAt" DESC, id`,
  TITLE: Prisma.sql`lower("title"), id`,
  YEAR_ASC: Prisma.sql`"year" ASC NULLS LAST, lower("title"), id`,
  YEAR_DESC: Prisma.sql`"year" DESC NULLS LAST, lower("title"), id`,
};

async function run(prisma: PrismaClient, input: LibrarySearchInput, fuzzy: boolean, page: number, limit: number) {
  const text = textConditions(input, fuzzy);
  const base = Prisma.sql`
    SELECT id, "source", "category", "year", "title", "ingestedAt",
      ${FORMATS_SQL} AS formats,
      ${AVAILABLE_SQL} AS available,
      ${LICENSE_SQL} AS license_group,
      ${CENTURY_SQL} AS century,
      ${text ? text.rank : Prisma.sql`0`}::float AS rank
    FROM "LibraryItem"
    WHERE "hiddenAt" IS NULL AND ${text ? text.where : Prisma.sql`TRUE`}`;

  const sort = input.sort && input.sort !== 'RELEVANCE' ? ORDER[input.sort] : text ? Prisma.sql`rank DESC, "ingestedAt" DESC, id` : ORDER.NEWEST;
  const facet = (column: Prisma.Sql, key: FacetKey, from = Prisma.sql`base`) => Prisma.sql`(
    SELECT coalesce(json_agg(json_build_object('value', value, 'count', n) ORDER BY n DESC, value), '[]'::json)
    FROM (SELECT ${column} AS value, count(*)::int AS n FROM ${from} WHERE ${and(filterConditions(input, key))} GROUP BY 1) facet)`;

  const rows: any[] = await prisma.$queryRaw`
    WITH base AS (${base}),
    hits AS (SELECT * FROM base WHERE ${and(filterConditions(input))})
    SELECT
      (SELECT count(*)::int FROM hits) AS total,
      (SELECT coalesce(json_agg(id), '[]'::json) FROM (SELECT id FROM hits ORDER BY ${sort} LIMIT ${limit} OFFSET ${(page - 1) * limit}) page) AS ids,
      ${facet(Prisma.sql`"source"::text`, 'source')} AS sources,
      ${facet(Prisma.sql`"category"::text`, 'category')} AS categories,
      ${facet(Prisma.sql`format.value`, 'format', Prisma.sql`base CROSS JOIN LATERAL unnest(formats) AS format(value)`)} AS formats,
      ${facet(Prisma.sql`century`, 'century')} AS centuries,
      ${facet(Prisma.sql`license_group`, 'license')} AS licenses,
      ${facet(Prisma.sql`CASE WHEN available THEN 'HERE' ELSE 'AT_SOURCE' END`, 'available')} AS availability`;
  const row = rows[0];
  return {
    total: Number(row.total) || 0,
    ids: row.ids as string[],
    facets: {
      sources: row.sources,
      categories: row.categories,
      formats: row.formats,
      centuries: row.centuries,
      licenses: row.licenses,
      availability: row.availability,
    } as LibrarySearchResult['facets'],
  };
}

export async function searchLibrary(prisma: PrismaClient, input: LibrarySearchInput): Promise<LibrarySearchResult> {
  const page = Math.max(1, Math.trunc(input.page ?? 1));
  const limit = Math.max(1, Math.min(Math.trunc(input.limit ?? 24), 100));
  const query = input.query?.trim().slice(0, 300) ?? '';
  const clean = { ...input, query };

  let result = await run(prisma, clean, false, page, limit);
  let fuzzy = false;
  // Nothing matched word for word: look for similar words instead.
  // Not for an exact phrase or case-sensitive search - those ask for precision.
  if (query && result.total === 0 && !input.caseSensitive && input.match !== 'PHRASE') {
    const similar = await run(prisma, clean, true, page, limit);
    if (similar.total > 0) {
      result = similar;
      fuzzy = true;
    }
  }

  let suggestion: string | null = null;
  if (query && (fuzzy || result.total < 3)) {
    try {
      suggestion = suggestQuery(query, parseQuery(query).words, await loadLexicon(prisma));
    } catch {
      suggestion = null;
    }
  }
  return { ids: result.ids, totalCount: result.total, page, limit, fuzzy, suggestion, facets: result.facets };
}
