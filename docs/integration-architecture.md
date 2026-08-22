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
| **Google Workspace SMTP relay** | Transactional email | `apps/api/src/lib/mailer.ts`, `apps/worker/src/lib/mailer.ts` + `mail-dispatch.ts` |
| **DeepSeek / OpenAI** | Advisory-only AI text (assessment feedback, event classification) | `apps/api/src/lib/ai.ts`, `apps/worker/src/lib/ai.ts` |
| **Ticketmaster** | External event discovery ingestion | `apps/worker/src/discovery/ticketmaster.ts`, `apps/worker/src/jobs/ticketmaster-ingest.ts` |
| **Classictic** | External affiliate event discovery (official "event list widget") | `apps/worker/src/discovery/classictic.ts`, `apps/worker/src/jobs/classictic-ingest.ts` |
| **Europeana** | Planned cultural-heritage content for learning — not yet implemented | — |
| **Calendar subscription feed (ICS)** | Outbound-only — Apple Calendar/Google Calendar/Outlook "subscribe from URL" | `apps/api/src/lib/calendarFeed.ts`, `GET /calendar/feed/:token` |
| **Google/Microsoft Calendar sync** | Schema/adapter contract only, deliberately not implemented — see below | `apps/api/src/lib/externalCalendar.ts` |

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
public teacher image goes through the S3 presigned-upload path above — the
`TEACHER_PROFILE_IMAGE` `UploadPurpose` (`storage.ts`), landing in
`TeacherProfile.publicImageUrl`, distinct from the general account avatar — since it
needs to be publicly servable at scale, not embedded per-request.

## Transactional email: Google Workspace SMTP relay

Both `apps/api/src/lib/mailer.ts` and `apps/worker/src/lib/mailer.ts` send via
`smtp-relay.gmail.com:587` (STARTTLS) using Nodemailer, configured through the same
`SMTP_HOST/PORT/USER/PASSWORD/FROM/FROM_NAME` (synced into each workload's env from
the `application-integrations` Secret independently — see `deploy/workloads/
application/api.yaml` and `worker.yaml`). `mailConfigured()` gates whether sending is
attempted at all in each.

Two distinct delivery paths exist, not one:

- **Durable outbox (booking confirm/cancel)** — `apps/api/src/lib/mailOutbox.ts`'s
  `enqueueMail` writes a `MailOutboxMessage` row inside the same transaction as the
  booking state change (see `notifyBookingConfirmed`/`notifyBookingCancelled` in
  `apps/api/src/resolvers/bookings.ts`); `apps/worker/src/jobs/mail-dispatch.ts` polls
  due `PENDING`/`FAILED` rows every minute and delivers them, with exponential
  backoff and a `DEAD_LETTER` status once `maxAttempts` is exhausted (never silently
  dropped — visible to admins via the Mail Queue admin tab, `Query.mailOutbox`).
  ICS calendar invitations (RFC 5545, `apps/api/src/lib/ics.ts`) ride along on the
  same row via nodemailer's `icalEvent` option.
- **Synchronous best-effort (course/event purchase confirmation)** —
  `sendPurchaseConfirmedEmail` (`apps/api/src/lib/emails.ts`, called from
  `payments.ts`'s Stripe webhook handler) calls `apps/api/src/lib/mailer.ts`'s
  `sendMail()` directly and does not await it. On failure it logs a warning and
  returns `false`; a transient SMTP failure silently drops this one rather than
  queuing a retry. This narrower path is a known, disclosed gap (see "Known gaps" in
  `docs/architecture.md`), not an oversight — migrating it onto the same outbox is
  future work, not yet done.

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

## External event discovery: Ticketmaster + Classictic (worker)

Both providers share one shape: a `DiscoveryAdapter` (`isConfigured()`, `search()`)
under `apps/worker/src/discovery/`, a `*-ingest.ts` job that upserts normalized rows
into the single `ExternalEventProjection` table (`unique(provider, providerId)`), and
`apps/worker/src/jobs/event-classification.ts` tagging every provider's rows the same
way afterwards. `apps/api`'s `discoveryResolvers` (`externalEvents`,
`recommendedExternalEvents`) is a read-only, provider-neutral surface over that one
table — it never calls a provider directly, and external rows never enter the
authored `Event`/`createEvent` flow. Scheduling is `apps/worker/src/scheduler.ts`
(in-process `node-cron` inside the worker, not a Kubernetes CronJob). Europeana
(cultural-heritage content for learning) is still a planned provider for a separate
part of the product and has no code yet.

`apps/worker/src/discovery/ticketmaster.ts` calls the Ticketmaster Discovery API
(`TICKETMASTER_API_KEY`); `apps/worker/src/jobs/ticketmaster-ingest.ts` runs the sync.

### Classictic

`apps/worker/src/discovery/classictic.ts` calls Classictic's **affiliate "event list
widget"** — documented in the Classictic affiliate portal's marketing-materials
section, alongside a separate banner widget. This is not a general-purpose REST API:
`?format=json` on the widget's own endpoint returns the same event data the
embeddable iframe renders, keyed by the caller's own `affiliate_id` so every returned
event's `link` already carries the affiliate tracking parameter.

- **Endpoint**: `GET https://account.classictic.com/en/whitelabel/customized/search/result/`
- **Documented query parameters** (the only ones used — no other parameter is assumed
  or guessed, no scraping, no reverse-engineered contract): `affiliate_id`,
  `link_on_image=true`, `format=json`, `range` (result count).
- **Credential**: `CLASSICTIC_AFFILIATE_ID` (worker-only — the API never calls
  Classictic directly, so it's wired into `worker.yaml` and not `api.yaml`). Missing
  → `isConfigured()` is `false` → the ingest job silently no-ops (no crash, no partial
  sync), same pattern as a missing `TICKETMASTER_API_KEY`.
- **`range` (event volume)**: the widget has no documented pagination/offset
  parameter — each sync only ever sees "the widget's first N events" in its own
  default ordering, never a way to page through the full catalog. `range=20` is the
  documented example; `range=300` was confirmed to work in ~3s during integration
  testing, `range=1000` timed out. The adapter uses `300` as "as much as possible"
  without pushing into untested territory or hammering an endpoint that offers no
  pagination contract to hammer politely with.
- **Field shape** (from the live JSON response, not assumed): `event_id`, `event`
  (title), `start_time`, `sale_end_time` (last purchasable moment — reused as this
  row's `expiresAt`, the same "withdrawn" signal `externalEvents`/`platformStats`
  already use), `link` (the affiliate tracking URL), `venue`, `city`, `pictures.
  {desktop,mobile}[].url`, `description`. No price, currency, category, or performer
  field is present anywhere in this widget's payload (confirmed across a sampled
  batch) — normalized to `null`/`[]` rather than guessed.
- **Outbound link validation**: `isSafeClassicticUrl()` independently re-validates
  every `link` is `https://classictic.com` or a subdomain of it before it's ever
  normalized or rendered — a future bad/compromised payload, or a redirect to an
  unrelated domain, is rejected rather than silently sent to a student.
- **Attribution**: every normalized row's `attribution` field states events are sold
  by Classictic and the listing links out to complete purchase — same disclosure
  requirement as Ticketmaster, rendered by `ExternalEventCard` on `/events`.

### Engagement, attendance confirmation, and XP (both providers)

Independent of ingestion, the *student-facing* side of external event discovery is a
per-(user, event) `ExternalEventEngagement` row (see `packages/database/prisma/
schema.prisma`), driven entirely from `apps/api`:

1. **View** — clicking through to an external event's own site from `/events` fires
   `Mutation.recordExternalEventView` (`apps/api/src/resolvers/discovery.ts`), which
   upserts the engagement row (`firstViewedAt`/`lastViewedAt`). Surfaced on `/profile`
   as "Recently visited events."
2. **Confirm participation** — self-reported, only once the event's `startsAt` has
   passed (`Mutation.confirmExternalEventAttendance`); there is no scanned-ticket
   signal available for an external provider's event, so this is the same trust level
   as any other self-attested confirmation.
3. **Evaluate** — `Mutation.createReview` accepts an `externalEventProjectionId`,
   gated on step 2 having happened first (`apps/api/src/resolvers/reviews.ts`).
4. **Credit XP** — evaluating a confirmed-attended external event awards XP once
   (`awardXpOnce`, reason `EVENT_ATTENDED`, `refId = "external:<projectionId>"` — the
   `external:` prefix keeps this idempotency key from ever colliding with a native
   ticketed `Event.id` under the same reason). `ExternalEventEngagement.xpAwardedAt`
   is the durable "already credited" marker shown back to the student.

None of this touches ingestion or provider credentials — it's pure application state
over rows the ingest jobs already wrote.

## Calendar sync (Phase 6, scoped)

**Decision, stated up front:** `CLAUDE.md` is explicit that "Google Calendar / Meet
integration is intentionally not in scope for now... Do not add Google Calendar
coupling unless a task explicitly reintroduces it." This phase honors that guardrail.
Nothing here performs a live Google or Microsoft OAuth exchange, stores an access
token, or writes to an external calendar. What exists is a schema/adapter *contract*
for that direction (so adding it later is additive, not a redesign) plus one fully
real, working feature that needs no OAuth at all.

### Working today: the ICS subscription feed

`GET /calendar/feed/:token` (`apps/api/src/lib/calendarFeed.ts`) returns a live,
regenerated-on-every-request RFC 5545 `VCALENDAR` of the caller's own booked lessons
(as a student, and as a teacher if applicable) and personal appointments —
`buildCalendarFeedIcs` in `apps/api/src/lib/ics.ts`, `METHOD:PUBLISH`, one `VEVENT`
per item. This is the standard "subscribe from URL" flow every mainstream calendar
client supports without any OAuth: Apple Calendar, Google Calendar, and Outlook can
all subscribe to the same link.

- **Auth**: the URL's token *is* the credential — a calendar app polls it directly
  with no session cookie. `User.calendarFeedToken` is a random, unique, nullable
  token; `Mutation.rotateCalendarFeedToken` (`apps/api/src/resolvers/
  externalCalendar.ts`) is get-or-rotate — first call provisions it, every later call
  replaces it so a previously shared link can be invalidated.
- **Reachability**: `apps/api` is cluster-internal only (see the platform-reality note
  in `CLAUDE.md`), so `apps/web` proxies the request the same way it already does for
  `/api/graphql` — `apps/web/src/app/api/calendar/feed/[token]/route.ts` forwards to
  `GRAPHQL_SERVER_URL`'s origin, reusing that existing env var rather than adding a
  new one.
- **UI**: `/profile`'s "Calendar sync" section shows the copyable link and a
  regenerate action.

### Contract only, deliberately not implemented: Google/Microsoft busy-time sync

`ExternalCalendarConnection` / `ExternalBusyInterval` (`packages/database/prisma/
schema.prisma`) model the *other* direction — reading a user's busy time FROM Google
or Microsoft, to block a teacher's availability against events on their external
calendar. `apps/api/src/lib/externalCalendar.ts` defines `isProviderConfigured()`
(checks `GOOGLE_CALENDAR_CLIENT_ID`/`_SECRET`, `MICROSOFT_CALENDAR_CLIENT_ID`/
`_SECRET` — none of which exist in this codebase or `deploy/`) and the
`ExternalCalendarSyncAdapter` interface a real provider adapter would implement,
mirroring `DiscoveryAdapter`'s shape in `apps/worker/src/discovery/types.ts`.
`Mutation.connectExternalCalendar` always throws `NOT_CONFIGURED` today — by design,
not as a bug to fix, until a task explicitly asks for real Google/Microsoft OAuth
credentials and reintroduces that coupling.

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
