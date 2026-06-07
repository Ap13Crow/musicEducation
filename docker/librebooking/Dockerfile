# ── LibreBooking ─────────────────────────────────────────────
# Physical lesson scheduling – room & resource management.
# Based on the community LibreBooking image with pinned version.

FROM ghcr.io/librebooking/librebooking:2.8.6

LABEL maintainer="MusicEdu Platform"
LABEL description="LibreBooking for MusicEdu – physical lesson scheduling"

# Copy entrypoint that generates config.php from environment variables
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["apache2-foreground"]
