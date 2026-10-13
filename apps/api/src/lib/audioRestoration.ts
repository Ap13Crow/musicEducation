import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { PrismaClient } from '@my-music-coach/database';
import { logger } from '../utils/logger.js';
import { storeLibraryObject } from './libraryMediaStore.js';

// Restored versions of the Internet Archive's 78 rpm transfers (Great 78
// Project). Their masters are deliberately unprocessed - surface hiss,
// crackle, clicks and turntable rumble included - so each side is rendered
// three times, from the 24-bit FLAC master when there is one: Mild, Medium
// and Strong. The player offers them next to the untouched original, Strong
// by default (the operator's choice, 2026-10-13, after an A/B listening
// test). Run by the audio-restorer deployment (src/audioRestorer.ts), never
// by the API pod: ffmpeg is CPU-heavy and the API must stay responsive.

export const RESTORATION_LEVELS = ['MILD', 'MEDIUM', 'STRONG'] as const;
export type RestorationLevel = (typeof RESTORATION_LEVELS)[number];

// Lateral-cut 78s carry the music equally on both groove walls; the noise of
// each wall is independent, so Medium and Strong sum them to mono (about
// 3 dB less noise before any filtering). Filters, in order: rumble
// (highpass), clicks and crackle (adeclick), steady hiss (afftdn), the hiss
// band above what a 78 carries (lowpass). The same loudness for all three
// (-18 LUFS), so switching compares the restoration, not the volume.
export const RESTORATION_FILTERS: Record<RestorationLevel, string> = {
  MILD: 'highpass=f=40,adeclick=t=4,afftdn=nr=6:nf=-45:tn=1,lowpass=f=10000',
  MEDIUM: 'pan=mono|c0=0.5*c0+0.5*c1,highpass=f=50:poles=2,adeclick,afftdn=nr=12:nf=-40:tn=1,lowpass=f=8000',
  STRONG:
    'pan=mono|c0=0.5*c0+0.5*c1,highpass=f=60:poles=2,adeclick=t=1.5:w=40,afftdn=nr=20:nf=-35:tn=1,lowpass=f=6500,equalizer=f=2500:t=q:w=1:g=2',
};
const LOUDNESS = 'loudnorm=I=-18:TP=-1.5:LRA=14';

const MAX_SOURCE_BYTES = 600 * 1024 * 1024;
const MAX_ATTEMPTS = 3;
const ARCHIVE_DOWNLOAD = 'https://archive.org/download/';
const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; 78 rpm restoration)';

// One decode, three renders: the filter graph splits the master once.
export function ffmpegArguments(input: string, outputs: Record<RestorationLevel, string>): string[] {
  const chains = RESTORATION_LEVELS.map((level, index) => `[s${index}]${RESTORATION_FILTERS[level]},${LOUDNESS}[o${index}]`);
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

// The three restored MP3s of one side.
export async function restoreSide(sourceUrl: string): Promise<Record<RestorationLevel, Buffer>> {
  const dir = await mkdtemp(join(tmpdir(), 'restore-'));
  try {
    const master = await masterUrl(sourceUrl);
    const input = join(dir, /\.flac$/i.test(master) ? 'master.flac' : 'master.mp3');
    await download(master, input);
    const outputs = Object.fromEntries(RESTORATION_LEVELS.map((level) => [level, join(dir, `${level.toLowerCase()}.mp3`)])) as Record<RestorationLevel, string>;
    await run('ffmpeg', ffmpegArguments(input, outputs));
    const entries = await Promise.all(RESTORATION_LEVELS.map(async (level) => [level, await readFile(outputs[level])] as const));
    return Object.fromEntries(entries) as Record<RestorationLevel, Buffer>;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

type RestoreItem = { id: string; files: unknown };

const pendingWhere = {
  source: 'INTERNET_ARCHIVE' as any,
  category: 'AUDIO_RECORDING' as any,
  hiddenAt: null,
  restoredAt: null,
  restoreAttempts: { lt: MAX_ATTEMPTS },
};

export async function audioRestorationPending(prisma: PrismaClient): Promise<number> {
  return prisma.libraryItem.count({ where: pendingWhere } as any);
}

// One pass over every 78 still lacking its restored versions, one side at a
// time. Sides already done (an earlier, interrupted pass) are skipped.
export async function runAudioRestoration(
  prisma: PrismaClient,
  options: { limit?: number; shouldStop?: () => boolean } = {},
): Promise<{ total: number; restored: number; failed: number }> {
  const items: RestoreItem[] = await prisma.libraryItem.findMany({
    where: pendingWhere,
    select: { id: true, files: true },
    orderBy: { ingestedAt: 'asc' },
    take: options.limit,
  } as any);
  const result = { total: items.length, restored: 0, failed: 0 };
  for (const item of items) {
    if (options.shouldStop?.()) break;
    try {
      const files = Array.isArray(item.files) ? (item.files as any[]) : [];
      const done = await prisma.libraryAudioRestoration.findMany({ where: { itemId: item.id }, select: { fileIndex: true, level: true } });
      const have = new Set(done.map((row: { fileIndex: number; level: string }) => `${row.fileIndex}:${row.level}`));
      for (const [fileIndex, file] of files.entries()) {
        if (!String(file?.contentType ?? '').startsWith('audio/') || !file?.sourceUrl) continue;
        if (RESTORATION_LEVELS.every((level) => have.has(`${fileIndex}:${level}`))) continue;
        const started = Date.now();
        const versions = await restoreSide(String(file.sourceUrl));
        for (const level of RESTORATION_LEVELS) {
          const sha256 = await storeLibraryObject(prisma, versions[level], 'audio/mpeg');
          await prisma.libraryAudioRestoration.upsert({
            where: { itemId_fileIndex_level: { itemId: item.id, fileIndex, level } },
            create: { itemId: item.id, fileIndex, level, sha256 },
            update: { sha256 },
          });
        }
        logger.info({ itemId: item.id, fileIndex, seconds: Math.round((Date.now() - started) / 1000) }, 'Audio restoration: side done');
      }
      await prisma.libraryItem.update({ where: { id: item.id }, data: { restoredAt: new Date(), restoreError: null } } as any);
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
  return result;
}
