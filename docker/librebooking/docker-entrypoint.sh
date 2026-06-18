#!/bin/bash
set -e

# ── Generate LibreBooking config.php from environment ────────
# LibreBooking 3.x uses a PHP return-array format (new format).
CONFIG_DIR="/var/www/html/config"
mkdir -p "$CONFIG_DIR"

# Pre-compute PHP booleans so they land correctly in the heredoc.
KEYCLOAK_ENABLED="false"
if [ -n "${LIBREBOOKING_OIDC_CLIENT_ID:-}" ]; then
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
