# 🎵 MusicEdu — Classical Music Education Platform

A modern, fully open-source, AI-powered education platform for classical music built around **three pillars**:

| Pillar | Description |
|--------|-------------|
| 🎓 **Theory** | Udemy-style video courses with quizzes and progress tracking |
| 🎸 **Practice** | Online lessons (Zoom) + in-person bookings (Calendly) with Stripe/Yapeal payments |
| 🎪 **Performance** | Discover and publish concerts, masterclasses and workshops near you |

---

## Quick Start

```bash
# 1. Clone and copy environment
cp .env.example .env
# Edit .env with your secrets/API keys

# 2. Start the full stack (Docker)
docker compose up -d

# 3. Run database migrations
npm run db:migrate

# 4. Start development servers
npm run dev
```

**Local ports:**
- 🌐 Web App: http://localhost:3000
- 🔌 GraphQL API: http://localhost:4000/graphql
- 🔑 Keycloak Admin: http://localhost:8080
- 📦 MinIO Console: http://localhost:9001

---

## Tech Stack

- **Backend**: Node.js · TypeScript · Apollo Server 4 (GraphQL) · Prisma · PostgreSQL 16 · Redis
- **Frontend**: Next.js 14 · TypeScript · Tailwind CSS · Apollo Client
- **Auth**: Keycloak (OpenID Connect + SAML)
- **AI**: MCP Server + DeepSeek V4 (open-source LLM)
- **Payments**: Stripe + Yapeal (Swiss)
- **Video**: Zoom API
- **Scheduling**: Calendly API
- **Storage**: MinIO (S3-compatible)
- **Infrastructure**: Docker Compose + Kubernetes

---

## Key Features

- **AI-powered onboarding assessment** (15–20 min) — theory, performance recording, musical culture + preferences → personalised skill level + learning path
- **Duolingo-style gamification** — XP, levels, streaks, badges, achievements
- **Course system** — sections, lessons (video/audio/text/quiz), enrollments, progress
- **Teacher marketplace** — certifications, availability, ratings, Zoom/Calendly booking
- **Event platform** — geo-search for nearby concerts, ticket booking, event publishing
- **Social feed** — posts, likes, comments, follows
- **AI recommendations** — courses, teachers and events matched to your profile

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full technical architecture, data model, auth flow and deployment guide.

---

## Project Structure

```
apps/api/          GraphQL API (Apollo Server + Express)
apps/web/          Next.js 14 frontend
packages/database/ Prisma schema (PostgreSQL)
packages/graphql-schema/ Shared GraphQL SDL
packages/mcp-server/ MCP server (AI tools via DeepSeek)
docker/            Docker auxiliary configs (Keycloak realm)
k8s/               Kubernetes manifests
docs/              Architecture documentation
```

---

## License

[MIT](LICENSE)

