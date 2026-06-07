#!/bin/bash
set -e

# ── Generate pretix.cfg from environment variables ───────────
mkdir -p /etc/pretix

cat > /etc/pretix/pretix.cfg << EOCFG
[pretix]
instance_name=${PRETIX_INSTANCE_NAME:-MusicEdu Tickets}
url=${PRETIX_URL:-http://tickets.musicedu.test}
currency=${PRETIX_CURRENCY:-CHF}
datadir=/data
trust_x_forwarded_for=on
trust_x_forwarded_proto=on

[database]
backend=postgresql
name=${PRETIX_DB_NAME:-pretix}
user=${PRETIX_DB_USER:-pretix}
******
host=${PRETIX_DB_HOST:-pretix-db}
port=5432

[mail]
from=${PRETIX_MAIL_FROM:-tickets@musicedu.app}
host=${PRETIX_MAIL_HOST:-localhost}
port=${PRETIX_MAIL_PORT:-587}
user=${PRETIX_MAIL_USER:-}
******
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

# Run the upstream pretix entrypoint
exec pretix "$@"
