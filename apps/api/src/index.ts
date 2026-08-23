import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync } from 'fs';
import { join } from 'path';
import pino from 'pino';
import { PrismaClient } from '@my-music-coach/database';
import { authMiddleware, resolveRequestUser } from './middleware/auth.js';
import { resolvers } from './resolvers/index.js';
import { createLoaders } from './lib/loaders.js';
import { handleStripeWebhook, handleStripeV2Webhook } from './resolvers/payments.js';
import { buildUserCalendarFeed } from './lib/calendarFeed.js';
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

// `resolvers` is the single merged map from resolvers/index.ts (every
// resolver module plus the DateTime/JSON scalars - no `Decimal`, the SDL
// declares none; see that file's own comment) - previously this
// file hand-rolled its own, narrower mergeResolvers() call that silently
// omitted teacherApplications/uploads/quizzes/xp/recommendations. A field
// with no resolver in the map falls back to reading a same-named property
// off the root value, which is always undefined here - for a non-null
// schema field (Query.storageConfigured: Boolean!, Query.teacherApplications:
// [TeacherApplication!]!) that produced exactly the reported
// "Cannot return null for non-nullable field" errors.
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

  // Separate endpoint, separate signing secret - v2 thin events (Connect
  // account requirements/capability changes) are delivered to their own
  // event destination, distinct from the v1 webhook above. See
  // handleStripeV2Webhook's own comment for the Stripe Dashboard setup.
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET_V2) {
    app.post('/webhooks/stripe-v2', express.raw({ type: 'application/json' }), async (req, res) => {
      const signature = req.headers['stripe-signature'];
      if (typeof signature !== 'string') return res.status(400).send('Missing stripe-signature header');
      try {
        await handleStripeV2Webhook(prisma, req.body, signature);
        return res.json({ received: true });
      } catch (error) {
        logger.warn({ error }, 'Stripe v2 webhook rejected');
        return res.status(400).send('Invalid Stripe webhook');
      }
    });
  }

  // Raised from the original 1mb to comfortably fit a base64-encoded CV/
  // document/audio sample below, not just the small avatar/photo payloads
  // that used to be the only inline uploads this API accepted.
  app.use(express.json({ limit: '10mb' }));

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

  // ── Teacher application / profile files ────────────────────────────────
  //
  // Same mechanism as /profile/avatar above: saved straight to Postgres as
  // a data: URL, not routed through S3 at all - there's no presigned-upload
  // step, no S3_* secrets to configure, nothing that can be "not enabled on
  // this deployment yet". TeacherApplication (the pending application) and
  // TeacherProfile (the approved public profile) are separate entities with
  // their own photo column, so each gets its own small endpoint below,
  // mirroring the /profile/avatar → UserProfile.avatarUrl relationship.
  //
  // applyForTeacher/updateTeacherProfile (the GraphQL mutations) still also
  // accept a real S3 fileUrl for imageUrl/cvUrl/audioSampleUrl/
  // publicImageUrl/documentUrls, for a deployment that does have S3_*
  // configured and prefers that path - these REST endpoints are simply
  // what the web app itself calls today.
  const TEACHER_PHOTO_PATTERN = /^data:image\/(?:jpeg|png|webp);base64,/;
  const TEACHER_DOCUMENT_PATTERN = /^data:(?:application\/pdf|image\/(?:jpeg|png));base64,/;
  const TEACHER_AUDIO_PATTERN = /^data:audio\/(?:mpeg|mp4|wav|x-wav|ogg);base64,/;

  // Applicant may add a photo on step 1 of the wizard well before the
  // final "Submit application" step reaches applyForTeacher, so no
  // TeacherApplication row may exist yet - upsert rather than update-only.
  // Every other field stays whatever it already was (null on first
  // creation); applyForTeacher's own upsert fills and validates the rest
  // at actual submission time.
  app.post('/teacher-application/photo', async (req, res) => {
    const auth = await resolveRequestUser(req, prisma);
    if (!auth) return res.status(401).json({ error: 'Authentication required.' });
    const imageUrl = typeof req.body?.imageUrl === 'string' ? req.body.imageUrl : '';
    if (!TEACHER_PHOTO_PATTERN.test(imageUrl) || imageUrl.length > 750_000) {
      return res.status(400).json({ error: 'Use a JPEG, PNG, or WebP image smaller than 500 KB.' });
    }
    await prisma.teacherApplication.upsert({
      where: { userId: auth.id },
      create: { userId: auth.id, imageUrl, instruments: [] },
      update: { imageUrl },
    });
    return res.json({ imageUrl });
  });

  app.post('/teacher-application/cv', async (req, res) => {
    const auth = await resolveRequestUser(req, prisma);
    if (!auth) return res.status(401).json({ error: 'Authentication required.' });
    const cvUrl = typeof req.body?.cvUrl === 'string' ? req.body.cvUrl : '';
    if (!/^data:application\/pdf;base64,/.test(cvUrl) || cvUrl.length > 6_000_000) {
      return res.status(400).json({ error: 'Use a PDF smaller than 4 MB.' });
    }
    await prisma.teacherApplication.upsert({
      where: { userId: auth.id },
      create: { userId: auth.id, cvUrl, instruments: [] },
      update: { cvUrl },
    });
    return res.json({ cvUrl });
  });

  app.post('/teacher-application/audio', async (req, res) => {
    const auth = await resolveRequestUser(req, prisma);
    if (!auth) return res.status(401).json({ error: 'Authentication required.' });
    const audioSampleUrl = typeof req.body?.audioSampleUrl === 'string' ? req.body.audioSampleUrl : '';
    if (!TEACHER_AUDIO_PATTERN.test(audioSampleUrl) || audioSampleUrl.length > 8_000_000) {
      return res.status(400).json({ error: 'Use an audio file smaller than 6 MB.' });
    }
    await prisma.teacherApplication.upsert({
      where: { userId: auth.id },
      create: { userId: auth.id, audioSampleUrl, instruments: [] },
      update: { audioSampleUrl },
    });
    return res.json({ audioSampleUrl });
  });

  // Appends rather than replaces - matches the web wizard's "new ones are
  // added, not replaced" copy for this field.
  app.post('/teacher-application/document', async (req, res) => {
    const auth = await resolveRequestUser(req, prisma);
    if (!auth) return res.status(401).json({ error: 'Authentication required.' });
    const documentUrl = typeof req.body?.documentUrl === 'string' ? req.body.documentUrl : '';
    if (!TEACHER_DOCUMENT_PATTERN.test(documentUrl) || documentUrl.length > 6_000_000) {
      return res.status(400).json({ error: 'Use a PDF, JPEG, or PNG smaller than 4 MB.' });
    }
    const existing = await prisma.teacherApplication.findUnique({ where: { userId: auth.id } });
    const documentUrls = [...(existing?.documentUrls ?? []), documentUrl];
    await prisma.teacherApplication.upsert({
      where: { userId: auth.id },
      create: { userId: auth.id, documentUrls, instruments: [] },
      update: { documentUrls },
    });
    return res.json({ documentUrls });
  });

  app.post('/teacher/photo', async (req, res) => {
    const auth = await resolveRequestUser(req, prisma);
    if (!auth || (auth.role !== 'TEACHER' && auth.role !== 'ADMIN')) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const publicImageUrl = typeof req.body?.publicImageUrl === 'string' ? req.body.publicImageUrl : '';
    if (!TEACHER_PHOTO_PATTERN.test(publicImageUrl) || publicImageUrl.length > 750_000) {
      return res.status(400).json({ error: 'Use a JPEG, PNG, or WebP image smaller than 500 KB.' });
    }
    const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: auth.id } });
    if (!teacherProfile) return res.status(404).json({ error: 'Teacher profile not found.' });
    await prisma.teacherProfile.update({ where: { userId: auth.id }, data: { publicImageUrl } });
    return res.json({ publicImageUrl });
  });
  // Token-authenticated calendar subscription feed (Phase 6) - a calendar
  // app (Apple Calendar, Google Calendar, Outlook "subscribe from web")
  // polls this URL directly with no session cookie and no OAuth, so it's
  // deliberately outside authMiddleware/the GraphQL context. The token
  // itself is the credential (see User.calendarFeedToken and
  // rotateCalendarFeedToken in externalCalendar.ts) - constant-time
  // comparison isn't needed here since it's a unique-indexed DB lookup, not
  // a string comparison against a known value.
  app.get('/calendar/feed/:token', async (req, res) => {
    const raw = req.params.token;
    const token = raw.endsWith('.ics') ? raw.slice(0, -4) : raw;
    if (!token) return res.status(404).send('Not found');
    try {
      const user = await prisma.user.findUnique({ where: { calendarFeedToken: token } });
      if (!user) return res.status(404).send('Not found');
      const ics = await buildUserCalendarFeed(prisma, user.id);
      res.setHeader('content-type', 'text/calendar; charset=utf-8');
      res.setHeader('cache-control', 'no-store');
      res.setHeader('content-disposition', 'inline; filename="mymusic-coach.ics"');
      return res.send(ics);
    } catch (error) {
      logger.error({ error }, 'Calendar feed generation failed');
      return res.status(500).send('Calendar feed temporarily unavailable');
    }
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
        // Fresh loaders per request - see loaders.ts for why these must
        // never be reused/cached across requests.
        return { prisma, user, req, loaders: createLoaders(prisma) };
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
