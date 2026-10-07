import { XMLParser } from 'fast-xml-parser';
import type { BnfCatalogueRecord, BnfSearchOptions } from './types.js';
import { BnfRequestError } from './types.js';
import { GALLICA_USER_AGENT } from './config.js';
import { fetchWithRetry } from './retry.js';

// Gallica's own SRU endpoint (confirmed live, 2026-10) - NOT
// catalogue.bnf.fr/api/SRU, which indexes physical holdings and only rarely
// carries a link to a digitized copy. This one returns the Gallica ARK
// directly as a dc:identifier, plus dc:rights and dc:type, which is what the
// course-authoring search actually needs.
const SRU_ENDPOINT = 'https://gallica.bnf.fr/SRU';
const REQUEST_TIMEOUT_MS = 20_000;

const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });

function buildQuery(query: string, opts?: BnfSearchOptions): string {
  const escaped = query.replace(/"/g, '\\"');
  const typeFilter = opts?.documentType ? ` and dc.type all "${opts.documentType.replace(/"/g, '\\"')}"` : '';
  return `gallica all "${escaped}"${typeFilter}`;
}

function searchUrl(query: string, opts?: BnfSearchOptions): URL {
  const url = new URL(SRU_ENDPOINT);
  url.searchParams.set('operation', 'searchRetrieve');
  url.searchParams.set('version', '1.2');
  url.searchParams.set('maximumRecords', String(Math.max(1, Math.min(opts?.maximumRecords ?? 20, 50))));
  url.searchParams.set('query', buildQuery(query, opts));
  return url;
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function textOf(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object' && '#text' in (value as Record<string, unknown>)) {
    return textOf((value as Record<string, unknown>)['#text']);
  }
  return null;
}

// Plain bare-ARK identifier, e.g. "https://gallica.bnf.fr/ark:/12148/bpt6k11767775" -
// excludes the other dc:identifier values the same record carries (a free-text
// "Numéro commercial : ..." string, NUMM- legacy ids), which don't match this.
const GALLICA_ARK_URL_PATTERN = /^https?:\/\/gallica\.bnf\.fr\/ark:\/12148\/([a-z0-9]+)$/i;
const CATALOGUE_RELATION_PATTERN = /Notice du catalogue\s*:\s*(https?:\/\/\S+)/i;

function pickDocumentType(types: string[]): string | null {
  // dc:type mixes the actual document-nature label with other
  // classifications - confirmed live, e.g. a score record's full list is
  // ["Genre musical : divers", "partition musicale", "score", "text"] and a
  // sound record's is ["sound", "document sonore"]. A "Category : value"
  // entry (colon) is a separate genre/subject classification, not the
  // document type, so it's excluded first; of what's left, the French
  // multi-word label ("partition musicale", "document sonore") is the
  // specific, human-readable one - prefer it over a single English word
  // ("score", "sound", "text").
  const candidates = types.filter((t) => !t.includes(':'));
  const specific = candidates.find((t) => t.includes(' '));
  return specific ?? candidates[0] ?? types[0] ?? null;
}

function normalizeRecord(dc: Record<string, unknown>): BnfCatalogueRecord | null {
  const identifiers = asArray(dc.identifier).map(textOf).filter((v): v is string => Boolean(v));
  const title = textOf(asArray(dc.title)[0]);
  if (!title) return null;

  let ark: string | null = null;
  for (const identifier of identifiers) {
    const match = identifier.match(GALLICA_ARK_URL_PATTERN);
    if (match) {
      ark = match[1];
      break;
    }
  }
  if (!ark) return null;

  const creators = asArray(dc.creator).map(textOf).filter((v): v is string => Boolean(v));
  const types = asArray(dc.type).map(textOf).filter((v): v is string => Boolean(v));
  const rights = asArray(dc.rights).map(textOf).filter((v): v is string => Boolean(v));
  const relations = asArray(dc.relation).map(textOf).filter((v): v is string => Boolean(v));
  const catalogueUrl = relations.map((r) => r.match(CATALOGUE_RELATION_PATTERN)?.[1]).find(Boolean) ?? null;

  return {
    ark,
    title,
    creator: creators[0] ?? null,
    date: textOf(asArray(dc.date)[0]),
    documentType: pickDocumentType(types),
    isPublicDomainWork: rights.some((r) => /domaine public|public domain/i.test(r)),
    catalogueUrl,
    permalink: `https://gallica.bnf.fr/ark:/12148/${ark}`,
  };
}

export async function searchCatalogue(query: string, opts?: BnfSearchOptions): Promise<BnfCatalogueRecord[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let xml: string;
  try {
    const response = await fetchWithRetry(searchUrl(query, opts), {
      signal: controller.signal,
      headers: { 'User-Agent': GALLICA_USER_AGENT },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    xml = await response.text();
  } catch (error) {
    throw new BnfRequestError('Gallica SRU search failed.', error);
  } finally {
    clearTimeout(timeout);
  }

  let parsed: any;
  try {
    parsed = parser.parse(xml);
  } catch (error) {
    throw new BnfRequestError('Gallica SRU search returned unparseable XML.', error);
  }

  const diagnostics = parsed?.searchRetrieveResponse?.diagnostics;
  if (diagnostics) {
    const message = textOf(asArray(diagnostics.diagnostic)[0]?.message) ?? 'Unknown SRU diagnostic.';
    throw new BnfRequestError(`Gallica SRU search rejected the query: ${message}`);
  }

  const records = asArray(parsed?.searchRetrieveResponse?.records?.record);
  const normalized: BnfCatalogueRecord[] = [];
  for (const record of records) {
    const dc = record?.recordData?.dc;
    if (!dc) continue;
    const normalizedRecord = normalizeRecord(dc);
    if (normalizedRecord) normalized.push(normalizedRecord);
  }
  return normalized;
}
