# Integration Architecture

> Rewritten from a direct read of `apps/api/src`, `apps/worker/src`, and
> `packages/database/prisma/schema.prisma`. The previous version of this document
> described a hub-and-spoke model with Moodle, LibreBooking, and pretix as separate
> backend systems behind a Caddy gateway, each with its own database, OIDC client, and
> webhook adapter. **None of that exists in the current implementation.** It was an
> early reference approach; the product is built natively instead (see `AGENTS.md`,
> `CLAUDE.md`). The only integration layer that exists today is a set of direct,
> server-side SDK/API calls from `apps/api` and `apps/worker` to external providers —
> there is no generic adapter directory, no per-system database, and no per-system
> OIDC client.

## Overview

MyMusic.Coach (`apps/api` + `apps/web` + `apps/worker`) is the single application.
External systems are narrow, server-side integrations behind small dedicated modules,
never a second source of truth for platform state:

| System | Role | Where it's wired in |
|--------|------|----------------------|
| **Keycloak** | Sole identity provider (OIDC) | `apps/api/src/middleware/keycloak.ts` (RS256 verification via JWKS), `apps/web` NextAuth Keycloak provider |
| **Stripe** | Checkout payments + Stripe Connect Express payouts | `apps/api/src/resolvers/payments.ts`, webhooks below |
| **S3-compatible object storage** | Teacher application files, course slides (presigned uploads) | `apps/api/src/lib/storage.ts` |
| **Google Workspace SMTP relay** | Transactional email | `apps/api/src/lib/mailer.ts` |
| **DeepSeek / OpenAI** | Advisory-only AI text (assessment feedback, event classification) | `apps/api/src/lib/ai.ts`, `apps/worker/src/lib/ai.ts` |
| **Ticketmaster** | External event discovery ingestion | `apps/worker/src/discovery/ticketmaster.ts`, `apps/worker/src/jobs/ticketmaster-ingest.ts` |
| **Classictic** | Planned external affiliate event discovery — not yet implemented | — |
| **Europeana** | Planned cultural-heritage content for learning — not yet implemented | — |

## Identity: Keycloak

- `apps/web` authenticates via NextAuth's Keycloak provider (OIDC + PKCE, server-side
  session).
- `apps/api/src/middleware/keycloak.ts` verifies the bearer token against Keycloak's
  JWKS (RS256, key selected by `kid`).
- `apps/api/src/middleware/auth.ts` resolves the verified token into GraphQL
  `context.user`.
- `UserExternalIdentity` maps the immutable Keycloak `sub` to the platform `User`; the
  application database — not Keycloak — owns profiles, roles, marketplace, bookings,
  courses, entitlements, and progress.
- There is a single auth path. No parallel custom-JWT login/register/refresh system
  exists in current source.

## Payments: Stripe

- Checkout: course purchases, lesson bookings, event bookings.
- Payouts: Stripe Connect Express accounts for teachers (`TeacherProfile
  .stripeAccountId` / `.stripePayoutsEnabled`).
- Two webhook endpoints in `apps/api/src/index.ts`, each gated on its own env vars so
  an unconfigured secret simply leaves that endpoint unregistered rather than
  crashing the server:
  - `POST /webhooks/stripe` (`STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`) — the
    main payment/checkout event stream.
  - `POST /webhooks/stripe-v2` (`STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET_V2`) —
    Stripe's newer "thin event" stream for Connect account-requirements/capability
    changes only.
- Both verify the `stripe-signature` header against raw request bytes
  (`express.raw`) before parsing. Payment state is a state machine driven by these
  signed webhooks; the browser redirect after checkout never confirms payment on its
  own. Stripe test mode only in development.

## Object storage: S3-compatible (DigitalOcean Spaces in the deployed environment)

`apps/api/src/lib/storage.ts`:

- `storageConfigured()` — `true` only when `S3_ENDPOINT`, `S3_BUCKET`,
  `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY` are all set; exposed as the
  `Query.storageConfigured` GraphQL field so the frontend can hide upload UI when
  storage isn't configured rather than offering a control that will fail.
- `createUploadTarget(purpose, ownerId, filename, contentType)` mints a short-lived
  presigned PUT URL, namespaced by purpose and the uploading user's own id so two
  callers can never collide. Current purposes: `TEACHER_APPLICATION_CV`,
  `TEACHER_APPLICATION_AUDIO`, `TEACHER_APPLICATION_DOCUMENT`, `COURSE_SLIDE`. There
  is **no purpose for a public teacher profile image** yet.
- `isOwnedUploadUrl(...)` re-validates, server-side, that a `fileUrl` a client submits
  back (e.g. as `cvUrl` on a teacher application) actually came from a URL this
  service minted for that purpose and that user — closing off arbitrary external URLs
  being persisted into fields an admin later opens.

Separately, `POST /profile/avatar` (`apps/api/src/index.ts`) is its own, independent
path for the **general account avatar**: it accepts a small (<500 KB) inline
`data:image/{jpeg,png,webp};base64,...` payload and writes straight to
`UserProfile.avatarUrl` — it does not go through `storage.ts`/S3 at all. Any future
public teacher image should go through the S3 presigned-upload path above (a new
`UploadPurpose`, e.g. `TEACHER_PROFILE_IMAGE`) rather than this inline-base64 route,
since it needs to be publicly servable at scale, not embedded per-request.

## Transactional email: Google Workspace SMTP relay

`apps/api/src/lib/mailer.ts` sends via `smtp-relay.gmail.com:587` (STARTTLS) using
Nodemailer, configured through `SMTP_HOST/PORT/USER/PASSWORD/FROM/FROM_NAME`.
`mailConfigured()` gates whether sending is attempted at all. `sendMail()` is
currently **synchronous and best-effort**: on failure it logs a warning and returns
`false`, and callers must not let that block the mutation that triggered it (a
booking, a purchase). There is no outbox table, retry, or dead-letter queue yet —
a transient SMTP failure silently drops the notification rather than queuing it for
retry. This is a known gap to close (see the Phase 1 booking-email work).

This is separate from Keycloak's own email verification/reset flows, which are
configured on the realm itself (`deploy/overlays/dev/keycloak-realm/realm-import.yaml`),
not through this mailer.

## AI: DeepSeek / OpenAI

`apps/api/src/lib/ai.ts` and `apps/worker/src/lib/ai.ts` each wrap a single
OpenAI-wire-compatible client: DeepSeek preferred (`DEEPSEEK_API_KEY`/
`DEEPSEEK_API_URL`), OpenAI as fallback (`OPENAI_API_KEY`). `aiConfigured()` reports
availability; `aiChat()` returns `null` on failure or when unconfigured, and every
caller must have a real fallback — this only ever produces narrative/classification
text (assessment feedback, event categorization). Per `CLAUDE.md`, AI never mutates
payment, entitlement, progress, or XP state; that stays deterministic and auditable.

`packages/mcp-server` is a separate MCP tool surface for AI-assisted development
tooling, independent of the resolver-level helpers above.

## External event discovery: Ticketmaster (worker)

`apps/worker/src/discovery/ticketmaster.ts` calls the Ticketmaster Discovery API
(`TICKETMASTER_API_KEY`); `apps/worker/src/jobs/ticketmaster-ingest.ts` runs the sync
and upserts into `ExternalEventProjection`; `apps/worker/src/jobs/
event-classification.ts` uses the AI helper above to tag ingested events. Scheduling
is `apps/worker/src/scheduler.ts` (in-process `node-cron` inside the worker, not a
Kubernetes CronJob). Classictic (affiliate events) and Europeana (cultural-heritage
content) are named in `CLAUDE.md` as planned providers for this same discovery layer
but have no code yet — implementing them should follow this module's shape
(provider-neutral GraphQL surface, `unique(provider, externalId)` upsert, no
credentials or provider payloads copied into other systems as owned inventory).

## Webhooks summary

| Endpoint | Source | Verification |
|----------|--------|--------------|
| `POST /webhooks/stripe` | Stripe | `stripe-signature` header, raw body |
| `POST /webhooks/stripe-v2` | Stripe (Connect thin events) | `stripe-signature` header, raw body, separate signing secret |

No LibreBooking or pretix webhook endpoints exist; bookings and event tickets are
native platform state, not synced from an external system.

## Security boundaries

- Credentials for every integration above live in the `application-integrations`
  Kubernetes Secret, synchronized from GitHub environment secrets by the deploy
  workflow — never committed, never logged, never returned in a GraphQL response or
  health endpoint. See `deploy/README.md` and `.github/workflows/deploy-application.yml`.
- CORS is an explicit origin (`CORS_ORIGIN`, defaulting to the internal web service
  address), not a wildcard.
- Every external callback (Stripe webhooks today) must remain idempotent and treat
  the payload as untrusted input, per `AGENTS.md`.
