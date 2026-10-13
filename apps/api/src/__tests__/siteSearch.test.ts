import { __clearSiteSearchLexicons, COURSE_SEARCH, EXTERNAL_EVENT_SEARCH, siteSearch } from '../lib/siteSearch';

// $queryRaw answers in call order: exact pass, then (if empty) the
// similar-word pass, then the "did you mean" lexicon.
function fakePrisma(...answers: unknown[][]) {
  const $queryRaw = jest.fn();
  for (const answer of answers) $queryRaw.mockResolvedValueOnce(answer);
  return { prisma: { $queryRaw } as any, $queryRaw };
}

const ids = (...values: string[]) => values.map((id) => ({ id }));

describe('siteSearch', () => {
  beforeEach(() => __clearSiteSearchLexicons());

  it('returns null for an empty query', async () => {
    const { prisma, $queryRaw } = fakePrisma();
    expect(await siteSearch(prisma, COURSE_SEARCH, '  ')).toBeNull();
    expect(await siteSearch(prisma, COURSE_SEARCH, undefined)).toBeNull();
    expect($queryRaw).not.toHaveBeenCalled();
  });

  it('matches whole words over the stored vector, accent- and case-insensitively', async () => {
    const { prisma, $queryRaw } = fakePrisma(ids('c1', 'c2', 'c3'));

    const result = await siteSearch(prisma, COURSE_SEARCH, 'Violin');

    expect(result).toEqual({ ids: ['c1', 'c2', 'c3'], fuzzy: false, suggestion: null });
    const sql = $queryRaw.mock.calls[0][0];
    expect(sql.sql).toContain('c."searchVector" @@ websearch_to_tsquery(\'simple\'::regconfig, library_unaccent(');
    expect(sql.sql).toContain('c."status"::text = \'PUBLISHED\'');
    expect(sql.values).toContain('Violin');
    expect($queryRaw).toHaveBeenCalledTimes(1);
  });

  it('falls back to similar words when nothing matches exactly, and suggests a known word', async () => {
    const { prisma, $queryRaw } = fakePrisma([], ids('x1'), [{ word: 'violin', ndoc: 12 }, { word: 'viola', ndoc: 3 }]);

    const result = await siteSearch(prisma, EXTERNAL_EVENT_SEARCH, 'vilin');

    expect(result).toEqual({ ids: ['x1'], fuzzy: true, suggestion: 'violin' });
    const similar = $queryRaw.mock.calls[1][0];
    expect(similar.sql).toContain('word_similarity(library_unaccent(lower(');
    expect(similar.values).toEqual(expect.arrayContaining(['vilin', 0.5]));
  });

  it('reports no hits, without fuzzy, when even similar words find nothing', async () => {
    const { prisma } = fakePrisma([], [], []);

    expect(await siteSearch(prisma, COURSE_SEARCH, 'zzzz')).toEqual({ ids: [], fuzzy: false, suggestion: null });
  });

  it('requires every word in the similar-word pass', async () => {
    const { prisma, $queryRaw } = fakePrisma([], [], []);

    await siteSearch(prisma, COURSE_SEARCH, 'jaz pianno');

    expect($queryRaw.mock.calls[1][0].sql).toMatch(/>= \? AND word_similarity/);
  });
});

describe('siteSearch spelling correction', () => {
  beforeEach(() => __clearSiteSearchLexicons());

  it('searches the corrected spelling when even similar words find nothing', async () => {
    const { prisma, $queryRaw } = fakePrisma([], [], [{ word: 'beethoven', ndoc: 40 }], ids('x9'));

    const result = await siteSearch(prisma, EXTERNAL_EVENT_SEARCH, 'betoven');

    expect(result).toEqual({ ids: ['x9'], fuzzy: true, suggestion: 'beethoven' });
    expect($queryRaw.mock.calls[3][0].values).toContain('beethoven');
  });
});
