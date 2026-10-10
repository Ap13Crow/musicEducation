import type { PrismaClient } from '@my-music-coach/database';

// Europeana (europeana.eu, Europe's aggregator of library, archive and
// broadcaster collections): openly licensed sound recordings. Search API
// with a free personal key (EUROPEANA_API_KEY; register at
// https://pro.europeana.eu/page/get-api) - without one this source stays off.
//
// Only records we can actually copy: a direct media file (edm:isShownBy)
// under an open licence (Public Domain Mark, CC0, CC BY, CC BY-SA). BnF
// records are left out - their files live on Gallica, which blocks our
// server. Some providers point isShownBy at a picture of the record sleeve;
// the media mirror only keeps real audio (lib/libraryMirror.ts).

const SEARCH_URL = 'https://api.europeana.eu/record/v2/search.json';
const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; library import)';
export const EUROPEANA_MAX_PAGE_SIZE = 100;
const EXCLUDED_PROVIDERS = ['National Library of France'];

// The automatic import: these composers' recordings, newest additions first.
export const EUROPEANA_AUTO_QUERIES = [
  'Bach', 'Handel', 'Vivaldi', 'Telemann', 'Haydn', 'Mozart', 'Beethoven', 'Schubert', 'Schumann', 'Mendelssohn',
  'Chopin', 'Liszt', 'Brahms', 'Wagner', 'Verdi', 'Tchaikovsky', 'Dvorak', 'Grieg', 'Debussy', 'Ravel',
  'Enescu', 'Sibelius', 'Rachmaninoff', 'Mahler', 'Bruckner', 'Puccini', 'Rossini', 'Bizet', 'Smetana', 'Janacek',
  'symphony', 'sonata', 'concerto', 'string quartet', 'opera aria',
];

export function europeanaConfigured(): boolean {
  return Boolean(process.env.EUROPEANA_API_KEY);
}

export interface EuropeanaRecord {
  id: string;
  title: string;
  creator: string | null;
  performers: string[];
  year: string | null;
  provider: string | null;
  rights: string;
  license: string;
  mediaUrl: string;
  description: string | null;
  permalink: string;
}

const OPEN_LICENSES: [RegExp, string][] = [
  [/publicdomain\/mark/, 'Public Domain Mark 1.0'],
  [/publicdomain\/zero/, 'CC0-1.0'],
  [/licenses\/by-sa\/([\d.]+)/, 'CC BY-SA'],
  [/licenses\/by\/([\d.]+)/, 'CC BY'],
];

export function europeanaLicense(rights: string): string | null {
  for (const [pattern, name] of OPEN_LICENSES) {
    const match = rights.match(pattern);
    if (match) return match[1] ? `${name} ${match[1]}` : name;
  }
  return null;
}

const first = (value: unknown): string | null => {
  const text = Array.isArray(value) ? value[0] : value;
  return typeof text === 'string' && text.trim() ? text.replace(/ /g, ' ').trim() : null;
};

// Every value once, in the default language ("def") when the record has
// language variants - the plain field repeats each name per language.
function names(item: any, field: string): string[] {
  const values = item?.[`${field}LangAware`]?.def ?? item?.[field] ?? [];
  return [...new Set((Array.isArray(values) ? values : [values]).filter((value: unknown) => typeof value === 'string' && value.trim()).map((value: string) => value.trim()))];
}

// "Benefelde, Ada, 1887-1967" -> Ada Benefelde (died 1967);
// "Beethoven, Ludwig van (1770-1827). Composer" -> Ludwig van Beethoven.
export function europeanaPerson(raw: string): { name: string; died: number | null } {
  const text = raw.replace(/\.\s*(Auteur ou responsable intellectuel|Author or intellectual leader|Compositeur|Composer|Interprète|Performer)\s*$/i, '').trim();
  const life = text.match(/[,(]\s*\d{4}\s*-\s*(\d{4})?\s*\)?\s*$/);
  const died = life?.[1] ? Number(life[1]) : null;
  const bare = (life ? text.slice(0, life.index) : text).replace(/[.,\s]+$/, '').trim();
  const [last, ...rest] = bare.split(/\s*,\s*/);
  const name = rest.length === 1 && last && rest[0] ? `${rest[0].replace(/\.$/, '')} ${last}` : bare;
  return { name, died };
}

// Creators are the composers; a contributor who died before records were
// sold (1900) is an arranger or composer too (Gounod in Bach's Ave Maria),
// everyone else performs.
export function europeanaPeople(item: any): { composers: string[]; performers: string[] } {
  const composers = names(item, 'dcCreator').map((raw) => europeanaPerson(raw).name);
  const performers: string[] = [];
  for (const raw of names(item, 'dcContributor')) {
    const person = europeanaPerson(raw);
    const list = person.died !== null && person.died < 1900 ? composers : performers;
    if (!list.includes(person.name)) list.push(person.name);
  }
  return { composers: [...new Set(composers)], performers };
}

// Only public web addresses: the media URL comes from a third party, and
// our server is the one fetching it.
export function isPublicMediaUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  const host = parsed.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.svc') || !host.includes('.')) return false;
  if (/^[\d.]+$/.test(host) || host.includes(':')) return false;
  return !/gallica\.bnf\.fr$/.test(host);
}

export function parseEuropeanaItem(item: any): EuropeanaRecord | null {
  const id = String(item?.id ?? '').replace(/^\//, '');
  const title = first(item?.title);
  const rights = first(item?.rights) ?? '';
  const license = europeanaLicense(rights);
  const mediaUrl = first(item?.edmIsShownBy);
  const provider = first(item?.dataProvider);
  if (!id || !/^[\w./-]+$/.test(id) || !title || !license || !mediaUrl || !isPublicMediaUrl(mediaUrl)) return null;
  if (provider && EXCLUDED_PROVIDERS.includes(provider)) return null;
  const { composers, performers } = europeanaPeople(item);
  const year = first(item?.year);
  return {
    id,
    title,
    creator: composers.length ? composers.join('; ') : null,
    performers,
    year: year && /^\d{4}$/.test(year) ? year : null,
    provider,
    rights,
    license,
    mediaUrl,
    description: first(item?.dcDescription)?.slice(0, 2000) ?? null,
    permalink: `https://www.europeana.eu/item/${id}`,
  };
}

export async function searchEuropeana(
  query: string,
  options: { page: number; rows: number; yearFrom?: number | null; yearTo?: number | null },
): Promise<{ total: number; records: EuropeanaRecord[] }> {
  const key = process.env.EUROPEANA_API_KEY;
  if (!key) throw new Error('Europeana is not set up yet (EUROPEANA_API_KEY).');
  const terms = query.replace(/["():\\[\]{}^~*?]/g, ' ').split(/\s+/).filter((word) => word && !/^(and|or|not)$/i.test(word));
  if (!terms.length) return { total: 0, records: [] };
  const url = new URL(SEARCH_URL);
  url.searchParams.set('wskey', key);
  url.searchParams.set('query', `(${terms.join(' AND ')})${EXCLUDED_PROVIDERS.map((provider) => ` NOT DATA_PROVIDER:"${provider}"`).join('')}`);
  url.searchParams.append('qf', 'TYPE:SOUND');
  if (options.yearFrom || options.yearTo) url.searchParams.append('qf', `YEAR:[${options.yearFrom ?? 1800} TO ${options.yearTo ?? 2100}]`);
  url.searchParams.set('reusability', 'open');
  url.searchParams.set('media', 'true');
  url.searchParams.set('profile', 'rich');
  const rows = Math.max(1, Math.min(options.rows, EUROPEANA_MAX_PAGE_SIZE));
  url.searchParams.set('rows', String(rows));
  url.searchParams.set('start', String((Math.max(1, options.page) - 1) * rows + 1));
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Europeana search failed (HTTP ${response.status}).`);
  const data: any = await response.json();
  if (data?.success === false) throw new Error(`Europeana search failed: ${data?.error ?? 'unknown error'}`);
  return {
    total: Number(data?.totalResults ?? 0),
    records: (data?.items ?? []).map(parseEuropeanaItem).filter((record: EuropeanaRecord | null): record is EuropeanaRecord => Boolean(record)),
  };
}

export function europeanaItemData(record: EuropeanaRecord, seedQuery: string | null, durationSeconds?: number | null) {
  return {
    category: 'AUDIO_RECORDING' as const,
    title: record.title,
    creator: record.creator,
    date: record.year,
    documentType: `Sound recording${record.performers.length ? ` · ${record.performers.join('; ')}` : ''}`,
    isPublicDomainWork: /Public Domain|CC0/.test(record.license),
    permalink: record.permalink,
    description: record.description,
    files: [{ label: 'Recording', sourceUrl: record.mediaUrl, contentType: 'audio/mpeg', ...(durationSeconds ? { durationSeconds } : {}) }],
    license: record.license,
    attribution: `${record.provider ?? 'Europeana'} · via Europeana`,
    seedQuery,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ebucore:duration is meant to be milliseconds; some providers write
// microseconds (Latvian National Library: 162840000 for 2:43). No single
// record side runs for hours, so scale down until it is plausible.
export function europeanaSeconds(value: unknown): number | null {
  let seconds = Number(value) / 1000;
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  while (seconds > 4 * 3600) seconds /= 1000;
  return Math.round(seconds);
}

// The recording's length from its record (the search API doesn't give it) -
// how two catalogue entries for one recording are told apart from two
// recordings. Null when the provider doesn't say or the lookup fails.
export async function fetchEuropeanaDetails(id: string, mediaUrl?: string | null): Promise<{ durationSeconds: number | null; record: any } | null> {
  const key = process.env.EUROPEANA_API_KEY;
  if (!key || !/^[\w./-]+$/.test(id)) return null;
  try {
    const response = await fetch(`https://api.europeana.eu/record/v2/${id}.json?wskey=${encodeURIComponent(key)}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) return null;
    const object: any = ((await response.json()) as any)?.object ?? {};
    const resources: any[] = (object.aggregations ?? []).flatMap((aggregation: any) => aggregation.webResources ?? []);
    const audio = resources.filter((resource) => String(resource.ebucoreHasMimeType ?? '').startsWith('audio'));
    const resource = audio.find((entry) => entry.about === mediaUrl) ?? audio[0];
    return { durationSeconds: europeanaSeconds(resource?.ebucoreDuration), record: object };
  } catch {
    return null;
  }
}

// Record-API proxies carry the same people fields as search items, keyed by
// language ({ def: [...], en: [...] }).
export function europeanaPeopleFromRecord(object: any): { composers: string[]; performers: string[] } {
  const proxy = (object?.proxies ?? []).find((entry: any) => !entry.europeanaProxy) ?? {};
  const pick = (field: any) => field?.def ?? Object.values(field ?? {}).flat();
  return europeanaPeople({ dcCreator: pick(proxy.dcCreator), dcContributor: pick(proxy.dcContributor) });
}

// The automatic import: new open sound recordings for each query.
export async function importEuropeana(
  prisma: PrismaClient,
  onProgress?: (done: number, total: number) => Promise<void> | void,
): Promise<{ total: number; upserted: number }> {
  const existing = new Set(
    (await prisma.libraryItem.findMany({ where: { source: 'EUROPEANA' as any }, select: { ark: true } })).map((row: { ark: string }) => row.ark),
  );
  let total = 0;
  let upserted = 0;
  for (const [index, query] of EUROPEANA_AUTO_QUERIES.entries()) {
    for (let page = 1; page <= 5; page++) {
      const result = await searchEuropeana(query, { page, rows: 100 });
      total += result.records.length;
      for (const record of result.records) {
        if (existing.has(record.id)) continue;
        existing.add(record.id);
        const details = await fetchEuropeanaDetails(record.id, record.mediaUrl);
        const data = europeanaItemData(record, `europeana:${query}`, details?.durationSeconds);
        await sleep(150);
        await prisma.libraryItem.create({ data: { source: 'EUROPEANA' as any, ark: record.id, ...data, files: data.files as any } }).then(
          () => (upserted += 1),
          () => undefined,
        );
      }
      if (page * 100 >= result.total) break;
      await sleep(500);
    }
    await onProgress?.(index + 1, EUROPEANA_AUTO_QUERIES.length);
  }
  return { total, upserted };
}
