#!/usr/bin/env bash
#
# scripts/diagnose.sh — machine-readable health probe for the My Music Coach platform.
#
# Probes every public hostname (or local override) and exits non-zero if any required
# dependency is unhealthy. Intended for use in CI smoke jobs and the production runbook.
#
# Usage:
#   scripts/diagnose.sh                 # probe production *.mymusic.coach hosts
#   BASE_DOMAIN=local.mymusic.coach scripts/diagnose.sh
#   APP_URL=http://localhost:3000 API_URL=http://localhost:4000 scripts/diagnose.sh
#   FORMAT=json scripts/diagnose.sh     # emit a JSON summary on stdout
#
# Environment overrides (any unset value falls back to https://<svc>.$BASE_DOMAIN):
#   BASE_DOMAIN  default domain suffix (default: mymusic.coach)
#   APP_URL, API_URL, AUTH_URL, LEARN_URL, BOOKING_URL, TICKETS_URL
#   KEYCLOAK_REALM  Keycloak realm name (default: mymusic-coach)
#   TIMEOUT      per-request timeout in seconds (default: 10)
#   FORMAT       "text" (default) or "json"
#
# Exit codes:
#   0  all required checks healthy
#   1  one or more required checks failed
#   2  curl is not available
#
set -u

command -v curl >/dev/null 2>&1 || { echo "FATAL: curl not found" >&2; exit 2; }

BASE_DOMAIN="${BASE_DOMAIN:-mymusic.coach}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-mymusic-coach}"
TIMEOUT="${TIMEOUT:-10}"
FORMAT="${FORMAT:-text}"

APP_URL="${APP_URL:-https://app.${BASE_DOMAIN}}"
API_URL="${API_URL:-https://api.${BASE_DOMAIN}}"
AUTH_URL="${AUTH_URL:-https://auth.${BASE_DOMAIN}}"
LEARN_URL="${LEARN_URL:-https://learn.${BASE_DOMAIN}}"
BOOKING_URL="${BOOKING_URL:-https://booking.${BASE_DOMAIN}}"
TICKETS_URL="${TICKETS_URL:-https://tickets.${BASE_DOMAIN}}"

FAILURES=0
JSON_ENTRIES=()

# check NAME URL EXPECTED_CODES REQUIRED
#   EXPECTED_CODES: space-separated list of acceptable HTTP status codes
#   REQUIRED: "required" (failure -> non-zero exit) or "optional"
check() {
  local name="$1" url="$2" expected="$3" required="$4"
  local code time out
  # %{http_code} and %{time_total}; -L follows redirects, -o discards body.
  # curl prints the -w line even on connection failure; default to "000 0" if empty.
  out="$(curl -sS -L -m "$TIMEOUT" -o /dev/null \
    -w '%{http_code} %{time_total}' "$url" 2>/dev/null)"
  out="${out:-000 0}"
  code="${out%% *}"
  time="${out##* }"

  local ok="no"
  for c in $expected; do
    [ "$code" = "$c" ] && ok="yes" && break
  done

  local status_word
  if [ "$ok" = "yes" ]; then
    status_word="OK"
  elif [ "$required" = "required" ]; then
    status_word="FAIL"
    FAILURES=$((FAILURES + 1))
  else
    status_word="WARN"
  fi

  if [ "$FORMAT" = "json" ]; then
    JSON_ENTRIES+=("{\"name\":\"$name\",\"url\":\"$url\",\"http_code\":\"$code\",\"time_s\":\"$time\",\"required\":\"$required\",\"status\":\"$status_word\"}")
  else
    printf '%-5s %-22s %-4s %6ss  %s\n' "$status_word" "$name" "$code" "$time" "$url"
  fi
}

[ "$FORMAT" = "text" ] && printf '%-5s %-22s %-4s %7s  %s\n' "STATE" "SERVICE" "CODE" "TIME" "URL"

check "web"        "$APP_URL"                                                                      "200 301 302 304" required
check "api-health" "$API_URL/health"                                                               "200"             required
check "keycloak-oidc" "$AUTH_URL/realms/$KEYCLOAK_REALM/.well-known/openid-configuration"          "200"             required
check "keycloak-jwks" "$AUTH_URL/realms/$KEYCLOAK_REALM/protocol/openid-connect/certs"             "200"             required
check "moodle"     "$LEARN_URL"                                                                     "200 301 302 303" optional
check "librebooking" "$BOOKING_URL"                                                                 "200 301 302 303" optional
check "pretix"     "$TICKETS_URL"                                                                    "200 301 302 303" optional

if [ "$FORMAT" = "json" ]; then
  printf '{"failures":%d,"checks":[%s]}\n' "$FAILURES" "$(IFS=,; echo "${JSON_ENTRIES[*]}")"
else
  echo
  if [ "$FAILURES" -eq 0 ]; then
    echo "All required dependencies healthy."
  else
    echo "$FAILURES required dependency check(s) failed."
  fi
fi

[ "$FAILURES" -eq 0 ]
