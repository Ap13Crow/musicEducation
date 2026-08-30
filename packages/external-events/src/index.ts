export {
  ClassicticAdapter,
  ClassicticRequestError,
  classicticConfigurationSource,
  isClassicticConfigured,
  isSafeClassicticUrl,
  normalizeEvent,
} from './classictic.js';
export { runClassicticIngest } from './ingest.js';
export { EXTERNAL_EVENT_ATTENDANCE_XP, externalEventRecommendationScore } from './scoring.js';
export type {
  ClassicticIngestResult,
  ClassicticSource,
  DiscoveryAdapter,
  DiscoverySearchWindow,
  IngestLogger,
  NormalizedExternalEvent,
} from './types.js';
