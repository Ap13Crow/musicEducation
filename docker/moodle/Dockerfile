# ── Moodle LMS ───────────────────────────────────────────────
# Official Moodle HQ image (moodlehq/moodle-php-apache) replaces
# the Bitnami image, which was removed from Docker Hub in 2025.
# PHP 8.2 + Apache with all required Moodle extensions pre-installed.
# Moodle source is downloaded at build time; first-run installation
# is handled by the entrypoint via the Moodle CLI installer.

FROM moodlehq/moodle-php-apache:8.2-bullseye

ARG MOODLE_VERSION=4.4.4

LABEL maintainer="My Music Coach"
LABEL description="Moodle LMS for My Music Coach – online learning core"

# ── Download Moodle ───────────────────────────────────────────
RUN curl -fsSL \
      "https://download.moodle.org/download.php/direct/stable404/moodle-${MOODLE_VERSION}.tgz" \
    | tar -xz --strip-components=1 -C /var/www/html \
 && chown -R www-data:www-data /var/www/html

# ── Moodle data directory ─────────────────────────────────────
RUN mkdir -p /var/moodledata \
 && chown -R www-data:www-data /var/moodledata \
 && chmod 777 /var/moodledata

# ── Apache: run on port 8080 (matches Caddy upstream) ─────────
RUN sed -i 's/Listen 80$/Listen 8080/' /etc/apache2/ports.conf \
 && a2enmod rewrite

COPY apache-moodle.conf /etc/apache2/sites-enabled/000-default.conf

# ── Entrypoint: first-run CLI install + web-service setup ─────
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY setup-webservice.php /usr/local/bin/moodle-setup-webservice.php
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
