import type { Request, Response } from 'express';
import { fetchPageAudio, fetchPageImage, getManifest } from '@my-music-coach/bnf-gallica';
import type { BnfManifest } from '@my-music-coach/bnf-gallica';

// Gallica scans/recordings for the public Library viewer, served through our
// own routes (index.ts) so visitors never hit Gallica directly: it 429s a
// second request seconds after the first, so every upstream fetch here is
// cached in-process, and responses carry long cache headers so Cloudflare
// and browsers absorb repeat views. Gated by bnfLibraryMediaEnabled().

export const PAGE_IMAGE_WIDTH = 1600;

class LruCache<V> {
  private entries = new Map<string, { value: V; expiresAt: number }>();
  constructor(private readonly maxEntries: number, private readonly ttlMs: number) {}

  get(key: string): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key);
    if (entry.expiresAt < Date.now()) return undefined;
    this.entries.set(key, entry);
    return entry.value;
  }

  set(key: string, value: V): void {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    while (this.entries.size > this.maxEntries) this.entries.delete(this.entries.keys().next().value!);
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;
// ~250 KB per scaled page, ~10 MB per audio track - sized to stay well
// inside the API pod's memory.
const manifests = new LruCache<BnfManifest>(500, DAY_MS);
const pageImages = new LruCache<{ bytes: Buffer; contentType: string }>(120, 7 * DAY_MS);
const audioTracks = new LruCache<{ bytes: Buffer; contentType: string }>(6, DAY_MS);
// Concurrent requests for the same uncached asset share one upstream fetch.
const inFlight = new Map<string, Promise<unknown>>();

async function cached<V>(cache: LruCache<V>, key: string, load: () => Promise<V>): Promise<V> {
  const hit = cache.get(key);
  if (hit) return hit;
  const pending = inFlight.get(key) as Promise<V> | undefined;
  if (pending) return pending;
  const promise = load()
    .then((value) => {
      cache.set(key, value);
      return value;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export function getLibraryManifest(ark: string): Promise<BnfManifest> {
  return cached(manifests, ark, () => getManifest(ark));
}

async function findPage(ark: string, pageNumber: number) {
  const manifest = await getLibraryManifest(ark);
  return manifest.pages.find((page) => page.pageNumber === pageNumber) ?? null;
}

export async function getLibraryPageImage(ark: string, pageNumber: number) {
  const page = await findPage(ark, pageNumber);
  if (!page) return null;
  return cached(pageImages, `${ark}/f${pageNumber}`, () => fetchPageImage(page, { width: PAGE_IMAGE_WIDTH }));
}

export async function getLibraryAudioTrack(ark: string, pageNumber: number) {
  const page = await findPage(ark, pageNumber);
  if (!page) return null;
  // Gallica labels MP3 as the non-standard "audio/mp3"; Safari wants audio/mpeg.
  return cached(audioTracks, `${ark}/f${pageNumber}`, async () => {
    const track = await fetchPageAudio(page);
    return track.contentType === 'audio/mp3' ? { ...track, contentType: 'audio/mpeg' } : track;
  });
}

// Gallica's .audio endpoint ignores Range, so we answer it ourselves from
// the cached bytes - without this the browser player can't seek.
export function sendWithRange(req: Request, res: Response, bytes: Buffer, contentType: string): void {
  res.setHeader('content-type', contentType);
  res.setHeader('accept-ranges', 'bytes');
  res.setHeader('cache-control', 'public, max-age=86400');
  const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (!match || (!match[1] && !match[2])) {
    res.setHeader('content-length', String(bytes.length));
    res.end(bytes);
    return;
  }
  const size = bytes.length;
  let start = match[1] ? Number(match[1]) : size - Number(match[2]);
  let end = match[1] && match[2] ? Number(match[2]) : size - 1;
  start = Math.max(0, start);
  end = Math.min(end, size - 1);
  if (start > end || start >= size) {
    res.status(416).setHeader('content-range', `bytes */${size}`);
    res.end();
    return;
  }
  res.status(206);
  res.setHeader('content-range', `bytes ${start}-${end}/${size}`);
  res.setHeader('content-length', String(end - start + 1));
  res.end(bytes.subarray(start, end + 1));
}
