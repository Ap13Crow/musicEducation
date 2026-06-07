#!/bin/bash
set -e

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

\$conf['settings']['app.title'] = '${LIBREBOOKING_APP_TITLE:-MusicEdu Booking}';
\$conf['settings']['default.timezone'] = '${LIBREBOOKING_TIMEZONE:-Europe/Zurich}';
\$conf['settings']['script.url'] = '${LIBREBOOKING_SCRIPT_URL:-http://booking.musicedu.test}';

\$conf['settings']['admin.email'] = '${LIBREBOOKING_ADMIN_EMAIL:-admin@musicedu.app}';
\$conf['settings']['admin.email.name'] = 'MusicEdu Booking';

\$conf['settings']['authentication']['type'] = 'ActiveDirectory';
\$conf['settings']['authentication']['required.email.domain'] = '';

// Keycloak SAML / OAuth2 can be configured through the plugin system
// or via Apache mod_auth_openidc sitting in front.
?>
EOPHP

echo "LibreBooking config.php generated from environment."

exec "$@"
