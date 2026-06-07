# ── Moodle LMS ───────────────────────────────────────────────
# Based on the official Bitnami Moodle image with pinned version.
# OIDC auth plugin is pre-installed so Keycloak SSO works at first boot.

FROM docker.io/bitnami/moodle:4.4.1

LABEL maintainer="MusicEdu Platform"
LABEL description="Moodle LMS for MusicEdu – online learning core"

# The Bitnami image handles config generation from env vars
# at container start. Custom config is injected via environment
# variables passed in docker-compose.yml.

EXPOSE 8080 8443
