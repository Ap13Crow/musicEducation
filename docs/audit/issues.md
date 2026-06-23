# Phase 0 — Initial GitHub issue set

> The platform remediation is sequenced as the issues below, in priority order. Each
> entry is written so it can be opened verbatim as a GitHub issue. Evidence labelled
> **(confirmed)** was verified by static inspection at commit
> `955b921787cff8da4403bb2f0c6334548fb17fff`; evidence labelled **(unconfirmed)** is a
> hypothesis that must be reproduced (with recorded evidence) before any code changes.
>
> Each issue must, before it is closed, contain: observed evidence, affected
> files/services, risk & priority, reproduction steps, proposed design, security
> considerations, test plan, acceptance criteria, rollback plan, and dependencies.
> Each PR must address one coherent issue, ship tests + docs + migration/rollback
> notes, and avoid unrelated formatting churn.

---

## #1 — Baseline diagnostics and reproducible environment
- **Priority:** P0 · **Risk:** low (docs/tooling only)
- **Evidence:** This document set — `docs/audit/baseline.md`, `scripts/diagnose.sh`.
- **Affected:** `docs/audit/*`, `scripts/diagnose.sh`.
- **Design:** Capture build/lint/test/compose state; add machine-readable health probe.
- **Acceptance:** Baseline recorded; every service has a status; confirmed vs
  unconfirmed defects separated; `scripts/diagnose.sh` returns non-zero on unhealthy
  required dependency. **(this issue — delivered in Phase 0)**
- **Dependencies:** none.

## #2 — Keycloak/NextAuth/GraphQL token-path investigation
- **Priority:** P0 · **Risk:** medium
- **Evidence (confirmed):** Dual auth — `apps/api/src/resolvers/auth.ts` mints custom
  HS256 access/refresh JWTs; `apps/api/src/middleware/auth.ts` (`resolveRequestUser`)
  accepts local HS256 **or** Keycloak RS256; `apps/api/src/middleware/keycloak.ts`
  verifies Keycloak tokens. Frontend uses NextAuth/Keycloak.
- **Affected:** `apps/web` NextAuth + Apollo Client link; `apps/api/src/middleware/*`.
- **Design:** Document the exact token actually forwarded by Apollo Client and which
  verifier accepts it; produce a decision record to make Keycloak the sole authority.
- **Test plan:** Trace a real login; assert which `Authorization` header reaches the API.
- **Acceptance:** Written analysis of current token flow + target flow agreed.
- **Dependencies:** #1.

## #3 — Keycloak JWT verification and local-user linking
- **Priority:** P0 · **Risk:** high (security)
- **Evidence (confirmed):** `apps/api/src/middleware/keycloak.ts:71-84` verifies only
  `iss` + `RS256`; **no `aud`/`azp` validation**, **no `clockTolerance`**.
- **Affected:** `apps/api/src/middleware/keycloak.ts`.
- **Design:** Validate `aud`/authorized party against expected client, add bounded
  `clockTolerance`, keep JWKS-by-`kid`; map realm/client roles explicitly; continue to
  link by immutable `sub` via `UserExternalIdentity`. Consider `jose` per spec.
- **Security:** Reject malformed/expired/wrong-issuer/wrong-audience tokens; never
  trust frontend-supplied roles; define duplicate-email conflict handling.
- **Test plan:** Unit tests for each rejection case + a valid-token accept case.
- **Acceptance:** Invalid token variants rejected; roles enforced server-side.
- **Dependencies:** #2.

## #4 — Remove/deprecate custom auth ambiguity
- **Priority:** P1 · **Risk:** medium
- **Evidence (confirmed):** `apps/api/src/resolvers/auth.ts` — `requestPasswordReset`
  (L62), `resetPassword` (L67), `verifyEmail` (L72) return `true` while doing no real
  work; `register`/`login`/`refreshToken` mint a parallel session system.
- **Design:** Deprecate/remove custom `login`/`register`/`refreshToken`/`resetPassword`
  /email-verification once Keycloak owns these flows, or implement via Keycloak. Mark
  deprecated in SDL; prevent dual-session ambiguity.
- **Acceptance:** No custom token required for normal frontend operation; placeholders
  no longer return false success.
- **Dependencies:** #2, #3.

## #5 — CORS and security-header baseline
- **Priority:** P0 · **Risk:** high (security)
- **Evidence (confirmed):** `apps/api/src/index.ts:83`
  `cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true })`.
- **Design:** Explicit origin allowlist; verify preflight; add `X-Content-Type-Options`,
  `Referrer-Policy`, HSTS at TLS-terminating layer, CSP (report-only → enforce, sources
  derived from real traces), secure cookie flags.
- **Test plan:** Preflight + disallowed-origin tests; header assertions per hostname.
- **Acceptance:** Wildcard+credentials removed; headers verified on public hostnames.
- **Dependencies:** #1.

## #6 — GraphQL validation, authorization tests, complexity limits
- **Priority:** P1 · **Risk:** medium
- **Evidence (confirmed):** Resolver args typed `any` throughout
  `apps/api/src/resolvers/*`; no depth/complexity/alias limits observed; pagination
  limits unverified.
- **Design:** GraphQL Code Generator types; Zod input + env validation; standardized
  error codes (`BAD_USER_INPUT`/`UNAUTHENTICATED`/`FORBIDDEN`/`NOT_FOUND`/`CONFLICT`/
  `INTERNAL_SERVER_ERROR`); depth/alias/complexity limits; body-size + rate limits;
  restrict introspection in prod.
- **Test plan:** Authorization tests per protected resolver group; invalid-input;
  cross-user isolation; integration suite on disposable Postgres.
- **Acceptance:** Schema validation passes; no unbounded public query; errors stable.
- **Dependencies:** #3.

## #7 — GraphQL N+1 / DataLoader fixes
- **Priority:** P1 · **Risk:** medium
- **Evidence (unconfirmed):** Suspected per-row Prisma queries in relation resolvers
  (teacher, category, sections, users, enrollments). Must be measured.
- **Design:** Per-request DataLoaders and/or selective `include`; query-count test.
- **Acceptance:** Representative list queries do not issue per-row DB queries.
- **Dependencies:** #6.

## #8 — Frontend runtime, auth, and environment repair
- **Priority:** P1 · **Risk:** medium
- **Evidence (unconfirmed):** `NEXT_PUBLIC_*` build-time inlining and placeholder admin
  UI (Moodle iframe) suspected — needs a per-route audit. Stored memory: web pages are
  `'use client'` gated by `NEXT_PUBLIC_ENABLE_LIVE_API`.
- **Design:** Fix console/hydration/redirect issues; centralized env validation;
  replace misleading placeholder UI with secure deep links; ensure no secret in bundle.
- **Acceptance:** No severe console errors on critical journeys; no secret in client.
- **Dependencies:** #2, #5.

## #9 — Frontend accessibility / E2E tests
- **Priority:** P2 · **Risk:** low
- **Evidence (confirmed):** No Playwright/axe/Lighthouse config present.
- **Design:** Playwright smoke tests for primary routes; `@axe-core/playwright`;
  Lighthouse CI budgets.
- **Acceptance:** WCAG-oriented checks pass on principal pages; critical paths have
  loading/success/failure states.
- **Dependencies:** #8.

## #10 — Moodle SSO and course-sync repair
- **Priority:** P2 · **Risk:** medium
- **Evidence:** Adapter/sync under `apps/api/src/integrations/{adapters,sync}`; OIDC
  provisioned headlessly (stored memory). Behaviour unconfirmed.
- **Design:** Verify OIDC claim mapping, REST scopes, pagination, idempotent
  provisioning/enrolment; admin-visible sync result (created/updated/skipped/failed +
  correlation ID); never expose Moodle token.
- **Test plan:** Adapter contract tests with mocked HTTP + optional local integration.
- **Acceptance:** SSO works for test user; sync repeatable without duplicates.
- **Dependencies:** #3.

## #11 — LibreBooking SSO/session/booking repair
- **Priority:** P2 · **Risk:** medium
- **Evidence (unconfirmed):** Session token may expire without re-auth (suspected #6).
- **Design:** Lazy/safe auth with one-time re-auth on 401; timeouts + bounded retry;
  UTC-internal timezone; double-booking prevention + idempotency; authenticated
  webhooks with replay protection; never log credentials/session token.
- **Acceptance:** Availability/create/cancel/reschedule tested; expired session
  recovers; duplicate webhook does not double-book.
- **Dependencies:** #3.

## #12 — Pretix SSO/event/order/webhook repair
- **Priority:** P2 · **Risk:** medium
- **Evidence (confirmed partial):** `apps/api/src/integrations/webhooks/pretix-webhook.ts`
  verifies HMAC (`createHmac`/`timingSafeEqual`); replay/idempotency to confirm.
- **Design:** Least-privilege token; pagination; stable local↔Pretix IDs; idempotent
  provisioning; decimal-safe money; verified webhooks + replay protection; order state
  machine; authz on admin/check-in mutations.
- **Acceptance:** Provisioning repeatable; test webhook updates state once; refund state
  synced; unauthorized check-in blocked.
- **Dependencies:** #3.

## #13 — Durable webhook and scheduler processing
- **Priority:** P1 · **Risk:** medium
- **Evidence (confirmed):** `apps/api/src/integrations/scheduler.ts` uses in-process
  `node-cron`; loses/duplicates work on restart or across replicas.
- **Design:** Authenticate before parsing; preserve raw body for signature checks;
  schema-validate; reject stale/replayed; idempotency record by provider event ID;
  ack fast + process via durable Redis-backed queue with backoff + DLQ; admin reprocess;
  metrics. Replace `setInterval`/in-process cron with durable/leader-elected jobs.
- **Acceptance:** API restart loses no accepted work; duplicate events harmless; failed
  jobs observable/reprocessable.
- **Dependencies:** #5.

## #14 — CI pipeline
- **Priority:** P0 · **Risk:** low
- **Evidence (confirmed):** Lint broken (no ESLint flat config in `apps/api`); 3/4 API
  test suites fail to load without the built database package; no observed end-to-end
  CI gate.
- **Design:** PR workflow — install w/ lockfile, format/lint, type-check, unit tests,
  schema validation/codegen check, integration tests with Postgres/Redis services,
  web+api+image builds, dependency/secret/container scans, Playwright smoke. Fix
  `apps/api` ESLint flat config so lint runs.
- **Acceptance:** Fresh checkout passes CI.
- **Dependencies:** #6 (tests), #5.

## #15 — Staging deployment and release workflow
- **Priority:** P1 · **Risk:** medium
- **Evidence:** `docker-compose.prod.yml` + Cloudflare tunnel + Caddy; realm patched by
  `scripts/patch-realm.py` (stored memory).
- **Design:** Build SHA-tagged immutable images + SBOM; deploy staging; `prisma migrate
  deploy`; smoke/E2E; manual approval gate; prod deploy + post-deploy checks; tested
  rollback; expand/migrate/contract DB strategy.
- **Acceptance:** Staging reproducible from docs; images traceable to commit+SBOM;
  rollback tested.
- **Dependencies:** #14.

## #16 — Metrics, alerts, backups, restore, and production runbook
- **Priority:** P1 · **Risk:** low
- **Evidence (confirmed):** Only liveness `GET /health` at `apps/api/src/index.ts:104`;
  no `/health/ready`. `docs/production-runbook.md` exists (stored memory) and should be
  extended.
- **Design:** `/health/live` + `/health/ready`; compose healthchecks; structured JSON
  logs with redaction; Prometheus/OpenTelemetry + dashboards; uptime checks per
  hostname; actionable alerts; backup schedules + restore drills; extend runbook.
- **Acceptance:** Operator can identify the failing service without shelling into each
  container; alerts fire in a controlled test; a backup restores into non-prod.
- **Dependencies:** #15.

---

### Suggested label scheme
`area:auth`, `area:graphql`, `area:frontend`, `area:moodle`, `area:librebooking`,
`area:pretix`, `area:webhooks`, `area:ci`, `area:ops`, `security`, `P0`/`P1`/`P2`.
