import { XMLParser } from 'fast-xml-parser';

// Deutsche Nationalbibliothek catalogue (SRU, no key) - the free online music
// titles: `location=onlinefree` (open access) and `sgt=780` (subject group
// Music). Each record carries the DNB's own long-term archive copy at
// https://d-nb.info/<idn>/34 - a PDF, or a zip of PDFs (score + parts),
// which lib/libraryMirror.ts downloads into our store after import. The
// DNB's digitised Musikarchiv recordings are reading-room only and never
// appear here. Verified live 2026-10-10 (see also the user's dnbkb repos).

const SRU_ENDPOINT = 'https://services.dnb.de/sru/dnb';
const USER_AGENT = 'MyMusicCoach/1.0 (+https://mymusic.coach; library import)';
const BASE_QUERY = 'location=onlinefree and sgt=780';
export const DNB_MAX_PAGE_SIZE = 100;
const IDN_PATTERN = /^\d{8,9}[\dX]$/;

export type DnbSearchMode = 'ALL' | 'ANY' | 'PHRASE';
export type DnbCategory = 'SHEET_MUSIC' | 'AUDIO_RECORDING' | 'BOOK' | 'OTHER';

export interface DnbSearchOptions {
  query: string;
  mode?: DnbSearchMode;
  category?: DnbCategory | null;
  yearFrom?: number | null;
  yearTo?: number | null;
}

export interface DnbRecord {
  idn: string;
  title: string;
  creator: string | null;
  date: string | null;
  publisher: string | null;
  category: DnbCategory;
  // RDA content type, e.g. "Noten", "Text".
  documentType: string | null;
  summary: string | null;
  permalink: string;
  archiveUrl: string;
}

export function isDnbIdn(value: string): boolean {
  return IDN_PATTERN.test(value);
}

export function dnbArchiveUrl(idn: string): string {
  return `https://d-nb.info/${idn}/34`;
}

// CQL needs every word joined explicitly ("Schubert Winterreise" unjoined
// finds nothing); characters with CQL meaning are dropped.
export function dnbTerms(query: string, mode: DnbSearchMode = 'ALL'): string | null {
  const words = query
    .replace(/["()=<>/\\*?^]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word && !/^(and|or|not|prox)$/i.test(word));
  if (!words.length) return null;
  if (mode === 'PHRASE') return `"${words.join(' ')}"`;
  if (words.length === 1) return words[0];
  return `(${words.join(mode === 'ANY' ? ' or ' : ' and ')})`;
}

export function buildDnbQuery(options: DnbSearchOptions): string | null {
  const terms = dnbTerms(options.query, options.mode);
  if (!terms) return null;
  const parts = [BASE_QUERY, terms];
  // mat=scores is notated music; everything else here is text.
  if (options.category === 'SHEET_MUSIC') parts.push('mat=scores');
  if (options.category === 'BOOK') parts.push('not mat=scores');
  if (options.yearFrom) parts.push(`jhr>=${Math.trunc(options.yearFrom)}`);
  if (options.yearTo) parts.push(`jhr<=${Math.trunc(options.yearTo)}`);
  return parts.join(' and ').replace(' and not ', ' not ');
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  removeNSPrefix: true,
  isArray: (name) => ['record', 'datafield', 'controlfield', 'subfield'].includes(name),
  parseTagValue: false,
});

type Field = { tag: string; ind1?: string; ind2?: string; subfield?: { code: string; '#text'?: string }[]; '#text'?: string };

// The DNB sends decomposed Unicode ("a" + combining diaeresis) - composed
// here, or "Künste" would neither display nor match like ours - and wraps a
// leading article in non-sorting marks ("&#152;Die&#156; Urlinie").
export function dnbText(raw: string): string {
  return raw
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/[\u0088\u0089\u0098\u009c]/g, '')
    .normalize('NFC')
    .trim();
}

function subfields(field: Field, code: string): string[] {
  return (field.subfield ?? [])
    .filter((sub) => sub.code === code)
    .map((sub) => dnbText(String(sub['#text'] ?? '')))
    .filter(Boolean);
}

function first(fields: Field[], tag: string, code: string): string | null {
  for (const field of fields) if (field.tag === tag) {
    const value = subfields(field, code)[0];
    if (value) return value;
  }
  return null;
}

const clean = (text: string) => text.replace(/\s+/g, ' ').replace(/^[\s:;,/]+|[\s:;,/.]+$/g, '').trim();

// One MARC21 bibliographic record. Returns null without a free archive copy.
export function parseDnbRecord(marc: any): DnbRecord | null {
  const controls: Field[] = marc?.controlfield ?? [];
  const fields: Field[] = marc?.datafield ?? [];
  const idn = String(controls.find((field) => field.tag === '001')?.['#text'] ?? '').trim();
  if (!isDnbIdn(idn)) return null;

  const archiveUrl = dnbArchiveUrl(idn);
  const hasArchive = fields.some((field) => field.tag === '856' && subfields(field, 'u').some((url) => url.replace(/^http:/, 'https:') === archiveUrl));
  if (!hasArchive) return null;

  const mainTitle = first(fields, '245', 'a');
  if (!mainTitle) return null;
  const subtitle = first(fields, '245', 'b');
  const title = clean(subtitle ? `${clean(mainTitle)} : ${clean(subtitle)}` : mainTitle);

  const leader = String(marc?.leader ?? '');
  const typeCode = leader.charAt(6);
  const category: DnbCategory = typeCode === 'c' || typeCode === 'd' ? 'SHEET_MUSIC' : typeCode === 'i' || typeCode === 'j' ? 'AUDIO_RECORDING' : 'BOOK';

  const fixed = String(controls.find((field) => field.tag === '008')?.['#text'] ?? '');
  const fixedYear = /^\d{4}$/.test(fixed.slice(7, 11)) ? fixed.slice(7, 11) : null;
  const summary = first(fields, '520', 'a')?.replace(/^(Zusammenfassung|Abstract)\s*:\s*/i, '') ?? null;

  return {
    idn,
    title,
    creator: first(fields, '100', 'a') ?? first(fields, '700', 'a') ?? first(fields, '110', 'a') ?? first(fields, '710', 'a'),
    date: clean(first(fields, '264', 'c') ?? first(fields, '260', 'c') ?? '') || fixedYear,
    publisher: first(fields, '264', 'b') ?? first(fields, '260', 'b'),
    category,
    documentType: first(fields, '336', 'a'),
    summary: summary ? summary.slice(0, 4000) : null,
    permalink: `https://d-nb.info/${idn}`,
    archiveUrl,
  };
}

export interface DnbPage {
  total: number;
  records: DnbRecord[];
}

export function parseDnbResponse(xml: string): DnbPage {
  const parsed = parser.parse(xml);
  const response = parsed?.searchRetrieveResponse;
  const diagnostic = response?.diagnostics?.diagnostic;
  if (diagnostic) {
    const message = (Array.isArray(diagnostic) ? diagnostic[0] : diagnostic)?.message ?? 'query rejected';
    throw new Error(`DNB search rejected the query: ${message}`);
  }
  const records: DnbRecord[] = [];
  for (const wrapper of response?.records?.record ?? []) {
    const marc = wrapper?.recordData?.record?.[0] ?? wrapper?.recordData?.record;
    const record = parseDnbRecord(marc);
    if (record) records.push(record);
  }
  return { total: Number(response?.numberOfRecords ?? 0) || 0, records };
}

async function sru(query: string, startRecord: number, maximumRecords: number): Promise<DnbPage> {
  const url = new URL(SRU_ENDPOINT);
  url.searchParams.set('version', '1.1');
  url.searchParams.set('operation', 'searchRetrieve');
  url.searchParams.set('recordSchema', 'MARC21-xml');
  url.searchParams.set('query', query);
  url.searchParams.set('startRecord', String(startRecord));
  url.searchParams.set('maximumRecords', String(maximumRecords));
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`DNB search failed (HTTP ${response.status}).`);
  return parseDnbResponse(await response.text());
}

// One page of results. `total` counts every match, including the few
// records without a free archive copy that are left out of `records`.
export async function searchDnb(options: DnbSearchOptions, page: number, pageSize: number): Promise<DnbPage> {
  const query = buildDnbQuery(options);
  if (!query) return { total: 0, records: [] };
  const size = Math.max(1, Math.min(pageSize, DNB_MAX_PAGE_SIZE));
  return sru(query, (Math.max(1, page) - 1) * size + 1, size);
}

// Exact records by IDN - used at import time, so what gets stored always
// comes from the DNB itself, never from the browser.
export async function fetchDnbRecords(idns: string[]): Promise<DnbRecord[]> {
  const valid = [...new Set(idns.filter(isDnbIdn))];
  const found: DnbRecord[] = [];
  for (let i = 0; i < valid.length; i += 50) {
    const batch = valid.slice(i, i + 50);
    const page = await sru(batch.map((idn) => `idn=${idn}`).join(' or '), 1, batch.length);
    found.push(...page.records);
  }
  return found;
}
