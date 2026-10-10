jest.mock('@my-music-coach/bnf-gallica', () => ({
  getManifest: jest.fn(),
  fetchPageImage: jest.fn(),
  fetchPageAudio: jest.fn(),
}));
jest.mock('../lib/libraryMediaStore', () => ({
  libraryMediaStoreConfigured: jest.fn().mockReturnValue(true),
  storeLibraryObject: jest.fn(async (_prisma: unknown, bytes: Buffer) => `sha-${bytes.toString()}`),
}));

import { fetchPageImage, getManifest } from '@my-music-coach/bnf-gallica';
import { storeLibraryObject } from '../lib/libraryMediaStore';
import { mirrorItem, runLibraryMirror } from '../lib/libraryMirror';

process.env.BNF_MIRROR_INTERVAL_MS = '0';

function fakePrisma(items: any[] = [], stored: { kind: string; position: number }[] = [], pausedUntil?: string) {
  const settings = new Map<string, string>(pausedUntil ? [['library_mirror:bnf_paused_until', pausedUntil]] : []);
  return {
    settings,
    libraryItem: {
      findMany: jest.fn(async () => items),
      update: jest.fn(async () => ({})),
    },
    libraryItemMedia: {
      findMany: jest.fn(async () => stored),
      upsert: jest.fn(async () => ({})),
    },
    libraryItemThumbnail: { upsert: jest.fn(async () => ({})) },
    adminSetting: {
      findUnique: jest.fn(async ({ where }: any) => (settings.has(where.key) ? { key: where.key, value: settings.get(where.key) } : null)),
      upsert: jest.fn(async ({ where, create }: any) => settings.set(where.key, create.value)),
    },
  } as any;
}

const pdfItem = {
  id: 'mut1',
  source: 'MUTOPIA',
  ark: 'mutopia:x',
  category: 'SHEET_MUSIC',
  musicXmlSourceUrl: null,
  thumbnailUrl: '/t',
  files: [
    { label: 'A4', sourceUrl: 'https://www.mutopiaproject.org/ftp/x/a4.pdf', contentType: 'application/pdf' },
    { label: 'Letter', sourceUrl: 'https://www.mutopiaproject.org/ftp/x/let.pdf', contentType: 'application/pdf' },
  ],
};

const bnfItem = { id: 'b1', source: 'BNF', ark: 'btv1b1', category: 'SHEET_MUSIC', musicXmlSourceUrl: null, thumbnailUrl: null, files: [] };

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn(async (url: string) => new Response(Buffer.from(String(url).split('/').pop()!), { status: 200, headers: { 'content-type': 'application/pdf' } })) as any;
});

describe('library mirror', () => {
  it('stores every file of an item and skips the ones already stored', async () => {
    const prisma = fakePrisma([], [{ kind: 'FILE', position: 0 }]);
    await mirrorItem(prisma, { ...pdfItem }, 0);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(storeLibraryObject).toHaveBeenCalledWith(prisma, Buffer.from('let.pdf'), 'application/pdf');
    expect(prisma.libraryItemMedia.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ itemId: 'mut1', kind: 'FILE', position: 1, sha256: 'sha-let.pdf' }) }),
    );
  });

  it('never downloads from a host outside the allowlist', async () => {
    const prisma = fakePrisma();
    const item = { ...pdfItem, files: [{ label: 'x', sourceUrl: 'https://evil.example/x.pdf', contentType: 'application/pdf' }] };
    await expect(mirrorItem(prisma, item, 0)).rejects.toThrow('not allowlisted');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('stores Gallica pages at 1000 px and uses page 1 as the card image', async () => {
    (getManifest as jest.Mock).mockResolvedValue({ pages: [{ pageNumber: 1, label: 'p1', imageUrl: 'i1', audioUrl: 'a1' }, { pageNumber: 2, label: null, imageUrl: 'i2', audioUrl: 'a2' }] });
    (fetchPageImage as jest.Mock).mockImplementation(async (page: any) => ({ bytes: Buffer.from(page.imageUrl), contentType: 'image/jpeg' }));
    const prisma = fakePrisma();
    await mirrorItem(prisma, { ...bnfItem }, 0);
    expect(fetchPageImage).toHaveBeenCalledWith(expect.objectContaining({ pageNumber: 1 }), { width: 1000 });
    expect(prisma.libraryItemMedia.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.libraryItemThumbnail.upsert).toHaveBeenCalledTimes(1);
  });

  it('pauses all Gallica downloads on a 403 without blaming the item, and keeps other sources going', async () => {
    (getManifest as jest.Mock).mockRejectedValue(new Error('Gallica request failed: HTTP 403 for https://gallica.bnf.fr/...'));
    const prisma = fakePrisma([{ ...bnfItem }, { ...bnfItem, id: 'b2' }, { ...pdfItem }]);
    const result = await runLibraryMirror(prisma);
    expect(result.blocked).toEqual(['BNF']);
    expect(result.mirrored).toBe(1);
    expect(getManifest).toHaveBeenCalledTimes(1);
    expect(new Date(prisma.settings.get('library_mirror:bnf_paused_until')).getTime()).toBeGreaterThan(Date.now());
    const attemptsCounted = prisma.libraryItem.update.mock.calls.some(([args]: any) => args.data.mirrorAttempts);
    expect(attemptsCounted).toBe(false);
  });

  it('does not contact Gallica at all while paused', async () => {
    const prisma = fakePrisma([{ ...bnfItem }], [], new Date(Date.now() + 60_000).toISOString());
    const result = await runLibraryMirror(prisma);
    expect(getManifest).not.toHaveBeenCalled();
    expect(result.blocked).toEqual(['BNF']);
  });

  it('counts a failed attempt for an item-specific error', async () => {
    global.fetch = jest.fn(async () => new Response('gone', { status: 404 })) as any;
    const prisma = fakePrisma([{ ...pdfItem }]);
    const result = await runLibraryMirror(prisma);
    expect(result.failed).toBe(1);
    expect(prisma.libraryItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'mut1' }, data: expect.objectContaining({ mirrorAttempts: { increment: 1 } }) }),
    );
  });
});
