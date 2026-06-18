# ── Moodle LMS ───────────────────────────────────────────────
# Official Moodle HQ image (moodlehq/moodle-php-apache) replaces
# the Bitnami image, which was removed from Docker Hub in 2025.
# PHP 8.2 + Apache with all required Moodle extensions pre-installed.
# Moodle source is downloaded at build time; first-run installation
# is handled by the entrypoint via the Moodle CLI installer.

FROM moodlehq/moodle-php-apache:8.2-bullseye

ARG MOODLE_VERSION=4.4.4
# auth_oidc ships inside the microsoft/o365-moodle bundle; the
# MOODLE_404_STABLE branch tracks the 4.4 plugin release that matches
# MOODLE_VERSION above.
ARG MOODLE_OIDC_PLUGIN_REF=MOODLE_404_STABLE

LABEL maintainer="My Music Coach"
LABEL description="Moodle LMS for My Music Coach – online learning core"

# ── Download Moodle ───────────────────────────────────────────
RUN curl -fsSL \
      "https://download.moodle.org/download.php/direct/stable404/moodle-${MOODLE_VERSION}.tgz" \
    | tar -xz --strip-components=1 -C /var/www/html \
 && chown -R www-data:www-data /var/www/html

# ── OIDC SSO plugin (Keycloak single sign-on) ─────────────────
# Extract only the auth/oidc subtree of the o365-moodle bundle into
# Moodle's auth plugin directory so headless SSO works out of the box.
RUN mkdir -p /var/www/html/auth/oidc \
 && curl -fsSL \
      "https://github.com/microsoft/o365-moodle/archive/refs/heads/${MOODLE_OIDC_PLUGIN_REF}.tar.gz" \
    | tar -xz --strip-components=3 -C /var/www/html/auth/oidc \
      "o365-moodle-${MOODLE_OIDC_PLUGIN_REF}/auth/oidc" \
 && chown -R www-data:www-data /var/www/html/auth/oidc

# ── Moodle data directory ─────────────────────────────────────
RUN mkdir -p /var/moodledata \
 && chown -R www-data:www-data /var/moodledata \
 && chmod 777 /var/moodledata

# ── Apache: run on port 8080 (matches Caddy upstream) ─────────
RUN sed -i 's/Listen 80$/Listen 8080/' /etc/apache2/ports.conf \
 && a2enmod rewrite

COPY apache-moodle.conf /etc/apache2/sites-enabled/000-default.conf

# ── Entrypoint: first-run CLI install + sslproxy config ───────
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY configure-oidc.php /usr/local/bin/configure-oidc.php
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
