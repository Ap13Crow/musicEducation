// Library card thumbnails - .mscz zip extraction, per-source selection and
// fallbacks, and the backfill's bookkeeping.

jest.mock('@my-music-coach/bnf-gallica', () => ({
  bnfLibraryMediaEnabled: jest.fn().mockReturnValue(true),
  fetchPageImage: jest.fn(),
}));

import { deflateRawSync } from 'zlib';
import { bnfLibraryMediaEnabled, fetchPageImage } from '@my-music-coach/bnf-gallica';
import { backfillLibraryThumbnails, generateThumbnail, readZipEntry } from '../lib/libraryThumbnails';

// Builds a real zip: one local header + data per entry, a central
// directory, and the end-of-central-directory record.
function makeZip(entries: { name: string; data: Buffer; deflate?: boolean }[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const body = entry.deflate ? deflateRawSync(entry.data) : entry.data;
    const name = Buffer.from(entry.name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(entry.deflate ? 8 : 0, 8);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(entry.deflate ? 8 : 0, 10);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, body);
    centrals.push(central, name);
    offset += 30 + name.length + body.length;
  }
  const centralDirectory = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDirectory, eocd]);
}

const PNG = Buffer.from('89504e470d0a1a0a-fake-thumbnail');

describe('readZipEntry', () => {
  const zip = makeZip([
    { name: 'score_style.mss', data: Buffer.from('<style/>'), deflate: true },
    { name: 'Thumbnails/thumbnail.png', data: PNG, deflate: true },
    { name: 'stored.txt', data: Buffer.from('plain') },
  ]);

  it('extracts deflated and stored entries by name', () => {
    expect(readZipEntry(zip, 'Thumbnails/thumbnail.png')).toEqual(PNG);
    expect(readZipEntry(zip, 'stored.txt')?.toString()).toBe('plain');
  });

  it('returns null for a missing entry or a non-zip', () => {
    expect(readZipEntry(zip, 'nope.png')).toBeNull();
    expect(readZipEntry(Buffer.from('not a zip'), 'x')).toBeNull();
  });
});

describe('generateThumbnail', () => {
  afterEach(() => jest.restoreAllMocks());

  it("takes an OpenScore score's thumbnail from the .mscz next to its .mxl", async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(makeZip([{ name: 'Thumbnails/thumbnail.png', data: PNG, deflate: true }])));
    const thumbnail = await generateThumbnail({
      id: 'o1', source: 'OPENSCORE', ark: 'lieder:1', files: [],
      musicXmlSourceUrl: 'https://raw.githubusercontent.com/OpenScore/Lieder/sha/scores/X/lc1.mxl',
    });
    expect(thumbnail).toEqual({ bytes: PNG, contentType: 'image/png' });
    expect(String(fetchSpy.mock.calls[0][0])).toBe('https://raw.githubusercontent.com/OpenScore/Lieder/sha/scores/X/lc1.mscz');
  });

  it("falls back to the RDF's pngFile when a Mutopia piece's preview has another name", async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async (input: any) => {
      const url = String(input);
      if (url.endsWith('/belle-preview.png')) return new Response('missing', { status: 404 });
      if (url.endsWith('/belle.rdf')) return new Response('<mp:pngFile>belle-first.png</mp:pngFile>');
      if (url.endsWith('/belle-first.png')) return new Response(PNG);
      return new Response('?', { status: 500 });
    });
    const thumbnail = await generateThumbnail({ id: 'm1', source: 'MUTOPIA', ark: 'mutopia:ArbeauT/Orch/belle', files: [], musicXmlSourceUrl: null });
    expect(thumbnail).toEqual({ bytes: PNG, contentType: 'image/png' });
  });

  it('asks Gallica for page 1 at thumbnail width, only while BnF library media is enabled', async () => {
    (fetchPageImage as jest.Mock).mockResolvedValue({ bytes: Buffer.from('jpg'), contentType: 'image/jpeg' });
    await expect(generateThumbnail({ id: 'b1', source: 'BNF', ark: 'btv1b52500519p', files: [], musicXmlSourceUrl: null })).resolves.toEqual({
      bytes: Buffer.from('jpg'), contentType: 'image/jpeg',
    });
    expect(fetchPageImage).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: 'https://gallica.bnf.fr/iiif/ark:/12148/btv1b52500519p/f1/full/full/0/native.jpg' }),
      { width: 360 },
    );
    (bnfLibraryMediaEnabled as jest.Mock).mockReturnValueOnce(false);
    await expect(generateThumbnail({ id: 'b1', source: 'BNF', ark: 'btv1b52500519p', files: [], musicXmlSourceUrl: null })).resolves.toBeNull();
  });

  it('has nothing to fetch for a Musopen recording', async () => {
    await expect(generateThumbnail({ id: 'r1', source: 'MUSOPEN', ark: 'x', files: [], musicXmlSourceUrl: null })).resolves.toBeNull();
  });
});

describe('backfillLibraryThumbnails', () => {
  afterEach(() => jest.restoreAllMocks());

  it('stores each thumbnail, points thumbnailUrl at our route, and counts items without one', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async (input: any) =>
      String(input).includes('good') ? new Response(PNG) : new Response('missing', { status: 404 }),
    );
    const prisma: any = {
      libraryItem: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'g', source: 'MUTOPIA', ark: 'mutopia:A/B/good', files: [], musicXmlSourceUrl: null },
          { id: 'n', source: 'MUTOPIA', ark: 'mutopia:A/B/none', files: [], musicXmlSourceUrl: null },
        ]),
        update: jest.fn(),
      },
      libraryItemThumbnail: { upsert: jest.fn() },
    };

    await expect(backfillLibraryThumbnails(prisma)).resolves.toEqual({ total: 2, created: 1, failed: 1 });
    expect(prisma.libraryItemThumbnail.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { itemId: 'g' } }));
    expect(prisma.libraryItem.update).toHaveBeenCalledWith({ where: { id: 'g' }, data: { thumbnailUrl: '/api/library/items/g/thumbnail' } });
    expect(prisma.libraryItem.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ thumbnailUrl: null, hiddenAt: null }) }));
  });
});
