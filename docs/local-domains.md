# Local Domain Setup

## Overview

My Music Coach uses subdomain-based routing for local development via a **Caddy** reverse proxy. All services are accessed through `*.mymusic-coach.test` domains on port 80.

## Required `/etc/hosts` Entries

Add these lines to your `/etc/hosts` file:

```
127.0.0.1  app.mymusic-coach.test
127.0.0.1  api.mymusic-coach.test
127.0.0.1  auth.mymusic-coach.test
127.0.0.1  learn.mymusic-coach.test
127.0.0.1  booking.mymusic-coach.test
127.0.0.1  tickets.mymusic-coach.test
```

### macOS / Linux

```bash
sudo sh -c 'cat >> /etc/hosts << EOF

# My Music Coach local development
127.0.0.1  app.mymusic-coach.test
127.0.0.1  api.mymusic-coach.test
127.0.0.1  auth.mymusic-coach.test
127.0.0.1  learn.mymusic-coach.test
127.0.0.1  booking.mymusic-coach.test
127.0.0.1  tickets.mymusic-coach.test
EOF'
```

### Windows

Open PowerShell as Administrator:

```powershell
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value @"

# My Music Coach local development
127.0.0.1  app.mymusic-coach.test
127.0.0.1  api.mymusic-coach.test
127.0.0.1  auth.mymusic-coach.test
127.0.0.1  learn.mymusic-coach.test
127.0.0.1  booking.mymusic-coach.test
127.0.0.1  tickets.mymusic-coach.test
"@
```

Or use `make hosts` to print the required entries.

## Domain → Service Mapping

| Domain | Service | Port (internal) | Description |
|--------|---------|-----------------|-------------|
| `app.mymusic-coach.test` | web | 3000 | Next.js frontend |
| `api.mymusic-coach.test` | api | 4000 | GraphQL API |
| `auth.mymusic-coach.test` | keycloak | 8080 | Keycloak admin & OIDC |
| `learn.mymusic-coach.test` | moodle | 8080 | Moodle LMS |
| `booking.mymusic-coach.test` | librebooking | 80 | LibreBooking scheduler |
| `tickets.mymusic-coach.test` | pretix | 8345 | pretix event ticketing |

## How It Works

The **Caddy** reverse proxy (`docker/gateway/Caddyfile`) listens on port 80 and routes requests based on the `Host` header to the appropriate backend service on the Docker network. No TLS is used in local development (`auto_https off`).

## Verification

After starting the stack with `make up` or `docker compose up -d`, verify:

```bash
curl -s http://app.mymusic-coach.test | head -5
curl -s http://api.mymusic-coach.test/health
curl -s http://auth.mymusic-coach.test
curl -s http://learn.mymusic-coach.test
curl -s http://booking.mymusic-coach.test
curl -s http://tickets.mymusic-coach.test
```
