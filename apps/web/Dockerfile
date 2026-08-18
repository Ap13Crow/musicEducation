FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/graphql-schema/package.json ./packages/graphql-schema/package.json
COPY packages/mcp-server/package.json ./packages/mcp-server/package.json
# Browser binaries are irrelevant to this production build (e2e/ isn't part
# of it — see apps/web/tsconfig.json's exclude — and the Playwright CI job
# installs its own browser), so skip that download entirely rather than pay
# for it on every image build.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npm ci --workspace @my-music-coach/web --include-workspace-root

FROM deps AS builder
COPY apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_GRAPHQL_URL=/api/graphql
ARG NEXT_PUBLIC_ENABLE_LIVE_API=true
ARG NEXT_PUBLIC_KEYCLOAK_ISSUER=https://auth-dev.mymusic.coach/realms/mymusic-coach
ARG NEXT_PUBLIC_APP_URL=https://dev.mymusic.coach
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL \
    NEXT_PUBLIC_ENABLE_LIVE_API=$NEXT_PUBLIC_ENABLE_LIVE_API \
    NEXT_PUBLIC_KEYCLOAK_ISSUER=$NEXT_PUBLIC_KEYCLOAK_ISSUER \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN npm run build --workspace @my-music-coach/web

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
