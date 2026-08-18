import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
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
import { paymentResolvers, handleStripeWebhook } from './resolvers/payments.js';
import { adminResolvers } from './resolvers/admin.js';
import { discoveryResolvers } from './resolvers/discovery.js';
import type { GraphQLContext } from './types.js';

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
  discoveryResolvers,
]);
const schema = makeExecutableSchema({ typeDefs, resolvers });

async function main() {
  const app = express();
  const httpServer = createServer(app);
  app.disable('x-powered-by');
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://web:3000', credentials: true }));

  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
    app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
      const signature = req.headers['stripe-signature'];
      if (typeof signature !== 'string') return res.status(400).send('Missing stripe-signature header');
      try {
        await handleStripeWebhook(prisma, req.body, signature);
        return res.json({ received: true });
      } catch (error) {
        logger.warn({ error }, 'Stripe webhook rejected');
        return res.status(400).send('Invalid Stripe webhook');
      }
    });
  }

  app.use(express.json({ limit: '1mb' }));

  app.use(authMiddleware);
  app.post('/profile/avatar', async (req, res) => {
    const auth = await resolveRequestUser(req, prisma);
    if (!auth) return res.status(401).json({ error: 'Authentication required.' });
    const avatarUrl = typeof req.body?.avatarUrl === 'string' ? req.body.avatarUrl : '';
    if (!/^data:image\/(?:jpeg|png|webp);base64,/.test(avatarUrl) || avatarUrl.length > 750_000) {
      return res.status(400).json({ error: 'Use a JPEG, PNG, or WebP image smaller than 500 KB.' });
    }
    await prisma.userProfile.upsert({
      where: { userId: auth.id },
      create: { userId: auth.id, avatarUrl, instruments: [], musicStyles: [] },
      update: { avatarUrl },
    });
    return res.json({ avatarUrl });
  });
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

  const server = new ApolloServer<GraphQLContext>({ schema });
  await server.start();
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      try {
        const user = await resolveRequestUser(req, prisma, (diagnostic) => {
          logger.warn({ auth: diagnostic }, 'Keycloak access token was rejected');
        });
        if (req.headers.authorization?.startsWith('Bearer ') && !user) {
          logger.warn('Bearer token did not resolve to an application user');
        }
        return { prisma, user, req };
      } catch (error) {
        logger.error({ err: error }, 'Authenticated user provisioning failed');
        throw error;
      }
    },
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
