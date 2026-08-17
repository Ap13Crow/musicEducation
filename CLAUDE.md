# Claude Code guidance — MyMusic.Coach

Read `AGENTS.md` before making changes. Commands live in `docs/development.md`; the
Kubernetes layout lives under `deploy/` (see `deploy/README.md`).

## What this project is right now

MyMusic.Coach is a TypeScript monorepo delivering three product pillars in one app:

1. **Booking** — teacher discovery, availability, exact teacher-defined slots, Stripe payment.
2. **Learning** — native course authoring, publishing, purchase, viewer, progress, assessment.
3. **Events** — teacher-published events plus normalized external discovery (Ticketmaster now,
   Classictic once the contract is signed) and Europeana cultural-heritage content for learning.

All three are **modules of the same application**, not separate platforms. There is no Moodle,
LibreBooking, or pretix in the target system — those were an early reference approach and are being
removed. Do not reintroduce them.

### Workloads

- `apps/web` — Next.js UI (served at `dev.mymusic.coach`).
- `apps/api` — GraphQL + webhooks (Stripe at `/api/webhooks/stripe`).
- `apps/worker` — async jobs: webhook processing, email, external-event ingestion, retries.
  (Being introduced; async work currently runs in-process in the API and is moving here.)

Shared code: `packages/database` (Prisma, `db push` workflow — no migrations folder),
`packages/graphql-schema`, `packages/mcp-server`.

### Platform reality

- Deployed on **DigitalOcean Kubernetes (DOKS)**, reached through a **Cloudflare Tunnel**:
  `dev.mymusic.coach` → web, `auth-dev.mymusic.coach` → Keycloak. No public LoadBalancer/ingress.
- **Keycloak** is the identity authority (OIDC, PKCE, server-side sessions). The application
  database owns profiles, roles, marketplace, bookings, courses, entitlements, progress.
  `UserExternalIdentity` maps the immutable Keycloak `sub` to the platform user — keep it.
- **Stripe test mode only** in development. Payment state is a state machine; the signed webhook —
  never the browser redirect — confirms payment.
- **Google Calendar / Meet integration is intentionally not in scope for now.** The booking agenda
  is owned entirely by the application database. Do not add Google Calendar coupling unless a task
  explicitly reintroduces it.
- External providers (Ticketmaster, Europeana, later Classictic) are **read-only discovery inputs**
  behind server-side adapters. Their credentials live in the `application-integrations` Kubernetes
  Secret, populated by GitHub Actions — never committed.

## Deployment model (how your changes reach the cluster)

You author code and manifests and open a PR. **CI owns cluster mutation**, not Claude Code:
GitHub Actions builds a SHA-tagged image, pushes it, syncs secrets from GitHub repo secrets, and
runs `kubectl apply` against DOKS using `DIGITALOCEAN_ACCESS_TOKEN`. Do not run `kubectl apply`,
`doctl`, credential rotation, or any cluster/cloud write yourself. Read-only `kubectl get/logs/
describe` in the dev namespace is fine when explicitly permitted.

## Guardrails

- Never commit `.env` files, secrets, service-account JSON, tokens, or Kubernetes Secret manifests.
- Keep `.env.example` to safe placeholders. No live keys anywhere, ever.
- Do not add mutable `latest` image tags to `deploy/` manifests; use commit SHA tags.
- Treat `docker-compose*.yml`, `docker/`, and `k8s/deployment.yaml` as legacy references only.
- Keep credentials and provider SDK calls server-side. Store timestamps in UTC, keep IANA timezones.
- Make webhook and job handlers idempotent; external callbacks and provider data are untrusted input.
- Keep payment, entitlement, progress, and XP state deterministic and auditable. AI never mutates them.
- Change the Prisma schema only when the task says so; after schema edits, run `db push` (dev).
- One vertical slice per PR. Add tests with behavior changes; prefer contract tests at boundaries
  and conflict tests for booking/payment. Preserve unrelated changes; keep commits focused.

## Required workflow

1. Read this file and any nearer `AGENTS.md`.
2. `git status` before editing; stage only task-related files.
3. Use `docs/development.md` for install, generate, lint, test, build, and manifest rendering.
4. Run the narrowest relevant checks while working, then repository checks before handoff.
5. Review the staged diff for secret material before committing.
