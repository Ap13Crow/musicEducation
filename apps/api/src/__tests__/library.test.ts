// Unit tests for the Library resolver - public browsing is always open (no
// requireAuth call at all, matching Query.events); stats/export/ingest are
// ADMIN-only. The real BnF/Gallica network calls are covered in
// packages/bnf-gallica/src/__tests__ against live-captured fixtures.

jest.mock('@my-music-coach/bnf-gallica', () => ({
  ingestLibraryTopic: jest.fn(),
  acquireLibraryIngestLock: jest.fn().mockResolvedValue(true),
  releaseLibraryIngestLock: jest.fn().mockResolvedValue(undefined),
  bnfLibraryMediaEnabled: jest.fn().mockReturnValue(false),
}));

jest.mock('../lib/openscore', () => ({ ingestOpenScoreCorpus: jest.fn() }));

import { ingestLibraryTopic, acquireLibraryIngestLock, releaseLibraryIngestLock, bnfLibraryMediaEnabled } from '@my-music-coach/bnf-gallica';
import { ingestOpenScoreCorpus } from '../lib/openscore';
import { libraryResolvers } from '../resolvers/library';

const adminUser = { id: 'admin-1', role: 'ADMIN' } as const;
const studentUser = { id: 'student-1', role: 'STUDENT' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

describe('Query.libraryItems / libraryItem - public, no auth', () => {
  it('lists non-hidden items with pagination info, with no user in context at all', async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]);
    const count = jest.fn().mockResolvedValue(2);
    const prisma = fakePrisma({ libraryItem: { findMany, count } });

    const result = await libraryResolvers.Query.libraryItems(null, {}, { prisma, user: null } as any);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { hiddenAt: null } }));
    expect(result).toEqual({ nodes: [{ id: '1' }, { id: '2' }], pageInfo: { hasNextPage: false, hasPreviousPage: false, totalCount: 2 } });
  });

  it('filters by category and query text', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = fakePrisma({ libraryItem: { findMany, count } });

    await libraryResolvers.Query.libraryItems(null, { filter: { category: 'SHEET_MUSIC', query: 'Mozart' } }, { prisma, user: null } as any);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'SHEET_MUSIC',
          OR: [{ title: { contains: 'Mozart', mode: 'insensitive' } }, { creator: { contains: 'Mozart', mode: 'insensitive' } }],
        }),
      }),
    );
  });

  it('returns null for a hidden item rather than exposing it', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: '1', hiddenAt: new Date() });
    const prisma = fakePrisma({ libraryItem: { findUnique } });
    await expect(libraryResolvers.Query.libraryItem(null, { id: '1' }, { prisma, user: null } as any)).resolves.toBeNull();
  });
});

describe('Query.libraryStats / exportLibraryItemsCsv - ADMIN only', () => {
  afterEach(() => jest.resetAllMocks());

  it('rejects a non-admin caller for libraryStats', async () => {
    const prisma = fakePrisma();
    await expect(libraryResolvers.Query.libraryStats(null, {}, { prisma, user: studentUser } as any)).rejects.toThrow('FORBIDDEN');
  });

  it('rejects a non-admin caller for exportLibraryItemsCsv', async () => {
    const prisma = fakePrisma();
    await expect(libraryResolvers.Query.exportLibraryItemsCsv(null, {}, { prisma, user: studentUser } as any)).rejects.toThrow('FORBIDDEN');
  });

  it('exports CSV rows for an admin, quoting fields that contain a comma', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: '1',
        source: 'BNF',
        ark: 'bpt6k1',
        category: 'SHEET_MUSIC',
        title: 'Requiem, K. 626',
        creator: 'Mozart',
        date: '1791',
        documentType: 'partition musicale',
        isPublicDomainWork: true,
        permalink: 'https://gallica.bnf.fr/ark:/12148/bpt6k1',
        hiddenAt: null,
      },
    ]);
    const prisma = fakePrisma({ libraryItem: { findMany } });

    const csv = await libraryResolvers.Query.exportLibraryItemsCsv(null, {}, { prisma, user: adminUser } as any);

    expect(csv.split('\n')[0]).toBe('id,source,ark,category,title,creator,date,documentType,isPublicDomainWork,permalink,hiddenAt');
    expect(csv).toContain('"Requiem, K. 626"');
  });
});

describe('Mutation.runLibraryIngest - ADMIN only, advisory-locked', () => {
  afterEach(() => jest.resetAllMocks());

  it('rejects a non-admin caller without acquiring the lock', async () => {
    const prisma = fakePrisma();
    await expect(
      libraryResolvers.Mutation.runLibraryIngest(null, { query: 'Mozart' }, { prisma, user: studentUser } as any),
    ).rejects.toThrow('FORBIDDEN');
    expect(acquireLibraryIngestLock).not.toHaveBeenCalled();
  });

  it('rejects with CONFLICT when a run is already in progress, without calling the ingest function', async () => {
    (acquireLibraryIngestLock as jest.Mock).mockResolvedValue(false);
    const prisma = fakePrisma();

    await expect(
      libraryResolvers.Mutation.runLibraryIngest(null, { query: 'Mozart' }, { prisma, user: adminUser } as any),
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    expect(ingestLibraryTopic).not.toHaveBeenCalled();
  });

  it('runs the ingest and always releases the lock, even on failure', async () => {
    (acquireLibraryIngestLock as jest.Mock).mockResolvedValue(true);
    (ingestLibraryTopic as jest.Mock).mockRejectedValue(new Error('Gallica down'));
    const prisma = fakePrisma();

    await expect(
      libraryResolvers.Mutation.runLibraryIngest(null, { query: 'Mozart' }, { prisma, user: adminUser } as any),
    ).rejects.toThrow('Gallica down');
    expect(releaseLibraryIngestLock).toHaveBeenCalledWith(prisma);
  });
});

describe('LibraryItem.scoreUrl', () => {
  it('points at our own same-origin route only when a score source is stored', () => {
    expect(libraryResolvers.LibraryItem.scoreUrl({ id: 'i1', musicXmlSourceUrl: 'https://raw.githubusercontent.com/OpenScore/x.mxl' })).toBe(
      '/api/library/items/i1/score.mxl',
    );
    expect(libraryResolvers.LibraryItem.scoreUrl({ id: 'i2', musicXmlSourceUrl: null })).toBeNull();
  });
});

describe('Mutation.runOpenScoreIngest - ADMIN only', () => {
  afterEach(() => jest.resetAllMocks());

  it('rejects a non-admin caller without importing', async () => {
    await expect(
      libraryResolvers.Mutation.runOpenScoreIngest(null, {}, { prisma: fakePrisma(), user: studentUser } as any),
    ).rejects.toThrow('FORBIDDEN');
    expect(ingestOpenScoreCorpus).not.toHaveBeenCalled();
  });

  it('returns the import result, and allows a new run after a failure', async () => {
    (ingestOpenScoreCorpus as jest.Mock).mockRejectedValueOnce(new Error('GitHub down'));
    const ctx = { prisma: fakePrisma(), user: adminUser } as any;
    await expect(libraryResolvers.Mutation.runOpenScoreIngest(null, {}, ctx)).rejects.toThrow('GitHub down');

    (ingestOpenScoreCorpus as jest.Mock).mockResolvedValueOnce({ query: 'OpenScore Lieder', fetched: 2, upserted: 2, message: 'ok' });
    await expect(libraryResolvers.Mutation.runOpenScoreIngest(null, {}, ctx)).resolves.toMatchObject({ upserted: 2 });
  });

  it('imports the requested corpus and rejects an unknown one', async () => {
    const ctx = { prisma: fakePrisma(), user: adminUser } as any;
    (ingestOpenScoreCorpus as jest.Mock).mockResolvedValueOnce({ upserted: 1 });
    await libraryResolvers.Mutation.runOpenScoreIngest(null, { corpus: 'STRING_QUARTETS' }, ctx);
    expect(ingestOpenScoreCorpus).toHaveBeenCalledWith(ctx.prisma, 'STRING_QUARTETS');
    await expect(libraryResolvers.Mutation.runOpenScoreIngest(null, { corpus: 'JAZZ' }, ctx)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });
});

describe('LibraryItem.embedUrl', () => {
  it("is Gallica's own player for BnF items, null otherwise or for a malformed ark", () => {
    expect(libraryResolvers.LibraryItem.embedUrl({ source: 'BNF', ark: 'bpt6k127536f' })).toBe(
      'https://gallica.bnf.fr/ark:/12148/bpt6k127536f/f1.media.mini',
    );
    expect(libraryResolvers.LibraryItem.embedUrl({ source: 'OPENSCORE', ark: 'lieder:1' })).toBeNull();
    expect(libraryResolvers.LibraryItem.embedUrl({ source: 'BNF', ark: 'x"><script>' })).toBeNull();
  });
});

describe('LibraryItem.pagesUrl', () => {
  it('is null for BnF items until library media is enabled, and never set for other sources', () => {
    (bnfLibraryMediaEnabled as jest.Mock).mockReturnValue(false);
    expect(libraryResolvers.LibraryItem.pagesUrl({ id: 'b1', source: 'BNF' })).toBeNull();
    (bnfLibraryMediaEnabled as jest.Mock).mockReturnValue(true);
    expect(libraryResolvers.LibraryItem.pagesUrl({ id: 'b1', source: 'BNF' })).toBe('/api/library/items/b1/pages.json');
    expect(libraryResolvers.LibraryItem.pagesUrl({ id: 'o1', source: 'OPENSCORE' })).toBeNull();
  });
});

describe('LibraryItem.files', () => {
  it('exposes stored files only through our own indexed route', () => {
    const files = libraryResolvers.LibraryItem.files({
      id: 'q1',
      files: [{ label: 'Full score (PDF)', sourceUrl: 'https://raw.githubusercontent.com/OpenScore/x.pdf', contentType: 'application/pdf' }],
    });
    expect(files).toEqual([{ label: 'Full score (PDF)', url: '/api/library/items/q1/files/0.pdf', contentType: 'application/pdf', durationSeconds: null }]);
    expect(libraryResolvers.LibraryItem.files({ id: 'q2', files: null })).toEqual([]);
  });

  it('streams archive.org audio directly, with its duration', () => {
    const url = 'https://archive.org/download/MusopenCollectionAsFlac/Suk_Meditation/a.mp3';
    expect(libraryResolvers.LibraryItem.files({ id: 'm1', files: [{ label: 'Meditation', sourceUrl: url, contentType: 'audio/mpeg', durationSeconds: 430 }] })).toEqual([
      { label: 'Meditation', url, contentType: 'audio/mpeg', durationSeconds: 430 },
    ]);
  });
});
