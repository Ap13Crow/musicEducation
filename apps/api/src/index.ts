import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeResolvers } from '@graphql-tools/merge';
import { readFileSync } from 'fs';
import { join } from 'path';
import pino from 'pino';
import { PrismaClient } from '@my-music-coach/database';
import { authMiddleware, resolveRequestUser } from './middleware/auth.js';
import { authResolvers } from './resolvers/auth.js';
import { userResolvers } from './resolvers/users.js';
import { bookingResolvers } from './resolvers/bookings.js';
import { reviewResolvers } from './resolvers/reviews.js';
import { courseResolvers } from './resolvers/courses.js';
import { eventResolvers } from './resolvers/events.js';
import { assessmentResolvers } from './resolvers/assessments.js';
import { feedResolvers } from './resolvers/feed.js';
import { paymentResolvers } from './resolvers/payments.js';
import { adminResolvers } from './resolvers/admin.js';
import type { GraphQLContext } from './types.js';
import { PretixAdapter } from './integrations/adapters/pretix.js';
import { LibreBookingAdapter } from './integrations/adapters/librebooking.js';
import { MoodleAdapter } from './integrations/adapters/moodle.js';
import { startScheduler } from './integrations/scheduler.js';
import { createPretixWebhookHandler } from './integrations/webhooks/pretix-webhook.js';
import { createLibreBookingWebhookHandler } from './integrations/webhooks/librebooking-webhook.js';
import { createStripeWebhookHandler } from './integrations/webhooks/payment-webhook.js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

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

const schemaPath =
  process.env.GRAPHQL_SCHEMA_PATH ??
  join(process.cwd(), 'packages/graphql-schema/src/schema.graphql');
const typeDefs = readFileSync(schemaPath, 'utf-8');

const resolvers = mergeResolvers([
  authResolvers,
  userResolvers,
  bookingResolvers,
  reviewResolvers,
  courseResolvers,
  eventResolvers,
  assessmentResolvers,
  feedResolvers,
  paymentResolvers,
  adminResolvers,
]);
const schema = makeExecutableSchema({ typeDefs, resolvers });

async function main() {
  const legacySchedulerEnabled = process.env.ENABLE_LEGACY_SCHEDULER === 'true';
  const pretixAdapter = legacySchedulerEnabled && process.env.PRETIX_URL && process.env.PRETIX_API_TOKEN
    ? new PretixAdapter(process.env.PRETIX_URL, process.env.PRETIX_API_TOKEN)
    : undefined;
  const libreBookingAdapter = legacySchedulerEnabled && process.env.LIBREBOOKING_URL && process.env.LIBREBOOKING_API_USER && process.env.LIBREBOOKING_API_PASSWORD
    ? new LibreBookingAdapter(process.env.LIBREBOOKING_URL, {
        username: process.env.LIBREBOOKING_API_USER,
        password: process.env.LIBREBOOKING_API_PASSWORD,
      })
    : undefined;
  const moodleAdapter = legacySchedulerEnabled && process.env.MOODLE_URL && process.env.MOODLE_WS_TOKEN
    ? new MoodleAdapter(process.env.MOODLE_URL, process.env.MOODLE_WS_TOKEN)
    : undefined;

  if (legacySchedulerEnabled) {
    startScheduler(prisma, { pretix: pretixAdapter, libreBooking: libreBookingAdapter, moodle: moodleAdapter }, {
      pretixOrganiserSlug: process.env.PRETIX_ORGANISER_SLUG,
    });
  }

  const app = express();
  const httpServer = createServer(app);
  app.disable('x-powered-by');
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://web:3000', credentials: true }));

  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
    app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), createStripeWebhookHandler(
      prisma,
      process.env.STRIPE_SECRET_KEY,
      process.env.STRIPE_WEBHOOK_SECRET,
    ));
  }

  app.use(express.json());
  if (pretixAdapter) app.post('/webhooks/pretix', createPretixWebhookHandler(prisma, pretixAdapter));
  if (libreBookingAdapter) app.post('/webhooks/librebooking', createLibreBookingWebhookHandler(prisma));

  app.use(authMiddleware);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/health/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready' });
    } catch (error) {
      logger.warn({ error }, 'Database readiness check failed');
      res.status(503).json({ status: 'not-ready' });
    }
  });

  app.get('/pretix-sso-link', async (req, res) => {
    const auth = await resolveRequestUser(req, prisma);
    if (!auth || auth.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
    const dbUser = await prisma.user.findUnique({ where: { id: auth.id }, select: { email: true } });
    if (!dbUser?.email) return res.status(500).json({ error: 'User email not found' });
    const secret = process.env.PRETIX_SSO_SECRET;
    if (!secret) return res.status(503).json({ error: 'PRETIX_SSO_SECRET not configured' });
    const token = jwt.sign({ email: dbUser.email }, secret, { expiresIn: 60, algorithm: 'HS256' } as any);
    const pretixUrl = (process.env.PRETIX_URL ?? 'https://tickets.mymusic.coach').replace('http://pretix:80', 'https://tickets.mymusic.coach');
    return res.json({ url: `${pretixUrl}/control/login/?sso_token=${token}` });
  });

  const server = new ApolloServer<GraphQLContext>({ schema });
  await server.start();
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({
      prisma,
      user: await resolveRequestUser(req, prisma),
      req,
      libreBooking: libreBookingAdapter,
    }),
  }));

  const port = Number(process.env.PORT ?? 4000);
  httpServer.listen(port, '0.0.0.0', () => logger.info({ port }, 'API server listening'));
}

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

main().catch(async (error) => {
  logger.error(error, 'Fatal startup error');
  await prisma.$disconnect();
  process.exit(1);
});
