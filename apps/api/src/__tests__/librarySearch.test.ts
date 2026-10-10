import { __setLexicon, foldWord, parseQuery, suggestQuery, trigramSimilarity, trigrams, webSearchText } from '../lib/librarySearch';

// The SQL itself is exercised against a real PostgreSQL 17 with every
// migration applied (see the step-5 commit); these cover the query handling
// around it.

describe('library search query handling', () => {
  it('splits words, "phrases" and -exclusions, ignoring OR', () => {
    expect(parseQuery('Schubert "gute nacht" -Liszt OR lied')).toEqual({
      terms: ['Schubert', 'gute nacht', 'lied'],
      excluded: ['Liszt'],
      words: ['Schubert', 'lied'],
    });
  });

  it('builds the web-search text for each mode', () => {
    expect(webSearchText('schubert lied', 'ALL')).toBe('schubert lied');
    expect(webSearchText('schubert "gute nacht" -liszt', 'ANY')).toBe('schubert or "gute nacht" -liszt');
    expect(webSearchText('gute "nacht', 'PHRASE')).toBe('"gute nacht"');
  });

  it('folds accents like unaccent', () => {
    expect(foldWord('Dvořák')).toBe('dvorak');
  });

  it('scores trigram similarity like pg_trgm', () => {
    expect(trigramSimilarity(trigrams('schubert'), trigrams('schubert'))).toBe(1);
    expect(trigramSimilarity(trigrams('shubert'), trigrams('schubert'))).toBeGreaterThan(0.5);
  });

  it('suggests known words for unknown ones, keeping the rest', () => {
    __setLexicon({ schubert: 40, sonate: 12, debussy: 5, schumann: 30 });
    const lexicon = { words: new Map(Object.entries({ schubert: 40, sonate: 12, debussy: 5, schumann: 30 })), grams: new Map() };
    expect(suggestQuery('Shubert sonate', ['Shubert', 'sonate'], lexicon)).toBe('schubert sonate');
    expect(suggestQuery('debusy', ['debusy'], lexicon)).toBe('debussy');
    expect(suggestQuery('sonate', ['sonate'], lexicon)).toBeNull();
    expect(suggestQuery('xyzzy', ['xyzzy'], lexicon)).toBeNull();
    __setLexicon(null);
  });
});
