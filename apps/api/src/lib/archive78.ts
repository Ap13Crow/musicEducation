import type { PrismaClient } from '@my-music-coach/database';
import { ARCHIVE_DOWNLOAD_PREFIX } from './openSources.js';

// Historic classical recordings from the Internet Archive's 78 rpm
// collections (the Great 78 Project, collection "georgeblood", and the
// general "78rpm" collection), subject "Classical".
//
// One archive item is one side of a shellac disc, so a symphony arrives as
// a dozen items. Sides of the same work and performance (same title once
// "Part IV" is removed, same performers, label and year) become one Library
// item whose files are the sides, in order - the AudioPlayer's playlist.
//
// Copyright: only recordings published up to a cut-off year are imported
// automatically (AdminSetting library.historicRecordingsCutoffYear, default
// 1925 - public domain in the US, the EU and Switzerland alike). Undated
// sides are never auto-imported; the admin can review them in the import
// search.

const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; library import)';
const SEARCH_URL = 'https://archive.org/advancedsearch.php';
const BASE_QUERY = '(collection:georgeblood OR collection:78rpm) AND subject:classical';
export const CUTOFF_SETTING_KEY = 'library.historicRecordingsCutoffYear';
export const DEFAULT_CUTOFF_YEAR = 1925;
const METADATA_PAUSE_MS = 300;

export interface Side {
  identifier: string;
  title: string;
  creators: string[];
  year: number | null;
  publisher: string | null;
}

export interface SideFile {
  identifier: string;
  mp3: string;
  durationSeconds?: number;
  composer: string | null;
  performer: string | null;
  partLabel: string | null;
}

export interface Archive78Record {
  // The first side's identifier - stable, so re-imports update in place.
  ark: string;
  title: string;
  creator: string | null;
  performer: string | null;
  date: string | null;
  publisher: string | null;
  permalink: string;
  sides: Side[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url: string): Promise<any> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Internet Archive request failed (HTTP ${response.status}).`);
  return response.json();
}

const asArray = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : value ? [String(value)] : []);

// "SONATA IN C SHARP MINOR, Op. 27, No. 2" -> "Sonata in C Sharp Minor, Op. 27, No. 2"
const SMALL = new Set(['in', 'and', 'of', 'the', 'for', 'a', 'an', 'to', 'on', 'from', 'with', 'by', 'de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'und', 'der', 'die', 'das', 'von', 'aus', 'op.', 'no.', 'nr.']);
export function tidyTitle(title: string): string {
  // Shouting titles ("SONATA IN C SHARP MINOR, Op. 27"): most words in capitals.
  const words = title.match(/\p{L}{2,}/gu) ?? [];
  const shouted = words.filter((word) => word === word.toUpperCase()).length;
  if (!words.length || shouted / words.length < 0.5) return title.trim();
  return title
    .toLowerCase()
    .split(/(\s+)/)
    .map((word, index) => {
      if (/^\s+$/.test(word)) return word;
      if (/^[ivxlc]+[.,)]?$/.test(word) && word.length <= 5 && index > 0) return word.toUpperCase();
      if (index > 0 && SMALL.has(word)) return word === 'op.' ? 'Op.' : word === 'no.' ? 'No.' : word === 'nr.' ? 'Nr.' : word;
      return word.replace(/^([("'“‘]*)(\p{L})/u, (_, lead, letter) => lead + letter.toUpperCase());
    })
    .join('')
    .trim();
}

// "Moonlight Sonata Part IV" -> "Moonlight Sonata"; "Pt. 2", "Teil 3",
// "- Concluded", "(Continued)" too.
const PART_PATTERN = /[\s,;:-]*[([]?\s*(?:part|pt\.?|teil|side|seite|partie)\s*[ivxlc\d]+\s*[)\]]?\s*$|[\s,;:-]*[([]?\s*(?:concluded|continued|conclusion|schluss|fin|suite)\s*[)\]]?\s*$/i;
export function workTitle(title: string): { work: string; part: string | null } {
  let work = title.trim();
  let part: string | null = null;
  for (let i = 0; i < 3; i++) {
    const match = work.match(PART_PATTERN);
    if (!match || match.index === undefined || match.index === 0) break;
    part = part ?? match[0].replace(/^[\s,;:([-]+|[)\]]+$/g, '').trim();
    work = work.slice(0, match.index).trim();
  }
  return { work, part };
}

const keyText = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Only sides marked as parts ("Part II", "Concluded") are joined; the same
// unmarked title twice is the same recording in two pressings or copies,
// kept once. A repeated part marker is likewise a second copy.
export function groupSides(sides: Side[]): Archive78Record[] {
  const groups = new Map<string, Side[]>();
  const partsSeen = new Map<string, Set<string>>();
  for (const side of [...sides].sort((a, b) => a.identifier.localeCompare(b.identifier))) {
    const { work, part } = workTitle(side.title);
    const base = [keyText(work), side.creators.map(keyText).sort().join('|'), side.year ?? '', keyText(side.publisher ?? '')].join('#');
    const key = `${base}#${part ? 'parts' : 'single'}`;
    const list = groups.get(key) ?? [];
    if (!part && list.length) continue;
    if (part) {
      const seen = partsSeen.get(key) ?? new Set<string>();
      if (seen.has(keyText(part))) continue;
      seen.add(keyText(part));
      partsSeen.set(key, seen);
    }
    list.push(side);
    groups.set(key, list);
  }
  return [...groups.values()].map((group) => {
    const sorted = [...group].sort((a, b) => a.identifier.localeCompare(b.identifier));
    const first = sorted[0];
    return {
      ark: first.identifier,
      title: tidyTitle(workTitle(first.title).work),
      creator: null,
      performer: null,
      date: first.year ? String(first.year) : null,
      publisher: first.publisher,
      permalink: `https://archive.org/details/${first.identifier}`,
      sides: sorted,
    };
  });
}

export function archiveQuery(terms: string | null, yearFrom?: number | null, yearTo?: number | null, datedOnly = false): string {
  const parts = [BASE_QUERY];
  if (terms?.trim()) {
    const words = terms.replace(/["():\\[\]{}^~*?]/g, ' ').split(/\s+/).filter((word) => word && !/^(and|or|not)$/i.test(word));
    if (words.length) parts.push(`(${words.join(' AND ')})`);
  }
  if (yearFrom || yearTo || datedOnly) parts.push(`year:[${Math.trunc(yearFrom ?? 1880)} TO ${Math.trunc(yearTo ?? 2100)}]`);
  return parts.join(' AND ');
}

function toSide(doc: any): Side {
  const year = Number(doc.year ?? String(doc.date ?? '').slice(0, 4));
  return {
    identifier: String(doc.identifier),
    title: String(asArray(doc.title)[0] ?? doc.identifier),
    creators: asArray(doc.creator),
    year: Number.isInteger(year) && year > 1850 ? year : null,
    publisher: asArray(doc.publisher)[0] ?? null,
  };
}

const FIELDS = ['identifier', 'title', 'creator', 'year', 'date', 'publisher'];

export async function searchSides(query: string, page: number, rows: number, sort = 'titleSorter asc'): Promise<{ total: number; sides: Side[] }> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('q', query);
  for (const field of FIELDS) url.searchParams.append('fl[]', field);
  url.searchParams.append('sort[]', sort);
  url.searchParams.append('sort[]', 'identifier asc');
  url.searchParams.set('rows', String(rows));
  url.searchParams.set('page', String(page));
  url.searchParams.set('output', 'json');
  const data = await getJson(url.toString());
  return { total: Number(data?.response?.numFound ?? 0), sides: (data?.response?.docs ?? []).map(toSide) };
}

// "<b>Performer:</b> SOLOMON<br /><b>Writer:</b> Beethoven" in the item
// description says who is who; creator alone mixes both.
function descriptionField(description: string, label: string): string | null {
  const match = description.match(new RegExp(`<b>${label}:</b>\\s*([^<]+)`, 'i'));
  return match ? match[1].trim() : null;
}

export async function fetchSideFile(identifier: string): Promise<SideFile | null> {
  const data = await getJson(`https://archive.org/metadata/${encodeURIComponent(identifier)}`);
  const files: any[] = data?.files ?? [];
  // The "friendly" mp3 George Blood's engineer picked; any VBR MP3 otherwise.
  const mp3 = files.find((file) => file.format === 'VBR MP3' && !/_(restored|78)\./i.test(file.name)) ?? files.find((file) => String(file.name).endsWith('.mp3'));
  if (!mp3) return null;
  const description = asArray(data?.metadata?.description).join(' ');
  const length = Number(mp3.length);
  return {
    identifier,
    mp3: mp3.name,
    durationSeconds: Number.isFinite(length) && length > 0 ? Math.round(length) : undefined,
    composer: descriptionField(description, 'Writer') ?? descriptionField(description, 'Composer'),
    performer: descriptionField(description, 'Performer'),
    partLabel: workTitle(String(asArray(data?.metadata?.title)[0] ?? '')).part,
  };
}

const encodePath = (path: string) => path.split('/').map(encodeURIComponent).join('/');

export function sideFileUrl(file: SideFile): string {
  return `${ARCHIVE_DOWNLOAD_PREFIX}${encodeURIComponent(file.identifier)}/${encodePath(file.mp3)}`;
}

// Composers are written "BEETHOVEN", "Beethoven", "L. van Beethoven"...
const tidyName = (name: string | null) => (name ? tidyTitle(name) : null);

export function archiveItemData(record: Archive78Record, files: SideFile[], cutoffYear: number | null) {
  const composer = tidyName(files.find((file) => file.composer)?.composer ?? null);
  const performer = tidyName(files.find((file) => file.performer)?.performer ?? null);
  const pd = record.date && cutoffYear && Number(record.date) <= cutoffYear;
  return {
    category: 'AUDIO_RECORDING' as const,
    title: record.title,
    creator: composer ?? tidyName(record.sides[0].creators.find((name) => name !== performer) ?? null),
    date: record.date,
    documentType: `78 rpm record${record.publisher ? ` · ${record.publisher}` : ''}${performer ? ` · ${performer}` : ''}`,
    isPublicDomainWork: Boolean(pd),
    permalink: record.permalink,
    files: files.map((file, index) => ({
      label: files.length > 1 ? `Side ${index + 1}${file.partLabel ? ` (${file.partLabel})` : ''}` : 'Recording',
      sourceUrl: sideFileUrl(file),
      contentType: 'audio/mpeg',
      ...(file.durationSeconds ? { durationSeconds: file.durationSeconds } : {}),
    })),
    license: pd ? `Public domain (published ${record.date})` : 'Historic recording - rights checked by admin',
    attribution: `Great 78 Project · Internet Archive${record.publisher ? ` · ${record.publisher}` : ''}`,
  };
}

export async function historicCutoffYear(prisma: PrismaClient): Promise<number> {
  const row = await prisma.adminSetting.findUnique({ where: { key: CUTOFF_SETTING_KEY } });
  const year = Number(row?.value);
  return Number.isInteger(year) && year >= 1880 && year <= 2000 ? year : DEFAULT_CUTOFF_YEAR;
}

// Creates or updates one grouped record with its side files.
export async function upsertArchiveRecord(prisma: PrismaClient, record: Archive78Record, cutoffYear: number | null, seedQuery: string | null) {
  const files: SideFile[] = [];
  for (const side of record.sides) {
    const file = await fetchSideFile(side.identifier);
    if (file) files.push(file);
    await sleep(METADATA_PAUSE_MS);
  }
  if (!files.length) return null;
  const data = { ...archiveItemData(record, files, cutoffYear), seedQuery };
  return prisma.libraryItem.upsert({
    where: { source_ark: { source: 'INTERNET_ARCHIVE' as any, ark: record.ark } },
    create: { source: 'INTERNET_ARCHIVE' as any, ark: record.ark, ...data, files: data.files as any },
    update: { ...data, files: data.files as any },
    select: { id: true, shortId: true, title: true, source: true },
  });
}

// The automatic import: every dated classical 78 up to the cut-off year.
export async function importArchive78(
  prisma: PrismaClient,
  onProgress?: (done: number, total: number) => Promise<void> | void,
): Promise<{ total: number; upserted: number; cutoffYear: number }> {
  const cutoffYear = await historicCutoffYear(prisma);
  const query = archiveQuery(null, 1880, cutoffYear, true);
  const sides: Side[] = [];
  for (let page = 1; page <= 200; page++) {
    const result = await searchSides(query, page, 500);
    sides.push(...result.sides);
    if (sides.length >= result.total || !result.sides.length) break;
    await sleep(1000);
  }
  const records = groupSides(sides);
  const existing = new Set(
    (await prisma.libraryItem.findMany({ where: { source: 'INTERNET_ARCHIVE' as any }, select: { ark: true } })).map((row: { ark: string }) => row.ark),
  );
  // Only new works fetch per-side metadata; known ones are left alone.
  const fresh = records.filter((record) => !existing.has(record.ark));
  let upserted = 0;
  for (const [index, record] of fresh.entries()) {
    try {
      if (await upsertArchiveRecord(prisma, record, cutoffYear, 'great78')) upserted += 1;
    } catch {
      // One unreadable item doesn't stop the run; the next run retries it.
    }
    await onProgress?.(index + 1, fresh.length);
  }
  return { total: records.length, upserted, cutoffYear };
}
