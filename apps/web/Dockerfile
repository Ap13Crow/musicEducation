FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json turbo.json ./
COPY tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/
RUN npm install --workspaces --include-workspace-root

FROM deps AS builder
COPY apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars are inlined into the bundle at build time.
# They must be declared as ARG (and promoted to ENV) before `npm run build`.
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_GRAPHQL_WS_URL
ARG NEXT_PUBLIC_PRETIX_WIDGET_URL
ARG NEXT_PUBLIC_LEARN_URL
ARG NEXT_PUBLIC_BOOKING_URL
ARG NEXT_PUBLIC_TICKETS_URL
ARG NEXT_PUBLIC_ENABLE_LIVE_API
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL \
    NEXT_PUBLIC_GRAPHQL_WS_URL=$NEXT_PUBLIC_GRAPHQL_WS_URL \
    NEXT_PUBLIC_PRETIX_WIDGET_URL=$NEXT_PUBLIC_PRETIX_WIDGET_URL \
    NEXT_PUBLIC_LEARN_URL=$NEXT_PUBLIC_LEARN_URL \
    NEXT_PUBLIC_BOOKING_URL=$NEXT_PUBLIC_BOOKING_URL \
    NEXT_PUBLIC_TICKETS_URL=$NEXT_PUBLIC_TICKETS_URL \
    NEXT_PUBLIC_ENABLE_LIVE_API=$NEXT_PUBLIC_ENABLE_LIVE_API

RUN cd apps/web && npm run build

FROM deps AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/src ./apps/web/src
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --from=builder /app/apps/web/tsconfig.json ./apps/web/tsconfig.json

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "--workspace", "apps/web", "run", "start"]
