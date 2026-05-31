FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/graphql-schema/package.json ./packages/graphql-schema/
RUN npm install --workspaces --include-workspace-root

# Build
FROM deps AS builder
COPY packages/database ./packages/database
COPY packages/graphql-schema ./packages/graphql-schema
COPY apps/api ./apps/api
RUN cd packages/database && npx prisma generate
RUN cd apps/api && npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/graphql-schema/src ./packages/graphql-schema/src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
EXPOSE 4000
CMD ["node", "dist/index.js"]
