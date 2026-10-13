import { catalogueNumbers, composerSurname, matchWorks, workNumbers, type WorkItem } from '../lib/libraryWorkLinks';

// Cases from the 2026-10 review of the real Library: pairs that must link,
// and lookalikes that must not.
let next = 0;
const item = (title: string, creator: string | null): WorkItem => ({ id: `i${++next}`, title, creator });
const linked = (recording: WorkItem, scores: WorkItem[]) =>
  matchWorks([recording], scores).map((link) => [scores.find((score) => score.id === link.scoreId)!.title, link.method]);

describe('library work links', () => {
  it('reads composers in both name orders', () => {
    expect(composerSurname('Beethoven, Ludwig van (1770-1827). Compositeur')).toBe('beethoven');
    expect(composerSurname('Ludwig van Beethoven')).toBe('beethoven');
    expect(composerSurname('F. F. Chopin')).toBe('chopin');
    expect(composerSurname('Antonín Dvořák')).toBe('dvorak');
  });

  it('reads catalogue and work numbers', () => {
    expect(catalogueNumbers('Intermecco op. 118. Nr. 6')).toEqual([{ kind: 'op', number: '118', sub: '6' }]);
    expect(catalogueNumbers('String Quartet No.15 in D minor, K.421/417b')).toEqual([{ kind: 'k', number: '421', sub: null }]);
    expect([...workNumbers('Pour le piano ; 1re Arabesque')]).toEqual(['1']);
    expect([...workNumbers('Deuxième Arabesque (L66 No.2)')]).toEqual(['2']);
  });

  it('links the same catalogue number, sub-number included', () => {
    const scores = [item('Prelude: Op. 28, No. 15', 'F. F. Chopin'), item('Prelude: Op. 28, No. 7', 'F. F. Chopin'), item('Sonate 2 b-moll (Op. 35)', 'F. F. Chopin')];
    expect(linked(item('Prelude op. 28 no. 15', 'Frédéric Chopin'), scores)).toEqual([['Prelude: Op. 28, No. 15', 'CATALOGUE']]);
    expect(linked(item('Sonata in B Flat Minor, Op. 35 - III. Marche funebre, Lento', 'Frédéric Chopin'), scores)).toEqual([['Sonate 2 b-moll (Op. 35)', 'CATALOGUE']]);
    expect(linked(item('Intermecco op. 118. Nr. 6', 'Johannes Brahms'), [item('2. Intermezzo (Op. 118, No. 2)', 'J. Brahms')])).toEqual([]);
  });

  it('links distinctive titles by the same composer', () => {
    const scores = [item('Ave Maria (Ellens dritter Gesang) (D.839 (Op. 52, No. 6))', 'F. Schubert'), item('Erlkönig (D.328 (Op. 1))', 'F. Schubert')];
    expect(linked(item('Ave Maria', 'Schubert; Wilhelmj'), scores)).toEqual([['Ave Maria (Ellens dritter Gesang) (D.839 (Op. 52, No. 6))', 'TITLE']]);
    expect(linked(item('Der Erlkönig', 'Franz (säv.) Schubert; Johann Wolfgang von Goethe'), scores)).toEqual([['Erlkönig (D.328 (Op. 1))', 'TITLE']]);
    // No creator: the composer named in the title, if they have 3+ scores.
    const schumann = [item('Widmung (O 25)', 'R. Schumann'), item('Kinderscenen - Traümerei (O 15 N 7)', 'R. Schumann'), item('Du bist wie eine Blume (Op. 25, No. 24)', 'R. Schumann')];
    expect(linked(item("Transcripția liedului ''Widmung'' de Robert Schumann", null), schumann)).toEqual([['Widmung (O 25)', 'TITLE']]);
  });

  it('keeps lookalikes apart', () => {
    // Different form names.
    expect(linked(item('Sérénade Espagnole', 'Chaminade; Kreisler'), [item('Chanson espagnole', 'Cécile Chaminade')])).toEqual([]);
    // Different work numbers, as digits or ordinals.
    expect(linked(item('String Quartet No. 2 in D Major', 'Alexander Borodin'), [item('String Quartet No.1', 'Alexander Borodin')])).toEqual([]);
    expect(linked(item('Pour le piano ; 1re Arabesque / Claude Debussy, comp.', 'Debussy, Claude (1862-1918)'), [
      item('Première Arabesque (L66 No.1)', 'C. Debussy'),
      item('Deuxième Arabesque (L66 No.2)', 'C. Debussy'),
    ])).toEqual([['Première Arabesque (L66 No.1)', 'TITLE']]);
    // A form name alone is no match.
    expect(linked(item('Menuett', 'paderewski, ignace jan ; beethoven'), [item('Menuett Op. WoO 82', 'L. V. Beethoven')])).toEqual([]);
    expect(linked(item('Mazurka op. 17 no. 4 in A minor', 'Frédéric Chopin'), [item('F. Chopin // 42.e Mazurka // pour le Violoncelle', 'Chopin, Frédéric (1810-1849)')])).toEqual([]);
    // Shared words but another composer.
    expect(linked(item('Loengrin farewell: My swan white', 'Richard Wagner'), [item('A Farewell Song', 'Maude Valerie White')])).toEqual([]);
  });

  it('leaves a recording unlinked when too many scores would fit', () => {
    const scores = Array.from({ length: 5 }, (_, index) => item(`Sonate Op. 2 (copy ${index + 1})`, 'L. V. Beethoven'));
    expect(linked(item('Sonata Op. 2', 'Beethoven'), scores)).toEqual([]);
  });
});

jest.mock('../lib/libraryWorkLinksManual', () => ({
  MANUAL_WORK_LINKS: [{ recording: 'EUROPEANA:teiul', score: 'OPENSCORE:lindenbaum' }],
  REJECTED_WORK_LINKS: [{ recording: 'INTERNET_ARCHIVE:waltz15', score: 'MUTOPIA:waltz10' }],
}));

describe('relinkLibraryWorks', () => {
  it('adds hand-reviewed pairs, keeps hand-rejected ones out and confirms matcher pairs', async () => {
    const { relinkLibraryWorks } = jest.requireActual('../lib/libraryWorkLinks');
    const recordings = [
      { id: 'r-teiul', title: 'Teiul', creator: null, source: 'EUROPEANA', ark: 'teiul' },
      { id: 'r-waltz', title: 'Waltz : op. 39 Nr. 15, As dur', creator: 'Johannes Brahms', source: 'INTERNET_ARCHIVE', ark: 'waltz15' },
    ];
    const scores = [
      { id: 's-linden', title: 'Der Lindenbaum (Winterreise, D.911)', creator: 'Franz Schubert', source: 'OPENSCORE', ark: 'lindenbaum' },
      { id: 's-w10', title: 'Waltz No. 10 (Op. 39)', creator: 'J. Brahms', source: 'MUTOPIA', ark: 'waltz10' },
      { id: 's-w15', title: 'Waltz No. 15 (Op. 39)', creator: 'J. Brahms', source: 'MUTOPIA', ark: 'waltz15' },
    ];
    const createMany = jest.fn((args: any) => args);
    const upsert = jest.fn((args: any) => args);
    const prisma: any = {
      libraryItem: { findMany: jest.fn(({ where }: any) => Promise.resolve(where.category === 'AUDIO_RECORDING' ? recordings : scores)) },
      libraryWorkLink: { findMany: jest.fn().mockResolvedValue([]), createMany, upsert, delete: jest.fn(), update: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };

    const result = await relinkLibraryWorks(prisma);

    const created = createMany.mock.calls[0][0].data.map((link: any) => `${link.recordingId}>${link.scoreId}:${link.method}`).sort();
    expect(created).toEqual(['r-teiul>s-linden:MANUAL', 'r-waltz>s-w15:CATALOGUE']);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ recordingId: 'r-waltz', scoreId: 's-w10', rejectedAt: expect.any(Date) }) }));
    expect(result).toEqual({ links: 2, added: 2, removed: 0 });
  });
});
