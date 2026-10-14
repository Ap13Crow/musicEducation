import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GraphQLError } from 'graphql';
import type { PrismaClient } from '@my-music-coach/database';
import { deleteStoredUpload, libraryMediaStoreConfigured, readStoredUpload, storeLibraryObject } from './libraryMediaStore.js';
import { isOwnedUploadUrl, localKeyFromUrl } from './storage.js';
import { libraryShareUrl } from './libraryLinks.js';
import { relinkLibraryWorksSoon } from './libraryWorkLinks.js';
import { logger } from '../utils/logger.js';

// Recordings uploaded by teachers and admins (LibrarySource UPLOAD). They
// appear in the public Library like any other recording - the same player,
// the same noise-reduction versions (lib/audioRestoration.ts) - and their
// uploader can present them in courses and on event cards. Admins may use
// every recording; a teacher only their own uploads (canUseInTeaching).
//
// Labelling is required (work, composer, performers), and a recording under
// copyright needs the uploader's confirmation of RIGHTS_GRANT, stored word
// for word with the date on the item.

export const RIGHTS_GRANT_VERSION = '2026-10-14';
export const RIGHTS_GRANT =
  'I confirm that I hold all rights in this recording - in the music, in the performance and in the sound recording itself - ' +
  'or that every rights holder has authorised me to grant them. I grant mymusic.coach the unlimited and unrestricted right to use ' +
  'this recording: worldwide, without time limit, free of charge and irrevocably, in any form and in any medium - including ' +
  'publishing it in the public Library, using it in courses and at events, editing and processing it (for example noise ' +
  'reduction), and passing these rights on. I keep my own right to use the recording elsewhere.';

const MAX_UPLOAD_BYTES = 150 * 1024 * 1024;
const MAX_TRACKS = 30;
const MAX_TAGS = 12;
const SKILL_LEVELS = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'];

// What the browser says -> what we store and serve (Safari wants these).
const AUDIO_TYPES: Record<string, string> = {
  'audio/mpeg': 'audio/mpeg',
  'audio/mp3': 'audio/mpeg',
  'audio/mp4': 'audio/mp4',
  'audio/x-m4a': 'audio/mp4',
  'audio/aac': 'audio/aac',
  'audio/wav': 'audio/wav',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/vnd.wave': 'audio/wav',
  'audio/flac': 'audio/flac',
  'audio/x-flac': 'audio/flac',
};

type User = { id: string; role: string };

export type RecordingCopyright = 'PUBLIC_DOMAIN' | 'PROTECTED';

export interface RecordingLabels {
  title: string;
  composer: string;
  performers: string;
  date?: string | null;
  description?: string | null;
  instruments?: string[] | null;
  musicStyles?: string[] | null;
  skillLevels?: string[] | null;
  rightsHolder?: string | null;
}

export interface CreateRecordingInput extends RecordingLabels {
  tracks: Array<{ fileUrl: string; label?: string | null }>;
  copyright: RecordingCopyright;
  rightsConfirmed?: boolean | null;
}

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

function text(value: unknown, name: string, max: number, required: boolean): string | null {
  const trimmed = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  if (!trimmed) {
    if (required) badInput(`Please fill in ${name}.`);
    return null;
  }
  if (trimmed.length > max) badInput(`Keep ${name} under ${max} characters.`);
  return trimmed;
}

function tags(values: unknown, name: string): string[] {
  const list = Array.isArray(values) ? values : [];
  const cleaned = [...new Set(list.map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean))];
  if (cleaned.length > MAX_TAGS) badInput(`Choose at most ${MAX_TAGS} ${name}.`);
  if (cleaned.some((value) => value.length > 60)) badInput(`Keep each of the ${name} under 60 characters.`);
  return cleaned;
}

// The labels shared by create and update, checked and cleaned.
export function cleanLabels(input: RecordingLabels) {
  const skillLevels = tags(input.skillLevels, 'levels');
  if (skillLevels.some((level) => !SKILL_LEVELS.includes(level))) badInput('Unknown level.');
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  if (description.length > 4000) badInput('Keep the description under 4,000 characters.');
  const performers = text(input.performers, 'the performers', 300, true)!;
  return {
    title: text(input.title, 'the title of the work', 300, true)!,
    creator: text(input.composer, 'the composer', 200, true)!,
    performers,
    // Shown after composer and date on the item page, and searchable (the
    // Library's search index covers documentType, not performers).
    documentType: `Performed by ${performers}`,
    date: text(input.date, 'the recording date', 40, false),
    description: description || null,
    instruments: tags(input.instruments, 'instruments'),
    musicStyles: tags(input.musicStyles, 'styles'),
    skillLevels,
  };
}

// License and credit line shown with the player.
export function rightsLabels(copyright: RecordingCopyright, rightsHolder: string | null, year: string | null) {
  if (copyright === 'PUBLIC_DOMAIN') return { license: 'Public Domain', attribution: 'Uploaded to mymusic.coach' };
  return {
    license: 'All rights reserved - used by mymusic.coach with permission',
    attribution: `© ${[year?.match(/\d{4}/)?.[0], rightsHolder].filter(Boolean).join(' ')}`,
  };
}

// Admins may use every recording in their courses and events; a teacher any
// open Library item but, of the uploaded recordings, only their own.
export function canUseInTeaching(user: User | null | undefined, item: { source: string; uploadedById?: string | null }): boolean {
  if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) return false;
  if (user.role === 'ADMIN') return true;
  return item.source !== 'UPLOAD' || item.uploadedById === user.id;
}

export function requireRecordingOwner(user: User, item: { source: string; uploadedById: string | null } | null) {
  if (!item || item.source !== 'UPLOAD') throw new GraphQLError('Recording not found.', { extensions: { code: 'NOT_FOUND' } });
  if (user.role !== 'ADMIN' && item.uploadedById !== user.id) {
    throw new GraphQLError('Only the teacher who uploaded this recording (or an admin) may change it.', { extensions: { code: 'FORBIDDEN' } });
  }
}

function run(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr = (stderr + chunk).slice(-1000)));
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve(stdout) : reject(new Error(stderr.trim() || `${command} exited ${code}`))));
  });
}

// Length in seconds, or an error when the file holds no audio ffmpeg can read.
export async function probeAudio(bytes: Buffer): Promise<number | null> {
  const dir = await mkdtemp(join(tmpdir(), 'recording-'));
  try {
    const path = join(dir, 'upload');
    await writeFile(path, bytes);
    const output = await run('ffprobe', [
      '-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_type:format=duration', '-of', 'json', path,
    ]);
    const parsed = JSON.parse(output || '{}');
    if (!parsed?.streams?.some((stream: any) => stream?.codec_type === 'audio')) throw new Error('no audio stream');
    const seconds = Number(parsed?.format?.duration);
    return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : null;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export async function createLibraryRecording(prisma: PrismaClient, user: User, input: CreateRecordingInput) {
  if (!libraryMediaStoreConfigured()) {
    throw new GraphQLError('Recording uploads are not configured on this deployment yet.', { extensions: { code: 'STORAGE_NOT_CONFIGURED' } });
  }
  const labels = cleanLabels(input);
  const copyright: RecordingCopyright = input.copyright === 'PUBLIC_DOMAIN' ? 'PUBLIC_DOMAIN' : 'PROTECTED';
  const rightsHolder = copyright === 'PROTECTED' ? text(input.rightsHolder, 'the rights holder', 200, true) : null;
  if (copyright === 'PROTECTED' && input.rightsConfirmed !== true) {
    badInput('Please confirm that you grant mymusic.coach the rights to use this recording.');
  }
  const tracks = Array.isArray(input.tracks) ? input.tracks : [];
  if (tracks.length === 0) badInput('Add at least one audio file.');
  if (tracks.length > MAX_TRACKS) badInput(`A recording can have at most ${MAX_TRACKS} tracks.`);

  // Each upload: ours, real audio, then moved into the content-addressed store.
  const files: Array<{ label: string; sourceUrl: string; contentType: string; durationSeconds: number | null; sha256: string; key: string }> = [];
  for (const [index, track] of tracks.entries()) {
    const key = typeof track?.fileUrl === 'string' ? localKeyFromUrl(track.fileUrl) : null;
    if (!key || !isOwnedUploadUrl(track.fileUrl, 'LIBRARY_RECORDING', user.id)) {
      badInput('Each file must come from requestUploadUrl(purpose: LIBRARY_RECORDING).');
    }
    const { bytes, contentType: storedType } = await readStoredUpload(key, MAX_UPLOAD_BYTES).catch(() =>
      badInput(`File ${index + 1} was not uploaded completely - please upload it again.`),
    );
    const contentType = AUDIO_TYPES[storedType.toLowerCase()];
    if (!contentType) badInput(`File ${index + 1} is not a supported audio format (MP3, M4A/AAC, WAV or FLAC).`);
    const durationSeconds = await probeAudio(bytes).catch(() => badInput(`File ${index + 1} does not contain audio we can play.`));
    const sha256 = await storeLibraryObject(prisma, bytes, contentType);
    const label = text(track.label, `the title of track ${index + 1}`, 200, false) ?? (tracks.length === 1 ? labels.title : `Track ${index + 1}`);
    files.push({ label, sourceUrl: track.fileUrl, contentType, durationSeconds, sha256, key });
  }

  const grantedAt = new Date();
  const created = await prisma.libraryItem.create({
    data: {
      source: 'UPLOAD',
      ark: randomUUID(),
      category: 'AUDIO_RECORDING',
      ...labels,
      isPublicDomainWork: copyright === 'PUBLIC_DOMAIN',
      // Replaced by the item's own share link right below (shortId is
      // assigned by the database).
      permalink: '',
      files: files.map(({ label, sourceUrl, contentType, durationSeconds }) => ({ label, sourceUrl, contentType, durationSeconds })),
      ...rightsLabels(copyright, rightsHolder, labels.date),
      // The uploader's tags are the item's tags - the classifier leaves it be.
      classifiedAt: grantedAt,
      // Already in our own store: nothing for the mirror to copy.
      mirroredAt: grantedAt,
      uploadedById: user.id,
      rightsHolder,
      rightsGrant: copyright === 'PROTECTED' ? `[${RIGHTS_GRANT_VERSION}] ${RIGHTS_GRANT}` : null,
      rightsGrantedAt: copyright === 'PROTECTED' ? grantedAt : null,
      media: {
        create: files.map((file, position) => ({
          kind: 'FILE',
          position,
          label: file.label,
          durationSeconds: file.durationSeconds,
          sha256: file.sha256,
          sourceUrl: file.sourceUrl,
        })),
      },
    } as any,
  });
  const item = await prisma.libraryItem.update({ where: { id: created.id }, data: { permalink: libraryShareUrl(created.shortId) } });
  // The upload copies are no longer needed once the Library holds the audio.
  for (const file of files) {
    await deleteStoredUpload(file.key).catch((error) => logger.warn({ error, key: file.key }, 'Uploaded recording copy not removed'));
  }
  relinkLibraryWorksSoon(prisma);
  logger.info({ itemId: item.id, userId: user.id, tracks: files.length, copyright }, 'Library recording uploaded');
  return item;
}

export async function updateLibraryRecording(prisma: PrismaClient, user: User, id: string, input: RecordingLabels) {
  const item = await prisma.libraryItem.findUnique({ where: { id } });
  requireRecordingOwner(user, item as any);
  const labels = cleanLabels(input);
  const isProtected = Boolean(item!.rightsGrantedAt);
  const rightsHolder = isProtected ? text(input.rightsHolder ?? item!.rightsHolder, 'the rights holder', 200, true) : null;
  const updated = await prisma.libraryItem.update({
    where: { id },
    data: {
      ...labels,
      rightsHolder,
      ...rightsLabels(isProtected ? 'PROTECTED' : 'PUBLIC_DOMAIN', rightsHolder, labels.date),
      classifiedAt: new Date(),
    } as any,
  });
  relinkLibraryWorksSoon(prisma);
  return updated;
}

// Removes the recording from the Library and from every course and event
// that used it. Restored versions go with it.
export async function deleteLibraryRecording(prisma: PrismaClient, user: User, id: string): Promise<boolean> {
  const item = await prisma.libraryItem.findUnique({ where: { id }, select: { source: true, uploadedById: true } });
  requireRecordingOwner(user, item as any);
  await prisma.libraryItem.delete({ where: { id } });
  logger.info({ itemId: id, userId: user.id }, 'Library recording deleted');
  return true;
}

// The recordings a teacher or admin may choose from for a course or an
// event (canUseInTeaching): uploads first - a teacher's own, an admin's
// every one - then the open Library's recordings.
export async function teachingRecordings(prisma: PrismaClient, user: User, query: string | null | undefined, limit = 20) {
  const take = Math.min(Math.max(limit, 1), 50);
  const words = (query ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 6);
  const where: any = {
    category: 'AUDIO_RECORDING',
    hiddenAt: null,
    AND: words.map((word) => ({
      OR: ['title', 'creator', 'performers'].map((field) => ({ [field]: { contains: word, mode: 'insensitive' } })),
    })),
  };
  const uploads = await prisma.libraryItem.findMany({
    where: { ...where, source: 'UPLOAD', ...(user.role === 'ADMIN' ? {} : { uploadedById: user.id }) },
    orderBy: { ingestedAt: 'desc' },
    take,
  });
  // Without a search, only the uploads: the open Library is too big to list.
  if (uploads.length >= take || words.length === 0) return uploads;
  const others = await prisma.libraryItem.findMany({
    where: { ...where, source: { not: 'UPLOAD' } },
    orderBy: { title: 'asc' },
    take: take - uploads.length,
  });
  return [...uploads, ...others];
}
