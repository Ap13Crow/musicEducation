# 🎵 MyMusic.Coach — Classical Music Education

A TypeScript monorepo delivering three product pillars in **one native application** —
there is no Moodle, LibreBooking, or pretix in the target system. Those were an early
reference approach and have been removed; do not reintroduce them.

> **Architecture rebuild:** the provider-neutral Kubernetes bootstrap is under
> [`deploy/`](deploy/), contributor commands are in
> [`docs/development.md`](docs/development.md), and coding-agent constraints are
> in [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md). `docker-compose*.yml`,
> `docker/`, and `k8s/deployment.yaml` remain legacy migration references only.

| Pillar | Description |
|--------|-------------|
| 🎓 **Learning** | Native course authoring, publishing, purchase, viewer, progress, assessment |
| 🎸 **Booking** | Teacher discovery, availability, exact teacher-defined slots, Stripe payment |
| 🎪 **Events** | Teacher-published events plus normalized external discovery (Ticketmaster, later Classictic) and Europeana cultural-heritage content |

All three are modules of the same application, not separate platforms.

---

## Architecture

### Workloads

| Workload | Role |
|----------|------|
| `apps/web` | Next.js UI |
| `apps/api` | GraphQL API + webhooks (Stripe at `/api/webhooks/stripe`) |
| `apps/worker` | Async jobs: webhook processing, email, external-event ingestion, retries (being introduced — async work currently runs in-process in the API) |

Shared code lives in `packages/database` (Prisma, `db push` workflow), `packages/graphql-schema`,
and `packages/mcp-server`.

### Identity and data ownership

- **Keycloak** is the identity authority (OIDC, PKCE, server-side sessions).
- The application **PostgreSQL database** owns profiles, roles, marketplace, bookings, courses,
  entitlements, and progress. `UserExternalIdentity` maps the immutable Keycloak `sub` to the
  platform user.
- **Stripe test mode only** in development. Payment state is a state machine; the signed webhook —
  never the browser redirect — confirms payment.
- External providers (Ticketmaster, Europeana, later Classictic) are read-only discovery inputs
  behind server-side adapters.

### Target deployment

Production and development both target **DigitalOcean Kubernetes (DOKS)**, reached through a
**Cloudflare Tunnel** — there is no public LoadBalancer or ingress controller. GitHub Actions builds
SHA-tagged images, syncs secrets from GitHub environment secrets, and applies manifests to the
cluster; local development does not require cluster access. See [`deploy/README.md`](deploy/README.md)
for the Kustomize layout and [`docs/deployment.md`](docs/deployment.md) for the deployment path.

---

## Quick Start (local development)

### 1. Prerequisites

- Node.js ≥ 20 + npm ≥ 10
- Docker with Compose v2 only if you want the legacy local stack (Postgres, Redis, Keycloak, MinIO)

### 2. Install and generate

```bash
npm ci
cp .env.example .env
npm run db:generate
```

### 3. Run

```bash
npm run dev
# or a single workspace:
npm run dev --workspace @my-music-coach/web
npm run dev --workspace @my-music-coach/api
```

See [`docs/development.md`](docs/development.md) for the full command reference (build, test, lint,
database commands, and rendering the Kubernetes manifests without touching a cluster).

### Legacy Compose stack

The Compose topology in [`docker-compose.yml`](docker-compose.yml) (Postgres, Redis, Keycloak,
MinIO, the app workloads, and the MCP server) remains available as a migration reference. It is
**not** the target architecture — that's the DOKS layout under `deploy/`.

```bash
docker compose config      # render only
docker compose up -d --build
docker compose down
```

---

## Tech Stack

- **Backend**: Node.js · TypeScript · Apollo Server 4 (GraphQL) · Prisma · PostgreSQL 16
- **Frontend**: Next.js 14 · TypeScript · Tailwind CSS · Apollo Client
- **Auth**: Keycloak (OpenID Connect, PKCE, server-side sessions) — central identity for the app
- **Payments**: Stripe (test mode in development), Stripe Connect for teacher/seller payouts
- **AI**: MCP Server
- **Infrastructure**: DigitalOcean Kubernetes (Kustomize) behind a Cloudflare Tunnel; Docker Compose
  kept only as a legacy local-dev reference

---

## Project Structure

```
apps/api/                     GraphQL API (Apollo Server + Express)
apps/web/                     Next.js 14 frontend
apps/worker/                  Async job runner (being introduced)
packages/database/            Prisma schema (PostgreSQL)
packages/graphql-schema/      Shared GraphQL SDL
packages/mcp-server/          MCP server (AI tools)
deploy/                       Provider-neutral Kustomize scaffold (target Kubernetes layout)
docker/                       Legacy Compose build contexts (gateway, keycloak) — migration reference
docker-compose.yml            Legacy local dev stack — migration reference, not the target architecture
k8s/                          Legacy Kubernetes manifest — migration reference, not the target layout
docs/
  development.md              Contributor commands (install, build, test, lint, manifest rendering)
  deployment.md                Deployment path and GitHub Actions/DOKS details
  cloudflare-tunnel.md        Cloudflare Tunnel setup and routing
```

---

## Documentation

- [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) — coding-agent guidance and guardrails
- [`docs/development.md`](docs/development.md) — install, build, test, lint, and manifest rendering
- [`docs/deployment.md`](docs/deployment.md) — deployment path (GitHub Actions → DOKS)
- [`docs/cloudflare-tunnel.md`](docs/cloudflare-tunnel.md) — Cloudflare Tunnel setup and routing
- [`deploy/README.md`](deploy/README.md) — target Kubernetes (Kustomize) layout

---

## License

[MIT](LICENSE)
