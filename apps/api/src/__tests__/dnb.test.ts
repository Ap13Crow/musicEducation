import { readFileSync } from 'fs';
import { join } from 'path';
import { buildDnbQuery, dnbTerms, dnbText, isDnbIdn, parseDnbResponse } from '../lib/dnb';
import { creatorTokens, possiblySameWork, titleKey } from '../lib/libraryMatch';

// Live DNB SRU answer for `Schubert and location=onlinefree and sgt=780`
// (2026-10-10), trimmed of fields we don't read.
const xml = readFileSync(join(__dirname, 'fixtures', 'dnb-sru-schubert.xml'), 'utf8');

describe('DNB query building', () => {
  it('joins words explicitly - the DNB finds nothing for unjoined words', () => {
    expect(dnbTerms('Schubert  Winterreise')).toBe('(Schubert and Winterreise)');
    expect(dnbTerms('Schubert Liszt', 'ANY')).toBe('(Schubert or Liszt)');
    expect(dnbTerms('Gute Nacht', 'PHRASE')).toBe('"Gute Nacht"');
    expect(dnbTerms('Bach')).toBe('Bach');
  });

  it('drops CQL syntax and boolean words from user input', () => {
    expect(dnbTerms('sgt=780 or "x" (y)')).toBe('(sgt and 780 and x and y)');
    expect(dnbTerms('   ')).toBeNull();
  });

  it('always limits to free online music titles and adds filters', () => {
    expect(buildDnbQuery({ query: 'Schubert' })).toBe('location=onlinefree and sgt=780 and Schubert');
    expect(buildDnbQuery({ query: 'Schubert', category: 'SHEET_MUSIC', yearFrom: 1800, yearTo: 1900 })).toBe(
      'location=onlinefree and sgt=780 and Schubert and mat=scores and jhr>=1800 and jhr<=1900',
    );
    expect(buildDnbQuery({ query: 'Schubert', category: 'BOOK' })).toBe('location=onlinefree and sgt=780 and Schubert not mat=scores');
  });

  it('accepts only real IDNs', () => {
    expect(isDnbIdn('1376235218')).toBe(true);
    expect(isDnbIdn('97836627X')).toBe(true);
    expect(isDnbIdn('12345')).toBe(false);
    expect(isDnbIdn('../34')).toBe(false);
  });
});

describe('DNB MARC21 parsing', () => {
  const page = parseDnbResponse(xml);

  it('reads the total and every record with an archive copy', () => {
    expect(page.total).toBe(66);
    expect(page.records.map((record) => record.idn)).toEqual(['1421687909', '1415325529', '1376235218']);
  });

  it('maps a printed score', () => {
    const score = page.records.find((record) => record.idn === '1376235218')!;
    expect(score).toMatchObject({
      title: "Gute Nacht : Lied aus Fr. Schubert's Winterreise",
      creator: 'Liszt, Franz',
      date: '2025',
      publisher: 'Universität der Künste Berlin',
      category: 'SHEET_MUSIC',
      documentType: 'Noten',
      permalink: 'https://d-nb.info/1376235218',
      archiveUrl: 'https://d-nb.info/1376235218/34',
    });
  });

  it('maps a book with its abstract', () => {
    const book = page.records.find((record) => record.idn === '1421687909')!;
    expect(book.category).toBe('BOOK');
    expect(book.creator).toBe('Dill, Leonor');
    expect(book.summary).toMatch(/^This open access book/);
  });

  it('drops non-sorting marks and composes accents', () => {
    expect(dnbText('&#152;Die&#156; Urlinie')).toBe('Die Urlinie');
    expect(dnbText('Ku\u0308nste')).toBe('Künste');
  });

  it('turns an SRU diagnostic into an error', () => {
    const diagnostic = '<searchRetrieveResponse><diagnostics><diagnostic><message>Unsupported index</message></diagnostic></diagnostics></searchRetrieveResponse>';
    expect(() => parseDnbResponse(diagnostic)).toThrow('Unsupported index');
  });
});

describe('cross-source duplicate hints', () => {
  it('normalises titles the way the database column does', () => {
    expect(titleKey('Méthode de piano : 2e édition / par X')).toBe('methode de piano');
    expect(titleKey("Gute Nacht : Lied aus Fr. Schubert's Winterreise")).toBe('gute nacht');
    expect(titleKey('Ku\u0308nste')).toBe('kunste');
  });

  it('matches creators across name orders and roles', () => {
    expect([...creatorTokens('Liszt, Franz (1811-1886). Compositeur')]).toEqual(['liszt', 'franz']);
    expect(possiblySameWork({ title: 'Gute Nacht', creator: 'Franz Liszt' }, { title: 'Gute nacht : Lied', creator: 'Liszt, Franz' })).toBe(true);
    expect(possiblySameWork({ title: 'Gute Nacht', creator: 'Franz Liszt' }, { title: 'Gute Nacht', creator: 'Carl Loewe' })).toBe(false);
    expect(possiblySameWork({ title: 'Sonate', creator: null }, { title: 'Sonate en ré', creator: 'X' })).toBe(false);
  });
});
