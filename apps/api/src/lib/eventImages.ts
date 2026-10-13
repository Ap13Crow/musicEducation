import { execFile } from 'child_process';
import { promisify } from 'util';

// External event pictures, cut to one card shape. Providers send anything
// from square photos to 1200x347 banners whose photo is only the middle
// third, padded with white (Classictic) - shown as they come, the cards'
// image areas looked unevenly filled. Each picture is stripped of plain
// white borders and centre-cropped to CARD_WIDTH x CARD_HEIGHT, the ratio
// of the event card's image area (apps/web/src/app/events/page.tsx).
// Served by index.ts's /events/external/:id/image; ImageMagick comes with
// the API image (apps/api/Dockerfile).

export const CARD_WIDTH = 640;
export const CARD_HEIGHT = 336;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const CACHE_ENTRIES = 400;
const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; event card images)';
const run = promisify(execFile);

// One border pixel of white first, so -trim only ever removes white
// padding, never a dark or coloured photo edge; then 2px off each side for
// the pale JPEG fringe the padding leaves along the photo.
export const CONVERT_ARGS = [
  '-', '-auto-orient',
  '-bordercolor', 'white', '-border', '1', '-fuzz', '15%', '-trim', '+repage', '-shave', '2x2',
  '-resize', `${CARD_WIDTH}x${CARD_HEIGHT}^`, '-gravity', 'center', '-extent', `${CARD_WIDTH}x${CARD_HEIGHT}`,
  '-strip', '-quality', '82', 'jpg:-',
];

const cache = new Map<string, Buffer>();

async function convert(source: Buffer): Promise<Buffer> {
  const child = run('convert', CONVERT_ARGS, { encoding: 'buffer', maxBuffer: 5 * 1024 * 1024, timeout: 20_000 });
  child.child.stdin?.end(source);
  const { stdout } = await child;
  return stdout as Buffer;
}

export async function eventCardImage(url: string): Promise<Buffer> {
  const cached = cache.get(url);
  if (cached) {
    // Re-insert: Map order doubles as least-recently-used order.
    cache.delete(url);
    cache.set(url, cached);
    return cached;
  }
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Event image fetch failed (${response.status}) for ${url}`);
  const source = Buffer.from(await response.arrayBuffer());
  if (source.length > MAX_SOURCE_BYTES) throw new Error(`Event image too large: ${url}`);
  const image = await convert(source);
  cache.set(url, image);
  if (cache.size > CACHE_ENTRIES) cache.delete(cache.keys().next().value as string);
  return image;
}
