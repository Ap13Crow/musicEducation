# My Music Coach — Architecture

## Overview

A fully open-source, containerised classical music education platform built around three core pillars:

| Pillar | Description | Key integrations |
|--------|-------------|-----------------|
| **Theory** | Udemy-style video courses with quizzes | Video hosting, progress tracking |
| **Practice** | Live lessons (online + physical) | Zoom, Calendly, Stripe/Yapeal |
| **Performance** | Event discovery & publishing | Geo-search, ticketing |

---

## Tech Stack

### Backend
| Concern | Technology |
|---------|-----------|
| Runtime | Node.js 20 (TypeScript) |
| API | GraphQL (Apollo Server 4) |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache / Pub-Sub | Redis 7 |
| Auth | Keycloak 24 (OpenID Connect + SAML) |
| AI / MCP | MCP Server + DeepSeek V4 |
| Payments | Stripe + Yapeal (CH) |
| Video calls | Zoom API |
| Scheduling | Calendly API |
| Object storage | MinIO (S3-compatible) |

### Frontend
| Concern | Technology |
|---------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| GraphQL client | Apollo Client 3 |
| Auth | NextAuth.js (Keycloak provider) |
| UI components | OpenUI |

### Infrastructure
| Concern | Technology |
|---------|-----------|
| Containers | Docker + Docker Compose |
| Orchestration | Kubernetes (k8s/) |
| Autoscaling | HPA (CPU-based) |
| Ingress | nginx-ingress-controller |
| TLS | cert-manager + Let's Encrypt |
| CI/CD | GitHub Actions (add as needed) |

---

## Repository Structure

```
my-music-coach/
├── apps/
│   ├── api/                      # GraphQL API server (Apollo + Express)
│   │   ├── src/
│   │   │   ├── resolvers/        # All GraphQL resolvers by domain
│   │   │   ├── middleware/       # Auth (JWT + OIDC)
│   │   │   ├── utils/            # Logger, helpers
│   │   │   ├── index.ts          # Server entrypoint
│   │   │   └── types.ts          # GraphQL context type
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                      # Next.js 14 frontend
│       ├── src/
│       │   ├── app/              # App Router pages
│       │   ├── components/       # Shared UI components
│       │   └── lib/              # Apollo provider, auth provider
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── database/                 # Prisma schema + client
│   │   └── prisma/schema.prisma  # Full data model
│   ├── graphql-schema/           # Shared SDL schema
│   │   └── src/schema.graphql    # Full GraphQL SDL
│   └── mcp-server/               # MCP server (AI tools)
│       └── src/
│           ├── index.ts          # MCP server entrypoint
│           └── tools/            # AI tool implementations
├── docker/
│   └── keycloak/
│       └── realm-export.json     # Keycloak realm config
├── k8s/
│   └── deployment.yaml           # Kubernetes manifests
├── docs/
│   └── architecture.md           # This file
├── docker-compose.yml            # Full local stack
├── .env.example                  # Environment variable template
├── turbo.json                    # Turborepo pipeline
└── package.json                  # Monorepo root
```

---

## Data Model Summary

### User Roles

```
GUEST     → browse free courses, search teachers, see events
STUDENT   → full access to paid content, bookings, feed
TEACHER   → create courses, accept bookings, publish events
ADMIN     → platform management, verify teachers
```

### Core Entities

```
User ──────────────────────────────────────────────────────────
  ├── UserProfile           (instruments, styles, timezone)
  ├── TeacherProfile        (certifications, availability, rates)
  └── GamificationProfile   (XP, level, badges, achievements)

Theory ────────────────────────────────────────────────────────
  Course → CourseSection → Lesson → Quiz → QuizQuestion
  Enrollment → LessonProgress
  Assessment → AssessmentQuestion → AssessmentAnswer

Practice ──────────────────────────────────────────────────────
  Booking (student ↔ teacher, Zoom/Calendly, Payment)
  TeacherAvailability

Performance ───────────────────────────────────────────────────
  Event (geo-located, typed, capacity-managed)
  EventBooking → Payment

Social ────────────────────────────────────────────────────────
  FeedPost → FeedLike, FeedComment
  Follow
  Review (course, event, booking)
  Message
  Notification
```

---

## Authentication Flow

```
Browser → Next.js → NextAuth.js → Keycloak (OIDC)
                                      ↓
                              id_token + access_token
                                      ↓
                         Apollo Client → GraphQL API
                              (Authorization: ******
                                      ↓
                              authMiddleware → verifyToken
                                      ↓
                              GraphQL context.user
```

### OpenID Connect endpoints (Keycloak)
- Discovery: `http://localhost:8080/realms/mymusic-coach/.well-known/openid-configuration`
- Auth: `http://localhost:8080/realms/mymusic-coach/protocol/openid-connect/auth`
- Token: `http://localhost:8080/realms/mymusic-coach/protocol/openid-connect/token`

---

## AI / MCP Integration

The MCP server exposes four tools that can be called by Claude, GPT or any MCP-compatible client:

| Tool | Purpose |
|------|---------|
| `analyze_recording` | Evaluate audio/video of a student performance |
| `evaluate_assessment` | Score the onboarding assessment + assign skill level |
| `generate_feedback` | Produce personalised next-step recommendations |
| `recommend_content` | Match courses, teachers and events to user profile |

Configure `DEEPSEEK_API_KEY` + `DEEPSEEK_API_URL` to use DeepSeek V4 (or any OpenAI-compatible endpoint).

---

## Gamification System

New users complete a **15–20 minute onboarding assessment** covering:

1. **Music Theory** — intervals, notation, harmony (MCQ)
2. **Performance** — upload/record a short musical piece (AI-graded)
3. **Cultural Knowledge** — composer history, periods, styles (MCQ)
4. **Preferences** — instruments & music styles (selector)

The AI produces a `SkillLevel` (BEGINNER → PROFESSIONAL) and generates personalised recommendations.

**XP sources:**
- Complete lesson → +10 XP (configurable per lesson)
- Complete assessment → up to +200 XP (score × 200)
- Complete a course → +100 XP
- Submit a review → +20 XP
- Daily login streak → multiplier

---

## Payments

| Provider | Use case |
|---------|---------|
| **Stripe** | International card payments, courses, bookings, events |
| **Yapeal** | Swiss digital wallet (CHF-native) |

Flow: `createCheckoutSession` → redirect to provider → webhook `handleWebhook` → update enrollment/booking status.

---

## Local Development

```bash
# 1. Copy env file
cp .env.example .env
# Edit .env with real values

# 2. Start all services
docker compose up -d

# 3. Run DB migrations
npm run db:migrate

# 4. Start dev servers (hot-reload)
npm run dev
```

Ports:
- Web app: http://localhost:3000
- GraphQL API: http://localhost:4000/graphql
- Keycloak admin: http://localhost:8080
- MinIO console: http://localhost:9001

---

## Deployment (Kubernetes)

```bash
# Create secrets first (never commit real secrets!)
kubectl create secret generic db-secret \
  --from-literal=username=mymusic_coach \
  --from-literal=****** \
  -n mymusic-coach

kubectl create secret generic redis-secret \
  --from-literal=****** \
  -n mymusic-coach

# Apply all manifests
kubectl apply -f k8s/

# Check status
kubectl get pods -n mymusic-coach
```

---

## Scalability Notes

- **API**: Stateless, scales horizontally via HPA (target 70% CPU)
- **Web**: Stateless SSR, scales independently
- **PostgreSQL**: Start with single instance; migrate to Citus or read replicas at scale
- **Redis**: Use Redis Cluster or Upstash for production
- **Media**: MinIO → migrate to S3/GCS for production
- **MCP/AI**: Runs as a separate service, scales independently
- **Zoom/Calendly**: Webhooks handled by the API; use queue (e.g., BullMQ on Redis) for high volume
