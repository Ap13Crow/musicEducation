#!/bin/bash
# ── Moodle first-run entrypoint ───────────────────────────────
# Runs the Moodle CLI installer on first boot, then hands off
# to Apache. Subsequent starts skip installation (config.php exists).
set -e

: "${MOODLE_DATABASE_TYPE:=pgsql}"
: "${MOODLE_DATABASE_HOST:=moodle-db}"
: "${MOODLE_DATABASE_PORT_NUMBER:=5432}"
: "${MOODLE_DATABASE_USER:=moodle}"
: "${MOODLE_DATABASE_PASSWORD:=moodle_dev_pw}"
: "${MOODLE_DATABASE_NAME:=moodle}"
: "${MOODLE_USERNAME:=admin}"
: "${MOODLE_PASSWORD:=moodle_admin_pw}"
: "${MOODLE_EMAIL:=admin@mymusic.coach}"
: "${MOODLE_SITE_NAME:=My Music Coach}"
: "${MOODLE_HOST:=learn.mymusic-coach.test}"
: "${MOODLE_SSLPROXY:=false}"
: "${MOODLE_DATA_DIR:=/var/moodledata}"

CONFIG_FILE="/var/www/html/config.php"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "[moodle] config.php not found — running first-run installer."
  echo "[moodle] Waiting for database at ${MOODLE_DATABASE_HOST}:${MOODLE_DATABASE_PORT_NUMBER}..."

  until bash -c "echo > /dev/tcp/${MOODLE_DATABASE_HOST}/${MOODLE_DATABASE_PORT_NUMBER}" 2>/dev/null; do
    echo "[moodle] Database not ready — retrying in 5s..."
    sleep 5
  done
  # Brief extra wait for PostgreSQL to finish initialising after the port opens
  sleep 3

  echo "[moodle] Database ready. Starting CLI install (this may take several minutes)..."

  php /var/www/html/admin/cli/install.php \
    --lang=en \
    --wwwroot="${MOODLE_WWWROOT:-http://${MOODLE_HOST}}" \
    --dataroot="${MOODLE_DATA_DIR}" \
    --dbtype="${MOODLE_DATABASE_TYPE}" \
    --dbhost="${MOODLE_DATABASE_HOST}" \
    --dbport="${MOODLE_DATABASE_PORT_NUMBER}" \
    --dbname="${MOODLE_DATABASE_NAME}" \
    --dbuser="${MOODLE_DATABASE_USER}" \
    --dbpass="${MOODLE_DATABASE_PASSWORD}" \
    --prefix=mdl_ \
    --fullname="${MOODLE_SITE_NAME}" \
    --shortname="mymusic_coach" \
    --adminuser="${MOODLE_USERNAME}" \
    --adminpass="${MOODLE_PASSWORD}" \
    --adminemail="${MOODLE_EMAIL}" \
    --non-interactive \
    --agree-license

  echo "[moodle] Installation complete."

  # Append sslproxy setting so Moodle trusts the Caddy reverse-proxy header
  if [ "${MOODLE_SSLPROXY}" = "true" ]; then
    sed -i "/require_once/i \\\$CFG->sslproxy = true;" "$CONFIG_FILE"
    echo "[moodle] sslproxy enabled."
  fi

  # Ensure www-data (Apache) can read the config file created by the root-run installer
  chown www-data:www-data "$CONFIG_FILE"

  # Enable web services, register the REST protocol, create the external service,
  # and inject the pre-shared API token so the GraphQL layer can authenticate
  # without a manual admin step.
  echo "[moodle] Configuring web services..."
  php /usr/local/bin/moodle-setup-webservice.php
else
  echo "[moodle] config.php found — skipping installation."
fi

exec "$@"
