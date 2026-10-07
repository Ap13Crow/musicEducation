import {
  acquireLibraryIngestLock,
  ingestLibraryTopic,
  releaseLibraryIngestLock,
} from '@my-music-coach/bnf-gallica';
import type { Job } from './types.js';

// French terms: Gallica's corpus is French and English terms under-match.
// documentType filters stay single-word - multi-word `dc.type all` phrases
// ("document sonore") return zero hits combined with "and" (see
// packages/bnf-gallica/src/libraryIngest.ts). No BOOK filter yet:
// "monographie" is unconfirmed live, so books only arrive via OTHER/BOOK
// classification of unfiltered results until it is spiked.
export const LIBRARY_SEED_TOPICS = [
  'Bach', 'Mozart', 'Beethoven', 'Chopin', 'Debussy', 'Fauré', 'Ravel',
  'sonate', 'symphonie', 'opéra', 'musique de chambre',
  'piano', 'violon', 'violoncelle', 'guitare',
  'solfège', 'harmonie musicale', 'méthode de piano',
];
export const LIBRARY_SEED_DOCUMENT_TYPES = ['partition', 'sonore'];

const DEFAULT_DELAY_MS = 2000;

function ingestDelayMs() {
  const parsed = Number(process.env.BNF_LIBRARY_INGEST_DELAY_MS);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_DELAY_MS;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const bnfLibraryIngestJob: Job = {
  key: 'bnf-library-ingest',
  // Nightly, after classictic-ingest (02:15) so the two external pulls never overlap.
  schedule: '30 3 * * *',
  async run(ctx) {
    if (!(await acquireLibraryIngestLock(ctx.prisma))) {
      ctx.logger.info('Another library ingest holds the lock; skipping this run.');
      return;
    }

    const delayMs = ingestDelayMs();
    let fetched = 0;
    let upserted = 0;
    let failed = 0;
    try {
      // Strictly sequential: Gallica 429s back-to-back requests, so never Promise.all here.
      let first = true;
      for (const topic of LIBRARY_SEED_TOPICS) {
        for (const documentType of LIBRARY_SEED_DOCUMENT_TYPES) {
          if (!first) await sleep(delayMs);
          first = false;
          try {
            const result = await ingestLibraryTopic(ctx.prisma, topic, documentType, ctx.logger);
            fetched += result.fetched;
            upserted += result.upserted;
          } catch (error) {
            // One failing topic must not abort the rest of the seed list.
            failed += 1;
            ctx.logger.warn({ error, topic, documentType }, 'Library ingest topic failed; continuing');
          }
        }
      }
    } finally {
      await releaseLibraryIngestLock(ctx.prisma);
    }
    ctx.logger.info({ fetched, upserted, failedTopics: failed }, 'bnf-library-ingest run complete');
  },
};
