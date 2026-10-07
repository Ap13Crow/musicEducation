import type { PrismaClient } from '@my-music-coach/database';
import type { LibraryFileSource } from './openscore.js';

// Openly licensed Library sources beyond OpenScore (lib/openscore.ts):
//   - Musopen recordings, via the Internet Archive's open metadata API. Only
//     Musopen's own uploads whose item licence is public domain (PD Mark or
//     CC0) - several other "MUSOPEN:" items there carry no licence at all.
//   - Mutopia Project engraved scores: piece folders listed from the
//     project's GitHub tree, then each piece's RDF metadata (title, composer,
//     instrumentation, licence, PDF names) from mutopiaproject.org. Every
//     Mutopia licence (Public Domain, CC BY, CC BY-SA) permits commercial
//     reuse with attribution.

const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; library import)';
export const ARCHIVE_DOWNLOAD_PREFIX = 'https://archive.org/download/';
export const MUTOPIA_FTP_PREFIX = 'https://www.mutopiaproject.org/ftp/';

export interface OpenSourceRecord {
  ark: string;
  category: 'SHEET_MUSIC' | 'AUDIO_RECORDING';
  title: string;
  creator: string | null;
  date: string | null;
  documentType: string;
  permalink: string;
  license: string;
  attribution: string;
  files: (LibraryFileSource & { durationSeconds?: number })[];
}

async function fetchOk(url: string, accept?: string): Promise<Response> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, ...(accept ? { Accept: accept } : {}) },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Fetch failed (${response.status}) for ${url}`);
  return response;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

// Some archive.org track tags are UTF-8 that was mis-decoded as
// Windows-1252 ("AntonÃ­n DvoÅ™Ã¡k" for "Antonín Dvořák" - the
// ™ is cp1252 byte 0x99, not Latin-1). Re-encode to those bytes and
// decode as UTF-8; anything that doesn't round-trip cleanly is left as is.
const CP1252_HIGH: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91,
  0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

export function repairMojibake(text: string): string {
  if (!/[Â-Æ][^\x00-\x7f]/.test(text)) return text;
  const bytes: number[] = [];
  for (const char of text) {
    const code = char.codePointAt(0)!;
    const byte = code < 0x100 ? code : CP1252_HIGH[code];
    if (byte === undefined) return text;
    bytes.push(byte);
  }
  const repaired = Buffer.from(bytes).toString('utf8');
  return repaired.includes('�') ? text : repaired;
}

// archive.org track length is "01:35", "1:02:03" or seconds ("339.97").
export function parseDuration(length: string | undefined): number | undefined {
  if (!length) return undefined;
  if (/^\d+(\.\d+)?$/.test(length)) return Math.round(Number(length));
  const parts = length.split(':').map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return undefined;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

// "Composer - 01 - Work - Movement" (Goldberg), "Composer - Work - 01 -
// Movement" (most), or "Composer - Work" (single-movement overtures).
export function parseMusopenTitle(title: string): { composer: string; work: string; movement: string } {
  const [composer, ...rest] = title.split(' - ').map((part) => part.trim());
  const numberAt = rest.findIndex((part) => /^\d+$/.test(part));
  if (numberAt === -1) return { composer, work: rest.join(' - '), movement: rest.join(' - ') };
  if (numberAt === 0) return { composer, work: rest[1] ?? '', movement: rest.slice(2).join(' - ') || rest[1] || '' };
  return { composer, work: rest.slice(0, numberAt).join(' - '), movement: rest.slice(numberAt + 1).join(' - ') };
}

const PUBLIC_DOMAIN_LICENSES: Record<string, string> = {
  'creativecommons.org/publicdomain/mark/1.0': 'Public Domain Mark 1.0',
  'creativecommons.org/publicdomain/zero/1.0': 'CC0-1.0',
};

function publicDomainLicense(licenseUrl: string | undefined): string | null {
  const key = Object.keys(PUBLIC_DOMAIN_LICENSES).find((url) => licenseUrl?.includes(url));
  return key ? PUBLIC_DOMAIN_LICENSES[key] : null;
}

interface ArchiveFile {
  name: string;
  format?: string;
  title?: string;
  creator?: string;
  length?: string;
}

// Each Musopen upload, and how its tracks group into Library items: the
// collection is one folder per work (movements become a playlist), the
// Chopin set is one piece per file.
const MUSOPEN_ITEMS = [
  { identifier: 'MusopenCollectionAsFlac', grouping: 'folder' as const },
  { identifier: 'musopen-chopin-complete-works-flac', grouping: 'file' as const, composer: 'Frédéric Chopin' },
];

export function buildMusopenRecords(
  identifier: string,
  grouping: 'folder' | 'file',
  license: string,
  files: ArchiveFile[],
  fixedComposer?: string,
): OpenSourceRecord[] {
  const mp3s = files.filter((file) => file.name.toLowerCase().endsWith('.mp3')).sort((a, b) => a.name.localeCompare(b.name));
  const groups = new Map<string, ArchiveFile[]>();
  for (const file of mp3s) {
    const key = grouping === 'folder' && file.name.includes('/') ? file.name.split('/')[0] : file.name;
    groups.set(key, [...(groups.get(key) ?? []), file]);
  }
  const records: OpenSourceRecord[] = [];
  for (const [key, tracks] of groups) {
    const first = tracks[0];
    const rawTitle = repairMojibake(first.title ?? first.name.split('/').pop()!.replace(/\.mp3$/i, ''));
    const parsed = fixedComposer ? { composer: fixedComposer, work: rawTitle, movement: rawTitle } : parseMusopenTitle(rawTitle);
    const performers = [...new Set(tracks.map((track) => repairMojibake(track.creator ?? '')).filter(Boolean))];
    records.push({
      ark: `${identifier}:${key}`,
      category: 'AUDIO_RECORDING',
      title: parsed.work || rawTitle,
      creator: parsed.composer || null,
      date: null,
      documentType: ['Recording', performers.join(', ')].filter(Boolean).join(' · '),
      permalink: `https://archive.org/details/${identifier}`,
      license,
      attribution: `Musopen (musopen.org)${performers.length ? ` - ${performers.join(', ')}` : ''}, via the Internet Archive`,
      files: tracks.map((track, index) => {
        const trackTitle = repairMojibake(track.title ?? track.name.split('/').pop()!.replace(/\.mp3$/i, ''));
        const label = fixedComposer ? trackTitle : parseMusopenTitle(trackTitle).movement || `Track ${index + 1}`;
        return {
          label,
          sourceUrl: `${ARCHIVE_DOWNLOAD_PREFIX}${identifier}/${encodePath(track.name)}`,
          contentType: 'audio/mpeg',
          durationSeconds: parseDuration(track.length),
        };
      }),
    });
  }
  return records;
}

export async function fetchMusopenRecords(): Promise<OpenSourceRecord[]> {
  const records: OpenSourceRecord[] = [];
  for (const source of MUSOPEN_ITEMS) {
    const item = (await (await fetchOk(`https://archive.org/metadata/${source.identifier}`)).json()) as {
      metadata?: { licenseurl?: string };
      files?: ArchiveFile[];
    };
    const license = publicDomainLicense(item.metadata?.licenseurl);
    if (!license) continue;
    records.push(...buildMusopenRecords(source.identifier, source.grouping, license, item.files ?? [], source.composer));
  }
  return records;
}

// ---- Mutopia ----

const MUTOPIA_REPO_TREE = 'https://api.github.com/repos/MutopiaProject/MutopiaProject/git/trees/master?recursive=1';

// A piece is a folder ftp/<Composer>/<Opus>/<piece>/ holding <piece>.ly or a
// <piece>-lys/ directory - the same name its RDF and PDFs carry.
export function mutopiaPieceFolders(paths: string[]): string[] {
  const folders = new Set<string>();
  for (const path of paths) {
    const match = /^(ftp\/[^/]+\/[^/]+\/([^/]+))\/\2(\.ly|-lys)$/.exec(path);
    if (match) folders.add(match[1]);
  }
  return [...folders].sort();
}

function rdfField(rdf: string, field: string): string | null {
  const match = new RegExp(`<mp:${field}>([^<]*)</mp:${field}>`).exec(rdf);
  const value = match?.[1]
    ?.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  return value || null;
}

// "AbtF" -> "F. Abt" from browse.html's "Composer=AbtF'>F. Abt (1819–1885)</a>".
export function parseMutopiaComposers(browseHtml: string): Map<string, string> {
  const composers = new Map<string, string>();
  for (const match of browseHtml.matchAll(/Composer=([A-Za-z]+)['"]>([^<(]+?)\s*(?:\([^)]*\))?\s*<\/a>/g)) {
    composers.set(match[1], match[2].trim());
  }
  return composers;
}

export function buildMutopiaRecord(folder: string, rdf: string, composers: Map<string, string>): OpenSourceRecord | null {
  const title = rdfField(rdf, 'title');
  const license = rdfField(rdf, 'licence');
  if (!title || !license) return null;
  const base = `${MUTOPIA_FTP_PREFIX}${encodePath(folder.replace(/^ftp\//, ''))}/`;
  const files: LibraryFileSource[] = [];
  const a4 = rdfField(rdf, 'pdfFileA4');
  const letter = rdfField(rdf, 'pdfFileLet');
  if (a4?.endsWith('.pdf')) files.push({ label: 'Score (PDF, A4)', sourceUrl: `${base}${encodeURIComponent(a4)}`, contentType: 'application/pdf' });
  if (letter?.endsWith('.pdf')) files.push({ label: 'Score (PDF, Letter)', sourceUrl: `${base}${encodeURIComponent(letter)}`, contentType: 'application/pdf' });
  if (files.length === 0) return null;
  const composerCode = rdfField(rdf, 'composer') ?? folder.split('/')[1];
  const maintainer = rdfField(rdf, 'maintainer');
  const opus = rdfField(rdf, 'opus');
  return {
    ark: `mutopia:${folder.replace(/^ftp\//, '')}`,
    category: 'SHEET_MUSIC',
    title: opus && !title.includes(opus) ? `${title} (${opus})` : title,
    creator: composers.get(composerCode) ?? composerCode,
    date: rdfField(rdf, 'date'),
    documentType: ['Engraved score', rdfField(rdf, 'for'), rdfField(rdf, 'style')].filter(Boolean).join(' · '),
    permalink: `${base}`,
    license,
    attribution: `Mutopia Project (mutopiaproject.org)${maintainer ? ` - typeset by ${maintainer}` : ''} · ${license}`,
    files,
  };
}

const MUTOPIA_CONCURRENCY = 4;
const MUTOPIA_PAUSE_MS = 250;

export async function fetchMutopiaRecords(onProgress?: (done: number, total: number) => Promise<void> | void): Promise<OpenSourceRecord[]> {
  const tree = (await (await fetchOk(MUTOPIA_REPO_TREE, 'application/vnd.github+json')).json()) as {
    tree: { path: string }[];
    truncated: boolean;
  };
  if (tree.truncated) throw new Error('Mutopia tree listing was truncated by GitHub.');
  const folders = mutopiaPieceFolders(tree.tree.map((entry) => entry.path));
  const composers = parseMutopiaComposers(await (await fetchOk('https://www.mutopiaproject.org/browse.html')).text());

  const records: OpenSourceRecord[] = [];
  let done = 0;
  for (let i = 0; i < folders.length; i += MUTOPIA_CONCURRENCY) {
    const batch = folders.slice(i, i + MUTOPIA_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (folder) => {
        const name = folder.split('/').pop()!;
        const rdf = await (await fetchOk(`${MUTOPIA_FTP_PREFIX}${encodePath(folder.replace(/^ftp\//, ''))}/${encodeURIComponent(name)}.rdf`)).text();
        return buildMutopiaRecord(folder, rdf, composers);
      }),
    );
    for (const result of results) if (result.status === 'fulfilled' && result.value) records.push(result.value);
    done += batch.length;
    await onProgress?.(done, folders.length);
    await new Promise((resolve) => setTimeout(resolve, MUTOPIA_PAUSE_MS));
  }
  return records;
}

// ---- shared upsert ----

const UPSERT_CONCURRENCY = 20;

export async function upsertOpenSourceRecords(prisma: PrismaClient, source: 'MUSOPEN' | 'MUTOPIA', records: OpenSourceRecord[]) {
  let upserted = 0;
  for (let i = 0; i < records.length; i += UPSERT_CONCURRENCY) {
    const results = await Promise.allSettled(
      records.slice(i, i + UPSERT_CONCURRENCY).map((record) => {
        const data = {
          category: record.category,
          title: record.title,
          creator: record.creator,
          date: record.date,
          documentType: record.documentType,
          isPublicDomainWork: true,
          permalink: record.permalink,
          files: record.files as any,
          license: record.license,
          attribution: record.attribution,
          seedQuery: source.toLowerCase(),
        };
        return prisma.libraryItem.upsert({
          where: { source_ark: { source, ark: record.ark } },
          create: { source, ark: record.ark, ...data },
          update: data,
        });
      }),
    );
    upserted += results.filter((result) => result.status === 'fulfilled').length;
  }
  return upserted;
}
