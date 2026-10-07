// OpenScore Lieder import - parsing and record building against snippets of
// the corpus's real data/*.yaml files and tree paths (fetched 2026-10-07).

import {
  OPENSCORE_RAW_PREFIX,
  buildOpenScoreRecords,
  composerFromFolder,
  fetchScoreBytes,
  ingestOpenScoreCorpus,
  pdfFileLabel,
  isAllowedScoreSource,
  parseFlatYaml,
  titleFromScorePath,
} from '../lib/openscore';

const SCORES_YAML = `# Parse this file with StrictYAML - https://github.com/crdoconnor/strictyaml
6583477:
  path: Abbott,_Jane_Bingham/_/Just_for_Today
  imslp: '#412044'
  set_id: 5106766
  lyricist: Samuel Wilberforce
  language: EN
5015378:
  path: Schubert,_Franz/Winterreise,_D.911/01_Gute_Nacht
  language: DE
  instruments: Voice, Piano
`;

const COMPOSERS_YAML = `# Parse this file with StrictYAML
60159846:
  path: Abbott,_Jane_Bingham
  name: Jane Bingham Abbott
  born: 1851
7:
  path: Schubert,_Franz
  name: Franz Schubert
`;

const MXL_PATHS = [
  'scores/Abbott,_Jane_Bingham/_/Just_for_Today/lc6583477.mxl',
  'scores/Schubert,_Franz/Winterreise,_D.911/01_Gute_Nacht/lc5015378.mxl',
  'scores/Unknown/_/No_Metadata/lc999.mxl',
  'scores/Schubert,_Franz/Winterreise,_D.911/01_Gute_Nacht/README.md',
];

describe('parseFlatYaml', () => {
  it('reads two-level StrictYAML, unquoting values and skipping comments', () => {
    const parsed = parseFlatYaml(SCORES_YAML);
    expect(parsed['6583477']).toEqual({
      path: 'Abbott,_Jane_Bingham/_/Just_for_Today',
      imslp: '#412044',
      set_id: '5106766',
      lyricist: 'Samuel Wilberforce',
      language: 'EN',
    });
    expect(parsed['5015378'].instruments).toBe('Voice, Piano');
  });
});

describe('titleFromScorePath', () => {
  it('uses the song name alone for a standalone piece', () => {
    expect(titleFromScorePath('Abbott,_Jane_Bingham/_/Just_for_Today')).toBe('Just for Today');
  });

  it('strips the track number and appends the set', () => {
    expect(titleFromScorePath('Schubert,_Franz/Winterreise,_D.911/01_Gute_Nacht')).toBe('Gute Nacht (Winterreise, D.911)');
  });
});

describe('buildOpenScoreRecords', () => {
  const records = buildOpenScoreRecords('LIEDER', 'abc123', MXL_PATHS, parseFlatYaml(SCORES_YAML), parseFlatYaml(COMPOSERS_YAML));

  it('builds one record per .mxl file only', () => {
    expect(records.map((r) => r.ark)).toEqual(['lieder:6583477', 'lieder:5015378', 'lieder:999']);
  });

  it('maps composer, document type, links, and a commit-pinned, URL-encoded score source', () => {
    expect(records[1]).toEqual({
      ark: 'lieder:5015378',
      title: 'Gute Nacht (Winterreise, D.911)',
      creator: 'Franz Schubert',
      documentType: 'Lied · DE · Voice, Piano',
      permalink: 'https://musescore.com/score/5015378',
      catalogueUrl: null,
      musicXmlSourceUrl: `${OPENSCORE_RAW_PREFIX}Lieder/abc123/scores/Schubert%2C_Franz/Winterreise%2C_D.911/01_Gute_Nacht/lc5015378.mxl`,
      files: [],
    });
    expect(records[0].catalogueUrl).toBe('https://imslp.org/wiki/Special:ReverseLookup/412044');
  });

  it('still imports a score with no metadata entry, naming the composer from its folder', () => {
    expect(records[2]).toMatchObject({ title: 'No Metadata', creator: 'Unknown', documentType: 'Lied' });
  });

  it('derives "First Last" from a "Last,_First" folder', () => {
    expect(composerFromFolder('Hensel,_Fanny')).toBe('Fanny Hensel');
  });
});

describe('isAllowedScoreSource / fetchScoreBytes', () => {
  afterEach(() => jest.restoreAllMocks());

  it('only allows the OpenScore raw GitHub prefix', () => {
    expect(isAllowedScoreSource(`${OPENSCORE_RAW_PREFIX}Lieder/abc/x.mxl`)).toBe(true);
    expect(isAllowedScoreSource('https://raw.githubusercontent.com/evil/repo/x.mxl')).toBe(false);
    expect(isAllowedScoreSource('http://169.254.169.254/latest')).toBe(false);
  });

  it('refuses a disallowed URL without fetching', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    await expect(fetchScoreBytes('https://example.com/x.mxl')).rejects.toThrow('not allowed');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches once and serves repeats from the cache', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(new Uint8Array([0x50, 0x4b, 3, 4])));
    const url = `${OPENSCORE_RAW_PREFIX}Lieder/cache-test/a.mxl`;
    const first = await fetchScoreBytes(url);
    const second = await fetchScoreBytes(url);
    expect(first).toEqual(Buffer.from([0x50, 0x4b, 3, 4]));
    expect(second).toBe(first);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe('ingestOpenScoreCorpus', () => {
  afterEach(() => jest.restoreAllMocks());

  it('pins to the current commit and upserts every score as CC0 sheet music', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async (input: any) => {
      const url = String(input);
      if (url.endsWith('/commits/main')) return new Response(JSON.stringify({ sha: 'sha1' }));
      if (url.includes('/git/trees/sha1')) {
        return new Response(JSON.stringify({ truncated: false, tree: MXL_PATHS.map((path) => ({ path, type: 'blob' })) }));
      }
      if (url.endsWith('/data/scores.yaml')) return new Response(SCORES_YAML);
      if (url.endsWith('/data/composers.yaml')) return new Response(COMPOSERS_YAML);
      return new Response('not found', { status: 404 });
    });
    const upsert = jest.fn().mockResolvedValue({});
    const prisma = { libraryItem: { upsert } } as any;

    const result = await ingestOpenScoreCorpus(prisma, 'LIEDER');

    expect(result).toMatchObject({ fetched: 3, upserted: 3 });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { source_ark: { source: 'OPENSCORE', ark: 'lieder:5015378' } },
        create: expect.objectContaining({ source: 'OPENSCORE', category: 'SHEET_MUSIC', license: 'CC0-1.0', isPublicDomainWork: true }),
      }),
    );
  });

  it('fails loudly when GitHub is unreachable instead of importing nothing silently', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('rate limited', { status: 403 }));
    await expect(ingestOpenScoreCorpus({ libraryItem: { upsert: jest.fn() } } as any, 'LIEDER')).rejects.toThrow('403');
  });
});

describe('String Quartets corpus - real Arriaga folder layout (2026-10-07)', () => {
  const dir = 'scores/Arriaga,_Juan_Crisóstomo_de/String_Quartet_No.1_in_D_minor';
  const paths = [
    `${dir}/README.md`,
    `${dir}/sq13744399-Part-Viola.pdf`,
    `${dir}/sq13744399-Part-Violin_1.pdf`,
    `${dir}/sq13744399-Part-Violin_2.pdf`,
    `${dir}/sq13744399-Part-Violoncello.pdf`,
    `${dir}/sq13744399.mscx`,
    `${dir}/sq13744399.mxl`,
    `${dir}/sq13744399.pdf`,
  ];
  const scores = parseFlatYaml(`13744399:
  path: Arriaga,_Juan_Crisóstomo_de/String_Quartet_No.1_in_D_minor
  name: String Quartet No.1 in D minor
  imslp: '#33857'
`);
  const composers = parseFlatYaml(`313669:
  path: Arriaga,_Juan_Crisóstomo_de
  name: Juan Crisóstomo de Arriaga
`);
  const [record] = buildOpenScoreRecords('STRING_QUARTETS', 'sha2', paths, scores, composers);

  it('builds one record per work with its metadata title and composer', () => {
    expect(record).toMatchObject({
      ark: 'sq:13744399',
      title: 'String Quartet No.1 in D minor',
      creator: 'Juan Crisóstomo de Arriaga',
      documentType: 'String quartet',
      catalogueUrl: 'https://imslp.org/wiki/Special:ReverseLookup/33857',
    });
    expect(record.musicXmlSourceUrl.startsWith(`${OPENSCORE_RAW_PREFIX}StringQuartets/sha2/`)).toBe(true);
  });

  it('attaches the full score then parts in playing order, as PDFs', () => {
    expect(record.files.map((file) => file.label)).toEqual([
      'Full score (PDF)',
      'Violin 1 part (PDF)',
      'Violin 2 part (PDF)',
      'Viola part (PDF)',
      'Violoncello part (PDF)',
    ]);
    expect(record.files.every((file) => file.contentType === 'application/pdf' && isAllowedScoreSource(file.sourceUrl))).toBe(true);
  });

  it('labels PDF files', () => {
    expect(pdfFileLabel('sq1.pdf')).toBe('Full score (PDF)');
    expect(pdfFileLabel('sq1-Part-Violin_2.pdf')).toBe('Violin 2 part (PDF)');
  });
});
