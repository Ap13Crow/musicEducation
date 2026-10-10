import { archiveItemData, archiveQuery, groupSides, matrixNumber, parseLength, tidyTitle, workTitle } from '../lib/archive78';
import { europeanaLicense, europeanaPeople, europeanaPerson, europeanaSeconds, isPublicMediaUrl, parseEuropeanaItem } from '../lib/europeana';

describe('Internet Archive 78s', () => {
  it('tidies all-caps titles and keeps mixed case alone', () => {
    expect(tidyTitle('SONATA IN C SHARP MINOR, Op. 27, No. 2 ("Moonlight")')).toBe('Sonata in C Sharp Minor, Op. 27, No. 2 ("Moonlight")');
    expect(tidyTitle('SINFONIE Nr. 7 IN A-DUR, Op. 92')).toBe('Sinfonie Nr. 7 in A-dur, Op. 92');
    expect(tidyTitle('Ave Maria')).toBe('Ave Maria');
  });

  it('separates the work from the side marker', () => {
    expect(workTitle('SONATA ("Moonlight") Part IV')).toEqual({ work: 'SONATA ("Moonlight")', part: 'Part IV' });
    expect(workTitle('Symphony No. 5 - Pt. 2')).toEqual({ work: 'Symphony No. 5', part: 'Pt. 2' });
    expect(workTitle('Erlkönig (Concluded)')).toEqual({ work: 'Erlkönig', part: 'Concluded' });
    expect(workTitle('Part II')).toEqual({ work: 'Part II', part: null });
  });

  it('groups the sides of one recorded work, in order', () => {
    const side = (identifier: string, title: string, year: number | null = 1945) => ({ identifier, title, creators: ['SOLOMON', 'Beethoven'], year, publisher: "His Master's Voice" });
    const records = groupSides([
      side('78_moonlight_b', 'SONATA ("Moonlight") Part II'),
      side('78_moonlight_a', 'SONATA ("Moonlight") Part I'),
      side('78_moonlight_a2', 'SONATA ("Moonlight") Part I'),
      side('78_other', 'RONDO'),
      side('78_other_copy', 'RONDO'),
      side('78_moonlight_c', 'SONATA ("Moonlight") Part I', 1950),
    ]);
    // Second copies of the same recording are left out.
    expect(records).toHaveLength(3);
    const moonlight = records.find((record) => record.ark === '78_moonlight_a')!;
    expect(moonlight.sides.map((s) => s.identifier)).toEqual(['78_moonlight_a', '78_moonlight_b']);
    expect(moonlight.title).toBe('Sonata ("Moonlight")');
  });

  it('builds the archive query with years', () => {
    expect(archiveQuery('Beethoven sonata', null, 1925)).toBe('(collection:georgeblood OR collection:78rpm) AND subject:classical AND (Beethoven AND sonata) AND year:[1880 TO 1925]');
  });

  it('marks public domain only up to the cut-off year', () => {
    const record = { ark: 'a', title: 'Erlkönig', creator: null, performer: null, date: '1924', publisher: 'Victor', permalink: 'p', sides: [{ identifier: 'a', title: 'Erlkönig', creators: ['SCHUMANN-HEINK', 'Schubert'], year: 1924, publisher: 'Victor' }] };
    const files = [{ identifier: 'a', mp3: 'Erlkönig - SCHUMANN-HEINK.mp3', durationSeconds: 200, composer: 'Schubert', performer: 'SCHUMANN-HEINK', partLabel: null }];
    const data = archiveItemData(record, files, 1925);
    expect(data).toMatchObject({ creator: 'Schubert', isPublicDomainWork: true, license: 'Public domain (published 1924)', category: 'AUDIO_RECORDING' });
    expect(data.files[0]).toEqual({ label: 'Recording', sourceUrl: 'https://archive.org/download/a/Erlk%C3%B6nig%20-%20SCHUMANN-HEINK.mp3', contentType: 'audio/mpeg', durationSeconds: 200 });
    expect(archiveItemData(record, files, 1920).isPublicDomainWork).toBe(false);
  });
});

describe('Europeana', () => {
  it('names open licences and rejects others', () => {
    expect(europeanaLicense('http://creativecommons.org/publicdomain/mark/1.0/')).toBe('Public Domain Mark 1.0');
    expect(europeanaLicense('http://creativecommons.org/licenses/by-sa/4.0/')).toBe('CC BY-SA 4.0');
    expect(europeanaLicense('http://rightsstatements.org/vocab/InC/1.0/')).toBeNull();
  });

  it('only fetches from public web addresses, never Gallica', () => {
    expect(isPublicMediaUrl('https://resource.culturalia.ro/public/a.mp3')).toBe(true);
    expect(isPublicMediaUrl('http://localhost/x')).toBe(false);
    expect(isPublicMediaUrl('http://10.0.0.5/x')).toBe(false);
    expect(isPublicMediaUrl('http://garage:3900/x')).toBe(false);
    expect(isPublicMediaUrl('http://gallica.bnf.fr/ark:/12148/x/f1.audio')).toBe(false);
    expect(isPublicMediaUrl('file:///etc/passwd')).toBe(false);
  });

  it('keeps open records with a media file', () => {
    const item = {
      id: '/2048128/618580',
      title: ['Moon Sonata'],
      dcCreator: ['Beethoven, Ludwig van (1770-1827). Composer'],
      year: ['1931'],
      rights: ['http://creativecommons.org/licenses/by-sa/4.0/'],
      dataProvider: ['Romanian Radio Broadcasting Company'],
      edmIsShownBy: ['https://resource.culturalia.ro/public/moon.mp3'],
    };
    expect(parseEuropeanaItem(item)).toMatchObject({ id: '2048128/618580', creator: 'Ludwig van Beethoven', performers: [], year: '1931', license: 'CC BY-SA 4.0' });
    expect(parseEuropeanaItem({ ...item, edmIsShownBy: undefined })).toBeNull();
    expect(parseEuropeanaItem({ ...item, dataProvider: ['National Library of France'] })).toBeNull();
    expect(parseEuropeanaItem({ ...item, rights: ['http://rightsstatements.org/vocab/InC/1.0/'] })).toBeNull();
  });
});

describe('recording details', () => {
  it('reads archive lengths in seconds and as a clock, and matrix numbers', () => {
    expect(parseLength('276.26')).toBe(276);
    expect(parseLength('04:46')).toBe(286);
    expect(parseLength('1:02:03')).toBe(3723);
    expect(parseLength('')).toBeUndefined();
    expect(matrixNumber(['urn:matrix_no:3815-c-13'])).toBe('3815-C-13');
    expect(matrixNumber(['urn:upc:123'])).toBeNull();
  });

  it('tells Europeana composers from performers', () => {
    expect(europeanaPerson('Benefelde, Ada, 1887-1967')).toEqual({ name: 'Ada Benefelde', died: 1967 });
    expect(europeanaPerson('Taube, Verners')).toEqual({ name: 'Verners Taube', died: null });
    expect(europeanaPerson('Beethoven, Ludwig van (1770-1827). Composer')).toEqual({ name: 'Ludwig van Beethoven', died: 1827 });
    // The plain field repeats names per language; Gounod (d. 1893) arranged, he didn't sing.
    expect(
      europeanaPeople({
        dcCreator: ['Bach, Johann Sebastian, 1685-1750', 'Bach, Johann Sebastian, 1685-1750'],
        dcContributor: ['Gounod, Charles, 1818-1893', 'Kārkliņa-Olava, Marina, 1908-', 'Karklin-Olava, Marina, 1908-'],
        dcContributorLangAware: { def: ['Gounod, Charles, 1818-1893', 'Kārkliņa-Olava, Marina, 1908-'], en: ['Karklin-Olava, Marina, 1908-'] },
      }),
    ).toEqual({ composers: ['Johann Sebastian Bach', 'Charles Gounod'], performers: ['Marina Kārkliņa-Olava'] });
  });

  it('scales Europeana durations to seconds', () => {
    expect(europeanaSeconds('162840')).toBe(163);
    expect(europeanaSeconds('162840000')).toBe(163);
    expect(europeanaSeconds(undefined)).toBeNull();
  });
});
