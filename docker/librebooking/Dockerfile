# ── LibreBooking ─────────────────────────────────────────────
# Physical lesson scheduling – room & resource management.
# Based on the community LibreBooking image with pinned version.

FROM docker.io/librebooking/librebooking:5.0.3-3.3.6

LABEL maintainer="MusicEdu Platform"
LABEL description="LibreBooking for MusicEdu – physical lesson scheduling"

# Copy entrypoint that generates config.php from environment variables.
# --chmod=755 sets the bit at COPY time, avoiding a separate RUN as non-root.
COPY --chmod=755 docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["apache2-foreground"]
