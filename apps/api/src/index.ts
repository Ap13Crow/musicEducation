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
import type { GraphQLContext } from './types.js';

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
]);

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function main() {
  const app = express();
  const httpServer = createServer(app);

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
  app.use(express.json());
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
