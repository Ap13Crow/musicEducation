#!/usr/bin/env bash
# ── Cloudflare WAF rule for Moodle Hub registration ──────────────
# Creates a targeted Configuration Rule that exempts the Moodle hub
# verification callback (/admin/registration/check.php) from Bot Fight
# Mode. Everything else stays protected.
#
# Requires:
#   CLOUDFLARE_API_TOKEN  — Zone-level token with "Zone.Firewall Services:Edit"
#   CLOUDFLARE_ZONE_ID    — Found at Cloudflare Dashboard → Zone → Overview → right sidebar
#
# Usage:
#   export CLOUDFLARE_API_TOKEN=...
#   export CLOUDFLARE_ZONE_ID=...
#   bash scripts/setup-cloudflare-waf.sh
#
# Idempotent: skips creation if a rule with the same description already exists.
set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN (Zone Firewall Services:Edit)}"
: "${CLOUDFLARE_ZONE_ID:?Set CLOUDFLARE_ZONE_ID (from Cloudflare zone Overview page)}"

CF_API="https://api.cloudflare.com/client/v4"
RULE_DESC="Allow Moodle Hub verification callback (check.php)"

echo "Checking for existing rule..."

# List existing configuration rules for the zone
EXISTING=$(curl -s -X GET \
  "${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/rulesets" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" | \
  python3 -c "
import json, sys
rulesets = json.load(sys.stdin).get('result', [])
for rs in rulesets:
    if rs.get('phase') == 'http_config_settings':
        print(rs['id'])
        break
" 2>/dev/null || true)

if [ -n "$EXISTING" ]; then
  # Check if our rule is already in the ruleset
  HAS_RULE=$(curl -s -X GET \
    "${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/rulesets/${EXISTING}" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" | \
    python3 -c "
import json, sys
rs = json.load(sys.stdin).get('result', {})
for rule in rs.get('rules', []):
    if '${RULE_DESC}' in (rule.get('description') or ''):
        print('found')
        break
" 2>/dev/null || true)

  if [ "$HAS_RULE" = "found" ]; then
    echo "Rule already exists — nothing to do."
    exit 0
  fi
fi

echo "Creating Cloudflare Configuration Rule..."

# Use the 'skip' action to bypass bot fight mode for the hub callback path only.
# The path /admin/registration/check.php is the endpoint hub.moodle.com calls
# to verify the Moodle version. It is public, returns only encrypted version
# info, and is only ever called during hub registration (rare, admin-triggered).
RESULT=$(curl -s -X POST \
  "${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/rulesets/phases/http_config_settings/entrypoint" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"rules\": [
      {
        \"description\": \"${RULE_DESC}\",
        \"expression\": \"(http.request.uri.path eq \\\"/admin/registration/check.php\\\")\",
        \"action\": \"skip\",
        \"action_parameters\": {
          \"phases\": [],
          \"products\": [\"bic\"]
        },
        \"enabled\": true
      }
    ]
  }")

SUCCESS=$(echo "$RESULT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo false)

if [ "$SUCCESS" = "True" ]; then
  echo "WAF rule created: Bot Fight Mode skipped for /admin/registration/check.php only."
  echo "All other paths remain fully protected."
else
  echo "Error creating rule. Response:"
  echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"
  exit 1
fi
