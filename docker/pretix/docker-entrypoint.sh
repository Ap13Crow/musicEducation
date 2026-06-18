#!/bin/bash
set -e

# ── Generate pretix.cfg from environment variables ───────────
mkdir -p /etc/pretix

DB_PASS="${PRETIX_DB_PASSWORD:-pretix_dev_pw}"
MAIL_PASS="${PRETIX_MAIL_PASSWORD:-}"

cat > /etc/pretix/pretix.cfg << EOCFG
[pretix]
instance_name=${PRETIX_INSTANCE_NAME:-My Music Coach Tickets}
url=${PRETIX_URL:-http://tickets.mymusic-coach.test}
currency=${PRETIX_CURRENCY:-CHF}
datadir=/data
trust_x_forwarded_for=on
trust_x_forwarded_proto=on

[database]
backend=postgresql
name=${PRETIX_DB_NAME:-pretix}
user=${PRETIX_DB_USER:-pretix}
password=$DB_PASS
host=${PRETIX_DB_HOST:-pretix-db}
port=5432

[mail]
from=${PRETIX_MAIL_FROM:-tickets@mymusic.coach}
host=${PRETIX_MAIL_HOST:-localhost}
port=${PRETIX_MAIL_PORT:-587}
user=${PRETIX_MAIL_USER:-}
password=$MAIL_PASS
tls=on

[redis]
location=redis://:${PRETIX_REDIS_PASSWORD:-redis_dev_pw}@${PRETIX_REDIS_HOST:-pretix-redis}:6379/0
sessions=true
cache=true

[celery]
backend=redis://:${PRETIX_REDIS_PASSWORD:-redis_dev_pw}@${PRETIX_REDIS_HOST:-pretix-redis}:6379/1
broker=redis://:${PRETIX_REDIS_PASSWORD:-redis_dev_pw}@${PRETIX_REDIS_HOST:-pretix-redis}:6379/2
EOCFG

echo "pretix.cfg generated from environment."

# ── Headless customer-account SSO (Keycloak OIDC) ────────────
# Provisioning needs the schema in place and Keycloak's discovery
# document reachable. Migrations run in the foreground (sequential and
# idempotent — `pretix all` re-checks them later), then the Keycloak-
# dependent provisioning runs in the background so it never blocks
# `pretix all` from serving.
: "${PRETIX_OIDC_ISSUER:=http://auth.mymusic-coach.test/realms/mymusic-coach}"
: "${PRETIX_OIDC_CLIENT_ID:=pretix-oidc}"
: "${PRETIX_OIDC_CLIENT_SECRET:=}"
export PRETIX_OIDC_ISSUER PRETIX_OIDC_CLIENT_ID PRETIX_OIDC_CLIENT_SECRET \
       PRETIX_ORGANISER_SLUG PRETIX_INSTANCE_NAME \
       PRETIX_OIDC_PROVIDER_NAME PRETIX_OIDC_BUTTON_LABEL

configure_sso() {
  echo "[pretix-sso] Waiting for Keycloak discovery at ${PRETIX_OIDC_ISSUER} ..."
  discovery="${PRETIX_OIDC_ISSUER%/}/.well-known/openid-configuration"
  for _ in $(seq 1 60); do
    if curl -fsS "$discovery" >/dev/null 2>&1; then
      break
    fi
    sleep 5
  done

  # Retry the provisioning a few times to ride out Keycloak still warming up.
  for _ in $(seq 1 5); do
    if pretix shell < /configure-sso.py; then
      return 0
    fi
    echo "[pretix-sso] Provisioning attempt failed — retrying in 10s..."
    sleep 10
  done
  echo "[pretix-sso] WARNING: SSO provisioning did not complete; re-run after Keycloak is healthy."
}

if [ -n "${PRETIX_OIDC_CLIENT_SECRET}" ]; then
  echo "[pretix-sso] Applying database migrations before provisioning..."
  pretix migrate --noinput
  configure_sso &
else
  echo "[pretix-sso] PRETIX_OIDC_CLIENT_SECRET not set — skipping SSO provisioning."
fi

# Run the upstream pretix entrypoint
exec pretix "$@"
