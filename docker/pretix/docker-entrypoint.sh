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

# ── Database migration + admin user bootstrap ─────────────────
# Run migrations explicitly so we can create the admin user before
# the full daemon starts. pretix all also runs migrate internally
# (idempotent), so running it here first is safe.
# pretix runs from /pretix/src with production_settings.
cd /pretix/src
export DJANGO_SETTINGS_MODULE=production_settings
export DATA_DIR=/data/
export HOME=/pretix

echo "Running pretix database migrations..."
python3 -m pretix migrate --noinput

# Provision Keycloak SSO (idempotent upsert — safe on every start).
echo "[pretix] Configuring Keycloak SSO..."
python3 /configure-sso.py

# Create the staff/admin user on first run. pretix's User model lives in
# pretixbase (not django.contrib.auth), so standard createsuperuser doesn't work.
ADMIN_EMAIL="${PRETIX_ADMIN_EMAIL:-admin@mymusic.coach}"
ADMIN_PASSWORD="${PRETIX_ADMIN_PASSWORD:-}"

if [ -n "$ADMIN_PASSWORD" ]; then
  python3 -m pretix shell << PYEOF
from pretix.base.models import User
u, created = User.objects.get_or_create(email='${ADMIN_EMAIL}', defaults={'is_staff': True, 'is_active': True})
u.is_staff = True
u.is_active = True
u.set_password('${ADMIN_PASSWORD}')
u.save()
print('[pretix] Admin user %s: ${ADMIN_EMAIL}' % ('created' if created else 'password updated'))
PYEOF
else
  echo "[pretix] PRETIX_ADMIN_PASSWORD not set — skipping admin user creation."
fi

# Run the upstream pretix supervisor
exec pretix "$@"
