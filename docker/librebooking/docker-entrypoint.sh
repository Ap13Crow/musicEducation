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
# LibreBooking 3.x uses a PHP return-array format (new format).
CONFIG_DIR="/var/www/html/config"
mkdir -p "$CONFIG_DIR"

# Pre-compute PHP booleans so they land correctly in the heredoc.
KEYCLOAK_ENABLED="false"
if [ -n "${LIBREBOOKING_OIDC_CLIENT_ID:-}" ] && [ -n "${LIBREBOOKING_OIDC_CLIENT_SECRET:-}" ]; then
    KEYCLOAK_ENABLED="true"
fi

cat > "$CONFIG_DIR/config.php" << EOPHP
<?php
return [
    'settings' => [
        'app.title' => '${LIBREBOOKING_APP_TITLE:-My Music Coach Booking}',
        'default.timezone' => '${LIBREBOOKING_TIMEZONE:-Europe/Zurich}',
        'script.url' => '${LIBREBOOKING_SCRIPT_URL:-http://booking.mymusic-coach.test}',

        'admin.email' => '${LIBREBOOKING_ADMIN_EMAIL:-admin@mymusic.coach}',
        'admin.email.name' => '${LIBREBOOKING_APP_TITLE:-My Music Coach Booking}',
        'phpmailer.mailer' => 'dummy', // Disable native emails to let the central platform handle them

        'database' => [
            'type'     => 'mysql',
            'hostspec' => '${LIBREBOOKING_DB_HOST:-librebooking-db}',
            'name'     => '${LIBREBOOKING_DB_NAME:-librebooking}',
            'user'     => '${LIBREBOOKING_DB_USER:-librebooking}',
            'password' => '${LIBREBOOKING_DB_PASSWORD}',
        ],

        'authentication' => [
            // Hide the local login form and auto-redirect to Keycloak when SSO is configured.
            // Users are silently authenticated via their existing Keycloak browser session.
            'hide.login.prompt' => $KEYCLOAK_ENABLED,

            // Keycloak SSO — enabled when LIBREBOOKING_OIDC_CLIENT_ID is set.
            'keycloak.login.enabled' => $KEYCLOAK_ENABLED,
            'keycloak.url'           => '${LIBREBOOKING_KEYCLOAK_URL:-https://auth.mymusic.coach}',
            'keycloak.realm'         => '${LIBREBOOKING_KEYCLOAK_REALM:-mymusic-coach}',
            'keycloak.client.id'     => '${LIBREBOOKING_OIDC_CLIENT_ID:-}',
            'keycloak.client.secret' => '${LIBREBOOKING_OIDC_CLIENT_SECRET:-}',
            // Default redirect URI path matches keycloak-auth.php in the Web root.
            'keycloak.client.uri'    => '/Web/keycloak-auth.php',
        ],
    ],
];
EOPHP

echo "LibreBooking config.php generated (new format) from environment."

exec "$@"
