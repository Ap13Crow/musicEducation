# ── pretix ───────────────────────────────────────────────────
# Event ticketing core for MusicEdu.
# Pinned to a stable release; pretix.cfg is mounted at runtime.

FROM pretix/standalone:2024.7.0

LABEL maintainer="MusicEdu Platform"
LABEL description="pretix for MusicEdu – event ticketing core"

# Copy entrypoint that generates pretix.cfg from env-driven template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8345

ENTRYPOINT ["/docker-entrypoint.sh"]
