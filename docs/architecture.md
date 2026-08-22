# MyMusic.Coach — Architecture

> This document was rewritten from a direct read of the current source tree, Prisma
> schema, GraphQL SDL, GitHub Actions workflows, and `deploy/` manifests. Earlier
> versions of this file described an unrelated reference stack (Redis, MinIO, Zoom,
> Calendly, Yapeal, a Caddy gateway, `k8s/deployment.yaml`, and a Moodle/LibreBooking/
> pretix hub-and-spoke). None of that exists in the current implementation — it was an
> early reference approach superseded by the native build described below. See
> `AGENTS.md` and `CLAUDE.md` for the authoritative statement of that decision.

## Overview

MyMusic.Coach is a single TypeScript application delivering three product pillars,
implemented natively (no external LMS, booking, or ticketing system):

| Pillar | Description |
|--------|-------------|
| **Booking** | Teacher discovery, teacher-defined availability, exact bookable slots, Stripe payment |
| **Learning** | Native course authoring, publishing, purchase, viewer, progress, assessment |
| **Events** | Teacher-published events plus normalized external discovery (Ticketmaster today; Classictic and Europeana are planned, not yet built) |

---

## Tech stack

### Backend
| Concern | Technology |
|---------|-----------|
| Runtime | Node.js 20 (TypeScript) |
| API | GraphQL (Apollo Server 4 + Express, `expressMiddleware` at `/graphql`) |
| Database | PostgreSQL + Prisma ORM (`db push` workflow in dev; forward-only SQL under `deploy/database/identity/` ships schema changes to the cluster) |
| Auth | Keycloak (OIDC), verified server-side; no parallel/custom auth system |
| AI | DeepSeek preferred, OpenAI as fallback (both OpenAI-wire-compatible) — advisory text only (assessment reports, event classification); never mutates payment/entitlement/progress/XP state |
| Payments | Stripe (Checkout + Stripe Connect Express for teacher payouts) |
| Object storage | S3-compatible (DigitalOcean Spaces in the deployed environment), purpose-scoped presigned uploads |
| Transactional email | Google Workspace SMTP relay (`smtp-relay.gmail.com`) via Nodemailer, best-effort/fire-and-forget today |

### Frontend
| Concern | Technology |
|---------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | NextAuth.js (Keycloak provider) |
| GraphQL client | Apollo Client |

### Infrastructure
| Concern | Technology |
|---------|-----------|
| Containers | Docker (per-app Dockerfile) |
| Orchestration | Kubernetes on DigitalOcean (DOKS), Kustomize (`deploy/`) |
| Public entry | Cloudflare Tunnel only — no public LoadBalancer, no ingress controller |
| Registry | DigitalOcean Container Registry, SHA-tagged immutable images |
| CI/CD | GitHub Actions, `workflow_dispatch`-gated deploys (merging to `main` does **not** auto-deploy) |
| Identity | Keycloak, deployed via the official Keycloak Operator |

`docker-compose*.yml`, `docker/`, and `k8s/deployment.yaml` are legacy migration
references only (per `AGENTS.md`) and do not represent the deployed environment.

---

## Repository structure

```
musicEducation/
├── apps/
│   ├── api/                      # GraphQL API + webhooks (Apollo + Express)
│   │   └── src/
│   │       ├── resolvers/        # GraphQL resolvers by domain
│   │       ├── middleware/       # auth.ts (context/RBAC), keycloak.ts (token verification)
│   │       ├── lib/               # storage.ts, mailer.ts, ai.ts, emails.ts, youtube.ts
│   │       └── index.ts           # Express app: /graphql, /webhooks/stripe(-v2),
│   │                               #   /profile/avatar, /health, /health/ready
│   ├── web/                      # Next.js 14 frontend (apps/web/src/app/*)
│   └── worker/                   # Async jobs: Ticketmaster discovery ingestion,
│                                   #   event classification, heartbeat. Booking-email
│                                   #   outbox processing does not live here yet — see
│                                   #   "Known gaps" below.
├── packages/
│   ├── database/                 # Prisma schema + generated client
│   ├── graphql-schema/           # Shared SDL (packages/graphql-schema/src/schema.graphql)
│   └── mcp-server/                # MCP server (separate AI tool surface)
├── deploy/                       # Provider-neutral Kustomize scaffold — see deploy/README.md
├── docs/                         # This file, deployment.md, development.md, etc.
└── docker/, docker-compose*.yml, k8s/   # Legacy references only, not deployed
```

---

## Data model summary (`packages/database/prisma/schema.prisma`)

```
User ──────────────────────────────────────────────────────────
  ├── UserExternalIdentity   (immutable Keycloak `sub` link)
  ├── UserProfile            (account avatar, instruments, styles, timezone)
  ├── TeacherProfile         (bio, instruments, rates, Stripe Connect account —
  │                            no dedicated public teacher image field today)
  └── TeacherApplication     (PENDING/APPROVED/REJECTED review queue)

Learning ──────────────────────────────────────────────────────
  Course → CourseSection → Lesson → Quiz → QuizQuestion
  Enrollment → LessonProgress
  Assessment → AssessmentQuestion → AssessmentAnswer

Booking ───────────────────────────────────────────────────────
  Booking (student ↔ teacher, Stripe payment)
  TeacherAvailability

Events ────────────────────────────────────────────────────────
  Event (teacher-published, capacity-managed)
  EventBooking → Payment
  ExternalEventProjection (Ticketmaster ingestion output)

Social / gamification ─────────────────────────────────────────
  FeedPost → FeedLike, FeedComment
  Review, Message, Notification
  GamificationProfile (XP, level)
```

Two unused legacy columns remain from an earlier design and are not read or written
by any current adapter code: `Course.moodleCourseId`, `EventBooking.pretixOrderCode`.
They can be dropped in a dedicated migration when convenient; leave them alone
otherwise.

---

## Authentication flow

```
Browser → Next.js → NextAuth.js → Keycloak (OIDC)
                                      ↓
                              id_token + access_token
                                      ↓
                         Apollo Client → GraphQL API (Authorization: Bearer …)
                                      ↓
                    apps/api/src/middleware/keycloak.ts (verify RS256, JWKS by kid)
                                      ↓
                    apps/api/src/middleware/auth.ts → GraphQL context.user
                                      ↓
                    UserExternalIdentity maps sub → platform User (role, id)
```

Keycloak is the sole identity authority; the application database owns profiles,
roles, marketplace, bookings, courses, entitlements, and progress.

---

## AI integration

`apps/api/src/lib/ai.ts` and `apps/worker/src/lib/ai.ts` wrap a single OpenAI-wire-
compatible client pointed at DeepSeek (preferred) or OpenAI (fallback). Configured
only via `DEEPSEEK_API_KEY`/`DEEPSEEK_API_URL` or `OPENAI_API_KEY`. Used for advisory
text only — assessment feedback, event classification — never for payment,
entitlement, progress, or XP state, which stay deterministic and auditable.

`packages/mcp-server` is a separate MCP tool surface, independent of the resolver-
level AI helper above.

---

## Payments

Stripe only (Checkout for course/booking/event purchases; Stripe Connect Express for
teacher payouts). Webhooks: `POST /webhooks/stripe` and `POST /webhooks/stripe-v2`
(the v2 listener handles Connect account-requirements events). Payment state is a
state machine; the signed webhook — never the browser redirect — confirms payment.
Stripe test mode only in development.

---

## Local development

See `docs/development.md` for the authoritative, current command set (`npm ci`,
`npm run db:generate`, `npm run dev`, Playwright e2e, Kustomize render checks). The
legacy Compose stack (`docker compose up -d`) remains available as a migration
reference only and is not the target architecture.

---

## Deployment (Kubernetes)

See `deploy/README.md` for the Kustomize layout and `docs/deployment.md` for the
GitHub Actions-driven deploy path. In short: CI builds and pushes SHA-tagged images,
syncs the `application-integrations` Secret from GitHub environment secrets, and runs
`kubectl apply` against DOKS — triggered manually via `workflow_dispatch`, not on
every merge to `main`. Claude Code / agents do not run `kubectl apply`, `doctl`, or
any cluster/cloud write directly; read-only `kubectl get/logs/describe` is fine when
explicitly permitted.

---

## Known gaps (as of this writing — verify against current source before relying on this)

- No dedicated public teacher profile image: `TeacherProfile` has no image field and
  `storage.ts` has no upload purpose for one; the general `UserProfile.avatarUrl` is
  the only image field that exists today.
- Booking confirmation email is synchronous and best-effort (`apps/api/src/lib/
  mailer.ts`) — no outbox table, retry, or dead-letter; a temporarily unreachable SMTP
  relay silently drops the notification rather than queuing it.
- `apps/worker` does not yet process mail — CLAUDE.md notes async work is moving there
  but the migration isn't complete for email.

## Scalability notes

- API and worker are stateless and can scale horizontally.
- Web is stateless SSR.
- PostgreSQL: managed, single instance for the current stage.
- Object storage: S3-compatible, currently DigitalOcean Spaces.
