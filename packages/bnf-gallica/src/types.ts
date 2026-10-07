/**
 * One hit from Gallica's own SRU search (https://gallica.bnf.fr/SRU) - this is
 * the digitized-document catalogue, distinct from the BnF general catalogue
 * (catalogue.bnf.fr), which indexes physical holdings and only rarely links
 * out to a digitized copy. Searching Gallica's SRU directly is what actually
 * answers "what can I import" - confirmed live: `gallica all "<query>" and
 * dc.type all "<documentType>"` against https://gallica.bnf.fr/SRU returns
 * the Gallica ARK as a bare https://gallica.bnf.fr/ark:/12148/... dc:identifier.
 */
export interface BnfCatalogueRecord {
  /** Gallica document ARK, bare id (e.g. "bpt6k11767775") - usable directly against gallica/iiif endpoints. */
  ark: string;
  title: string;
  creator?: string | null;
  date?: string | null;
  /** Most specific dc:type value found (e.g. "partition musicale", "document sonore"). */
  documentType?: string | null;
  /** True when any dc:rights value says "domaine public"/"public domain" - BnF's reuse fee still applies regardless (see config.ts). */
  isPublicDomainWork: boolean;
  /** BnF catalogue notice URL from the record's "Notice du catalogue" relation, when present. */
  catalogueUrl?: string | null;
  /** Permanent Gallica URL for this document - what gets stored as attribution. */
  permalink: string;
}

export interface BnfSearchOptions {
  /** Gallica dc.type value, e.g. "partition" (sheet music) or "document sonore" (audio). */
  documentType?: string;
  maximumRecords?: number;
}

/** One page/canvas of a digitized document, from its Gallica IIIF manifest. */
export interface BnfManifestPage {
  pageNumber: number;
  label?: string | null;
  /** Full-resolution IIIF Image API URL for this page - taken directly from the manifest, never reconstructed. */
  imageUrl: string;
  thumbnailUrl: string;
  /** This page/track number's digitized audio file, when the document has one (sound recordings: usually every page has a matching f{n}.audio). */
  audioUrl: string;
}

export interface BnfManifest {
  ark: string;
  title: string;
  /** The Gallica document's own permalink - what gets stored as attribution. */
  permalink: string;
  pages: BnfManifestPage[];
}

export interface BnfFetchedAsset {
  bytes: Buffer;
  contentType: string;
}

export class BnfRequestError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'BnfRequestError';
  }
}
