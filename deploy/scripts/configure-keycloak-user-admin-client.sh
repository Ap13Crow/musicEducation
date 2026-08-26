#!/usr/bin/env bash
set -euo pipefail
set +x

NAMESPACE="${NAMESPACE:-mymusic-coach}"
REALM="${REALM:-mymusic-coach}"
SECRET_NAME="${SECRET_NAME:-keycloak-user-admin-client}"
CLIENT_ID="${CLIENT_ID:-mymusic-coach-user-admin}"

existing_secret="$({
  kubectl -n "$NAMESPACE" get secret "$SECRET_NAME" -o 'jsonpath={.data.CLIENT_SECRET}' 2>/dev/null || true
} | base64 -d 2>/dev/null || true)"
client_secret="${existing_secret:-$(openssl rand -base64 48 | tr -d '\n')}"
test -n "$client_secret"

kubectl -n "$NAMESPACE" create secret generic "$SECRET_NAME" \
  --from-literal=CLIENT_ID="$CLIENT_ID" \
  --from-literal=CLIENT_SECRET="$client_secret" \
  --dry-run=client -o yaml | kubectl apply -f - >/dev/null

admin_username="$(kubectl -n "$NAMESPACE" get secret keycloak-initial-admin -o 'jsonpath={.data.username}' | base64 -d)"
admin_password="$(kubectl -n "$NAMESPACE" get secret keycloak-initial-admin -o 'jsonpath={.data.password}' | base64 -d)"
test -n "$admin_username" && test -n "$admin_password"

keycloak_pod="$(
  kubectl -n "$NAMESPACE" get pods -l app=keycloak -o json |
    jq -r '.items[] | select(.status.phase == "Running" and any(.status.containerStatuses[]?; .ready)) | .metadata.name' |
    head -n 1
)"
test -n "$keycloak_pod"

run_id="${GITHUB_RUN_ID:-$$}"
admin_config="/tmp/kcadm-user-admin-bootstrap-$run_id.config"
service_config="/tmp/kcadm-user-admin-verify-$run_id.config"
client_json="/tmp/user-admin-client-$run_id.json"

cleanup() {
  kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
    rm -f "$admin_config" "$service_config" "$client_json" >/dev/null 2>&1 || true
  unset admin_password client_secret existing_secret client_payload
}
trap cleanup EXIT

kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
  /opt/keycloak/bin/kcadm.sh config credentials \
  --config "$admin_config" \
  --server http://127.0.0.1:8080 \
  --realm master \
  --user "$admin_username" \
  --password "$admin_password" >/dev/null

client_payload="$(jq -n --arg client_id "$CLIENT_ID" --arg secret "$client_secret" '{
  clientId: $client_id,
  name: "MyMusic.Coach user administration",
  description: "Realm-scoped service account for application user deletion and reconciliation",
  protocol: "openid-connect",
  enabled: true,
  publicClient: false,
  bearerOnly: false,
  standardFlowEnabled: false,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: true,
  secret: $secret
}')"
kubectl -n "$NAMESPACE" exec -i "$keycloak_pod" -- \
  sh -c "umask 077 && cat > '$client_json'" <<<"$client_payload"

clients_json="$(kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
  /opt/keycloak/bin/kcadm.sh get clients --config "$admin_config" -r "$REALM" \
  -q "clientId=$CLIENT_ID" --fields id,clientId)"
client_uuid="$(jq -er --arg client_id "$CLIENT_ID" '
  [.[] | select(.clientId == $client_id)] |
  if length == 0 then empty
  elif length == 1 then .[0].id
  else error("Duplicate Keycloak user-admin clients") end
' <<<"$clients_json" || true)"

if [[ -z "$client_uuid" ]]; then
  kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
    /opt/keycloak/bin/kcadm.sh create clients --config "$admin_config" -r "$REALM" \
    -f "$client_json" >/dev/null
  clients_json="$(kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
    /opt/keycloak/bin/kcadm.sh get clients --config "$admin_config" -r "$REALM" \
    -q "clientId=$CLIENT_ID" --fields id,clientId)"
  client_uuid="$(jq -er --arg client_id "$CLIENT_ID" '
    [.[] | select(.clientId == $client_id)] |
    if length == 1 then .[0].id else error("Expected exactly one Keycloak user-admin client") end
  ' <<<"$clients_json")"
else
  kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
    /opt/keycloak/bin/kcadm.sh update "clients/$client_uuid" --config "$admin_config" -r "$REALM" \
    -f "$client_json" >/dev/null
fi

service_user_id="$(kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
  /opt/keycloak/bin/kcadm.sh get "clients/$client_uuid/service-account-user" \
  --config "$admin_config" -r "$REALM" --fields id | jq -er '.id')"
realm_management_uuid="$(kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
  /opt/keycloak/bin/kcadm.sh get clients --config "$admin_config" -r "$REALM" \
  -q clientId=realm-management --fields id,clientId |
  jq -er '[.[] | select(.clientId == "realm-management")] | if length == 1 then .[0].id else error("realm-management client missing") end')"

assigned_roles="$(kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
  /opt/keycloak/bin/kcadm.sh get \
  "users/$service_user_id/role-mappings/clients/$realm_management_uuid" \
  --config "$admin_config" -r "$REALM")"
for role in query-users view-users manage-users; do
  if ! jq -e --arg role "$role" 'any(.name == $role)' <<<"$assigned_roles" >/dev/null; then
    kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
      /opt/keycloak/bin/kcadm.sh add-roles --config "$admin_config" -r "$REALM" \
      --uid "$service_user_id" --cclientid realm-management --rolename "$role" >/dev/null
  fi
done

# Prove the scoped credential itself can authenticate and list users before
# the application rollout consumes it. No secret values or realm users are
# printed.
kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
  /opt/keycloak/bin/kcadm.sh config credentials \
  --config "$service_config" \
  --server http://127.0.0.1:8080 \
  --realm "$REALM" \
  --client "$CLIENT_ID" \
  --secret "$client_secret" >/dev/null
kubectl -n "$NAMESPACE" exec "$keycloak_pod" -- \
  /opt/keycloak/bin/kcadm.sh get users --config "$service_config" -r "$REALM" \
  -q max=1 --fields id >/dev/null

echo 'Keycloak realm-scoped user-administration client is configured.'
