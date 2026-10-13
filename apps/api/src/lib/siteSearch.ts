import { Prisma, type PrismaClient } from '@my-music-coach/database';
import { parseQuery, suggestQuery, type Lexicon } from './librarySearch.js';

// One search standard for every public search bar - courses, events,
// external events and teachers work like the Library (librarySearch.ts):
//   - whole words, case- and accent-insensitive, over a weighted tsvector
//     (migrations 048 and 056); web-search syntax: "exact phrase",
//     -excluded word, OR
//   - no hits: similar words instead (trigram word_similarity, the same 0.5
//     threshold as the Library), so typos like "vilin" or "jaz" still find
//     something, and the page says the results are only similar
//   - a "did you mean" built from the words that actually occur in the list;
//     if even similar words find nothing, the list shows the hits for that
//     corrected spelling ("betoven" -> beethoven), again marked as similar
// The resolver adds `id IN (ids)` to its own filters and keeps its own order.
// Whether to fall back to similar words is decided over the whole list,
// before the page's other filters (instrument, date, ...) are applied.

export interface SearchSurface {
  key: string;
  // FROM clause with table aliases and joins.
  from: Prisma.Sql;
  // The rows this list may show at all (published, public, not expired).
  scope: Prisma.Sql;
  id: Prisma.Sql;
  vector: Prisma.Sql;
  // Short, accent-folded, lower-case text the similar-word fallback
  // compares against - titles, names and tags, not long descriptions.
  similarText: Prisma.Sql;
}

export interface SiteSearchResult {
  ids: string[];
  fuzzy: boolean;
  suggestion: string | null;
}

const MAX_IDS = 10000;
const SIMILARITY = 0.5;

const tags = (column: string) => Prisma.raw(`search_tags(${column})`);

export const COURSE_SEARCH: SearchSurface = {
  key: 'course',
  from: Prisma.sql`"Course" c`,
  scope: Prisma.sql`c."status"::text = 'PUBLISHED'`,
  id: Prisma.sql`c."id"`,
  vector: Prisma.sql`c."searchVector"`,
  similarText: Prisma.sql`library_unaccent(lower(concat_ws(' ', c."title", ${tags('c."instruments"')}, ${tags('c."musicStyles"')})))`,
};

export const EVENT_SEARCH: SearchSurface = {
  key: 'event',
  from: Prisma.sql`"Event" e`,
  scope: Prisma.sql`e."isPublished"`,
  id: Prisma.sql`e."id"`,
  vector: Prisma.sql`e."searchVector"`,
  similarText: Prisma.sql`library_unaccent(lower(concat_ws(' ', e."title", ${tags('e."instruments"')}, ${tags('e."musicStyles"')}, e."venueName", e."city")))`,
};

export const EXTERNAL_EVENT_SEARCH: SearchSurface = {
  key: 'externalEvent',
  from: Prisma.sql`"ExternalEventProjection" x`,
  scope: Prisma.sql`(x."expiresAt" IS NULL OR x."expiresAt" >= now())`,
  id: Prisma.sql`x."id"`,
  vector: Prisma.sql`x."searchVector"`,
  similarText: Prisma.sql`library_unaccent(lower(concat_ws(' ', x."title", ${tags('x."instruments"')}, ${tags('x."musicStyles"')}, x."venueName", x."city")))`,
};

// Teachers span two tables and number in the tens, so their vector is built
// per query rather than stored. The headline is the bio's first line.
export const TEACHER_SEARCH: SearchSurface = {
  key: 'teacher',
  from: Prisma.sql`"TeacherProfile" tp
    JOIN "User" u ON u."id" = tp."userId"
    LEFT JOIN "UserProfile" up ON up."userId" = tp."userId"`,
  scope: Prisma.sql`tp."isPublic" AND u."role"::text IN ('TEACHER', 'ADMIN') AND u."status"::text = 'ACTIVE'`,
  id: Prisma.sql`tp."id"`,
  vector: Prisma.sql`(
    setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce(up."displayName", ''))), 'A') ||
    setweight(to_tsvector('simple'::regconfig, library_unaccent(concat_ws(' ', ${tags('tp."instruments"')}, ${tags('tp."musicStyles"')}, up."city", up."country"))), 'B') ||
    setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce(tp."bio", ''))), 'D'))`,
  similarText: Prisma.sql`library_unaccent(lower(concat_ws(' ', up."displayName", split_part(coalesce(tp."bio", ''), chr(10), 1),
    ${tags('tp."instruments"')}, ${tags('tp."musicStyles"')}, up."city", up."country")))`,
};

async function selectIds(prisma: PrismaClient, surface: SearchSurface, where: Prisma.Sql, rank: Prisma.Sql): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT ${surface.id} AS id FROM ${surface.from}
    WHERE ${surface.scope} AND ${where}
    ORDER BY ${rank} DESC
    LIMIT ${MAX_IDS}`);
  return rows.map((row) => row.id);
}

const lexicons = new Map<string, { value: Lexicon; at: number }>();
const LEXICON_TTL_MS = 10 * 60 * 1000;

async function loadLexicon(prisma: PrismaClient, surface: SearchSurface): Promise<Lexicon> {
  const cached = lexicons.get(surface.key);
  if (cached && Date.now() - cached.at < LEXICON_TTL_MS) return cached.value;
  const rows = await prisma.$queryRaw<{ word: string; ndoc: number }[]>(Prisma.sql`
    SELECT lexeme AS word, count(*)::int AS ndoc
    FROM (SELECT ${surface.vector} AS v FROM ${surface.from} WHERE ${surface.scope}) docs, unnest(docs.v)
    WHERE length(lexeme) >= 3 AND lexeme !~ '^[0-9]+$'
    GROUP BY lexeme`);
  const value: Lexicon = { words: new Map(rows.map((row) => [row.word, Number(row.ndoc)])), grams: new Map() };
  lexicons.set(surface.key, { value, at: Date.now() });
  return value;
}

export function __clearSiteSearchLexicons() {
  lexicons.clear();
}

// null when there is nothing to search for - the caller then leaves the
// list unfiltered.
export async function siteSearch(
  prisma: PrismaClient,
  surface: SearchSurface,
  raw: string | null | undefined,
): Promise<SiteSearchResult | null> {
  const query = raw?.trim().slice(0, 300) ?? '';
  if (!query) return null;
  const parsed = parseQuery(query);
  if (!parsed.terms.length && !parsed.excluded.length) return null;

  const tsquery = Prisma.sql`websearch_to_tsquery('simple'::regconfig, library_unaccent(${query}))`;
  let ids = await selectIds(prisma, surface, Prisma.sql`${surface.vector} @@ ${tsquery}`, Prisma.sql`ts_rank(${surface.vector}, ${tsquery})`);

  let fuzzy = false;
  const words = parsed.words.length ? parsed.words : parsed.terms;
  if (ids.length === 0 && words.length) {
    const scores = words.map((word) => Prisma.sql`word_similarity(library_unaccent(lower(${word})), ${surface.similarText})`);
    const similar = await selectIds(
      prisma,
      surface,
      Prisma.join(scores.map((score) => Prisma.sql`${score} >= ${SIMILARITY}`), ' AND '),
      Prisma.sql`(${Prisma.join(scores, ' + ')})`,
    );
    if (similar.length) {
      ids = similar;
      fuzzy = true;
    }
  }

  let suggestion: string | null = null;
  if (fuzzy || ids.length < 3) {
    try {
      suggestion = suggestQuery(query, parsed.words, await loadLexicon(prisma, surface));
    } catch {
      suggestion = null;
    }
  }
  if (suggestion && ids.length === 0) {
    const corrected = Prisma.sql`websearch_to_tsquery('simple'::regconfig, library_unaccent(${suggestion}))`;
    ids = await selectIds(prisma, surface, Prisma.sql`${surface.vector} @@ ${corrected}`, Prisma.sql`ts_rank(${surface.vector}, ${corrected})`);
    fuzzy = ids.length > 0;
  }
  return { ids, fuzzy, suggestion };
}

// What a connection's `search` field returns (SearchInfo in the schema).
export const searchInfo = (result: SiteSearchResult | null) =>
  result ? { fuzzy: result.fuzzy, suggestion: result.suggestion } : null;
