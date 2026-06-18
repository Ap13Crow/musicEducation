#!/bin/bash
# Run this once on the production server to remove PKCE from SSO clients
# that do not support it (LibreBooking, Pretix) and disable browser login
# for the headless Moodle client.
#
# Usage (from the repo root):
#   docker compose exec keycloak bash /opt/keycloak/fix-sso-clients.sh
#
# Or copy it into the container first:
#   docker cp docker/keycloak/fix-sso-clients.sh mymusic_coach_keycloak:/opt/keycloak/
#   docker exec mymusic_coach_keycloak bash /opt/keycloak/fix-sso-clients.sh
set -euo pipefail

KCADM=/opt/keycloak/bin/kcadm.sh
REALM=mymusic-coach
KC_SERVER=http://localhost:8080

echo "[kcadm] Authenticating as admin..."
$KCADM config credentials \
  --server  "$KC_SERVER" \
  --realm   master \
  --user    "${KEYCLOAK_ADMIN}" \
  --password "${KEYCLOAK_ADMIN_PASSWORD}"

get_client_uuid() {
  local clientId="$1"
  $KCADM get clients -r "$REALM" --fields id,clientId 2>/dev/null \
    | grep -A1 "\"clientId\" : \"${clientId}\"" \
    | grep '"id"' \
    | sed 's/.*"id" : "\([^"]*\)".*/\1/'
}

# ── pretix-oidc: remove PKCE (pretix social auth does not send code_challenge) ─
PRETIX_UUID=$(get_client_uuid pretix-oidc)
if [ -n "$PRETIX_UUID" ]; then
  $KCADM update "clients/$PRETIX_UUID" -r "$REALM" \
    -s 'attributes.pkce\.code\.challenge\.method='
  echo "[kcadm] pretix-oidc: PKCE removed."
else
  echo "[kcadm] pretix-oidc: client not found — skipping."
fi

# ── librebooking-saml: remove PKCE (LibreBooking does not send code_challenge) ─
LB_UUID=$(get_client_uuid librebooking-saml)
if [ -n "$LB_UUID" ]; then
  $KCADM update "clients/$LB_UUID" -r "$REALM" \
    -s 'attributes.pkce\.code\.challenge\.method='
  echo "[kcadm] librebooking-saml: PKCE removed."
else
  echo "[kcadm] librebooking-saml: client not found — skipping."
fi

# ── moodle-oidc: disable standard (browser) flow — Moodle is headless ──────────
MOODLE_UUID=$(get_client_uuid moodle-oidc)
if [ -n "$MOODLE_UUID" ]; then
  $KCADM update "clients/$MOODLE_UUID" -r "$REALM" \
    -s standardFlowEnabled=false \
    -s 'attributes.pkce\.code\.challenge\.method='
  echo "[kcadm] moodle-oidc: standardFlow disabled, PKCE removed."
else
  echo "[kcadm] moodle-oidc: client not found — skipping."
fi

echo "[kcadm] Done. Verify at https://auth.mymusic.coach/admin/master/console/#/mymusic-coach/clients"
