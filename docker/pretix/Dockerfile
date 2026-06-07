# ── pretix ───────────────────────────────────────────────────
# Event ticketing core for MusicEdu.
# Pinned to a stable release; pretix.cfg is mounted at runtime.

FROM pretix/standalone:2024.7.0

LABEL maintainer="MusicEdu Platform"
LABEL description="pretix for MusicEdu – event ticketing core"

# Copy entrypoint that generates pretix.cfg from env-driven template.
# --chmod=755 sets the bit at COPY time (build runs as root), avoiding
# a separate RUN chmod which fails when the image user is non-root.
COPY --chmod=755 docker-entrypoint.sh /docker-entrypoint.sh

# Pre-create config dir owned by pretixuser so the entrypoint can write pretix.cfg
USER root
RUN install -d -o 15371 -g 15371 -m 755 /etc/pretix
USER 15371

EXPOSE 8345

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["all"]
