# Integration Architecture

## Overview

My Music Coach uses a hub-and-spoke model where the **platform API** (`apps/api`) is the central orchestrator and four specialised systems handle their respective domains:

| System | Role | Auth method |
|--------|------|-------------|
| **my-music-coach** (apps/api + apps/web) | User profiles, public event discovery, orchestration | Keycloak OIDC (NextAuth.js) |
| **Keycloak** | Central identity provider | — |
| **Moodle** | Online learning (courses, lessons, quizzes) | Keycloak OIDC via `moodle-oidc` client |
| **LibreBooking** | Physical lesson scheduling (rooms, resources) | Keycloak OAuth2 / SAML via `librebooking-saml` client |
| **pretix** | Event ticketing (orders, check-in, refunds) | Keycloak OIDC via `pretix-oidc` client |

## Service Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         Caddy Gateway                           │
│  app.  │  api.  │  auth.  │  learn.  │  booking.  │  tickets.  │
└───┬────┴───┬────┴────┬────┴────┬─────┴─────┬──────┴─────┬──────┘
    │        │         │         │            │            │
    ▼        ▼         ▼         ▼            ▼            ▼
  [web]    [api]   [keycloak]  [moodle]  [librebooking]  [pretix]
    │        │         │         │            │            │
    │        ├─────────┤         │            │            │
    │        │   OIDC  │◄────────┤            │            │
    │        │  tokens │◄────────┼────────────┤            │
    │        │         │◄────────┼────────────┼────────────┤
    │        │         │         │            │            │
    │        ▼         │         ▼            ▼            ▼
    │   ┌─────────┐    │    [moodle-db]  [libre-db]   [pretix-db]
    │   │postgres │    │                              [pretix-redis]
    │   │ -main   │    │
    │   └─────────┘    │
    │   ┌─────────┐    │
    │   │redis    │    │
    │   │ -main   │    │
    │   └─────────┘    │
    │   ┌─────────┐    │
    │   │ minio   │    │
    │   └─────────┘    │
    │   ┌─────────┐    │
    │   │mcp-     │    │
    │   │server   │    │
    │   └─────────┘    │
    │                  │
    └──────────────────┘
```

## Integration Layer (`apps/api/src/integrations/`)

The integration layer is a dedicated module inside the API that owns:

### Directory Structure

```
apps/api/src/integrations/
├── adapters/
│   ├── index.ts              # Re-exports
│   ├── librebooking.ts       # SchedulingAdapter → LibreBooking REST API
│   ├── moodle.ts             # Moodle REST API (user provisioning, courses)
│   └── pretix.ts             # EventCoreAdapter → pretix REST API
├── provisioning/
│   └── user-provisioning.ts  # Idempotent user sync to external systems
├── sync/
│   └── event-sync.ts         # Event provisioning + periodic order sync
├── types/
│   └── index.ts              # Shared interfaces (adapters, webhooks, IDs)
├── webhooks/
│   ├── librebooking-webhook.ts
│   └── pretix-webhook.ts     # POST handler for pretix webhook callbacks
└── index.ts                  # Barrel export
```

### Adapter Abstractions

Two core interfaces decouple the platform from specific vendor APIs:

1. **`SchedulingAdapter`** — replaces the previous Calendly assumptions. Provides `getAvailability()`, `createBooking()`, `cancelBooking()`, `getBooking()`. The `LibreBookingAdapter` is the first implementation.

2. **`EventCoreAdapter`** — abstracts event ticketing operations. Provides organiser, event, product, order, and check-in management. The `PretixAdapter` is the first implementation.

### External Identity Mapping

Each platform user can be linked to external system accounts:

| Field | Type | Source |
|-------|------|--------|
| `moodleUserId` | `number` | Provisioned via Moodle REST API |
| `libreBookingUserId` | `number` | Created on first SSO login |
| `pretixCustomerId` | `string` | Created on first SSO login |

### Data Flow

```
Platform Event → provisionEventToPretix() → pretix API
                                              ↓
                                    pretix webhook POST
                                              ↓
                              pretix-webhook.ts handler
                                              ↓
                                    EventBooking upsert
```

### Webhook Endpoints

| Endpoint | Source | Purpose |
|----------|--------|---------|
| `POST /webhooks/pretix` | pretix | Order placed/paid/cancelled/refunded, check-in |
| `POST /webhooks/librebooking` | LibreBooking | Reservation created/updated/deleted |

## Startup Order

1. **Databases** — `postgres-main`, `moodle-db`, `librebooking-db`, `pretix-db`
2. **Caches** — `redis-main`, `pretix-redis`
3. **Identity** — `keycloak` (waits for `postgres-main`)
4. **Backend services** — `moodle`, `librebooking`, `pretix` (wait for their respective DBs)
5. **Platform** — `api` (waits for `postgres-main` + `redis-main`), then `web` (waits for `api`)
6. **AI** — `mcp-server` (waits for `postgres-main`)
7. **Storage** — `minio`
8. **Gateway** — `gateway` (waits for all upstream services)

## Security Boundaries

- Only the **Caddy gateway** is exposed on `0.0.0.0:80`.
- All other services use Docker `expose` (internal network only).
- Database and Redis ports are never mapped to the host.
- Secrets are loaded from `.env` (never committed) — see `.env.example`.
