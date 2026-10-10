import type { PrismaClient } from '@my-music-coach/database';
import { creatorTokens, titleKey } from './libraryMatch.js';

// The same recording more than once in the Library: one shellac disc
// digitised twice by the Internet Archive (or issued on two labels - Mischa
// Elman's Ave Maria came out on Grammophon in 1913 and on HMV in 1924, one
// matrix), or one recording catalogued twice by a Europeana provider.
//
// Two items are the same recording only when the evidence says so:
// - identical stored audio (same SHA-256 in the media store), or
// - the same matrix number - one recorded take - and the same work, or
// - the same work, composer, performers, label and year AND lengths within
//   a few seconds (Europeana has no matrix numbers; its records do give
//   the length).
// Without lengths or performers nothing is merged: the same singer may
// well have recorded the same song twice, and different takes (Edison's
// 3815-A and 3815-C) are different performances, so they stay.
//
// Duplicates are hidden (hiddenAt), never deleted, and an item someone
// uses - favourite, folder, lesson - is never hidden.

export const DUPLICATE_SOURCES = ['INTERNET_ARCHIVE', 'EUROPEANA'] as const;

export interface RecordingFacts {
  id: string;
  source: string;
  title: string;
  creator: string | null;
  date: string | null;
  documentType: string | null;
  files: any[];
  sha256s: string[];
  uses: number;
  mirrored: boolean;
  ingestedAt: Date;
}

// The work's main title: "Ave Maria: meditation" and "Ave Maria" are one
// work catalogued twice (the other checks decide whether it is one recording).
export const workKey = (title: string) => titleKey(title.split(/\s*[:;]\s*/)[0]);

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// "78 rpm record · Edison · Marie Rappold; Albert Spalding" and
// "Sound recording · Ada Benefelde; Verners Taube". A 78 with only one
// detail can't say whether it is the label or the performer - no performers.
export function recordingParts(item: Pick<RecordingFacts, 'source' | 'documentType'>): { label: string | null; performers: string[] } {
  const parts = (item.documentType ?? '').split(' · ').map((part) => part.trim()).filter(Boolean);
  const split = (text: string | undefined) => (text ? text.split(/\s*;\s*/).filter(Boolean) : []);
  if (item.source === 'INTERNET_ARCHIVE') return { label: parts[1] ?? null, performers: parts.length >= 3 ? split(parts[2]) : [] };
  return { label: null, performers: split(parts[1]) };
}

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 3) return 99;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    previous = current;
  }
  return previous[b.length];
}

// "MARIE RAPPOLD" and "Marie Rappoli" (a cataloguer's typo) are one singer;
// "Kārkliņa-Olava, Marina" and "Marina Karklina-Olava" too.
const personKey = (name: string) => fold(name).replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((word) => word.length > 1 && !['miss', 'mrs', 'mr', 'mme', 'and', 'her', 'his'].includes(word)).sort().join(' ');
export function samePerson(a: string, b: string): boolean {
  const left = personKey(a);
  const right = personKey(b);
  return Boolean(left && right) && (left === right || editDistance(left, right) <= Math.max(1, Math.floor(Math.min(left.length, right.length) / 8)));
}

// Every performer of the shorter list is in the longer one (a second copy
// often names only the singer, not the violinist).
function samePerformers(a: string[], b: string[]): boolean {
  if (!a.length || !b.length) return false;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.every((name) => long.some((other) => samePerson(name, other)));
}

const totalLength = (files: any[]): number | null => {
  const lengths = files.map((file) => Number(file?.durationSeconds));
  return lengths.length && lengths.every((length) => Number.isFinite(length) && length > 0) ? lengths.reduce((sum, length) => sum + length, 0) : null;
};
const matrices = (files: any[]): string[] => files.map((file) => (typeof file?.matrix === 'string' ? file.matrix.replace(/\s+/g, '').toUpperCase() : '')).filter(Boolean);

// Lengths only count as evidence for real pieces: a few seconds of sound
// (a bird call, a jingle) are alike whatever they are.
const MIN_COMPARABLE_SECONDS = 30;
function closeLengths(a: number | null, b: number | null, tolerance: number): boolean {
  if (a === null || b === null || Math.min(a, b) < MIN_COMPARABLE_SECONDS) return false;
  return Math.abs(a - b) <= Math.max(3, tolerance * Math.max(a, b));
}

export function sameRecording(a: RecordingFacts, b: RecordingFacts): boolean {
  if (a.id === b.id || a.source !== b.source) return false;
  if (a.sha256s.some((sha) => b.sha256s.includes(sha))) return true;
  const key = workKey(a.title);
  if (key.length < 3 || key !== workKey(b.title) || a.files.length !== b.files.length) return false;
  const composersA = creatorTokens(a.creator);
  const composersB = creatorTokens(b.creator);
  if (composersA.size && composersB.size && ![...composersA].some((word) => composersB.has(word))) return false;
  const partsA = recordingParts(a);
  const partsB = recordingParts(b);
  const lengthA = totalLength(a.files);
  const lengthB = totalLength(b.files);

  // One matrix number is one take, whatever label or year it was issued under.
  const matrixA = matrices(a.files);
  const matrixB = matrices(b.files);
  if (matrixA.length === a.files.length && matrixB.length === b.files.length) {
    const exact = matrixA.every((matrix, index) => matrix === matrixB[index]);
    // A typo in one catalogue ("075995" for "07995") - numbers only, since a
    // different letter is a different take (CK4015-A, CK4015-F) - and only
    // with the same performers and practically the same length.
    const numeric = (matrix: string) => /^[\d-]+$/.test(matrix);
    const typo = matrixA.every((matrix, index) => numeric(matrix) && numeric(matrixB[index]) && editDistance(matrix, matrixB[index]) <= 1) && samePerformers(partsA.performers, partsB.performers) && closeLengths(lengthA, lengthB, 0.01);
    return exact || typo;
  }

  if (!samePerformers(partsA.performers, partsB.performers)) return false;
  if (a.date && b.date && a.date !== b.date) return false;
  if (partsA.label && partsB.label && fold(partsA.label) !== fold(partsB.label)) return false;
  return closeLengths(lengthA, lengthB, 0.02);
}

// Connected groups (A=B and B=C put A, B and C together), only ever
// comparing items with the same title.
export function duplicateGroups(items: RecordingFacts[]): RecordingFacts[][] {
  const byTitle = new Map<string, RecordingFacts[]>();
  for (const item of items) {
    const key = `${item.source}#${workKey(item.title)}`;
    byTitle.set(key, [...(byTitle.get(key) ?? []), item]);
  }
  const groups: RecordingFacts[][] = [];
  for (const bucket of byTitle.values()) {
    if (bucket.length < 2) continue;
    const parent = bucket.map((_, index) => index);
    const find = (index: number): number => (parent[index] === index ? index : (parent[index] = find(parent[index])));
    for (let i = 0; i < bucket.length; i++) for (let j = i + 1; j < bucket.length; j++) if (sameRecording(bucket[i], bucket[j])) parent[find(i)] = find(j);
    const sets = new Map<number, RecordingFacts[]>();
    bucket.forEach((item, index) => sets.set(find(index), [...(sets.get(find(index)) ?? []), item]));
    groups.push(...[...sets.values()].filter((group) => group.length > 1));
  }
  return groups;
}

// The copy to keep: one people use, then a stored (mirrored) one, then the
// one with the most detail, then the first imported.
export function rankForKeeping(group: RecordingFacts[]): RecordingFacts[] {
  const detail = (item: RecordingFacts) => recordingParts(item).performers.length * 10 + (item.date ? 5 : 0) + (totalLength(item.files) ? 3 : 0) + matrices(item.files).length;
  return [...group].sort(
    (a, b) =>
      Number(b.uses > 0) - Number(a.uses > 0) ||
      Number(b.mirrored) - Number(a.mirrored) ||
      detail(b) - detail(a) ||
      a.ingestedAt.getTime() - b.ingestedAt.getTime(),
  );
}

export async function loadRecordingFacts(prisma: PrismaClient, where: Record<string, unknown> = {}): Promise<RecordingFacts[]> {
  const rows = await prisma.libraryItem.findMany({
    where: { category: 'AUDIO_RECORDING', hiddenAt: null, source: { in: [...DUPLICATE_SOURCES] }, ...where } as any,
    select: {
      id: true, source: true, title: true, creator: true, date: true, documentType: true, files: true, mirroredAt: true, ingestedAt: true,
      media: { select: { sha256: true } },
      _count: { select: { favorites: true, folderEntries: true, lessonReferences: true } },
    },
  });
  return rows.map((row: any) => ({
    id: row.id,
    source: row.source,
    title: row.title,
    creator: row.creator,
    date: row.date,
    documentType: row.documentType,
    files: Array.isArray(row.files) ? row.files : [],
    sha256s: row.media.map((media: { sha256: string }) => media.sha256),
    uses: row._count.favorites + row._count.folderEntries + row._count.lessonReferences,
    mirrored: Boolean(row.mirroredAt),
    ingestedAt: row.ingestedAt,
  }));
}

export interface DuplicateReport {
  groups: { keep: { id: string; title: string; documentType: string | null }; hide: { id: string; documentType: string | null }[] }[];
  hidden: number;
}

// Finds duplicate recordings and (with apply) hides all but one per group.
// `onlyIds`: just the groups touching these items (after an import).
export async function hideDuplicateRecordings(prisma: PrismaClient, options: { apply: boolean; onlyIds?: string[] }): Promise<DuplicateReport> {
  let items = await loadRecordingFacts(prisma);
  if (options.onlyIds) {
    const wanted = new Set(items.filter((item) => options.onlyIds!.includes(item.id)).map((item) => `${item.source}#${workKey(item.title)}`));
    items = items.filter((item) => wanted.has(`${item.source}#${workKey(item.title)}`));
  }
  const report: DuplicateReport = { groups: [], hidden: 0 };
  for (const group of duplicateGroups(items)) {
    const [keep, ...rest] = rankForKeeping(group);
    const hide = rest.filter((item) => item.uses === 0);
    if (!hide.length) continue;
    report.groups.push({ keep: { id: keep.id, title: keep.title, documentType: keep.documentType }, hide: hide.map((item) => ({ id: item.id, documentType: item.documentType })) });
    if (options.apply) {
      const result = await prisma.libraryItem.updateMany({ where: { id: { in: hide.map((item) => item.id) }, hiddenAt: null }, data: { hiddenAt: new Date() } });
      report.hidden += result.count;
    }
  }
  return report;
}
