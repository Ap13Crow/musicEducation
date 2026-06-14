# Production Runbook — `mymusic.coach` (Linux + Cloudflare tunnel)

This is the deployment checklist and diagnostic runbook for running the full
stack on a Linux (Ubuntu) host with a Cloudflare tunnel in front. It focuses on
the parts that commonly break behind a tunnel: the post-login dashboard, the
Keycloak SSO round-trip, and reachability of the three external containers
(Moodle, LibreBooking, pretix).

> TLS terminates at Cloudflare. `cloudflared` connects **outbound only** to the
> internal Caddy gateway over plain HTTP — nothing is exposed on the host's
> public IP.

---

## 1. Bring up the stack

```bash
# Generate a production .env with fresh, URL-safe secrets
bash scripts/gen-prod-env.sh

# Add the tunnel token (Cloudflare Zero Trust → Tunnels → your tunnel → token)
echo 'CLOUDFLARE_TUNNEL_TOKEN=...' >> .env

# Build the Keycloak production realm from .env (see §3 — required!)
python3 scripts/patch-realm.py

# Start everything with the production overrides + tunnel
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
make migrate
```

The override file [`docker-compose.prod.yml`](../docker-compose.prod.yml) flips
the services that bake a hostname into their own config to the
`https://*.mymusic.coach` hosts and adds `cloudflared`. The base
`docker-compose.yml` stays the dev source of truth (`*.mymusic-coach.test`).

---

## 2. Cloudflare tunnel ingress

In the Cloudflare Zero Trust dashboard (or `config.yml` if you self-host the
connector), map **every** public hostname to the Caddy gateway service. Caddy
then fans out to each upstream by `Host` header (see
[`docker/gateway/Caddyfile.prod`](../docker/gateway/Caddyfile.prod)).

| Public hostname | Tunnel service (origin) |
|-----------------|-------------------------|
| `app.mymusic.coach` | `http://gateway:80` |
| `api.mymusic.coach` | `http://gateway:80` |
| `auth.mymusic.coach` | `http://gateway:80` |
| `learn.mymusic.coach` | `http://gateway:80` |
| `booking.mymusic.coach` | `http://gateway:80` |
| `tickets.mymusic.coach` | `http://gateway:80` |

Notes:
- Point each hostname's **DNS** (CNAME) at the tunnel.
- All ingress goes through the **one** gateway origin; do **not** point
  hostnames directly at individual containers, or Caddy's host routing and the
  `trusted_proxies` handling are bypassed.
- Caddy already trusts private-range proxies
  (`trusted_proxies static private_ranges`), so the `X-Forwarded-Proto: https`
  that Cloudflare/cloudflared set is honored by the upstreams.

---

## 3. Keycloak: realm, redirect URIs and role claims

### Build the production realm (do not skip)

`docker-compose.prod.yml` mounts `docker/keycloak/realm-export.prod.json` and
imports it on startup. That file is **generated** by
[`scripts/patch-realm.py`](../scripts/patch-realm.py) from
`realm-export.json` + `.env`; it:

- rewrites every client redirect URI / web origin from `*.mymusic-coach.test`
  (http) to `*.mymusic.coach` (https),
- drops `localhost` entries (prod trusts the live domain only),
- injects each confidential client's secret from `.env` so Keycloak and the
  apps share the same secret.

After running it, the web client should have redirect URIs
`https://app.mymusic.coach/*` (matching `NEXTAUTH_URL`), and the Moodle / pretix
/ LibreBooking clients should point at their `https://*.mymusic.coach` hosts.
Verify:

```bash
python3 - <<'PY'
import json
r = json.load(open("docker/keycloak/realm-export.prod.json"))
for c in r["clients"]:
    print(c["clientId"], c.get("redirectUris"), "secret" in c)
PY
```

### Role claims feeding the dashboard

The frontend reads roles from the Keycloak access token at
`realm_access.roles` (see `apps/web/src/app/api/auth/[...nextauth]/route.ts`),
and the dashboard renders the highest of `ADMIN > TEACHER > STUDENT > GUEST`.
Keycloak's default `roles` client scope already adds `realm_access.roles` to the
access token, so no custom mapper is required for roles.

**New accounts must get a role.** The realm defines `STUDENT` as the default
role. If a freshly registered Keycloak user shows up with no role (the classic
"logged in but the dashboard can't tell who I am" symptom), confirm in the admin
console that **Realm settings → User registration → Default roles** includes
`STUDENT`, and assign it to existing users under **Users → Role mapping** if
needed.

### One-time admin checks on the server

- **Realm settings → General**: frontend URL / hostname resolves to
  `https://auth.mymusic.coach` (set via `KC_HOSTNAME`).
- **Clients → `mymusic-coach-web` → Valid redirect URIs**: `https://app.mymusic.coach/*`.
- **Clients → each external client → Valid redirect URIs**: the matching
  `https://learn|booking|tickets.mymusic.coach` callback paths.
- **Realm settings → Login → Require SSL**: `external requests` (so SSL is
  required for the public hostnames while the internal tunnel hop stays HTTP).

---

## 4. External containers: "buttons don't work / backend not accessible"

When a service generates links/redirects from the **wrong** base URL or scheme,
forms post to `http://` behind an `https://` page and silently fail
(mixed-content) — this is the usual cause of dead buttons behind a tunnel. Each
service must know its real public URL **and** trust the proxy's
`X-Forwarded-Proto` header. The production compose already sets these:

| Service | Public-URL env | Proxy-trust setting | Mounted/handled in |
|---------|----------------|---------------------|--------------------|
| **Moodle** | `MOODLE_WWWROOT=https://learn.mymusic.coach`, `MOODLE_HOST=learn.mymusic.coach` | `MOODLE_SSLPROXY=true` → sets `$CFG->sslproxy` | `docker/moodle/docker-entrypoint.sh` |
| **LibreBooking** | `LIBREBOOKING_SCRIPT_URL=https://booking.mymusic.coach` | trusts gateway `X-Forwarded-*` | `docker/librebooking/docker-entrypoint.sh` |
| **pretix** | `PRETIX_URL=https://tickets.mymusic.coach` | `trust_x_forwarded_for=on`, `trust_x_forwarded_proto=on` (in `pretix.cfg`) | `docker/pretix/docker-entrypoint.sh` |

If you changed any of these, the config is only regenerated on container
(re)start — recreate the affected service:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate moodle librebooking pretix
```

---

## 5. Diagnostic runbook

Run these on the Ubuntu host. They isolate *where* a request breaks: gateway →
container → tunnel.

```bash
# 1. Are all containers healthy?
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# 2. Gateway is up and routing (Host header selects the upstream)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:80/health
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: app.mymusic.coach'    http://localhost:80/
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: api.mymusic.coach'    http://localhost:80/health
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: learn.mymusic.coach'  http://localhost:80/login/index.php
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: booking.mymusic.coach' http://localhost:80/
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: tickets.mymusic.coach' http://localhost:80/

# 3. Each container answers directly (bypass the gateway)
docker compose exec moodle       curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/login/index.php
docker compose exec librebooking curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/
docker compose exec pretix       curl -s -o /dev/null -w '%{http_code}\n' http://localhost:80/

# 4. Public round-trip through Cloudflare (from anywhere)
curl -sI https://app.mymusic.coach     | head -1
curl -sI https://auth.mymusic.coach    | head -1
curl -s  https://auth.mymusic.coach/realms/mymusic-coach/.well-known/openid-configuration | head -c 200; echo

# 5. Logs for a failing service
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 moodle
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 cloudflared
```

Interpreting results:

- **Gateway health 200 but a Host-routed call 502/404** → the upstream container
  is down or its service name/port changed; check `docker compose ps` and step 3.
- **Step 3 works but step 2 fails** → Caddy host routing/`trusted_proxies`; check
  `Caddyfile.prod` and `docker compose logs gateway`.
- **Steps 2–3 work but step 4 fails** → Cloudflare tunnel ingress/DNS (§2) or the
  tunnel token; check `docker compose logs cloudflared`.
- **Pages load but buttons/forms do nothing, or you get redirect loops** →
  wrong public URL / missing proxy-proto trust in §4, or a Keycloak redirect-URI
  mismatch in §3.

---

## 6. Frontend dashboard

The post-login landing page is `/dashboard`
(`apps/web/src/app/dashboard/page.tsx`). It is session-guarded (unauthenticated
visitors are sent to Keycloak), shows the user's role and a three-pillar
overview, and deep-links into Moodle / LibreBooking / pretix via the
`NEXT_PUBLIC_LEARN_URL` / `NEXT_PUBLIC_BOOKING_URL` / `NEXT_PUBLIC_TICKETS_URL`
env vars.

- It renders **typed example content** until `NEXT_PUBLIC_ENABLE_LIVE_API=true`
  and the GraphQL API at `api.mymusic.coach` is reachable (an amber banner makes
  this state explicit). `gen-prod-env.sh` sets this to `true` for production.

### API fields not yet available (dashboard follow-ups)

The dashboard surfaces these, but the API does not yet expose them — they render
as labelled placeholders today and should be added to the GraphQL schema later:

- **Course deadlines** — no deadline/due-date field on `Enrollment`/`Course`.
- **Messages** — there is no messaging query/type (`messages`, threads, etc.).
