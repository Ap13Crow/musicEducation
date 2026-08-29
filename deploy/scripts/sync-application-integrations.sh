#!/usr/bin/env bash
set -euo pipefail
set +x

NAMESPACE="${NAMESPACE:-mymusic-coach}"
SECRET_NAME="${SECRET_NAME:-application-integrations}"

existing_json="$(kubectl -n "$NAMESPACE" get secret "$SECRET_NAME" -o json 2>/dev/null || echo '{}')"

existing_value() {
  local encoded
  encoded="$(jq -r --arg key "$1" '.data[$key] // empty' <<<"$existing_json")"
  if [[ -n "$encoded" ]]; then
    base64 -d <<<"$encoded"
  fi
}

effective_value() {
  local variable_name="$1"
  local current_value="${!variable_name:-}"
  if [[ -n "$current_value" ]]; then
    printf '%s' "$current_value"
  else
    existing_value "$variable_name"
  fi
}

stripe_secret_key="$(effective_value STRIPE_SECRET_KEY)"
stripe_webhook_secret="$(effective_value STRIPE_WEBHOOK_SECRET)"
stripe_webhook_secret_v2="$(effective_value STRIPE_WEBHOOK_SECRET_V2)"
ticketmaster_api_key="$(effective_value TICKETMASTER_API_KEY)"
classictic_api_token="$(effective_value CLASSICTIC_API_TOKEN)"
classictic_affiliate_id="$(effective_value CLASSICTIC_AFFILIATE_ID)"
deepseek_api_key="$(effective_value DEEPSEEK_API_KEY)"
deepseek_api_url="$(effective_value DEEPSEEK_API_URL)"
openai_api_key="$(effective_value OPENAI_API_KEY)"
s3_endpoint="$(effective_value S3_ENDPOINT)"
s3_region="$(effective_value S3_REGION)"
s3_bucket="$(effective_value S3_BUCKET)"
s3_access_key_id="$(effective_value S3_ACCESS_KEY_ID)"
s3_secret_access_key="$(effective_value S3_SECRET_ACCESS_KEY)"
smtp_password="$(effective_value SMTP_PASSWORD)"

args=()
if [[ -n "$stripe_secret_key" && -n "$stripe_webhook_secret" ]]; then
  args+=(--from-literal=STRIPE_SECRET_KEY="$stripe_secret_key")
  args+=(--from-literal=STRIPE_WEBHOOK_SECRET="$stripe_webhook_secret")
  echo 'Stripe credentials configured.'
fi
if [[ -n "$stripe_secret_key" && -n "$stripe_webhook_secret_v2" ]]; then
  args+=(--from-literal=STRIPE_WEBHOOK_SECRET_V2="$stripe_webhook_secret_v2")
  echo 'Stripe Connect v2 webhook configured.'
fi
if [[ -n "$ticketmaster_api_key" ]]; then
  args+=(--from-literal=TICKETMASTER_API_KEY="$ticketmaster_api_key")
  echo 'Ticketmaster configured.'
fi
if [[ -n "$classictic_api_token" ]]; then
  args+=(--from-literal=CLASSICTIC_API_TOKEN="$classictic_api_token")
  echo 'Classictic API token configured.'
fi
if [[ -n "$classictic_affiliate_id" ]]; then
  args+=(--from-literal=CLASSICTIC_AFFILIATE_ID="$classictic_affiliate_id")
  echo 'Legacy Classictic affiliate widget configured.'
fi
if [[ -n "$deepseek_api_key" ]]; then
  args+=(--from-literal=DEEPSEEK_API_KEY="$deepseek_api_key")
  [[ -n "$deepseek_api_url" ]] && args+=(--from-literal=DEEPSEEK_API_URL="$deepseek_api_url")
  echo 'DeepSeek configured.'
fi
if [[ -n "$openai_api_key" ]]; then
  args+=(--from-literal=OPENAI_API_KEY="$openai_api_key")
  echo 'OpenAI configured.'
fi
if [[ -n "$s3_endpoint" && -n "$s3_bucket" && -n "$s3_access_key_id" && -n "$s3_secret_access_key" ]]; then
  args+=(--from-literal=S3_ENDPOINT="$s3_endpoint")
  args+=(--from-literal=S3_BUCKET="$s3_bucket")
  args+=(--from-literal=S3_ACCESS_KEY_ID="$s3_access_key_id")
  args+=(--from-literal=S3_SECRET_ACCESS_KEY="$s3_secret_access_key")
  [[ -n "$s3_region" ]] && args+=(--from-literal=S3_REGION="$s3_region")
  echo 'S3-compatible object storage configured.'
fi
if [[ -n "$smtp_password" ]]; then
  args+=(--from-literal=SMTP_HOST=smtp-relay.gmail.com)
  args+=(--from-literal=SMTP_PORT=587)
  args+=(--from-literal=SMTP_USER=camille@mymusic.coach)
  args+=(--from-literal=SMTP_FROM=camille@mymusic.coach)
  args+=(--from-literal=SMTP_FROM_NAME=MyMusic.Coach)
  args+=(--from-literal=SMTP_PASSWORD="$smtp_password")
  echo 'Google Workspace SMTP relay configured.'
fi

if [[ ${#args[@]} -eq 0 ]]; then
  echo "No integration values are configured; preserving any existing $SECRET_NAME Secret."
  exit 0
fi

kubectl -n "$NAMESPACE" create secret generic "$SECRET_NAME" \
  "${args[@]}" \
  --dry-run=client -o yaml | kubectl apply -f -

unset existing_json stripe_secret_key stripe_webhook_secret stripe_webhook_secret_v2
unset ticketmaster_api_key classictic_api_token classictic_affiliate_id deepseek_api_key deepseek_api_url
unset openai_api_key s3_endpoint s3_region s3_bucket s3_access_key_id
unset s3_secret_access_key smtp_password args
echo "Synchronized $SECRET_NAME without printing secret values."
