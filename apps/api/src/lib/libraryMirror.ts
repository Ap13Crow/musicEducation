import type { PrismaClient } from '@my-music-coach/database';
import { fetchPageAudio, fetchPageImage, getManifest } from '@my-music-coach/bnf-gallica';
import { libraryMediaStoreConfigured, storeLibraryObject } from './libraryMediaStore.js';
import { ARCHIVE_DOWNLOAD_PREFIX, MUTOPIA_FTP_PREFIX } from './openSources.js';
import { isAllowedScoreSource } from './openscore.js';
import { dnbArchiveUrl, isDnbIdn } from './dnb.js';
import { isPublicMediaUrl } from './europeana.js';
import { listZipEntries, readZipEntry, renderPdfFirstPage } from './libraryThumbnails.js';
import { logger } from '../utils/logger.js';

// Downloads every Library item's files once into our own media store
// (lib/libraryMediaStore.ts), so the Library keeps working when a source is
// slow, gone or blocks us. This is the ONLY place that pulls media from a
// source, always paced per host, and resumable file by file: a restart
// continues where it stopped.
//
// Gallica gets special care: BnF caps large IIIF images at 5 calls/min per
// IP and blocks IPs that burst (HTTP 403). One request every
// BNF_MIRROR_INTERVAL_MS (default 15 s), and on the first 403/429 every
// Gallica download pauses for BNF_MIRROR_PAUSE_MS (default 6 h).

const MAX_FILE_BYTES = 80 * 1024 * 1024;
// A DNB archive copy can be a zip of a score and all its parts.
const MAX_ARCHIVE_BYTES = 200 * 1024 * 1024;
const MAX_ATTEMPTS = 5;
const BNF_PAUSE_KEY = 'library_mirror:bnf_paused_until';
// Same width the viewer uses - BnF's 5 calls/min cap applies above 1000 px.
const BNF_PAGE_WIDTH = 1000;

const numberEnv = (name: string, fallback: number) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};
const bnfInterval = () => numberEnv('BNF_MIRROR_INTERVAL_MS', 15_000);
const bnfPause = () => numberEnv('BNF_MIRROR_PAUSE_MS', 6 * 60 * 60 * 1000);

// Pause between two downloads from the same host.
const PACING_MS: Record<string, () => number> = {
  OPENSCORE: () => 200,
  MUTOPIA: () => 500,
  MUSOPEN: () => 1000,
  DNB: () => 1000,
  INTERNET_ARCHIVE: () => 1000,
  EUROPEANA: () => 1500,
  BNF: bnfInterval,
};

export class SourceBlockedError extends Error {}
// The item can never be copied (e.g. a DNB archive without any PDF) - no
// point retrying it.
export class PermanentMirrorError extends Error {}

type MirrorItem = {
  id: string;
  source: string;
  ark: string;
  category: string;
  musicXmlSourceUrl: string | null;
  files: unknown;
  thumbnailUrl: string | null;
};

type PlannedFile = {
  kind: 'SCORE' | 'FILE' | 'PAGE' | 'TRACK';
  position: number;
  label: string | null;
  durationSeconds: number | null;
  sourceUrl: string;
  download: () => Promise<{ bytes: Buffer; contentType: string }>;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DNB_ARCHIVE_PATTERN = /^https:\/\/d-nb\.info\/\d{8,9}[\dX]\/34$/;

function allowedOpenSourceUrl(url: string): boolean {
  return isAllowedScoreSource(url) || url.startsWith(MUTOPIA_FTP_PREFIX) || url.startsWith(ARCHIVE_DOWNLOAD_PREFIX) || DNB_ARCHIVE_PATTERN.test(url);
}

async function downloadOpen(url: string, fallbackType: string, maxBytes = MAX_FILE_BYTES): Promise<{ bytes: Buffer; contentType: string }> {
  if (!allowedOpenSourceUrl(url)) throw new Error(`Source URL not allowlisted: ${url}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'MyMusicCoach/1.0 (+https://mymusic.coach; library mirror)' } });
    if (response.status === 403 || response.status === 429) throw new SourceBlockedError(`HTTP ${response.status} from ${new URL(url).host}`);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const declared = Number(response.headers.get('content-length') ?? 0);
    if (declared > maxBytes) throw new PermanentMirrorError(`File too large (${declared} bytes): ${url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > maxBytes) throw new PermanentMirrorError(`File too large (${bytes.length} bytes): ${url}`);
    const header = response.headers.get('content-type')?.split(';')[0]?.trim();
    return { bytes, contentType: header && header !== 'application/octet-stream' ? header : fallbackType };
  } finally {
    clearTimeout(timeout);
  }
}

// Europeana media lives on many providers' servers - any public web
// address, but only real audio is kept (some point at a sleeve picture).
async function downloadExternalAudio(url: string): Promise<{ bytes: Buffer; contentType: string }> {
  if (!isPublicMediaUrl(url)) throw new PermanentMirrorError(`Not a public media address: ${url}`);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(120_000),
    redirect: 'follow',
    headers: { 'User-Agent': 'MyMusicCoach/1.0 (+https://mymusic.coach; library mirror)' },
  });
  if (response.url && !isPublicMediaUrl(response.url)) throw new PermanentMirrorError(`Redirected to a non-public address: ${response.url}`);
  if (response.status === 403 || response.status === 429) throw new SourceBlockedError(`HTTP ${response.status} from ${new URL(url).host}`);
  if (response.status === 404 || response.status === 410) throw new PermanentMirrorError(`Gone at the source (HTTP ${response.status}): ${url}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!contentType.startsWith('audio/')) {
    await response.body?.cancel().catch(() => undefined);
    throw new PermanentMirrorError(`Not an audio file (${contentType || 'unknown type'}): ${url}`);
  }
  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > MAX_FILE_BYTES) throw new PermanentMirrorError(`File too large (${declared} bytes): ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_FILE_BYTES) throw new PermanentMirrorError(`File too large (${bytes.length} bytes): ${url}`);
  return { bytes, contentType: contentType === 'audio/mp3' ? 'audio/mpeg' : contentType };
}

function isGallicaBlock(error: unknown): boolean {
  return /HTTP (403|429)|rate-limited/i.test(error instanceof Error ? error.message : String(error));
}

async function gallica<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (isGallicaBlock(error)) throw new SourceBlockedError(error instanceof Error ? error.message : 'Gallica blocked the request.');
    throw error;
  }
}

// What to download for one item. BnF needs one manifest request first.
export async function planItemFiles(item: MirrorItem): Promise<PlannedFile[]> {
  const files = Array.isArray(item.files) ? (item.files as any[]) : [];
  const planned: PlannedFile[] = files.map((file, index) => ({
    kind: 'FILE' as const,
    position: index,
    label: file?.label ?? null,
    durationSeconds: Number.isFinite(file?.durationSeconds) ? file.durationSeconds : null,
    sourceUrl: String(file?.sourceUrl ?? ''),
    download: () =>
      item.source === 'EUROPEANA'
        ? downloadExternalAudio(String(file?.sourceUrl ?? ''))
        : downloadOpen(String(file?.sourceUrl ?? ''), String(file?.contentType ?? 'application/pdf')),
  }));
  if (item.musicXmlSourceUrl) {
    const url = item.musicXmlSourceUrl;
    planned.unshift({
      kind: 'SCORE',
      position: 0,
      label: null,
      durationSeconds: null,
      sourceUrl: url,
      download: () => downloadOpen(url, 'application/vnd.recordare.musicxml'),
    });
  }
  if (item.source === 'BNF' && /^[a-z0-9]+$/i.test(item.ark)) {
    const manifest = await gallica(() => getManifest(item.ark));
    const audio = item.category === 'AUDIO_RECORDING';
    for (const page of manifest.pages) {
      planned.push({
        kind: audio ? 'TRACK' : 'PAGE',
        position: page.pageNumber,
        label: page.label ?? null,
        durationSeconds: null,
        sourceUrl: audio ? page.audioUrl : page.imageUrl,
        download: audio
          ? async () => {
              const track = await gallica(() => fetchPageAudio(page));
              // Gallica says "audio/mp3"; Safari wants audio/mpeg.
              return { bytes: track.bytes, contentType: track.contentType === 'audio/mp3' ? 'audio/mpeg' : track.contentType };
            }
          : () => gallica(() => fetchPageImage(page, { width: BNF_PAGE_WIDTH })),
      });
    }
  }
  return planned;
}

export async function bnfPausedUntil(prisma: PrismaClient): Promise<number> {
  const row = await prisma.adminSetting.findUnique({ where: { key: BNF_PAUSE_KEY } });
  const until = row ? new Date(row.value).getTime() : 0;
  return Number.isFinite(until) ? until : 0;
}

export async function pauseBnf(prisma: PrismaClient): Promise<void> {
  const value = new Date(Date.now() + bnfPause()).toISOString();
  await prisma.adminSetting.upsert({ where: { key: BNF_PAUSE_KEY }, create: { key: BNF_PAUSE_KEY, value }, update: { value } });
}

const isPdf = (bytes: Buffer) => bytes.subarray(0, 5).toString('latin1') === '%PDF-';

// "netpub/dnb~files/RB_3201_Klavier.pdf" -> "RB 3201 Klavier"
function pdfLabel(name: string): string {
  const base = name.split('/').pop() ?? name;
  return base.replace(/\.pdf$/i, '').replace(/[_]+/g, ' ').trim() || 'PDF';
}

// A DNB item's files are only known once its archive copy is here: one PDF,
// or a zip whose PDFs (full score, parts) each become a file of the item.
// Stores them, fills LibraryItem.files, and makes the card image from the
// first page. Later passes find every file stored and skip the download.
export async function mirrorDnbArchive(prisma: PrismaClient, item: MirrorItem): Promise<void> {
  if (!isDnbIdn(item.ark)) throw new PermanentMirrorError(`Not a DNB record id: ${item.ark}`);
  if (Array.isArray(item.files) && item.files.length) return;
  const url = dnbArchiveUrl(item.ark);
  const { bytes } = await downloadOpen(url, 'application/octet-stream', MAX_ARCHIVE_BYTES);

  let pdfs: { name: string; bytes: Buffer }[];
  if (isPdf(bytes)) {
    pdfs = [{ name: item.category === 'SHEET_MUSIC' ? 'Score' : 'Full text', bytes }];
  } else {
    const names = listZipEntries(bytes).filter((name) => /\.pdf$/i.test(name)).sort((a, b) => a.localeCompare(b));
    pdfs = names
      .map((name) => ({ name: pdfLabel(name), bytes: readZipEntry(bytes, name) }))
      .filter((entry): entry is { name: string; bytes: Buffer } => Boolean(entry.bytes && isPdf(entry.bytes) && entry.bytes.length <= MAX_FILE_BYTES));
  }
  if (!pdfs.length) throw new PermanentMirrorError('The DNB archive copy holds no PDF we can show.');

  const files = [];
  for (const [position, pdf] of pdfs.entries()) {
    const sha256 = await storeLibraryObject(prisma, pdf.bytes, 'application/pdf');
    const sourceUrl = pdfs.length === 1 && isPdf(bytes) ? url : `${url}#${position + 1}`;
    await prisma.libraryItemMedia.upsert({
      where: { itemId_kind_position: { itemId: item.id, kind: 'FILE', position } },
      create: { itemId: item.id, kind: 'FILE', position, label: pdf.name, sha256, sourceUrl },
      update: { sha256, label: pdf.name, sourceUrl },
    });
    files.push({ label: pdf.name, sourceUrl, contentType: 'application/pdf' });
  }
  await prisma.libraryItem.update({ where: { id: item.id }, data: { files } });
  item.files = files;

  if (!item.thumbnailUrl) {
    try {
      const jpeg = await renderPdfFirstPage(pdfs[0].bytes);
      await prisma.libraryItemThumbnail.upsert({
        where: { itemId: item.id },
        create: { itemId: item.id, contentType: 'image/jpeg', bytes: jpeg },
        update: { contentType: 'image/jpeg', bytes: jpeg },
      });
      await prisma.libraryItem.update({ where: { id: item.id }, data: { thumbnailUrl: `/api/library/items/${item.id}/thumbnail` } });
      item.thumbnailUrl = 'set';
    } catch (error) {
      logger.warn({ itemId: item.id, error: error instanceof Error ? error.message : String(error) }, 'Library mirror: no thumbnail for DNB item');
    }
  }
}

// Mirrors one item; true when all its files are stored. Throws
// SourceBlockedError when the source refuses us.
export async function mirrorItem(prisma: PrismaClient, item: MirrorItem, pauseMs: number): Promise<boolean> {
  const stored = await prisma.libraryItemMedia.findMany({ where: { itemId: item.id }, select: { kind: true, position: true } });
  const have = new Set(stored.map((row: { kind: string; position: number }) => `${row.kind}:${row.position}`));
  if (item.source === 'DNB') {
    await mirrorDnbArchive(prisma, item);
    await sleep(pauseMs);
    return true;
  }
  const planned = await planItemFiles(item);
  if (item.source === 'BNF') await sleep(pauseMs);

  for (const file of planned) {
    if (have.has(`${file.kind}:${file.position}`)) continue;
    const { bytes, contentType } = await file.download();
    const sha256 = await storeLibraryObject(prisma, bytes, contentType);
    await prisma.libraryItemMedia.upsert({
      where: { itemId_kind_position: { itemId: item.id, kind: file.kind, position: file.position } },
      create: { itemId: item.id, kind: file.kind, position: file.position, label: file.label, durationSeconds: file.durationSeconds, sha256, sourceUrl: file.sourceUrl },
      update: { sha256, label: file.label, durationSeconds: file.durationSeconds, sourceUrl: file.sourceUrl },
    });
    // A Gallica item gets its card image from its own first page - no
    // extra request to Gallica.
    if (item.source === 'BNF' && file.kind === 'PAGE' && !item.thumbnailUrl) {
      await prisma.libraryItemThumbnail.upsert({
        where: { itemId: item.id },
        create: { itemId: item.id, contentType, bytes },
        update: { contentType, bytes },
      });
      await prisma.libraryItem.update({ where: { id: item.id }, data: { thumbnailUrl: `/api/library/items/${item.id}/thumbnail` } });
      item.thumbnailUrl = 'set';
    }
    await sleep(pauseMs);
  }
  return true;
}

export interface MirrorResult {
  total: number;
  mirrored: number;
  failed: number;
  blocked: string[];
}

// One pass over every item still lacking a local copy. Each source runs in
// its own sequential lane (different hosts), so a slow Gallica never holds
// up the open-licence sources.
export async function runLibraryMirror(
  prisma: PrismaClient,
  onProgress?: (done: number, total: number) => Promise<void> | void,
): Promise<MirrorResult> {
  if (!libraryMediaStoreConfigured()) throw new Error('The local media store is not configured (library-media-s3 Secret).');
  const items: MirrorItem[] = await prisma.libraryItem.findMany({
    where: { mirroredAt: null, hiddenAt: null, mirrorAttempts: { lt: MAX_ATTEMPTS } },
    select: { id: true, source: true, ark: true, category: true, musicXmlSourceUrl: true, files: true, thumbnailUrl: true },
    orderBy: { ingestedAt: 'asc' },
  });
  const result: MirrorResult = { total: items.length, mirrored: 0, failed: 0, blocked: [] };
  let done = 0;

  const lanes = Object.keys(PACING_MS).map(async (source) => {
    const queue = items.filter((item) => item.source === source);
    for (const item of queue) {
      if (source === 'BNF' && (await bnfPausedUntil(prisma)) > Date.now()) {
        if (!result.blocked.includes(source)) result.blocked.push(source);
        break;
      }
      try {
        await mirrorItem(prisma, item, PACING_MS[source]());
        await prisma.libraryItem.update({ where: { id: item.id }, data: { mirroredAt: new Date(), mirrorError: null } });
        result.mirrored += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof SourceBlockedError) {
          // Not the item's fault - stop this lane without counting an attempt.
          logger.warn({ source, itemId: item.id, message }, 'Library mirror: source refused us; pausing this source');
          if (source === 'BNF') await pauseBnf(prisma);
          if (!result.blocked.includes(source)) result.blocked.push(source);
          break;
        }
        result.failed += 1;
        logger.warn({ source, itemId: item.id, message }, 'Library mirror: item failed');
        await prisma.libraryItem.update({
          where: { id: item.id },
          data: {
            mirrorError: message.slice(0, 500),
            mirrorAttempts: error instanceof PermanentMirrorError ? MAX_ATTEMPTS : { increment: 1 },
          },
        });
      } finally {
        done += 1;
        await onProgress?.(done, items.length);
      }
    }
  });
  await Promise.all(lanes);
  return result;
}

export async function libraryMirrorPending(prisma: PrismaClient): Promise<number> {
  return prisma.libraryItem.count({ where: { mirroredAt: null, hiddenAt: null, mirrorAttempts: { lt: MAX_ATTEMPTS } } });
}
