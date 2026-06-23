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
import { paymentResolvers } from './resolvers/payments.js';
import { adminResolvers } from './resolvers/admin.js';
import type { GraphQLContext } from './types.js';

// Import Integrations & Scheduler
import { PretixAdapter } from './integrations/adapters/pretix.js';
import { LibreBookingAdapter } from './integrations/adapters/librebooking.js';
import { MoodleAdapter } from './integrations/adapters/moodle.js';
import { startScheduler } from './integrations/scheduler.js';
import { createPretixWebhookHandler } from './integrations/webhooks/pretix-webhook.js';
import { createLibreBookingWebhookHandler } from './integrations/webhooks/librebooking-webhook.js';
import { createStripeWebhookHandler } from './integrations/webhooks/payment-webhook.js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const prisma = new PrismaClient();

const typeDefs = readFileSync(
  join(__dirname, '../packages/graphql-schema/src/schema.graphql'),
  'utf-8',
);

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
  // Initialize Adapters if configured
  const pretixAdapter = process.env.PRETIX_URL && process.env.PRETIX_API_TOKEN
    ? new PretixAdapter(process.env.PRETIX_URL, process.env.PRETIX_API_TOKEN)
    : undefined;

  const libreBookingAdapter = process.env.LIBREBOOKING_URL && process.env.LIBREBOOKING_API_USER && process.env.LIBREBOOKING_API_PASSWORD
    ? new LibreBookingAdapter(process.env.LIBREBOOKING_URL, {
        username: process.env.LIBREBOOKING_API_USER,
        password: process.env.LIBREBOOKING_API_PASSWORD,
      })
    : undefined;

  const moodleAdapter = process.env.MOODLE_URL && process.env.MOODLE_WS_TOKEN
    ? new MoodleAdapter(process.env.MOODLE_URL, process.env.MOODLE_WS_TOKEN)
    : undefined;

  // Start the background scheduler
  startScheduler(prisma, {
    pretix: pretixAdapter,
    libreBooking: libreBookingAdapter,
    moodle: moodleAdapter,
  }, { pretixOrganiserSlug: process.env.PRETIX_ORGANISER_SLUG });

  const app = express();
  const httpServer = createServer(app);

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));

  // Stripe requires raw body for signature verification
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
    app.post(
      '/webhooks/stripe',
      express.raw({ type: 'application/json' }),
      createStripeWebhookHandler(prisma, process.env.STRIPE_SECRET_KEY, process.env.STRIPE_WEBHOOK_SECRET)
    );
  }

  app.use(express.json());

  // Webhooks (must be before authMiddleware so they are public)
  if (pretixAdapter) {
    app.post('/webhooks/pretix', createPretixWebhookHandler(prisma, pretixAdapter));
  }
  app.post('/webhooks/librebooking', createLibreBookingWebhookHandler(prisma));

  app.use(authMiddleware);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  const server = new ApolloServer<GraphQLContext>({ schema });
  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({
        prisma,
        user: await resolveRequestUser(req, prisma),
        req,
        libreBooking: libreBookingAdapter,
      }),
    }),
  );

  const port = Number(process.env.PORT ?? 4000);
  httpServer.listen(port, () => {
    logger.info({ port }, 'API server listening');
  });
}

main().catch((err) => {
  logger.error(err, 'Fatal startup error');
  process.exit(1);
});
