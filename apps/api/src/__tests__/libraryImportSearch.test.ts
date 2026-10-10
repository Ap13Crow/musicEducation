jest.mock('@my-music-coach/bnf-gallica', () => ({
  GALLICA_MAX_PAGE_SIZE: 50,
  bnfAttribution: (title: string) => `${title} — source: gallica.bnf.fr / Bibliothèque nationale de France`,
  categorizeDocumentTypes: () => 'SHEET_MUSIC',
  searchCataloguePage: jest.fn(),
  getManifest: jest.fn(),
  fetchPageImage: jest.fn(),
  fetchPageAudio: jest.fn(),
}));
jest.mock('../lib/archive78', () => ({
  ...jest.requireActual('../lib/archive78'),
  searchSides: jest.fn(async () => ({ total: 0, sides: [] })),
  historicCutoffYear: jest.fn(async () => 1925),
}));
jest.mock('../lib/europeana', () => ({ ...jest.requireActual('../lib/europeana'), europeanaConfigured: () => false }));
jest.mock('../lib/dnb', () => ({
  ...jest.requireActual('../lib/dnb'),
  searchDnb: jest.fn(),
  fetchDnbRecords: jest.fn(),
}));

import { searchCataloguePage } from '@my-music-coach/bnf-gallica';
import { fetchDnbRecords, searchDnb } from '../lib/dnb';
import { __clearImportCache, importSelection, searchImportSources } from '../lib/libraryImportSearch';

const dnbRecord = {
  idn: '1376235218',
  title: "Gute Nacht : Lied aus Fr. Schubert's Winterreise",
  creator: 'Liszt, Franz',
  date: '2025',
  publisher: 'Universität der Künste Berlin',
  category: 'SHEET_MUSIC',
  documentType: 'Noten',
  summary: null,
  permalink: 'https://d-nb.info/1376235218',
  archiveUrl: 'https://d-nb.info/1376235218/34',
};
const bnfRecord = {
  ark: 'btv1b1234',
  title: 'Gute Nacht',
  creator: 'Liszt, Franz (1811-1886). Compositeur',
  date: '1840',
  documentType: 'partition musicale',
  documentTypes: ['partition musicale'],
  isPublicDomainWork: true,
  catalogueUrl: null,
  permalink: 'https://gallica.bnf.fr/ark:/12148/btv1b1234',
};

function fakePrisma(existing: any[] = [], pausedUntil?: string) {
  const created: any[] = [];
  return {
    created,
    libraryItem: {
      findMany: jest.fn(async () => existing),
      findUnique: jest.fn(async () => null),
      create: jest.fn(async ({ data }: any) => {
        const row = { id: `new-${created.length + 1}`, shortId: 'abc', ...data };
        created.push(row);
        return row;
      }),
    },
    adminSetting: {
      findUnique: jest.fn(async () => (pausedUntil ? { value: pausedUntil } : null)),
      upsert: jest.fn(async () => ({})),
    },
  } as any;
}

beforeEach(() => {
  jest.clearAllMocks();
  __clearImportCache();
  (searchDnb as jest.Mock).mockResolvedValue({ total: 66, records: [dnbRecord] });
  (searchCataloguePage as jest.Mock).mockResolvedValue({ total: 120, records: [bnfRecord] });
});

describe('searchImportSources', () => {
  it('asks both sources for the same page and reports the largest page count', async () => {
    const result = await searchImportSources(fakePrisma(), { query: 'Gute Nacht', page: 2, pageSize: 25, category: 'SHEET_MUSIC', yearFrom: 1800 });
    expect(searchDnb).toHaveBeenCalledWith(expect.objectContaining({ query: 'Gute Nacht', category: 'SHEET_MUSIC', yearFrom: 1800 }), 2, 25);
    expect(searchCataloguePage).toHaveBeenCalledWith(expect.objectContaining({ documentType: 'partition', yearFrom: 1800 }), 2, 25);
    expect(result.totalPages).toBe(5);
    expect(result.sources.map((source) => [source.source, source.total])).toEqual([['BNF', 120], ['DNB', 66], ['INTERNET_ARCHIVE', 0], ['EUROPEANA', 0]]);
  });

  it('flags rows already in the Library and lookalikes from the other source', async () => {
    const prisma = fakePrisma([{ id: 'item-1', shortId: 's1', title: 'Gute Nacht', source: 'BNF', ark: 'btv1b1234', creator: 'Liszt, Franz', titleKey: 'gute nacht' }]);
    const result = await searchImportSources(prisma, { query: 'Gute Nacht' });
    const bnf = result.sources.find((source) => source.source === 'BNF')!.candidates[0];
    const dnb = result.sources.find((source) => source.source === 'DNB')!.candidates[0];
    expect(bnf.inLibrary).toMatchObject({ id: 'item-1' });
    expect(dnb.inLibrary).toBeNull();
    expect(dnb.possibleDuplicates[0]).toMatchObject({ id: 'item-1', source: 'BNF' });
  });

  it('keeps answering from one source when the other fails', async () => {
    (searchCataloguePage as jest.Mock).mockRejectedValue(new Error('Gallica SRU search failed (HTTP 403).'));
    const prisma = fakePrisma();
    const result = await searchImportSources(prisma, { query: 'Schubert' });
    expect(result.sources.find((source) => source.source === 'BNF')).toMatchObject({ total: 0, error: expect.stringMatching(/refused/) });
    expect(result.sources.find((source) => source.source === 'DNB')!.candidates).toHaveLength(1);
    // A refusal pauses every Gallica caller.
    expect(prisma.adminSetting.upsert).toHaveBeenCalled();
  });

  it('does not contact Gallica while it is paused', async () => {
    const prisma = fakePrisma([], new Date(Date.now() + 60_000).toISOString());
    const result = await searchImportSources(prisma, { query: 'Schubert' });
    expect(searchCataloguePage).not.toHaveBeenCalled();
    expect(result.sources.find((source) => source.source === 'BNF')!.error).toMatch(/leaving it alone/);
  });
});

describe('importSelection', () => {
  it('creates new items from source data, never twice', async () => {
    (fetchDnbRecords as jest.Mock).mockResolvedValue([dnbRecord]);
    const prisma = fakePrisma([{ id: 'item-1', shortId: 's1', title: 'Old', source: 'DNB', ark: '1111111111' }]);
    await searchImportSources(prisma, { query: 'Gute Nacht' });
    prisma.libraryItem.findMany.mockResolvedValueOnce([{ id: 'item-1', shortId: 's1', title: 'Old', source: 'DNB', ark: '1111111111' }]);

    const result = await importSelection(
      prisma,
      [
        { source: 'DNB', externalId: '1376235218' },
        { source: 'DNB', externalId: '1376235218' },
        { source: 'BNF', externalId: 'btv1b1234' },
        { source: 'DNB', externalId: '1111111111' },
      ],
      'Gute Nacht',
    );
    expect(result.imported.map((item) => item.source)).toEqual(['DNB', 'BNF']);
    expect(result.alreadyInLibrary).toEqual([expect.objectContaining({ id: 'item-1' })]);
    expect(fetchDnbRecords).toHaveBeenCalledWith(['1376235218']);
    expect(prisma.created[0]).toMatchObject({
      source: 'DNB',
      ark: '1376235218',
      category: 'SHEET_MUSIC',
      license: 'Free online access (DNB)',
      attribution: 'Source: Deutsche Nationalbibliothek · Universität der Künste Berlin',
    });
    expect(prisma.created[1]).toMatchObject({ source: 'BNF', ark: 'btv1b1234', isPublicDomainWork: true });
  });

  it('asks for a new search when a Gallica row is no longer remembered', async () => {
    const result = await importSelection(fakePrisma(), [{ source: 'BNF', externalId: 'btv1b9999' }], null);
    expect(result.failed[0].reason).toMatch(/search again/);
  });

  it('treats a concurrent import as already in the Library', async () => {
    (fetchDnbRecords as jest.Mock).mockResolvedValue([dnbRecord]);
    const prisma = fakePrisma();
    prisma.libraryItem.create.mockRejectedValueOnce(Object.assign(new Error('unique'), { code: 'P2002' }));
    prisma.libraryItem.findUnique.mockResolvedValueOnce({ id: 'x', shortId: 'y', title: 'Gute Nacht', source: 'DNB' });
    const result = await importSelection(prisma, [{ source: 'DNB', externalId: '1376235218' }], null);
    expect(result.imported).toHaveLength(0);
    expect(result.alreadyInLibrary).toEqual([expect.objectContaining({ id: 'x' })]);
  });
});
