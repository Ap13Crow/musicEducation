// Musopen (archive.org) and Mutopia importers - against the exact formats
// captured live on 2026-10-07.

import {
  ARCHIVE_DOWNLOAD_PREFIX,
  MUTOPIA_FTP_PREFIX,
  buildMusopenRecords,
  buildMutopiaRecord,
  mutopiaPieceFolders,
  parseDuration,
  parseMusopenTitle,
  parseMutopiaComposers,
  repairMojibake,
} from '../lib/openSources';

describe('parseMusopenTitle', () => {
  it('handles number-before-work (Goldberg), work-then-number, and single-movement titles', () => {
    expect(parseMusopenTitle('Johann Sebastian Bach - 01 - Goldberg Variations, BWV. 988 - Aria')).toEqual({
      composer: 'Johann Sebastian Bach', work: 'Goldberg Variations, BWV. 988', movement: 'Aria',
    });
    expect(parseMusopenTitle('Alexander Borodin - String Quartet No. 1 in A Major - 01 - Moderato - Allegro')).toEqual({
      composer: 'Alexander Borodin', work: 'String Quartet No. 1 in A Major', movement: 'Moderato - Allegro',
    });
    expect(parseMusopenTitle('Ludwig van Beethoven - Coriolan Overture')).toEqual({
      composer: 'Ludwig van Beethoven', work: 'Coriolan Overture', movement: 'Coriolan Overture',
    });
  });
});

describe('repairMojibake / parseDuration', () => {
  it('re-decodes double-encoded UTF-8 and leaves clean text alone', () => {
    // Exactly as archive.org returns them (cp1252 mis-decode: ř -> "Å™").
    expect(repairMojibake('AntonÃ­n DvoÅ™Ã¡k')).toBe('Antonín Dvořák');
    expect(repairMojibake('BedÅ™ich Smetana - MÃ¡ vlast')).toBe('Bedřich Smetana - Má vlast');
    expect(repairMojibake("'PathÃ©tique'")).toBe("'Pathétique'");
    expect(repairMojibake('Frédéric Chopin')).toBe('Frédéric Chopin');
  });

  it('reads mm:ss, h:mm:ss and seconds', () => {
    expect(parseDuration('01:35')).toBe(95);
    expect(parseDuration('1:02:03')).toBe(3723);
    expect(parseDuration('339.97')).toBe(340);
    expect(parseDuration(undefined)).toBeUndefined();
  });
});

describe('buildMusopenRecords', () => {
  const files = [
    { name: 'Bach_GoldbergVariations/JohannSebastianBach-02-GoldbergVariationsBwv.988-Variation1.mp3', title: 'Johann Sebastian Bach - 02 - Goldberg Variations, BWV. 988 - Variation 1', creator: 'Shelley Katz', length: '01:54' },
    { name: 'Bach_GoldbergVariations/JohannSebastianBach-01-GoldbergVariationsBwv.988-Aria.mp3', title: 'Johann Sebastian Bach - 01 - Goldberg Variations, BWV. 988 - Aria', creator: 'Shelley Katz', length: '04:52' },
    { name: 'Bach_GoldbergVariations/JohannSebastianBach-01-GoldbergVariationsBwv.988-Aria.flac', format: 'Flac' },
    { name: 'Suk_Meditation/JosefSuk-Meditation.mp3', title: 'Josef Suk - Meditation', creator: 'Musopen String Quartet', length: '07:10' },
  ];

  it('groups a folder into one work whose movements are an ordered playlist streamed from archive.org', () => {
    const records = buildMusopenRecords('MusopenCollectionAsFlac', 'folder', 'Public Domain Mark 1.0', files);
    expect(records).toHaveLength(2);
    const goldberg = records[0];
    expect(goldberg).toMatchObject({
      ark: 'MusopenCollectionAsFlac:Bach_GoldbergVariations',
      category: 'AUDIO_RECORDING',
      title: 'Goldberg Variations, BWV. 988',
      creator: 'Johann Sebastian Bach',
      documentType: 'Recording · Shelley Katz',
      license: 'Public Domain Mark 1.0',
    });
    expect(goldberg.files.map((f) => [f.label, f.durationSeconds])).toEqual([['Aria', 292], ['Variation 1', 114]]);
    expect(goldberg.files[0].sourceUrl.startsWith(`${ARCHIVE_DOWNLOAD_PREFIX}MusopenCollectionAsFlac/Bach_GoldbergVariations/`)).toBe(true);
  });

  it('makes one item per file with a fixed composer for the Chopin set', () => {
    const [record] = buildMusopenRecords('musopen-chopin-complete-works-flac', 'file', 'CC0-1.0', [
      { name: 'Allegro de concert, Op. 46.mp3', title: 'Allegro de concert, op. 46 in A major', creator: 'Olga Gurevich', length: '12:40' },
    ], 'Frédéric Chopin');
    expect(record).toMatchObject({ title: 'Allegro de concert, op. 46 in A major', creator: 'Frédéric Chopin', documentType: 'Recording · Olga Gurevich' });
    expect(record.files[0].sourceUrl).toBe(`${ARCHIVE_DOWNLOAD_PREFIX}musopen-chopin-complete-works-flac/Allegro%20de%20concert%2C%20Op.%2046.mp3`);
  });
});

describe('Mutopia', () => {
  it('finds single-file and multi-file piece folders', () => {
    expect(
      mutopiaPieceFolders([
        'ftp/ArbeauT/Orch/belle/belle.ly',
        'ftp/BachJS/BWV828/4-Partita/4-Partita-lys',
        'ftp/BachJS/BWV828/4-Partita/4-Partita-lys/readme.txt',
        'ftp/BachJS/BWV828/4-Partita/other.ly',
        'collections/kv487/index.html',
      ]),
    ).toEqual(['ftp/ArbeauT/Orch/belle', 'ftp/BachJS/BWV828/4-Partita']);
  });

  it('maps composer codes to names from browse.html', () => {
    const composers = parseMutopiaComposers(
      `<a href='cgibin/make-table.cgi?Composer=AbtF'>F. Abt (1819–1885)</a> [2]<a href='cgibin/make-table.cgi?Composer=AlbenizIMF'>I. M. F. Albéniz (1860–1909)</a>`,
    );
    expect(composers.get('AbtF')).toBe('F. Abt');
    expect(composers.get('AlbenizIMF')).toBe('I. M. F. Albéniz');
  });

  const rdf = `<rdf:Description rdf:about=".">
    <mp:title>Pavan: Belle qui tiens ma Vie</mp:title>
    <mp:composer>ArbeauT</mp:composer>
    <mp:opus>Orchésographie</mp:opus>
    <mp:for>Voice (SATB)</mp:for>
    <mp:date>1588</mp:date>
    <mp:style>Renaissance</mp:style>
    <mp:licence>Public Domain</mp:licence>
    <mp:pdfFileA4>belle-a4.pdf</mp:pdfFileA4>
    <mp:pdfFileLet>belle-let.pdf</mp:pdfFileLet>
    <mp:maintainer>Peter Chubb</mp:maintainer>
</rdf:Description>`;

  it('builds a sheet-music record with A4 and Letter PDFs and attribution', () => {
    const record = buildMutopiaRecord('ftp/ArbeauT/Orch/belle', rdf, new Map([['ArbeauT', 'T. Arbeau']]));
    expect(record).toEqual({
      ark: 'mutopia:ArbeauT/Orch/belle',
      category: 'SHEET_MUSIC',
      title: 'Pavan: Belle qui tiens ma Vie (Orchésographie)',
      creator: 'T. Arbeau',
      date: '1588',
      documentType: 'Engraved score · Voice (SATB) · Renaissance',
      permalink: `${MUTOPIA_FTP_PREFIX}ArbeauT/Orch/belle/`,
      license: 'Public Domain',
      attribution: 'Mutopia Project (mutopiaproject.org) - typeset by Peter Chubb · Public Domain',
      files: [
        { label: 'Score (PDF, A4)', sourceUrl: `${MUTOPIA_FTP_PREFIX}ArbeauT/Orch/belle/belle-a4.pdf`, contentType: 'application/pdf' },
        { label: 'Score (PDF, Letter)', sourceUrl: `${MUTOPIA_FTP_PREFIX}ArbeauT/Orch/belle/belle-let.pdf`, contentType: 'application/pdf' },
      ],
    });
  });

  it('skips a piece with no licence or no PDF', () => {
    expect(buildMutopiaRecord('ftp/X/Y/z', rdf.replace(/<mp:licence>.*<\/mp:licence>/, ''), new Map())).toBeNull();
    expect(buildMutopiaRecord('ftp/X/Y/z', rdf.replace(/<mp:pdfFile\w+>.*<\/mp:pdfFile\w+>/g, ''), new Map())).toBeNull();
  });
});
