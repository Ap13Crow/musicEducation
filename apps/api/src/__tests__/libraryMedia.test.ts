// Gallica media for the public Library viewer - range serving (Gallica's
// .audio ignores Range, so we answer it) and shared upstream fetches.

jest.mock('@my-music-coach/bnf-gallica', () => ({
  getManifest: jest.fn(),
  fetchPageImage: jest.fn(),
  fetchPageAudio: jest.fn(),
}));

import { fetchPageImage, getManifest } from '@my-music-coach/bnf-gallica';
import { getLibraryPageImage, sendWithRange } from '../lib/libraryMedia';

function fakeRes() {
  const res: any = { statusCode: 200, headers: {} as Record<string, string>, body: undefined as Buffer | undefined };
  res.status = (code: number) => ((res.statusCode = code), res);
  res.setHeader = (name: string, value: string) => ((res.headers[name] = value), res);
  res.end = (body?: Buffer) => (res.body = body);
  return res;
}

const bytes = Buffer.from('0123456789');

describe('sendWithRange', () => {
  it('sends the whole body with accept-ranges when no Range is asked for', () => {
    const res = fakeRes();
    sendWithRange({ headers: {} } as any, res, bytes, 'audio/mpeg');
    expect(res.statusCode).toBe(200);
    expect(res.headers['accept-ranges']).toBe('bytes');
    expect(res.body).toEqual(bytes);
  });

  it('answers a bounded range with 206 and content-range', () => {
    const res = fakeRes();
    sendWithRange({ headers: { range: 'bytes=2-5' } } as any, res, bytes, 'audio/mpeg');
    expect(res.statusCode).toBe(206);
    expect(res.headers['content-range']).toBe('bytes 2-5/10');
    expect(res.body?.toString()).toBe('2345');
  });

  it('answers open-ended and suffix ranges', () => {
    const open = fakeRes();
    sendWithRange({ headers: { range: 'bytes=7-' } } as any, open, bytes, 'audio/mpeg');
    expect(open.body?.toString()).toBe('789');
    const suffix = fakeRes();
    sendWithRange({ headers: { range: 'bytes=-3' } } as any, suffix, bytes, 'audio/mpeg');
    expect(suffix.body?.toString()).toBe('789');
  });

  it('rejects an unsatisfiable range with 416', () => {
    const res = fakeRes();
    sendWithRange({ headers: { range: 'bytes=50-60' } } as any, res, bytes, 'audio/mpeg');
    expect(res.statusCode).toBe(416);
    expect(res.headers['content-range']).toBe('bytes */10');
  });
});

describe('getLibraryPageImage', () => {
  it('fetches the manifest and a scaled page once, sharing concurrent and repeat requests', async () => {
    (getManifest as jest.Mock).mockResolvedValue({
      ark: 'btv1test', title: 'T', permalink: 'p',
      pages: [{ pageNumber: 1, imageUrl: 'https://gallica.bnf.fr/iiif/x/f1/full/full/0/native.jpg', thumbnailUrl: '', audioUrl: '' }],
    });
    (fetchPageImage as jest.Mock).mockResolvedValue({ bytes: Buffer.from('jpg'), contentType: 'image/jpeg' });

    const [a, b] = await Promise.all([getLibraryPageImage('btv1test', 1), getLibraryPageImage('btv1test', 1)]);
    const c = await getLibraryPageImage('btv1test', 1);

    expect(a).toBe(b);
    expect(c).toBe(a);
    expect(getManifest).toHaveBeenCalledTimes(1);
    expect(fetchPageImage).toHaveBeenCalledTimes(1);
    expect(fetchPageImage).toHaveBeenCalledWith(expect.objectContaining({ pageNumber: 1 }), { width: 1600 });
  });

  it('returns null for a page the manifest does not have', async () => {
    await expect(getLibraryPageImage('btv1test', 99)).resolves.toBeNull();
  });
});
