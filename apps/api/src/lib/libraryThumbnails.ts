import { execFile } from 'child_process';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';
import { inflateRawSync } from 'zlib';
import type { PrismaClient } from '@my-music-coach/database';
import { MUTOPIA_FTP_PREFIX } from './openSources.js';

// Library card thumbnails, generated once per item and stored in
// LibraryItemThumbnail (served by index.ts's /library/items/:id/thumbnail),
// so the grid never makes per-visitor requests to a source:
//   - OpenScore: the first-page thumbnail MuseScore embeds in every .mscz
//     (a zip) next to the .mxl; quartets without one get page 1 of their
//     PDF full score, rendered with poppler's pdftoppm.
//   - Mutopia: the project's own "-preview.png" (the opening bars).
//   - Gallica: page 1 through IIIF at thumbnail width (a recording's page 1
//     is its disc label/cover), paced for Gallica's rate limit.
//   - Musopen: audio only - the web card draws a composer tile instead.

const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; library thumbnails)';
const THUMB_WIDTH = 360;
const MAX_SOURCE_BYTES = 30 * 1024 * 1024;
const run = promisify(execFile);

export interface Thumbnail {
  bytes: Buffer;
  contentType: string;
}

async function fetchBytes(url: string): Promise<Buffer | null> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60_000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Thumbnail source fetch failed (${response.status}) for ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_SOURCE_BYTES) throw new Error(`Thumbnail source too large: ${url}`);
  return bytes;
}

// Minimal zip reader - just enough to pull one entry out of a .mscz:
// find the end-of-central-directory record, walk the central directory for
// the name, then read that entry's local header (stored or deflated).
export function readZipEntry(zip: Buffer, name: string): Buffer | null {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) return null;
  const entries = zip.readUInt16LE(eocd + 10);
  let offset = zip.readUInt32LE(eocd + 16);
  for (let i = 0; i < entries; i++) {
    if (zip.readUInt32LE(offset) !== 0x02014b50) return null;
    const method = zip.readUInt16LE(offset + 10);
    const compressedSize = zip.readUInt32LE(offset + 20);
    const nameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    const localOffset = zip.readUInt32LE(offset + 42);
    const entryName = zip.toString('utf8', offset + 46, offset + 46 + nameLength);
    if (entryName === name) {
      const localNameLength = zip.readUInt16LE(localOffset + 26);
      const localExtraLength = zip.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const data = zip.subarray(start, start + compressedSize);
      if (method === 0) return Buffer.from(data);
      if (method === 8) return inflateRawSync(data);
      return null;
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return null;
}

export async function renderPdfFirstPage(pdf: Buffer): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), 'library-thumb-'));
  try {
    await writeFile(join(dir, 'in.pdf'), pdf);
    await run('pdftoppm', ['-f', '1', '-l', '1', '-singlefile', '-scale-to-x', String(THUMB_WIDTH), '-scale-to-y', '-1', '-jpeg', '-jpegopt', 'quality=80', join(dir, 'in.pdf'), join(dir, 'out')], {
      timeout: 60_000,
    });
    return await readFile(join(dir, 'out.jpg'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

interface ThumbnailSourceItem {
  id: string;
  source: string;
  ark: string;
  musicXmlSourceUrl: string | null;
  files: unknown;
}

export async function generateThumbnail(item: ThumbnailSourceItem): Promise<Thumbnail | null> {
  switch (item.source) {
    case 'OPENSCORE': {
      if (item.musicXmlSourceUrl?.endsWith('.mxl')) {
        const mscz = await fetchBytes(item.musicXmlSourceUrl.replace(/\.mxl$/, '.mscz'));
        const png = mscz && readZipEntry(mscz, 'Thumbnails/thumbnail.png');
        if (png) return { bytes: png, contentType: 'image/png' };
      }
      const pdf = (Array.isArray(item.files) ? item.files : []).find((file: any) => file?.contentType === 'application/pdf') as any;
      if (!pdf?.sourceUrl) return null;
      const bytes = await fetchBytes(pdf.sourceUrl);
      return bytes ? { bytes: await renderPdfFirstPage(bytes), contentType: 'image/jpeg' } : null;
    }
    case 'MUTOPIA': {
      const folder = item.ark.replace(/^mutopia:/, '');
      const name = folder.split('/').pop()!;
      const base = `${MUTOPIA_FTP_PREFIX}${folder.split('/').map(encodeURIComponent).join('/')}/`;
      let png = await fetchBytes(`${base}${encodeURIComponent(name)}-preview.png`);
      if (!png) {
        // Older pieces name it differently - the RDF says which file.
        const rdf = await fetchBytes(`${base}${encodeURIComponent(name)}.rdf`);
        const pngFile = rdf && /<mp:pngFile>([^<]+)<\/mp:pngFile>/.exec(rdf.toString('utf8'))?.[1]?.trim();
        if (pngFile) png = await fetchBytes(`${base}${encodeURIComponent(pngFile)}`);
      }
      return png ? { bytes: png, contentType: 'image/png' } : null;
    }
    default:
      return null;
  }
}

// Pacing per source: GitHub raw is a CDN; Mutopia is a volunteer server;
// Gallica rate-limits our IP after a few quick requests.
const PACING: Record<string, { concurrency: number; pauseMs: number }> = {
  OPENSCORE: { concurrency: 6, pauseMs: 0 },
  MUTOPIA: { concurrency: 3, pauseMs: 250 },
  // No BNF: Gallica blocks IPs that send unattended bursts, so this job
  // (which also runs after every API start) never calls it. BnF thumbnails
  // come from the copy downloaded at import time.
};

export async function backfillLibraryThumbnails(
  prisma: PrismaClient,
  onProgress?: (done: number, total: number) => Promise<void> | void,
): Promise<{ total: number; created: number; failed: number }> {
  const items = await prisma.libraryItem.findMany({
    where: { thumbnailUrl: null, hiddenAt: null, source: { in: Object.keys(PACING) as any } },
    select: { id: true, source: true, ark: true, musicXmlSourceUrl: true, files: true },
    orderBy: { ingestedAt: 'asc' },
  });
  let done = 0;
  let created = 0;
  let failed = 0;
  for (const source of Object.keys(PACING)) {
    const queue = items.filter((item) => item.source === source);
    const { concurrency, pauseMs } = PACING[source];
    for (let i = 0; i < queue.length; i += concurrency) {
      const batch = queue.slice(i, i + concurrency);
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          const thumbnail = await generateThumbnail(item as ThumbnailSourceItem);
          if (!thumbnail) return false;
          await prisma.libraryItemThumbnail.upsert({
            where: { itemId: item.id },
            create: { itemId: item.id, contentType: thumbnail.contentType, bytes: thumbnail.bytes },
            update: { contentType: thumbnail.contentType, bytes: thumbnail.bytes },
          });
          await prisma.libraryItem.update({ where: { id: item.id }, data: { thumbnailUrl: `/api/library/items/${item.id}/thumbnail` } });
          return true;
        }),
      );
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) created += 1;
        else failed += 1;
      }
      done += batch.length;
      await onProgress?.(done, items.length);
      if (pauseMs) await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
  }
  return { total: items.length, created, failed };
}
