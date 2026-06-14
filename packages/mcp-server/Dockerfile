FROM node:20-alpine AS base
WORKDIR /app

# ── Install dependencies ───────────────────────────────────────
FROM base AS deps
COPY package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/mcp-server/package.json ./packages/mcp-server/
COPY packages/database/package.json ./packages/database/
COPY packages/graphql-schema/package.json ./packages/graphql-schema/
RUN npm install --workspaces --include-workspace-root

# ── Build ──────────────────────────────────────────────────────
FROM deps AS builder
COPY packages/mcp-server ./packages/mcp-server
RUN cd packages/mcp-server && npm run build

# ── Production image ───────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/mcp-server/dist ./dist
EXPOSE 3100
CMD ["node", "dist/index.js"]
