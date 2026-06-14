# 🎵 My Music Coach — Classical My Music Coach

A modern, fully open-source, AI-powered education platform for classical music built around **three pillars**:

| Pillar | Description |
|--------|-------------|
| 🎓 **Theory** | Moodle-powered video courses with quizzes and progress tracking |
| 🎸 **Practice** | Online lessons (Zoom) + in-person bookings (LibreBooking) with Stripe/Yapeal payments |
| 🎪 **Performance** | Discover and publish concerts, masterclasses and workshops — ticketed via pretix |

---

## Architecture

My Music Coach is a **hub-and-spoke platform** with five core systems:

| System | Role | Domain (local) |
|--------|------|----------------|
| **my-music-coach** | User profiles, orchestration, public event discovery | `app.mymusic-coach.test` / `api.mymusic-coach.test` |
| **Keycloak** | Central identity provider (OIDC + SAML) | `auth.mymusic-coach.test` |
| **Moodle** | Online learning core (courses, lessons, quizzes) | `learn.mymusic-coach.test` |
| **LibreBooking** | Physical lesson scheduling (rooms, resources) | `booking.mymusic-coach.test` |
| **pretix** | Event ticketing core (orders, check-in, refunds) | `tickets.mymusic-coach.test` |

### Service Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    Caddy Gateway (:80)                           │
│  app.  │  api.  │  auth.  │  learn.  │  booking.  │  tickets.  │
└───┬────┴───┬────┴────┬────┴────┬─────┴─────┬──────┴─────┬──────┘
    │        │         │         │            │            │
    ▼        ▼         ▼         ▼            ▼            ▼
  [web]    [api]   [keycloak]  [moodle]  [librebooking]  [pretix]
    │        │         ▲         │            │            │
    │        │    OIDC/SAML      │            │            │
    │        │    ┌────┴─────────┤            │            │
    │        │    │    ┌─────────┼────────────┤            │
    │        │    │    │    ┌────┼────────────┼────────────┤
    │        │    │    │    │    │            │            │
    │        ▼    │    ▼    │    ▼            ▼            ▼
    │   [postgres] │ [moodle-db] │  [librebooking-db]  [pretix-db]
    │   [redis]    │             │                     [pretix-redis]
    │   [minio]    │             │
    │   [mcp-svc]  │             │
    └──────────────┘             │
                                 └──────── All DBs/Redis internal only
```

### Startup Order

1. **Databases** — `postgres-main`, `moodle-db`, `librebooking-db`, `pretix-db`
2. **Caches** — `redis-main`, `pretix-redis`
3. **Identity** — `keycloak`
4. **External services** — `moodle`, `librebooking`, `pretix`
5. **Platform** — `api` → `web`
6. **AI / Storage** — `mcp-server`, `minio`
7. **Gateway** — `gateway` (last — waits for all upstreams)

---

## Quick Start

### 1. Prerequisites

- Docker & Docker Compose v2
- Node.js ≥ 20 + npm ≥ 10

### 2. Configure `/etc/hosts`

```bash
# Add to /etc/hosts (or run: make hosts)
127.0.0.1  app.mymusic-coach.test
127.0.0.1  api.mymusic-coach.test
127.0.0.1  auth.mymusic-coach.test
127.0.0.1  learn.mymusic-coach.test
127.0.0.1  booking.mymusic-coach.test
127.0.0.1  tickets.mymusic-coach.test
```

### 3. Start the full stack

```bash
cp .env.example .env
# Edit .env with your secrets/API keys

make up          # or: docker compose up -d --build
make migrate     # Run DB migrations
```

### 4. Access services

| Service | URL |
|---------|-----|
| 🌐 Web App | http://app.mymusic-coach.test |
| 🔌 GraphQL API | http://api.mymusic-coach.test/graphql |
| 🔑 Keycloak Admin | http://auth.mymusic-coach.test |
| 📚 Moodle LMS | http://learn.mymusic-coach.test |
| 📅 LibreBooking | http://booking.mymusic-coach.test |
| 🎫 pretix Ticketing | http://tickets.mymusic-coach.test |

### 5. Development (hot-reload, no Docker)

```bash
npm install
npm run dev
```

---

## Tech Stack

- **Backend**: Node.js · TypeScript · Apollo Server 4 (GraphQL) · Prisma · PostgreSQL 16 · Redis
- **Frontend**: Next.js 14 · TypeScript · Tailwind CSS · Apollo Client
- **Auth**: Keycloak 24 (OpenID Connect + SAML) — central SSO for all systems
- **Learning**: Moodle 4.4 — online course delivery
- **Scheduling**: LibreBooking 2.8 — physical room/resource booking
- **Ticketing**: pretix 2024.7 — event ticketing and check-in
- **AI**: MCP Server + DeepSeek V4
- **Payments**: Stripe + Yapeal (Swiss)
- **Video**: Zoom API
- **Storage**: MinIO (S3-compatible)
- **Gateway**: Caddy 2.8 (reverse proxy)
- **Infrastructure**: Docker Compose + Kubernetes

---

## Key Features

- **AI-powered onboarding assessment** (15–20 min) — theory, performance recording, musical culture + preferences → personalised skill level + learning path
- **Duolingo-style gamification** — XP, levels, streaks, badges, achievements
- **Moodle-powered courses** — sections, lessons (video/audio/text/quiz), enrollments, progress
- **Teacher marketplace** — certifications, availability, ratings, Zoom/LibreBooking scheduling
- **pretix-powered event ticketing** — geo-search for nearby concerts, full ticket lifecycle
- **Social feed** — posts, likes, comments, follows
- **AI recommendations** — courses, teachers and events matched to your profile
- **Central SSO** — one Keycloak account logs into all systems

---

## Project Structure

```
apps/api/                     GraphQL API (Apollo Server + Express)
  src/integrations/           Integration layer (adapters, webhooks, sync)
    adapters/                 LibreBooking, Moodle, pretix adapters
    webhooks/                 Webhook handlers
    provisioning/             User provisioning flows
    sync/                     Periodic sync jobs
apps/web/                     Next.js 14 frontend
packages/database/            Prisma schema (PostgreSQL)
packages/graphql-schema/      Shared GraphQL SDL
packages/mcp-server/          MCP server (AI tools via DeepSeek)
docker/
  gateway/                    Caddy reverse proxy config
  keycloak/                   Keycloak realm export
  moodle/                     Moodle Dockerfile
  librebooking/               LibreBooking Dockerfile + entrypoint
  pretix/                     pretix Dockerfile + entrypoint
k8s/                          Kubernetes manifests
docs/
  integration-architecture.md Full integration design
  local-domains.md            /etc/hosts setup guide
  pretix-integration.md       pretix integration details
  security-baseline.md        Security controls and checklist
```

---

## Make Targets

```
make up             Start the full stack
make down           Stop all services
make logs           Tail all service logs
make migrate        Run Prisma migrations
make seed           Seed the database
make realm-import   Re-import Keycloak realm
make hosts          Print required /etc/hosts entries
make dev            Start local dev servers (no Docker)
make help           Show all available targets
```

---

## Documentation

- [`docs/integration-architecture.md`](docs/integration-architecture.md) — system design, service map, data flows
- [`docs/local-domains.md`](docs/local-domains.md) — local domain setup guide
- [`docs/pretix-integration.md`](docs/pretix-integration.md) — pretix ticketing integration
- [`docs/security-baseline.md`](docs/security-baseline.md) — security controls and secrets management
- [`docs/architecture.md`](docs/architecture.md) — original architecture reference

---

## License

[MIT](LICENSE)

