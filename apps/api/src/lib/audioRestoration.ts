import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { PrismaClient } from '@my-music-coach/database';
import { logger } from '../utils/logger.js';
import { readLibraryObject, storeLibraryObject } from './libraryMediaStore.js';

// Restored versions of every Library recording: each side or track is
// rendered three times - Mild, Medium and Strong noise reduction - and the
// player offers them next to the untouched original. Built first for the
// Internet Archive's 78s (Great 78 Project), whose masters are deliberately
// unprocessed; since 2026-10-14 for every source, including recordings
// uploaded by teachers and admins. Run by the audio-restorer deployment
// (src/audioRestorer.ts), never by the API pod: ffmpeg is CPU-heavy and the
// API must stay responsive.

export const RESTORATION_LEVELS = ['MILD', 'MEDIUM', 'STRONG'] as const;
export type RestorationLevel = (typeof RESTORATION_LEVELS)[number];

// Two filter sets. HISTORIC is for 78s, cylinders and early transfers: loud
// surface noise, nothing worth keeping above 8-10 kHz. MODERN is for studio
// and home recordings (Musopen, teachers' uploads): already clean, full
// bandwidth and in real stereo - a 78's Strong (mono, 6.5 kHz lowpass)
// would ruin them, so MODERN only takes out hiss, hum and the odd click.
export const RESTORATION_PROFILES = ['HISTORIC', 'MODERN'] as const;
export type RestorationProfile = (typeof RESTORATION_PROFILES)[number];

// HISTORIC: lateral-cut 78s carry the music equally on both groove walls;
// the noise of each wall is independent, so Medium and Strong sum them to
// mono (about 3 dB less noise before any filtering). Filters, in order:
// rumble (highpass), clicks and crackle (adeclick), steady hiss (afftdn),
// the hiss band above what a 78 carries (lowpass). Strong is the player's
// default for these (the operator's choice, 2026-10-13, after an A/B
// listening test).
// MODERN: stereo kept, no lowpass, much gentler noise reduction; the
// player's default stays the original.
export const RESTORATION_FILTERS: Record<RestorationProfile, Record<RestorationLevel, string>> = {
  HISTORIC: {
    MILD: 'highpass=f=40,adeclick=t=4,afftdn=nr=6:nf=-45:tn=1,lowpass=f=10000',
    MEDIUM: 'pan=mono|c0=0.5*c0+0.5*c1,highpass=f=50:poles=2,adeclick,afftdn=nr=12:nf=-40:tn=1,lowpass=f=8000',
    STRONG:
      'pan=mono|c0=0.5*c0+0.5*c1,highpass=f=60:poles=2,adeclick=t=1.5:w=40,afftdn=nr=20:nf=-35:tn=1,lowpass=f=6500,equalizer=f=2500:t=q:w=1:g=2',
  },
  MODERN: {
    MILD: 'highpass=f=20,afftdn=nr=4:nf=-60:tn=1',
    MEDIUM: 'highpass=f=30,adeclick=t=8,afftdn=nr=8:nf=-55:tn=1',
    STRONG: 'highpass=f=40,adeclick=t=6,afftdn=nr=14:nf=-50:tn=1',
  },
};
// HISTORIC: the same loudness for all three (-18 LUFS), so switching
// compares the restoration, not the volume. MODERN keeps its dynamics (a
// one-pass loudnorm compresses a wide-range recording) - the filters
// barely change its level anyway.
const LOUDNESS: Record<RestorationProfile, string | null> = {
  HISTORIC: 'loudnorm=I=-18:TP=-1.5:LRA=14',
  MODERN: null,
};

// Before 1960 a recording is a 78, a cylinder or an early tape transfer.
// Without a year: the Internet Archive, Gallica and Europeana hold historic
// sound archives; Musopen and uploads are modern.
const HISTORIC_BEFORE = 1960;
export function restorationProfile(item: { source: string; year?: number | null }): RestorationProfile {
  if (item.source === 'INTERNET_ARCHIVE') return 'HISTORIC';
  if (item.year != null) return item.year < HISTORIC_BEFORE ? 'HISTORIC' : 'MODERN';
  return ['BNF', 'EUROPEANA'].includes(item.source) ? 'HISTORIC' : 'MODERN';
}

const MAX_SOURCE_BYTES = 600 * 1024 * 1024;
const MAX_ATTEMPTS = 3;
const ARCHIVE_DOWNLOAD = 'https://archive.org/download/';
const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; 78 rpm restoration)';

// One decode, three renders: the filter graph splits the master once.
export function ffmpegArguments(
  input: string,
  outputs: Record<RestorationLevel, string>,
  profile: RestorationProfile = 'HISTORIC',
): string[] {
  const loudness = LOUDNESS[profile];
  const chains = RESTORATION_LEVELS.map(
    (level, index) => `[s${index}]${[RESTORATION_FILTERS[profile][level], loudness].filter(Boolean).join(',')}[o${index}]`,
  );
  const graph = `[0:a]aresample=48000,asplit=3[s0][s1][s2];${chains.join(';')}`;
  const args = ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-filter_complex', graph];
  RESTORATION_LEVELS.forEach((level, index) => {
    args.push('-map', `[o${index}]`, '-c:a', 'libmp3lame', '-q:a', '3', '-ar', '44100', outputs[level]);
  });
  return args;
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    // Lowest CPU priority: the box also serves the site.
    const child = spawn('nice', ['-n', '15', command, ...args], { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk).slice(-2000);
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited ${code}: ${stderr.trim()}`))));
  });
}

// "https://archive.org/download/<identifier>/<file>" -> identifier.
export function archiveIdentifier(sourceUrl: string): string | null {
  if (!sourceUrl.startsWith(ARCHIVE_DOWNLOAD)) return null;
  const identifier = decodeURIComponent(sourceUrl.slice(ARCHIVE_DOWNLOAD.length).split('/')[0] ?? '');
  return identifier || null;
}

// The side's original FLAC transfer, else the MP3 the Library already plays.
export async function masterUrl(sourceUrl: string): Promise<string> {
  const identifier = archiveIdentifier(sourceUrl);
  if (!identifier) return sourceUrl;
  try {
    const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) return sourceUrl;
    const data: any = await response.json();
    const flac = (data?.files ?? []).find((file: any) => /flac$/i.test(String(file?.format ?? '')) && file?.source === 'original');
    if (!flac?.name) return sourceUrl;
    return `${ARCHIVE_DOWNLOAD}${encodeURIComponent(identifier)}/${String(flac.name).split('/').map(encodeURIComponent).join('/')}`;
  } catch {
    return sourceUrl;
  }
}

async function download(url: string, path: string): Promise<void> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(30 * 60_000) });
  if (!response.ok || !response.body) throw new Error(`Download failed (${response.status}) for ${url}`);
  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > MAX_SOURCE_BYTES) throw new Error(`Master too large (${declared} bytes): ${url}`);
  await pipeline(Readable.fromWeb(response.body as any), createWriteStream(path));
  if ((await stat(path)).size > MAX_SOURCE_BYTES) throw new Error(`Master too large: ${url}`);
}

// Our own copy of a side (lib/libraryMirror.ts, or an upload) to a file.
async function copyStored(sha256: string, path: string): Promise<void> {
  const object = await readLibraryObject(sha256);
  if (object.totalSize > MAX_SOURCE_BYTES) {
    object.body.destroy();
    throw new Error(`Stored copy too large (${object.totalSize} bytes): ${sha256}`);
  }
  await pipeline(object.body, createWriteStream(path));
}

// Where one side's audio comes from: an Internet Archive 78's original FLAC
// transfer first (the best master there is), else our own stored copy, else
// the archive.org file the Library plays. Only a 78 has one side per
// archive.org item - a Musopen item holds a whole collection, so its first
// FLAC would be some other piece.
export type SideSource = { sourceUrl: string | null; storedSha256: string | null; flacMaster?: boolean };

async function fetchSide(side: SideSource, dir: string): Promise<string> {
  if (side.sourceUrl && archiveIdentifier(side.sourceUrl)) {
    const master = side.flacMaster ? await masterUrl(side.sourceUrl) : side.sourceUrl;
    if (master !== side.sourceUrl || !side.storedSha256) {
      const input = join(dir, /\.flac$/i.test(master) ? 'master.flac' : 'master.mp3');
      try {
        await download(master, input);
        return input;
      } catch (error) {
        if (!side.storedSha256) throw error;
        logger.info({ master, message: error instanceof Error ? error.message : String(error) }, 'Audio restoration: master unavailable, using the stored copy');
      }
    }
  }
  if (side.storedSha256) {
    const input = join(dir, 'stored');
    await copyStored(side.storedSha256, input);
    return input;
  }
  throw new Error('No audio to restore: neither a stored copy nor an archive.org file.');
}

// The three restored MP3s of one side.
export async function restoreSide(side: SideSource, profile: RestorationProfile): Promise<Record<RestorationLevel, Buffer>> {
  const dir = await mkdtemp(join(tmpdir(), 'restore-'));
  try {
    const input = await fetchSide(side, dir);
    const outputs = Object.fromEntries(RESTORATION_LEVELS.map((level) => [level, join(dir, `${level.toLowerCase()}.mp3`)])) as Record<RestorationLevel, string>;
    await run('ffmpeg', ffmpegArguments(input, outputs, profile));
    const entries = await Promise.all(RESTORATION_LEVELS.map(async (level) => [level, await readFile(outputs[level])] as const));
    return Object.fromEntries(entries) as Record<RestorationLevel, Buffer>;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

type RestoreItem = { id: string; source: string; year: number | null; files: unknown };

// Every recording whose audio we can reach: Internet Archive and Musopen
// files stream from archive.org, everything else (Gallica, Europeana,
// uploads) once our own copy exists.
const pendingWhere = {
  category: 'AUDIO_RECORDING' as any,
  hiddenAt: null,
  restoredAt: null,
  restoreAttempts: { lt: MAX_ATTEMPTS },
  OR: [{ source: { in: ['INTERNET_ARCHIVE', 'MUSOPEN'] } }, { mirroredAt: { not: null } }],
};

export async function audioRestorationPending(prisma: PrismaClient): Promise<number> {
  return prisma.libraryItem.count({ where: pendingWhere } as any);
}

// The sides of one item: its audio files (position = index in
// LibraryItem.files), or a Gallica recording's tracks (position = Gallica
// page number; a BNF item has no files, so the two never collide).
export async function itemSides(prisma: PrismaClient, item: RestoreItem): Promise<Array<SideSource & { position: number }>> {
  const stored = await prisma.libraryItemMedia.findMany({
    where: { itemId: item.id, kind: { in: ['FILE', 'TRACK'] } },
    select: { kind: true, position: true, sha256: true },
  } as any);
  const storedSha = (kind: string, position: number) =>
    stored.find((row: { kind: string; position: number }) => row.kind === kind && row.position === position)?.sha256 ?? null;
  if (item.source === 'BNF') {
    return stored
      .filter((row: { kind: string }) => row.kind === 'TRACK')
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((row: { position: number; sha256: string }) => ({ position: row.position, sourceUrl: null, storedSha256: row.sha256 }));
  }
  const files = Array.isArray(item.files) ? (item.files as any[]) : [];
  return files.flatMap((file, position) => {
    if (!String(file?.contentType ?? '').startsWith('audio/')) return [];
    const sourceUrl = typeof file?.sourceUrl === 'string' && archiveIdentifier(file.sourceUrl) ? file.sourceUrl : null;
    const storedSha256 = storedSha('FILE', position);
    return sourceUrl || storedSha256 ? [{ position, sourceUrl, storedSha256, flacMaster: item.source === 'INTERNET_ARCHIVE' }] : [];
  });
}

// One pass over every recording still lacking its restored versions, one
// side at a time. Sides already done (an earlier, interrupted pass) are
// skipped. Teachers' uploads go first: their uploader is waiting for them.
export async function runAudioRestoration(
  prisma: PrismaClient,
  options: { limit?: number; concurrency?: number; shouldStop?: () => boolean } = {},
): Promise<{ total: number; restored: number; failed: number }> {
  const select = { id: true, source: true, year: true, files: true };
  const uploads: RestoreItem[] = await prisma.libraryItem.findMany({
    where: { ...pendingWhere, source: 'UPLOAD' },
    select,
    orderBy: { ingestedAt: 'asc' },
    take: options.limit,
  } as any);
  const others: RestoreItem[] =
    options.limit != null && uploads.length >= options.limit
      ? []
      : await prisma.libraryItem.findMany({
          where: { ...pendingWhere, source: { not: 'UPLOAD' } },
          select,
          orderBy: { ingestedAt: 'asc' },
          take: options.limit == null ? undefined : options.limit - uploads.length,
        } as any);
  const items = [...uploads, ...others];
  const result = { total: items.length, restored: 0, failed: 0 };
  // Several items at once (each its own download + ffmpeg); every lane takes
  // the next item from the shared queue.
  const queue = [...items];
  const lane = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      if (options.shouldStop?.()) return;
      await restoreItem(prisma, item, result);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, options.concurrency ?? 1) }, lane));
  return result;
}

async function restoreItem(prisma: PrismaClient, item: RestoreItem, result: { restored: number; failed: number }) {
  try {
    const profile = restorationProfile(item);
    const done = await prisma.libraryAudioRestoration.findMany({ where: { itemId: item.id }, select: { fileIndex: true, level: true } });
    const have = new Set(done.map((row: { fileIndex: number; level: string }) => `${row.fileIndex}:${row.level}`));
    for (const side of await itemSides(prisma, item)) {
      const fileIndex = side.position;
      if (RESTORATION_LEVELS.every((level) => have.has(`${fileIndex}:${level}`))) continue;
      const started = Date.now();
      const versions = await restoreSide(side, profile);
      for (const level of RESTORATION_LEVELS) {
        const sha256 = await storeLibraryObject(prisma, versions[level], 'audio/mpeg');
        await prisma.libraryAudioRestoration.upsert({
          where: { itemId_fileIndex_level: { itemId: item.id, fileIndex, level } },
          create: { itemId: item.id, fileIndex, level, sha256 },
          update: { sha256 },
        });
      }
      logger.info({ itemId: item.id, source: item.source, profile, fileIndex, seconds: Math.round((Date.now() - started) / 1000) }, 'Audio restoration: side done');
    }
    await prisma.libraryItem.update({ where: { id: item.id }, data: { restoredAt: new Date(), restoreError: null, restoreProfile: profile } } as any);
    result.restored += 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn({ itemId: item.id, message }, 'Audio restoration: item failed');
    result.failed += 1;
    await prisma.libraryItem.update({
      where: { id: item.id },
      data: { restoreError: message.slice(0, 500), restoreAttempts: { increment: 1 } },
    } as any);
  }
}
