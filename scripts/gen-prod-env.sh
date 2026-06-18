#!/usr/bin/env bash
# Generate a production .env with fresh, URL-safe (hex) secrets.
# Hex avoids the classic "@ or / in a password breaks the connection URL" bug.
# Usage:  bash scripts/gen-prod-env.sh [--force]
set -euo pipefail

DOMAIN="mymusic.coach"
OUT=".env"

if [[ -f "$OUT" && "${1:-}" != "--force" ]]; then
  echo "Refusing to overwrite existing $OUT — pass --force if you really mean it." >&2
  exit 1
fi

s()   { openssl rand -hex 24; }   # 48-char password/secret
s32() { openssl rand -hex 32; }   # 64-char signing secret

PG=$(s); RDS=$(s); JWT=$(s32); KC_ADMIN=$(s); NA=$(s32); MINIO=$(s)
MOO_DB=$(s); MOO_ADMIN=$(s); MOO_WS=$(s)
LB_DB=$(s); LB_ROOT=$(s); LB_API=$(s); LB_HOOK=$(s)
PX_DB=$(s); PX_RDS=$(s); PX_API=$(s); PX_HOOK=$(s)
# OIDC client secrets — patch-realm.py injects these into the realm import
# so Keycloak and the apps share the same secret.
CS_WEB=$(s); CS_API=$(s); CS_MOO=$(s); CS_PX=$(s); CS_LB=$(s)

umask 077
cat > "$OUT" <<EOF
# ===== My Music Coach PRODUCTION env — generated $(date -u +%FT%TZ). DO NOT COMMIT. =====

# ── Main DB ──
POSTGRES_USER=mymusic_coach
POSTGRES_PASSWORD=$PG
POSTGRES_DB=mymusic_coach
DATABASE_URL=postgresql://mymusic_coach:$PG@postgres-main:5432/mymusic_coach

# ── Redis ──
REDIS_PASSWORD=$RDS
REDIS_URL=redis://:$RDS@redis-main:6379

# ── JWT ──
JWT_SECRET=$JWT

# ── Keycloak ──
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=$KC_ADMIN
KEYCLOAK_CLIENT_ID=mymusic-coach-web
KEYCLOAK_CLIENT_SECRET=$CS_WEB
KEYCLOAK_API_CLIENT_SECRET=$CS_API
KEYCLOAK_ISSUER=https://auth.$DOMAIN/realms/mymusic-coach

# ── NextAuth ──
NEXTAUTH_URL=https://app.$DOMAIN
NEXTAUTH_SECRET=$NA

# ── App ──
NODE_ENV=production
LOG_LEVEL=info
PORT=4000
FRONTEND_URL=https://app.$DOMAIN
CORS_ORIGIN=https://app.$DOMAIN
NEXT_PUBLIC_GRAPHQL_URL=https://api.$DOMAIN/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://api.$DOMAIN/graphql
NEXT_PUBLIC_PRETIX_WIDGET_URL=https://tickets.$DOMAIN
# Moodle (learn) and LibreBooking (booking) are headless — leave unset.
NEXT_PUBLIC_LEARN_URL=
NEXT_PUBLIC_BOOKING_URL=
NEXT_PUBLIC_TICKETS_URL=https://tickets.$DOMAIN
NEXT_PUBLIC_ENABLE_LIVE_API=true

# ── Keycloak SMTP (fill in after setting up Infomaniak mail) ──
KC_SMTP_PASSWORD=

# ── MinIO ──
MINIO_ROOT_USER=mymusic-coach-minio
MINIO_ROOT_PASSWORD=$MINIO
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET_NAME=mymusic-coach-media

# ── Moodle ──
MOODLE_DB_USER=moodle
MOODLE_DB_PASSWORD=$MOO_DB
MOODLE_DB_NAME=moodle
MOODLE_ADMIN_USER=admin
MOODLE_ADMIN_PASSWORD=$MOO_ADMIN
MOODLE_ADMIN_EMAIL=admin@$DOMAIN
MOODLE_URL=http://moodle:8080
MOODLE_WS_TOKEN=$MOO_WS
MOODLE_OIDC_CLIENT_ID=moodle-oidc
MOODLE_OIDC_CLIENT_SECRET=$CS_MOO

# ── LibreBooking ──
LIBREBOOKING_DB_USER=librebooking
LIBREBOOKING_DB_PASSWORD=$LB_DB
LIBREBOOKING_DB_NAME=librebooking
LIBREBOOKING_DB_ROOT_PASSWORD=$LB_ROOT
LIBREBOOKING_TIMEZONE=Europe/Zurich
LIBREBOOKING_ADMIN_EMAIL=admin@$DOMAIN
LIBREBOOKING_URL=http://librebooking:80
LIBREBOOKING_API_USER=admin
LIBREBOOKING_API_PASSWORD=$LB_API
LIBREBOOKING_OIDC_CLIENT_ID=librebooking-saml
LIBREBOOKING_OIDC_CLIENT_SECRET=$CS_LB
LIBREBOOKING_WEBHOOK_SECRET=$LB_HOOK

# ── pretix ──
PRETIX_DB_USER=pretix
PRETIX_DB_PASSWORD=$PX_DB
PRETIX_DB_NAME=pretix
PRETIX_REDIS_PASSWORD=$PX_RDS
PRETIX_URL=https://tickets.$DOMAIN
PRETIX_API_TOKEN=$PX_API
PRETIX_ORGANISER_SLUG=mymusic-coach
PRETIX_CURRENCY=CHF
PRETIX_WEBHOOK_SECRET=$PX_HOOK
PRETIX_MAIL_FROM=tickets@$DOMAIN
PRETIX_MAIL_HOST=mail.infomaniak.com
PRETIX_MAIL_PORT=587
PRETIX_MAIL_USER=tickets@$DOMAIN
PRETIX_MAIL_PASSWORD=
PRETIX_OIDC_CLIENT_ID=pretix-oidc
PRETIX_OIDC_CLIENT_SECRET=$CS_PX

# ── Cloudflare Tunnel ── (Zero Trust → Networks → Tunnels → create → copy token)
CLOUDFLARE_TUNNEL_TOKEN=

# ── External APIs (fill in as you adopt them) ──
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
YAPEAL_API_KEY=
ZOOM_API_KEY=
ZOOM_API_SECRET=
ZOOM_ACCOUNT_ID=
DEEPSEEK_API_KEY=
DEEPSEEK_API_URL=https://api.deepseek.com/v1
OPENAI_API_KEY=
CLAUDE_API_KEY=
EOF

chmod 600 "$OUT"
echo "Wrote $OUT (0600) with fresh secrets for $DOMAIN."
echo "Next steps:"
echo "  1. Paste CLOUDFLARE_TUNNEL_TOKEN into .env"
echo "  2. Set KC_SMTP_PASSWORD in .env (Infomaniak mail password)"
echo "  3. Run: python3 scripts/patch-realm.py"
