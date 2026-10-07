import { mapDocumentTypeToCategory, ingestLibraryTopic, acquireLibraryIngestLock, releaseLibraryIngestLock } from '../libraryIngest.js';
import { searchCatalogue } from '../sru.js';

jest.mock('../sru.js', () => ({ searchCatalogue: jest.fn() }));

describe('mapDocumentTypeToCategory', () => {
  it('maps the confirmed-live single-word fragments to the right category', () => {
    expect(mapDocumentTypeToCategory('partition musicale')).toBe('SHEET_MUSIC');
    expect(mapDocumentTypeToCategory('document sonore')).toBe('AUDIO_RECORDING');
    expect(mapDocumentTypeToCategory('monographie imprimée')).toBe('BOOK');
  });

  it('falls back to OTHER for an unrecognized or missing type', () => {
    expect(mapDocumentTypeToCategory('carte postale')).toBe('OTHER');
    expect(mapDocumentTypeToCategory(null)).toBe('OTHER');
    expect(mapDocumentTypeToCategory(undefined)).toBe('OTHER');
  });
});

function fakePrisma() {
  return {
    libraryItem: { upsert: jest.fn().mockResolvedValue({}) },
    adminSetting: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({}),
    },
  } as any;
}

describe('acquireLibraryIngestLock / releaseLibraryIngestLock', () => {
  it('acquires the lock when none is held', async () => {
    const prisma = fakePrisma();
    await expect(acquireLibraryIngestLock(prisma)).resolves.toBe(true);
    expect(prisma.adminSetting.upsert).toHaveBeenCalled();
  });

  it('refuses to acquire a fresh lock someone else holds', async () => {
    const prisma = fakePrisma();
    prisma.adminSetting.findUnique.mockResolvedValue({ value: new Date().toISOString() });
    await expect(acquireLibraryIngestLock(prisma)).resolves.toBe(false);
    expect(prisma.adminSetting.upsert).not.toHaveBeenCalled();
  });

  it('treats a stale lock (older than the timeout) as free', async () => {
    const prisma = fakePrisma();
    prisma.adminSetting.findUnique.mockResolvedValue({ value: new Date(Date.now() - 60 * 60 * 1000).toISOString() });
    await expect(acquireLibraryIngestLock(prisma)).resolves.toBe(true);
  });

  it('releases the lock by deleting the setting row', async () => {
    const prisma = fakePrisma();
    await releaseLibraryIngestLock(prisma);
    expect(prisma.adminSetting.deleteMany).toHaveBeenCalledWith({ where: { key: 'bnf_library_ingest_running' } });
  });
});

describe('ingestLibraryTopic', () => {
  afterEach(() => jest.resetAllMocks());

  it('upserts every fetched record on the (source, ark) key with the mapped category', async () => {
    (searchCatalogue as jest.Mock).mockResolvedValue([
      {
        ark: 'bpt6k11767775',
        title: 'Messe de Requiem / par Mozart',
        creator: 'Mozart',
        date: null,
        documentType: 'partition musicale',
        isPublicDomainWork: true,
        catalogueUrl: null,
        permalink: 'https://gallica.bnf.fr/ark:/12148/bpt6k11767775',
      },
    ]);
    const prisma = fakePrisma();

    const result = await ingestLibraryTopic(prisma, 'Mozart Requiem', 'partition');

    expect(prisma.libraryItem.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { source_ark: { source: 'BNF', ark: 'bpt6k11767775' } },
        create: expect.objectContaining({ category: 'SHEET_MUSIC', seedQuery: 'Mozart Requiem' }),
      }),
    );
    expect(result).toEqual({
      query: 'Mozart Requiem',
      fetched: 1,
      upserted: 1,
      message: 'Library ingest for "Mozart Requiem" (partition) completed: 1/1 upserted.',
    });
  });

  it('skips a record whose upsert fails and logs a warning, without failing the whole run', async () => {
    (searchCatalogue as jest.Mock).mockResolvedValue([
      { ark: 'a', title: 'A', creator: null, date: null, documentType: null, isPublicDomainWork: false, catalogueUrl: null, permalink: 'x' },
      { ark: 'b', title: 'B', creator: null, date: null, documentType: null, isPublicDomainWork: false, catalogueUrl: null, permalink: 'y' },
    ]);
    const prisma = fakePrisma();
    prisma.libraryItem.upsert.mockRejectedValueOnce(new Error('db down')).mockResolvedValueOnce({});
    const warn = jest.fn();

    const result = await ingestLibraryTopic(prisma, 'topic', undefined, { info: jest.fn(), warn });

    expect(result.fetched).toBe(2);
    expect(result.upserted).toBe(1);
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ ark: 'a' }), expect.any(String));
  });
});
