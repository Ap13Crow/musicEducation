export { bnfCommercialReuseConfigured, bnfLibraryMediaEnabled, bnfAttribution } from './config.js';
export { searchCatalogue, searchCataloguePage, buildGallicaQuery, GALLICA_MAX_PAGE_SIZE } from './sru.js';
export { getManifest, fetchPageImage, fetchPageAudio, sizedImageUrl } from './gallica.js';
export {
  ingestLibraryTopic,
  mapDocumentTypeToCategory,
  categorizeDocumentTypes,
  acquireLibraryIngestLock,
  releaseLibraryIngestLock,
} from './libraryIngest.js';
export type { LibraryIngestResult, IngestLogger } from './libraryIngest.js';
export { fetchWithRetry } from './retry.js';
export type {
  BnfCatalogueRecord,
  BnfSearchOptions,
  BnfPageSearchOptions,
  BnfManifest,
  BnfManifestPage,
  BnfFetchedAsset,
} from './types.js';
export { BnfRequestError } from './types.js';
