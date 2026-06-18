#!/bin/bash
set -e

# ── Keycloak OIDC single sign-on (Keycloak) ──────────────────
# LibreBooking >= 5.0 ships a native Keycloak login button
# (Web/keycloak-auth.php). It is configured purely through config.php,
# so SSO is provisioned headlessly — no admin point-and-click setup.
#
# All connection details come from the environment so the same image
# works in dev (http://auth.mymusic-coach.test) and prod
# (https://auth.mymusic.coach) without rebuilds. The issuer is split
# into the Keycloak base URL and realm, which LibreBooking recombines
# into the OIDC endpoints (<base>/realms/<realm>/protocol/openid-connect/*).
LIBREBOOKING_OIDC_CLIENT_ID="${LIBREBOOKING_OIDC_CLIENT_ID:-librebooking-saml}"
LIBREBOOKING_OIDC_ISSUER="${LIBREBOOKING_OIDC_ISSUER:-http://auth.mymusic-coach.test/realms/mymusic-coach}"
KEYCLOAK_BASE_URL="${LIBREBOOKING_OIDC_ISSUER%/realms/*}"
KEYCLOAK_REALM="${LIBREBOOKING_OIDC_ISSUER##*/realms/}"

# Build the Keycloak SSO config block only when a client secret is set.
# Idempotent: regenerated on every boot so config self-heals and tracks
# any updated client secret / issuer from the environment.
KEYCLOAK_CONFIG=""
if [ -n "${LIBREBOOKING_OIDC_CLIENT_SECRET}" ]; then
  read -r -d '' KEYCLOAK_CONFIG << EOKC || true

// ── Keycloak OIDC single sign-on (provisioned headlessly) ────
\$conf['settings']['authentication']['keycloak.login.enabled'] = true;
\$conf['settings']['authentication']['keycloak.url'] = '${KEYCLOAK_BASE_URL}';
\$conf['settings']['authentication']['keycloak.realm'] = '${KEYCLOAK_REALM}';
\$conf['settings']['authentication']['keycloak.client.id'] = '${LIBREBOOKING_OIDC_CLIENT_ID}';
\$conf['settings']['authentication']['keycloak.client.secret'] = '${LIBREBOOKING_OIDC_CLIENT_SECRET}';
\$conf['settings']['authentication']['keycloak.client.uri'] = '/Web/keycloak-auth.php';
EOKC
  echo "[librebooking] Keycloak OIDC SSO enabled (realm '${KEYCLOAK_REALM}')."
else
  echo "[librebooking] LIBREBOOKING_OIDC_CLIENT_SECRET not set — skipping Keycloak SSO configuration."
fi

# ── Generate LibreBooking config.php from environment ────────
CONFIG_DIR="/var/www/html/config"
mkdir -p "$CONFIG_DIR"

cat > "$CONFIG_DIR/config.php" << EOPHP
<?php
\$conf['settings']['database']['type'] = 'mysql';
\$conf['settings']['database']['user'] = '${LIBREBOOKING_DB_USER:-librebooking}';
\$conf['settings']['database']['password'] = '${LIBREBOOKING_DB_PASSWORD}';
\$conf['settings']['database']['hostspec'] = '${LIBREBOOKING_DB_HOST:-librebooking-db}';
\$conf['settings']['database']['name'] = '${LIBREBOOKING_DB_NAME:-librebooking}';

\$conf['settings']['app.title'] = '${LIBREBOOKING_APP_TITLE:-My Music Coach Booking}';
\$conf['settings']['default.timezone'] = '${LIBREBOOKING_TIMEZONE:-Europe/Zurich}';
\$conf['settings']['script.url'] = '${LIBREBOOKING_SCRIPT_URL:-http://booking.mymusic-coach.test}';

\$conf['settings']['admin.email'] = '${LIBREBOOKING_ADMIN_EMAIL:-admin@mymusic.coach}';
\$conf['settings']['admin.email.name'] = 'My Music Coach Booking';

\$conf['settings']['authentication']['type'] = 'ActiveDirectory';
\$conf['settings']['authentication']['required.email.domain'] = '';
${KEYCLOAK_CONFIG}
?>
EOPHP

echo "LibreBooking config.php generated from environment."

exec "$@"
