import type { PrismaClient } from '@my-music-coach/database';

// OpenScore Lieder (https://github.com/OpenScore/Lieder) - ~1,450 art songs
// transcribed to MusicXML by volunteers and dedicated CC0-1.0, so unlike BnF
// masters (resolvers/bnf.ts) we may show them on a commercial platform.
// The corpus is read straight from GitHub: one commits call to pin the
// current HEAD, one tree call for the .mxl paths, two raw YAML files for
// metadata. Every stored score URL is pinned to that commit, so its bytes
// never change and the score route (index.ts) can cache them indefinitely.

const REPO = 'OpenScore/Lieder';
const BRANCH = 'main';
const GITHUB_API = 'https://api.github.com';
export const OPENSCORE_RAW_PREFIX = 'https://raw.githubusercontent.com/OpenScore/';
const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; library import)';
const LICENSE = 'CC0-1.0';
const ATTRIBUTION = 'OpenScore Lieder - transcribed by OpenScore contributors, CC0 1.0';

export interface OpenScoreRecord {
  ark: string;
  title: string;
  creator: string | null;
  documentType: string;
  permalink: string;
  catalogueUrl: string | null;
  musicXmlSourceUrl: string;
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

// The corpus's data/*.yaml files are StrictYAML, always two levels deep:
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

export function buildOpenScoreRecords(
  sha: string,
  mxlPaths: string[],
  scores: Record<string, Record<string, string>>,
  composers: Record<string, Record<string, string>>,
): OpenScoreRecord[] {
  const composerByPath = new Map(Object.values(composers).map((c) => [c.path, c.name]));
  const records: OpenScoreRecord[] = [];
  for (const mxlPath of mxlPaths) {
    const match = /^scores\/(.+)\/lc(\d+)\.mxl$/.exec(mxlPath);
    if (!match) continue;
    const [, scorePath, id] = match;
    const meta = scores[id] ?? {};
    const imslp = meta.imslp?.replace(/^#/, '');
    records.push({
      ark: `lieder:${id}`,
      title: titleFromScorePath(scorePath),
      creator: composerByPath.get(scorePath.split('/')[0]) ?? composerFromFolder(scorePath.split('/')[0]),
      documentType: ['Lied', meta.language, meta.instruments].filter(Boolean).join(' · '),
      permalink: `https://musescore.com/score/${id}`,
      catalogueUrl: imslp ? `https://imslp.org/wiki/Special:ReverseLookup/${imslp}` : null,
      musicXmlSourceUrl: `${OPENSCORE_RAW_PREFIX}Lieder/${sha}/${encodePath(mxlPath)}`,
    });
  }
  return records;
}

export async function fetchOpenScoreLieder(): Promise<OpenScoreRecord[]> {
  const github = 'application/vnd.github+json';
  const commit = (await (await fetchOk(`${GITHUB_API}/repos/${REPO}/commits/${BRANCH}`, github)).json()) as { sha: string };
  const tree = (await (await fetchOk(`${GITHUB_API}/repos/${REPO}/git/trees/${commit.sha}?recursive=1`, github)).json()) as {
    tree: { path: string; type: string }[];
    truncated: boolean;
  };
  if (tree.truncated) throw new Error('OpenScore tree listing was truncated by GitHub.');
  const raw = `${OPENSCORE_RAW_PREFIX}Lieder/${commit.sha}/data`;
  const [scoresYaml, composersYaml] = await Promise.all([
    fetchOk(`${raw}/scores.yaml`).then((r) => r.text()),
    fetchOk(`${raw}/composers.yaml`).then((r) => r.text()),
  ]);
  const mxlPaths = tree.tree.filter((entry) => entry.type === 'blob' && entry.path.endsWith('.mxl')).map((entry) => entry.path);
  return buildOpenScoreRecords(commit.sha, mxlPaths, parseFlatYaml(scoresYaml), parseFlatYaml(composersYaml));
}

const UPSERT_CONCURRENCY = 20;

export async function ingestOpenScoreLieder(prisma: PrismaClient) {
  const records = await fetchOpenScoreLieder();
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
          license: LICENSE,
          attribution: ATTRIBUTION,
          seedQuery: 'openscore-lieder',
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
    query: 'OpenScore Lieder',
    fetched: records.length,
    upserted,
    message: `OpenScore Lieder import completed: ${upserted}/${records.length} scores upserted.`,
  };
}

// Small in-process cache for the score route - a corpus file is 10-200 KB
// and immutable at its pinned URL, so the hot set fits comfortably.
const SCORE_CACHE_MAX = 200;
const MAX_SCORE_BYTES = 5 * 1024 * 1024;
const scoreCache = new Map<string, Buffer>();

export function isAllowedScoreSource(url: string): boolean {
  return url.startsWith(OPENSCORE_RAW_PREFIX);
}

export async function fetchScoreBytes(url: string): Promise<Buffer> {
  if (!isAllowedScoreSource(url)) throw new Error('Score source not allowed.');
  const cached = scoreCache.get(url);
  if (cached) {
    scoreCache.delete(url);
    scoreCache.set(url, cached);
    return cached;
  }
  const bytes = Buffer.from(await (await fetchOk(url)).arrayBuffer());
  if (bytes.length > MAX_SCORE_BYTES) throw new Error('Score file too large.');
  scoreCache.set(url, bytes);
  if (scoreCache.size > SCORE_CACHE_MAX) scoreCache.delete(scoreCache.keys().next().value!);
  return bytes;
}
