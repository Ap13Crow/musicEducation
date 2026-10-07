export { bnfCommercialReuseConfigured, bnfLibraryMediaEnabled, bnfAttribution } from './config.js';
export { searchCatalogue } from './sru.js';
export { getManifest, fetchPageImage, fetchPageAudio, sizedImageUrl } from './gallica.js';
export {
  ingestLibraryTopic,
  mapDocumentTypeToCategory,
  acquireLibraryIngestLock,
  releaseLibraryIngestLock,
} from './libraryIngest.js';
export type { LibraryIngestResult, IngestLogger } from './libraryIngest.js';
export { fetchWithRetry } from './retry.js';
export type {
  BnfCatalogueRecord,
  BnfSearchOptions,
  BnfManifest,
  BnfManifestPage,
  BnfFetchedAsset,
} from './types.js';
export { BnfRequestError } from './types.js';
