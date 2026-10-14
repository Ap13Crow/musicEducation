import { PrismaClient } from '@my-music-coach/database';
import { configureDatabaseUrl } from './lib/databaseUrl.js';
import { audioRestorationPending, runAudioRestoration } from './lib/audioRestoration.js';
import { libraryMediaStoreConfigured } from './lib/libraryMediaStore.js';
import { logger } from './utils/logger.js';

// Entry point of the audio-restorer deployment (deploy/workloads/application/
// audio-restorer.yaml): the API image with this command instead of the API.
// It restores every Library recording one side at a time (teachers' uploads
// first), then looks for new ones every 30 minutes (imports, uploads and the
// Library mirror add some). Kept out of the API pod so ffmpeg never slows
// the site.

const IDLE_MS = 30 * 60_000;
// Recordings processed at the same time (each one download + one ffmpeg).
const CONCURRENCY = Math.max(1, Number(process.env.RESTORE_CONCURRENCY ?? 1) || 1);
configureDatabaseUrl();
const prisma = new PrismaClient();
let stopping = false;

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    // Finish the side in hand at most; Kubernetes allows the grace period.
    stopping = true;
    logger.info({ signal }, 'Audio restorer stopping');
  });
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    const poll = setInterval(() => {
      if (stopping) {
        clearTimeout(timer);
        clearInterval(poll);
        resolve();
      }
    }, 1000);
    timer.unref?.();
  });

async function main() {
  if (!libraryMediaStoreConfigured()) {
    logger.error('Audio restorer: the Library media store is not configured (library-media-s3 Secret); idling');
  }
  while (!stopping) {
    try {
      if (libraryMediaStoreConfigured()) {
        const pending = await audioRestorationPending(prisma);
        if (pending > 0) {
          logger.info({ pending }, 'Audio restorer: pass starting');
          const result = await runAudioRestoration(prisma, { limit: 25 * CONCURRENCY, concurrency: CONCURRENCY, shouldStop: () => stopping });
          logger.info(result, 'Audio restorer: pass finished');
          if (result.restored > 0) continue;
        }
      }
    } catch (error) {
      logger.error({ error }, 'Audio restorer: pass failed');
    }
    await sleep(IDLE_MS);
  }
  await prisma.$disconnect();
}

void main();
