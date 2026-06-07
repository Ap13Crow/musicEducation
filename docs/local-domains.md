# Local Domain Setup

## Overview

MusicEdu uses subdomain-based routing for local development via a **Caddy** reverse proxy. All services are accessed through `*.musicedu.test` domains on port 80.

## Required `/etc/hosts` Entries

Add these lines to your `/etc/hosts` file:

```
127.0.0.1  app.musicedu.test
127.0.0.1  api.musicedu.test
127.0.0.1  auth.musicedu.test
127.0.0.1  learn.musicedu.test
127.0.0.1  booking.musicedu.test
127.0.0.1  tickets.musicedu.test
```

### macOS / Linux

```bash
sudo sh -c 'cat >> /etc/hosts << EOF

# MusicEdu local development
127.0.0.1  app.musicedu.test
127.0.0.1  api.musicedu.test
127.0.0.1  auth.musicedu.test
127.0.0.1  learn.musicedu.test
127.0.0.1  booking.musicedu.test
127.0.0.1  tickets.musicedu.test
EOF'
```

### Windows

Open PowerShell as Administrator:

```powershell
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value @"

# MusicEdu local development
127.0.0.1  app.musicedu.test
127.0.0.1  api.musicedu.test
127.0.0.1  auth.musicedu.test
127.0.0.1  learn.musicedu.test
127.0.0.1  booking.musicedu.test
127.0.0.1  tickets.musicedu.test
"@
```

Or use `make hosts` to print the required entries.

## Domain → Service Mapping

| Domain | Service | Port (internal) | Description |
|--------|---------|-----------------|-------------|
| `app.musicedu.test` | web | 3000 | Next.js frontend |
| `api.musicedu.test` | api | 4000 | GraphQL API |
| `auth.musicedu.test` | keycloak | 8080 | Keycloak admin & OIDC |
| `learn.musicedu.test` | moodle | 8080 | Moodle LMS |
| `booking.musicedu.test` | librebooking | 80 | LibreBooking scheduler |
| `tickets.musicedu.test` | pretix | 8345 | pretix event ticketing |

## How It Works

The **Caddy** reverse proxy (`docker/gateway/Caddyfile`) listens on port 80 and routes requests based on the `Host` header to the appropriate backend service on the Docker network. No TLS is used in local development (`auto_https off`).

## Verification

After starting the stack with `make up` or `docker compose up -d`, verify:

```bash
curl -s http://app.musicedu.test | head -5
curl -s http://api.musicedu.test/health
curl -s http://auth.musicedu.test
curl -s http://learn.musicedu.test
curl -s http://booking.musicedu.test
curl -s http://tickets.musicedu.test
```
