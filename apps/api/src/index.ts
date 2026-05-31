import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@music-edu/database';
import { resolvers } from './resolvers/index.js';
import { authMiddleware, getUser } from './middleware/auth.js';
import { logger } from './utils/logger.js';
import type { GraphQLContext } from './types.js';

const typeDefs = readFileSync(
  join(__dirname, '../../packages/graphql-schema/src/schema.graphql'),
  'utf-8',
);

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function bootstrap() {
  const app = express();

  // ── Security ───────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '50mb' }));

  // ── Auth middleware ────────────────────────────────────────
  app.use(authMiddleware);

  // ── Health check ──────────────────────────────────────────
  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // ── HTTP + WebSocket server ────────────────────────────────
  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

  // ── Apollo Server ─────────────────────────────────────────
  const apolloServer = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              wsDisposable.dispose();
            },
          };
        },
      },
    ],
    formatError: (formattedError, _error) => {
      logger.error(formattedError);
      // Hide internal details in production
      if (process.env.NODE_ENV === 'production' && formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        return { message: 'An internal error occurred.' };
      }
      return formattedError;
    },
  });

  // WebSocket cleanup handle
  const wsDisposable = useServer(
    {
      schema,
      context: async (ctx) => {
        const token = ctx.connectionParams?.authorization as string | undefined;
        const user = token ? await getUser(token.replace('Bearer ', ''), prisma) : null;
        return { prisma, user };
      },
    },
    wsServer,
  );

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }): Promise<GraphQLContext> => ({
        prisma,
        // @ts-ignore — user attached by authMiddleware
        user: req.user ?? null,
        req,
      }),
    }),
  );

  const PORT = Number(process.env.PORT ?? 4000);
  httpServer.listen(PORT, () => {
    logger.info(`🎵 API server ready at http://localhost:${PORT}/graphql`);
    logger.info(`🔌 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

bootstrap().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
