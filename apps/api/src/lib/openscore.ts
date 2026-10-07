import type { PrismaClient } from '@my-music-coach/database';

// OpenScore corpora - volunteer MusicXML transcriptions dedicated CC0-1.0,
// so unlike BnF masters (resolvers/bnf.ts) we may show them on a commercial
// platform:
//   - Lieder (https://github.com/OpenScore/Lieder): ~1,450 art songs.
//   - String Quartets (https://github.com/OpenScore/StringQuartets): ~200
//     works with MusicXML, most also with a PDF full score and PDF parts.
// Each corpus is read straight from GitHub: one commits call to pin the
// current HEAD, one tree call for file paths, two raw YAML files for
// metadata. Every stored source URL is pinned to that commit, so its bytes
// never change and the library file routes (index.ts) can cache them
// indefinitely.

export type OpenScoreCorpusKey = 'LIEDER' | 'STRING_QUARTETS';

interface CorpusConfig {
  repo: string;
  label: string;
  // Score file prefix ("lc6583477.mxl", "sq7313978.mxl") and our ark prefix.
  filePrefix: string;
  arkPrefix: string;
  documentType: string;
  // Lieder sit at scores/<composer>/<set>/<song>/, quartets one level up at
  // scores/<composer>/<work>/ - titles come from the path or scores.yaml.
  titleFrom: 'path' | 'metadata';
}

const CORPORA: Record<OpenScoreCorpusKey, CorpusConfig> = {
  LIEDER: { repo: 'OpenScore/Lieder', label: 'OpenScore Lieder', filePrefix: 'lc', arkPrefix: 'lieder', documentType: 'Lied', titleFrom: 'path' },
  STRING_QUARTETS: {
    repo: 'OpenScore/StringQuartets',
    label: 'OpenScore String Quartets',
    filePrefix: 'sq',
    arkPrefix: 'sq',
    documentType: 'String quartet',
    titleFrom: 'metadata',
  },
};

const BRANCH = 'main';
const GITHUB_API = 'https://api.github.com';
export const OPENSCORE_RAW_PREFIX = 'https://raw.githubusercontent.com/OpenScore/';
const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; library import)';
const LICENSE = 'CC0-1.0';

export interface LibraryFileSource {
  label: string;
  sourceUrl: string;
  contentType: string;
}

export interface OpenScoreRecord {
  ark: string;
  title: string;
  creator: string | null;
  documentType: string;
  permalink: string;
  catalogueUrl: string | null;
  musicXmlSourceUrl: string;
  files: LibraryFileSource[];
}

async function fetchOk(url: string, accept?: string): Promise<Response> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, ...(accept ? { Accept: accept } : {}) },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`OpenScore fetch failed (${response.status}) for ${url}`);
  return response;
}

function unquote(value: string): string {
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
  return value;
}

// The corpora's data/*.yaml files are StrictYAML, always two levels deep:
// a top-level `<id>:` key followed by indented `field: value` lines. That's
// all this parses - not a general YAML parser.
export function parseFlatYaml(text: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  let current: Record<string, string> | null = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const top = /^(\S[^:]*):\s*$/.exec(line);
    if (top) {
      current = {};
      result[unquote(top[1].trim())] = current;
      continue;
    }
    const field = /^\s+([A-Za-z_][\w-]*):\s?(.*)$/.exec(line);
    if (field && current) current[field[1]] = unquote(field[2].trim());
  }
  return result;
}

// "Schubert,_Franz/Winterreise,_D.911/01_Gute_Nacht" -> "Gute Nacht (Winterreise, D.911)".
// A set segment of "_" marks a standalone song.
export function titleFromScorePath(scorePath: string): string {
  const [, set = '_', song = scorePath] = scorePath.split('/');
  const title = song.replace(/^\d+[a-z]?_/, '').replace(/_/g, ' ').trim();
  return set === '_' ? title : `${title} (${set.replace(/_/g, ' ').trim()})`;
}

// Fallback for the few score folders whose name differs from their
// composers.yaml path (e.g. "Hensel,_Fanny" vs "Hensel,_Fanny_(Mendelssohn)"):
// "Hensel,_Fanny" -> "Fanny Hensel".
export function composerFromFolder(folder: string): string {
  const [last, first] = folder.replace(/_/g, ' ').split(',').map((part) => part.trim());
  return first ? `${first} ${last}` : last;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

// String-quartet part order as players expect it, not alphabetical.
const PART_ORDER = ['violin 1', 'violin 2', 'viola', 'violoncello', 'cello'];

// "sq13744399.pdf" -> "Full score (PDF)"; "sq13744399-Part-Violin_1.pdf" -> "Violin 1 part (PDF)".
export function pdfFileLabel(fileName: string): string {
  const part = /-Part-(.+)\.pdf$/i.exec(fileName)?.[1];
  return part ? `${part.replace(/_/g, ' ')} part (PDF)` : 'Full score (PDF)';
}

function pdfSortKey(label: string): number {
  if (label.startsWith('Full score')) return -1;
  const index = PART_ORDER.findIndex((part) => label.toLowerCase().startsWith(part));
  return index === -1 ? PART_ORDER.length : index;
}

export function buildOpenScoreRecords(
  corpusKey: OpenScoreCorpusKey,
  sha: string,
  filePaths: string[],
  scores: Record<string, Record<string, string>>,
  composers: Record<string, Record<string, string>>,
): OpenScoreRecord[] {
  const corpus = CORPORA[corpusKey];
  const rawBase = `${OPENSCORE_RAW_PREFIX}${corpus.repo.split('/')[1]}/${sha}/`;
  const composerByPath = new Map(Object.values(composers).map((c) => [c.path, c.name]));
  const scorePattern = new RegExp(`^scores/(.+)/${corpus.filePrefix}(\\d+)\\.mxl$`);

  const pdfsByScoreId = new Map<string, string[]>();
  const pdfPattern = new RegExp(`/${corpus.filePrefix}(\\d+)(-Part-[^/]+)?\\.pdf$`, 'i');
  for (const path of filePaths) {
    const id = pdfPattern.exec(path)?.[1];
    if (id) pdfsByScoreId.set(id, [...(pdfsByScoreId.get(id) ?? []), path]);
  }

  const records: OpenScoreRecord[] = [];
  for (const path of filePaths) {
    const match = scorePattern.exec(path);
    if (!match) continue;
    const [, scorePath, id] = match;
    const meta = scores[id] ?? {};
    const imslp = meta.imslp?.replace(/^#/, '');
    const composerFolder = scorePath.split('/')[0];
    const files = (pdfsByScoreId.get(id) ?? [])
      .map((pdfPath) => ({
        label: pdfFileLabel(pdfPath.split('/').pop()!),
        sourceUrl: `${rawBase}${encodePath(pdfPath)}`,
        contentType: 'application/pdf',
      }))
      .sort((a, b) => pdfSortKey(a.label) - pdfSortKey(b.label) || a.label.localeCompare(b.label));
    records.push({
      ark: `${corpus.arkPrefix}:${id}`,
      title: corpus.titleFrom === 'metadata' && meta.name ? meta.name : titleFromScorePath(scorePath),
      creator: composerByPath.get(composerFolder) ?? composerFromFolder(composerFolder),
      documentType: [corpus.documentType, meta.language, meta.instruments].filter(Boolean).join(' · '),
      permalink: `https://musescore.com/score/${id}`,
      catalogueUrl: imslp ? `https://imslp.org/wiki/Special:ReverseLookup/${imslp}` : null,
      musicXmlSourceUrl: `${rawBase}${encodePath(path)}`,
      files,
    });
  }
  return records;
}

export async function fetchOpenScoreCorpus(corpusKey: OpenScoreCorpusKey): Promise<OpenScoreRecord[]> {
  const corpus = CORPORA[corpusKey];
  const github = 'application/vnd.github+json';
  const commit = (await (await fetchOk(`${GITHUB_API}/repos/${corpus.repo}/commits/${BRANCH}`, github)).json()) as { sha: string };
  const tree = (await (await fetchOk(`${GITHUB_API}/repos/${corpus.repo}/git/trees/${commit.sha}?recursive=1`, github)).json()) as {
    tree: { path: string; type: string }[];
    truncated: boolean;
  };
  if (tree.truncated) throw new Error(`${corpus.label} tree listing was truncated by GitHub.`);
  const raw = `${OPENSCORE_RAW_PREFIX}${corpus.repo.split('/')[1]}/${commit.sha}/data`;
  const [scoresYaml, composersYaml] = await Promise.all([
    fetchOk(`${raw}/scores.yaml`).then((r) => r.text()),
    fetchOk(`${raw}/composers.yaml`).then((r) => r.text()),
  ]);
  const filePaths = tree.tree.filter((entry) => entry.type === 'blob').map((entry) => entry.path);
  return buildOpenScoreRecords(corpusKey, commit.sha, filePaths, parseFlatYaml(scoresYaml), parseFlatYaml(composersYaml));
}

const UPSERT_CONCURRENCY = 20;

export async function ingestOpenScoreCorpus(prisma: PrismaClient, corpusKey: OpenScoreCorpusKey = 'LIEDER') {
  const corpus = CORPORA[corpusKey];
  const records = await fetchOpenScoreCorpus(corpusKey);
  const attribution = `${corpus.label} - transcribed by OpenScore contributors, CC0 1.0`;
  let upserted = 0;
  for (let i = 0; i < records.length; i += UPSERT_CONCURRENCY) {
    const results = await Promise.allSettled(
      records.slice(i, i + UPSERT_CONCURRENCY).map((record) => {
        const data = {
          category: 'SHEET_MUSIC' as const,
          title: record.title,
          creator: record.creator,
          documentType: record.documentType,
          isPublicDomainWork: true,
          catalogueUrl: record.catalogueUrl,
          permalink: record.permalink,
          musicXmlSourceUrl: record.musicXmlSourceUrl,
          files: record.files as any,
          license: LICENSE,
          attribution,
          seedQuery: `openscore-${corpus.arkPrefix}`,
        };
        return prisma.libraryItem.upsert({
          where: { source_ark: { source: 'OPENSCORE', ark: record.ark } },
          create: { source: 'OPENSCORE', ark: record.ark, ...data },
          update: data,
        });
      }),
    );
    upserted += results.filter((result) => result.status === 'fulfilled').length;
  }
  return {
    query: corpus.label,
    fetched: records.length,
    upserted,
    message: `${corpus.label} import completed: ${upserted}/${records.length} scores upserted.`,
  };
}

// In-process cache for the library file routes, bounded by total bytes (a
// score .mxl is 10-200 KB, a PDF full score up to a few MB). Upstream URLs
// are immutable at their pinned commit, so entries never go stale.
const SOURCE_CACHE_MAX_BYTES = 64 * 1024 * 1024;
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const sourceCache = new Map<string, Buffer>();
let sourceCacheBytes = 0;

export function isAllowedScoreSource(url: string): boolean {
  return url.startsWith(OPENSCORE_RAW_PREFIX);
}

export async function fetchScoreBytes(url: string): Promise<Buffer> {
  if (!isAllowedScoreSource(url)) throw new Error('Score source not allowed.');
  const cached = sourceCache.get(url);
  if (cached) {
    sourceCache.delete(url);
    sourceCache.set(url, cached);
    return cached;
  }
  const bytes = Buffer.from(await (await fetchOk(url)).arrayBuffer());
  if (bytes.length > MAX_SOURCE_BYTES) throw new Error('Score file too large.');
  sourceCache.set(url, bytes);
  sourceCacheBytes += bytes.length;
  while (sourceCacheBytes > SOURCE_CACHE_MAX_BYTES && sourceCache.size > 1) {
    const [oldestUrl, oldest] = sourceCache.entries().next().value!;
    sourceCache.delete(oldestUrl);
    sourceCacheBytes -= oldest.length;
  }
  return bytes;
}
