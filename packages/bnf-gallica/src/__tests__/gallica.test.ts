import { getManifest, fetchPageImage, fetchPageAudio, sizedImageUrl } from '../gallica.js';
import { bnfLibraryMediaEnabled } from '../config.js';
import { BnfRequestError } from '../types.js';

// Real IIIF manifest from https://gallica.bnf.fr/iiif/ark:/12148/bpt6k11767775/manifest.json,
// trimmed to its first two canvases (captured during integration testing
// against the documented endpoint; CI never calls the live endpoint).
const MANIFEST_FIXTURE = {
  '@id': 'https://gallica.bnf.fr/iiif/ark:/12148/bpt6k11767775/manifest.json',
  label: 'Ancien fonds du Conservatoire, L-738',
  related: 'https://gallica.bnf.fr/ark:/12148/bpt6k11767775',
  sequences: [
    {
      canvases: [
        {
          '@id': 'https://gallica.bnf.fr/iiif/ark:/12148/bpt6k11767775/canvas/f1',
          label: 'plat sup.',
          images: [
            {
              resource: { '@id': 'https://gallica.bnf.fr/iiif/ark:/12148/bpt6k11767775/f1/full/full/0/native.jpg' },
            },
          ],
          thumbnail: { '@id': 'https://gallica.bnf.fr/ark:/12148/bpt6k11767775/f1.thumbnail' },
        },
        {
          '@id': 'https://gallica.bnf.fr/iiif/ark:/12148/bpt6k11767775/canvas/f2',
          label: 'contreplat sup.',
          images: [
            {
              resource: { '@id': 'https://gallica.bnf.fr/iiif/ark:/12148/bpt6k11767775/f2/full/full/0/native.jpg' },
            },
          ],
          thumbnail: { '@id': 'https://gallica.bnf.fr/ark:/12148/bpt6k11767775/f2.thumbnail' },
        },
      ],
    },
  ],
};

function mockFetch(impl: (url: string) => Promise<any>) {
  (global as any).fetch = jest.fn(impl);
}

describe('getManifest', () => {
  afterEach(() => jest.resetAllMocks());

  it('parses page number from the canvas @id, and takes imageUrl/thumbnailUrl directly from the manifest', async () => {
    mockFetch(async () => ({ ok: true, status: 200, json: () => Promise.resolve(MANIFEST_FIXTURE) }));
    const manifest = await getManifest('bpt6k11767775');

    expect(manifest.permalink).toBe('https://gallica.bnf.fr/ark:/12148/bpt6k11767775');
    expect(manifest.pages).toHaveLength(2);
    expect(manifest.pages[0]).toMatchObject({
      pageNumber: 1,
      label: 'plat sup.',
      imageUrl: 'https://gallica.bnf.fr/iiif/ark:/12148/bpt6k11767775/f1/full/full/0/native.jpg',
      thumbnailUrl: 'https://gallica.bnf.fr/ark:/12148/bpt6k11767775/f1.thumbnail',
    });
    expect(manifest.pages[1].pageNumber).toBe(2);
  });

  it('derives the per-page audio URL from ark + page number', async () => {
    mockFetch(async () => ({ ok: true, status: 200, json: () => Promise.resolve(MANIFEST_FIXTURE) }));
    const manifest = await getManifest('bpt6k11767775');
    expect(manifest.pages[0].audioUrl).toBe('https://gallica.bnf.fr/ark:/12148/bpt6k11767775/f1.audio');
  });

  it('throws BnfRequestError on a non-OK response', async () => {
    mockFetch(async () => ({ ok: false, status: 404, json: () => Promise.resolve({}) }));
    await expect(getManifest('does-not-exist')).rejects.toThrow(BnfRequestError);
  });

  it('retries a 429 with backoff and still throws BnfRequestError once retries are exhausted', async () => {
    jest.useFakeTimers();
    mockFetch(async () => ({ ok: false, status: 429, json: () => Promise.resolve({}) }));
    // Attach the rejection handler (via .rejects) before advancing fake
    // timers, not after - otherwise the rejection can fire during
    // advanceTimersByTimeAsync with nothing listening yet, which Node/Jest
    // flags as an unhandled rejection even though the assertion below would
    // have matched it fine.
    const assertion = expect(getManifest('bpt6k11767775')).rejects.toThrow(/rate-limited/);
    await jest.advanceTimersByTimeAsync(2000 + 4000 + 8000 + 1000);
    await assertion;
    jest.useRealTimers();
  });
});

describe('fetchPageImage / fetchPageAudio', () => {
  afterEach(() => jest.resetAllMocks());

  const page = {
    pageNumber: 1,
    label: null,
    imageUrl: 'https://gallica.bnf.fr/iiif/ark:/12148/bpt6k11767775/f1/full/full/0/native.jpg',
    thumbnailUrl: 'https://gallica.bnf.fr/ark:/12148/bpt6k11767775/f1.thumbnail',
    audioUrl: 'https://gallica.bnf.fr/ark:/12148/bpt6k11767775/f1.audio',
  };

  it('downloads image bytes and normalizes a missing content-type to image/jpeg', async () => {
    mockFetch(async () => ({
      ok: true,
      status: 200,
      headers: new Map(),
      arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
    }));
    const asset = await fetchPageImage(page);
    expect(asset.contentType).toBe('image/jpeg');
    expect(asset.bytes).toEqual(Buffer.from([1, 2, 3]));
  });

  it('downloads audio bytes and keeps a real audio content-type as-is', async () => {
    mockFetch(async () => ({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'audio/mp3;charset=UTF-8']]),
      arrayBuffer: () => Promise.resolve(new Uint8Array([4, 5]).buffer),
    }));
    const asset = await fetchPageAudio(page);
    expect(asset.contentType).toBe('audio/mp3');
  });
});

describe('sizedImageUrl', () => {
  it('rewrites a full-size IIIF image URL to a width-scaled one', () => {
    expect(sizedImageUrl('https://gallica.bnf.fr/iiif/ark:/12148/btv1b52500519p/f1/full/full/0/native.jpg', 1600)).toBe(
      'https://gallica.bnf.fr/iiif/ark:/12148/btv1b52500519p/f1/full/1600,/0/native.jpg',
    );
  });
});

describe('bnfLibraryMediaEnabled', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });

  it('is off by default, on with its own flag, and on with a signed commercial licence', () => {
    delete process.env.BNF_LIBRARY_MEDIA_ENABLED;
    delete process.env.BNF_COMMERCIAL_LICENSE_ACCEPTED;
    expect(bnfLibraryMediaEnabled()).toBe(false);
    process.env.BNF_LIBRARY_MEDIA_ENABLED = 'true';
    expect(bnfLibraryMediaEnabled()).toBe(true);
    delete process.env.BNF_LIBRARY_MEDIA_ENABLED;
    process.env.BNF_COMMERCIAL_LICENSE_ACCEPTED = 'true';
    expect(bnfLibraryMediaEnabled()).toBe(true);
  });
});
