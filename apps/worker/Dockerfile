FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS manifests
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/worker/package.json ./apps/worker/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/external-events/package.json ./packages/external-events/package.json
COPY packages/graphql-schema/package.json ./packages/graphql-schema/package.json
COPY packages/mcp-server/package.json ./packages/mcp-server/package.json

FROM manifests AS build-deps
# npm install (not ci): apps/worker is a new workspace and package-lock.json
# regeneration for it is tracked separately (see docs/development.md); install
# resolves it from the existing lockfile instead of requiring exact sync.
RUN npm install --workspace @my-music-coach/worker --workspace @my-music-coach/database --workspace @my-music-coach/external-events --include-workspace-root

FROM build-deps AS builder
COPY apps/worker ./apps/worker
COPY packages/database ./packages/database
COPY packages/external-events ./packages/external-events
RUN npm run db:generate --workspace @my-music-coach/database \
 && npm run build --workspace @my-music-coach/database \
 && npm run build --workspace @my-music-coach/external-events \
 && npm run build --workspace @my-music-coach/worker

FROM manifests AS production-deps
RUN npm install --omit=dev --workspace @my-music-coach/worker --workspace @my-music-coach/database --workspace @my-music-coach/external-events --include-workspace-root \
 && npm cache clean --force

FROM node:20-bookworm-slim AS runner
RUN apt-get update -qq \
 && apt-get install -y --no-install-recommends ca-certificates openssl \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4100
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/apps/worker/dist ./dist
COPY --from=builder --chown=node:node /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder --chown=node:node /app/packages/database/dist ./packages/database/dist
COPY --from=builder --chown=node:node /app/packages/external-events/package.json ./packages/external-events/package.json
COPY --from=builder --chown=node:node /app/packages/external-events/dist ./packages/external-events/dist
USER node
EXPOSE 4100
CMD ["node", "dist/index.js"]
