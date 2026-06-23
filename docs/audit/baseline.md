# Phase 0 — Baseline Audit & Reproduction

> Purpose: establish a reproducible, evidence-based baseline of the My Music Coach
> platform **before** any authentication, integration, or behaviour changes are made.
> This document records exactly what was executed and observed. Where a claim could
> not be runtime-confirmed in the audit environment, it is explicitly labelled as an
> **unconfirmed hypothesis** and must be reproduced before code is changed.

## 1. Metadata

| Field | Value |
| --- | --- |
| Commit SHA | `955b921787cff8da4403bb2f0c6334548fb17fff` |
| Commit date | 2026-06-23 |
| Branch | `copilot/make-music-coach-operational` |
| Audit date | 2026-06-23 |
| Audit environment | CI sandbox (Ubuntu, Node v22.x, npm 10.x, Docker 28.x) |
| Node engine required | `>=20.0.0` (`package.json#engines`) |

### Environment limitations (important — read before trusting results)

The audit ran inside a **network-restricted sandbox**. The following could **not** be
reached and were therefore **not** runtime-tested. Their status below is recorded as
*unverified*, not *healthy* or *failed*:

- **Production hostnames are not resolvable** from the sandbox:
  `curl https://api.mymusic.coach/health` → `curl: (6) Could not resolve host`.
  The same applies to `app.`, `auth.`, `learn.`, `booking.`, and `tickets.`
  `mymusic.coach`. No production probing, header inspection, or SSO flow testing was
  possible. These probes must be re-run from an environment with egress to the
  production/staging gateway (see `scripts/diagnose.sh`).
- **`binaries.prisma.sh` is blocked** (TLS self-signed certificate in the sandbox
  proxy chain). `prisma generate` cannot download its query engine, which cascades
  into several build/test failures (see §3). These failures are **environment
  artefacts**, not necessarily product defects, and are called out as such.

## 2. Commands executed

All commands run from the repository root unless noted.

| Command | Result | Notes |
| --- | --- | --- |
| `npm ci` | ✅ success | 805 packages installed. `npm audit`: 25 vulns (24 moderate, 1 high) — see §5. |
| `npm run db:generate` | ❌ failed | Network: cannot fetch Prisma engine from `binaries.prisma.sh` (self-signed cert). Environment artefact. |
| `npm run lint` | ❌ failed | **Genuine repo defect** — `apps/api` has no `eslint.config.*` (ESLint 9). See §4.1. |
| `npm run test` | ❌ failed (partial) | 22 tests **passed**; 3 of 4 suites failed to load because `@my-music-coach/database` is not built (downstream of `db:generate`). See §3. |
| `npm run build` | ❌ failed | `@my-music-coach/database` build fails: `@prisma/client` has no exported member (client not generated). Downstream of `db:generate`. `web` and `mcp-server` compiled. |
| `docker compose config` | ✅ valid (exit 0) | 16 services resolved (see §6). |
| `docker compose up -d` / `ps` | ⏸️ not run | Not executed in sandbox: pulling/booting 16 service images (Keycloak, Moodle, Pretix, LibreBooking, MinIO, Postgres×4, Redis×2) is not feasible/safe here. Must be run in staging. |
| Production `curl` probes | ⚠️ unverified | Hosts unresolvable from sandbox (see §1). |

> Reproduction note: `db:generate`, `build`, and most `test` failures are expected to
> **resolve once `prisma generate` can run** (i.e. in an environment with network
> access to `binaries.prisma.sh` or with a pre-cached engine). They should be
> re-verified there before being treated as product defects.

## 3. Build & test detail

### Test output (executed)

```
PASS  src/__tests__/resolvers.test.ts
FAIL  src/__tests__/keycloak.test.ts  — Cannot find module '@my-music-coach/database'
FAIL  src/__tests__/admin.test.ts     — Cannot find module '@my-music-coach/database'
FAIL  src/__tests__/auth.test.ts      — Cannot find module '@my-music-coach/database'
Tests: 22 passed, 22 total
Test Suites: 3 failed, 1 passed, 4 total
```

The three failing suites do not indicate failing assertions — they **fail to load**
because the `@my-music-coach/database` workspace was never built (its build needs the
generated Prisma client). Once the database package builds, these suites should run.

### Build output (executed)

```
@my-music-coach/database#build:
  src/index.ts(39,3): error TS2305: Module '"@prisma/client"'
    has no exported member 'EventBookingStatus'.
@my-music-coach/web#build:       compiled (Next.js 14.2.35)
@my-music-coach/mcp-server#build: compiled
```

`EventBookingStatus` is a Prisma-generated enum; its absence is a direct symptom of
the un-generated client, not a schema error.

## 4. Confirmed defects (static inspection)

These were confirmed by reading committed source at the baseline SHA. They are real
and do not depend on the runtime environment. They still require a reproduction step
and a regression test **with** each fix (see `docs/audit/issues.md`).

### 4.1 Lint is broken — no ESLint flat config (CONFIRMED)
- `apps/api/package.json` → `"lint": "eslint src/"`; root dev-dep is `eslint@^9`.
- ESLint 9 requires `eslint.config.{js,mjs,cjs}`; none exists in `apps/api`.
- Effect: `npm run lint` exits non-zero for the API workspace; lint never gates CI.

### 4.2 CORS allows wildcard origin with credentials (CONFIRMED)
- `apps/api/src/index.ts:83`
  `app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));`
- `origin: '*'` together with `credentials: true` is invalid/insecure for
  cookie/authorization-bearing requests. Needs an explicit allowlist + preflight test.
  Maps to suspected defect #2 and Phase 8.

### 4.3 Placeholder auth mutations return success without doing work (CONFIRMED)
- `apps/api/src/resolvers/auth.ts`:
  - `resetPassword` (L67) → `// TODO: validate token… return true`.
  - `verifyEmail` (L72) → `// TODO: validate token… return true`.
  - `requestPasswordReset` (L62) → looks up user, always returns `true`.
- These return `true` (apparent success) while performing no real operation. Maps to
  suspected defect #3. Should be implemented via Keycloak or removed/deprecated.

### 4.4 Keycloak JWT verification does not validate audience / azp (CONFIRMED)
- `apps/api/src/middleware/keycloak.ts:71-84` calls `jwt.verify(token, getKey,
  { algorithms: ['RS256'], issuer: KEYCLOAK_ISSUER }, …)`.
- Only `iss` and `RS256` are enforced. **No `aud`/`azp` validation** and **no
  `clockTolerance`**. Maps to suspected defect #1 (audience verification, clock skew).
- Positive findings (already correct): signature is verified against remote JWKS
  (`jwks-rsa`), key selected by `kid`, `RS256` pinned, and identity is linked by
  immutable Keycloak `sub` via `UserExternalIdentity` (matches stored repo memory).

### 4.5 Dual authentication path exists (CONFIRMED, by design today)
- `apps/api/src/resolvers/auth.ts` issues custom access + refresh JWTs
  (`register`/`login`/`refreshToken`) while `middleware/keycloak.ts` verifies Keycloak
  RS256 tokens. `middleware/auth.ts` (`resolveRequestUser`) accepts **either** a local
  HS256 token or a Keycloak token. Maps to suspected defect #1 — two identity systems
  coexist; Phase 1 should make Keycloak the sole authority.

### 4.6 In-process cron scheduler (CONFIRMED)
- `apps/api/src/integrations/scheduler.ts` uses `node-cron` (`cron.schedule(...)`) for
  Pretix/LibreBooking/Moodle sync. In-process scheduling loses/duplicates work on
  restart or across replicas. Maps to suspected defect for Phase 7 (durable jobs).

### 4.7 Health endpoint is liveness-only (CONFIRMED)
- `apps/api/src/index.ts:104` → `app.get('/health', … { status: 'ok' })`.
- No `/health/ready` dependency readiness check (Phase 10). The advertised
  `GET /health` exists and returns 200 JSON.

## 5. Dependency vulnerabilities (executed)

`npm ci` reported **25 vulnerabilities (24 moderate, 1 high)**. Full triage deferred to
the security-hardening issue (Phase 8). Notable deprecations surfaced during install:
Apollo Server v4 (EOL 2026-01-26), several `uuid@8/9`, legacy `glob`/`rimraf`. Recorded
here as baseline; not changed in Phase 0.

## 6. Service inventory (`docker compose config`)

16 services declared and the compose file is structurally valid (exit 0):

```
postgres-main, redis-main, minio,
keycloak,
api, web, mcp-server, gateway,
moodle-db, moodle,
librebooking-db, librebooking,
pretix-db, pretix-redis, pretix
```

Runtime health of these services was **not** verified in the sandbox. Use
`scripts/diagnose.sh` from an environment with access to the running stack.

## 7. Suspected defects — verification status

| # | Suspected defect (problem statement) | Status at baseline |
| --- | --- | --- |
| 1 | Split auth (NextAuth/Keycloak vs custom JWT); audience/clock not checked | **Confirmed (static)** — §4.4, §4.5 |
| 2 | CORS `origin:'*'` with `credentials:true` | **Confirmed (static)** — §4.2 |
| 3 | Password reset / email verification placeholders | **Confirmed (static)** — §4.3 |
| 4 | GraphQL N+1 Prisma queries | **Unconfirmed** — needs query-count measurement against a DB |
| 5 | Webhook auth/replay/idempotency gaps | **Partially confirmed** — Stripe & Pretix verify signatures; replay/idempotency/audit not yet confirmed. Needs review per handler |
| 6 | LibreBooking session expiry without re-auth | **Unconfirmed** — needs adapter review/runtime |
| 7 | `NEXT_PUBLIC_*` build-time inlining / secret exposure | **Unconfirmed** — needs built image inspection |
| 8 | Placeholder admin integration UI (Moodle iframe) | **Unconfirmed** — needs frontend route audit |
| 9 | Limited automated coverage / no full CI | **Confirmed** — only 4 API test suites; lint broken; no observed end-to-end CI gate |
| 10 | Observability / rate limit / depth-complexity / CSP gaps | **Unconfirmed** — needs review against running services |

## 8. Acceptance check for Phase 0

- [x] Every declared service has a recorded status (running-health deferred to staging via `scripts/diagnose.sh`).
- [x] Every **confirmed** defect has reproducible evidence (file + line) and is separated from unconfirmed hypotheses.
- [x] Current build/lint/test state is known and recorded.
- [x] No production data was accessed or modified (production was unreachable).
- [x] A machine-readable service check script exists (`scripts/diagnose.sh`).
- [x] Initial prioritised issue set documented (`docs/audit/issues.md`).

## 9. Next steps

Proceed **issue by issue** per `docs/audit/issues.md`, in priority order, starting
with the Keycloak/NextAuth/GraphQL token-path investigation (issue #2). Do **not**
begin auth/integration code changes until each target defect is reproduced in an
environment where `prisma generate` and the Docker stack can run.
