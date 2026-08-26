import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@my-music-coach/database';
import { logger } from './logger.js';
import { JobRegistry } from './scheduler.js';
import { heartbeatJob } from './jobs/heartbeat.js';
import { ticketmasterIngestJob } from './jobs/ticketmaster-ingest.js';
import { eventClassificationJob } from './jobs/event-classification.js';
import { mailDispatchJob } from './jobs/mail-dispatch.js';
import { classicticIngestJob } from './jobs/classictic-ingest.js';
import { keycloakUserSyncJob } from './jobs/keycloak-user-sync.js';

// Mirrors apps/api's DATABASE_URL construction: the postgres-mymusiccoach
// Kubernetes Secret provides PG* pieces (via envFrom), not a single DSN.
function configureDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  const required = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'] as const;
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Database configuration is missing: ${missing.join(', ')}`);
  }

  const user = encodeURIComponent(process.env.PGUSER!);
  const password = encodeURIComponent(process.env.PGPASSWORD!);
  const host = process.env.PGHOST!;
  const port = process.env.PGPORT!;
  const database = encodeURIComponent(process.env.PGDATABASE!);
  const query = new URLSearchParams({
    schema: 'public',
    sslmode: process.env.PGSSLMODE ?? 'verify-full',
    sslrootcert: process.env.PGSSLROOTCERT ?? '/etc/postgres-ca/ca.crt',
  });
  process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${database}?${query}`;
}

configureDatabaseUrl();
const prisma = new PrismaClient();
const registry = new JobRegistry(prisma, logger);
registry.register(heartbeatJob);
registry.register(ticketmasterIngestJob);
registry.register(eventClassificationJob);
registry.register(mailDispatchJob);
registry.register(classicticIngestJob);
registry.register(keycloakUserSyncJob);

async function main() {
  const app = express();
  app.disable('x-powered-by');

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/health/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready', jobs: registry.registeredJobKeys });
    } catch (error) {
      logger.warn({ error }, 'Database readiness check failed');
      res.status(503).json({ status: 'not-ready' });
    }
  });

  const port = Number(process.env.PORT ?? 4100);
  const server = app.listen(port, () => {
    logger.info({ port }, 'Worker health server listening');
  });

  registry.start();
  logger.info({ jobs: registry.registeredJobKeys }, 'Worker started');

  let shuttingDown = false;
  async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Worker shutting down');
    registry.stop();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
    logger.info('Worker shutdown complete');
    process.exit(0);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error({ error }, 'Worker failed to start');
  process.exit(1);
});
