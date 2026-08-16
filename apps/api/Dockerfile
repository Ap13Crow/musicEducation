FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/graphql-schema/package.json ./packages/graphql-schema/package.json
COPY packages/mcp-server/package.json ./packages/mcp-server/package.json
RUN npm ci --workspace @my-music-coach/api --workspace @my-music-coach/database --include-workspace-root

FROM deps AS builder
COPY apps/api ./apps/api
COPY packages/database ./packages/database
COPY packages/graphql-schema ./packages/graphql-schema
RUN npm run db:generate --workspace @my-music-coach/database \
 && npm run build --workspace @my-music-coach/database \
 && npm run build --workspace @my-music-coach/api \
 && npm prune --omit=dev --workspaces --include-workspace-root

FROM node:20-bookworm-slim AS runner
RUN apt-get update -qq \
 && apt-get install -y --no-install-recommends ca-certificates openssl \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000 \
    GRAPHQL_SCHEMA_PATH=/app/packages/graphql-schema/src/schema.graphql
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist
COPY --from=builder --chown=node:node /app/packages/database ./packages/database
COPY --from=builder --chown=node:node /app/packages/graphql-schema ./packages/graphql-schema
USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
