# pretix Integration

## Overview

[pretix](https://pretix.eu) is the operational event-ticketing core for My Music Coach. It handles:

- **Organisers** — the My Music Coach organisation
- **Events / sub-events** — individual concerts, masterclasses, workshops
- **Products / quotas** — ticket types (General Admission, VIP, etc.)
- **Customer accounts** — linked to Keycloak via OIDC
- **Orders / refunds / check-in** — full lifecycle

## Architecture

```
Platform API                         pretix
────────────                         ──────
provisionEventToPretix() ─────────►  Create event + products
                                          │
                                   Ticket purchase (hosted shop
                                   at tickets.mymusic-coach.test)
                                          │
                              pretix webhook POST ◄──────┘
                                          │
                              /webhooks/pretix handler
                                          │
                              EventBooking upsert ──────► Platform DB
```

## v1 Approach

In v1, we use **pretix's hosted shop** rather than building a fully custom headless checkout:

1. **Custom-domain shop** — pretix runs at `tickets.mymusic-coach.test` and serves its own storefront
2. **Widget embedding** (optional) — The pretix widget can be embedded in the Next.js frontend using `NEXT_PUBLIC_PRETIX_WIDGET_URL`

This minimises the integration surface while still providing a full ticketing flow.

## Provisioning Flow

When a teacher or admin creates an event in the platform:

1. `provisionEventToPretix()` is called
2. Creates a pretix event under the configured organiser
3. Creates a default "General Admission" product with the specified price and quota
4. Stores the mapping (`eventId ↔ pretixEventSlug`) for webhook correlation

## Webhook Events

pretix sends POST requests to `POST /webhooks/pretix` for the following actions:

| Action | Platform behaviour |
|--------|-------------------|
| `pretix.event.order.placed` | Create EventBooking (status: PENDING) |
| `pretix.event.order.paid` | Update EventBooking (status: CONFIRMED) |
| `pretix.event.order.canceled` | Update EventBooking (status: CANCELLED) |
| `pretix.event.order.refunded` | Update EventBooking (status: REFUNDED) |
| `pretix.event.checkin` | Set `checkedIn: true` on EventBooking |

## Sync Safety Net

A periodic sync job (`syncPretixOrders`) runs every 5 minutes as a safety net:

- Fetches all orders from pretix for each mapped event
- Updates the platform EventBooking status to match pretix
- Handles any missed webhooks

## Keycloak SSO

pretix customer accounts use Keycloak for OIDC login:

- **Client ID**: `pretix-oidc`
- **Redirect URI**: `http://tickets.mymusic-coach.test/oidc/callback/`
- Configured in Keycloak realm export (`docker/keycloak/realm-export.json`)

## Configuration

All pretix configuration is driven by environment variables (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `PRETIX_URL` | Internal URL for API calls |
| `PRETIX_API_TOKEN` | API authentication token |
| `PRETIX_ORGANISER_SLUG` | Default organiser slug |
| `PRETIX_CURRENCY` | Default currency (CHF) |
| `PRETIX_WEBHOOK_SECRET` | Webhook signature validation |
| `PRETIX_DB_*` | Database credentials |
| `PRETIX_REDIS_*` | Redis credentials |
| `PRETIX_MAIL_*` | Email configuration |
| `PRETIX_OIDC_*` | Keycloak OIDC client credentials |

## pretix.cfg

The `pretix.cfg` configuration file is generated at container startup from environment variables by `docker/pretix/docker-entrypoint.sh`. It is never committed to source control.
