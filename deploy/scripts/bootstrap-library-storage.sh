#!/usr/bin/env bash
# One-time (idempotent) setup of the Library media store: Garage on the
# second NVMe (/data, data-vg) - see deploy/platform/library-storage.
#
#   deploy/scripts/bootstrap-library-storage.sh            # show what would happen
#   deploy/scripts/bootstrap-library-storage.sh --apply    # do it
#
# Creates /data/garage/{meta,snapshots,data} (uid 1000), the garage-secrets
# Secret (random RPC secret + admin token), the Garage StatefulSet, the
# single-node layout, the library-media bucket, and an access key stored in
# the library-media-s3 Secret for the API. Secrets are generated in place and
# never printed. Safe to re-run: every step checks before it acts.
set -euo pipefail

NS=mymusic-coach
ROOT=/data/garage
BUCKET=library-media
KEY_NAME=library-api
CAPACITY=350G
REPO=$(cd "$(dirname "$0")/../.." && pwd)
APPLY=false
[[ "${1:-}" == "--apply" ]] && APPLY=true

step() { echo "== $*"; }
run() { if $APPLY; then "$@"; else echo "   would run: $*"; fi; }
garage() { kubectl -n "$NS" exec garage-0 -- /garage -c /etc/garage/garage.toml "$@"; }

step "media directories under $ROOT (owner 1000:1000)"
for dir in meta snapshots data; do
  [[ -d "$ROOT/$dir" ]] || run mkdir -p "$ROOT/$dir"
done
run chown -R 1000:1000 "$ROOT"
run chmod 0750 "$ROOT"

step "garage-secrets Secret"
if kubectl -n "$NS" get secret garage-secrets >/dev/null 2>&1; then
  echo "   exists - kept"
elif $APPLY; then
  kubectl -n "$NS" create secret generic garage-secrets \
    --from-literal=rpc_secret="$(openssl rand -hex 32)" \
    --from-literal=admin_token="$(openssl rand -base64 32)" >/dev/null
  echo "   created"
else
  echo "   would create (random values, never printed)"
fi

step "namespace storage quota + Garage manifests"
run kubectl apply -k "$REPO/deploy/platform/namespace-policy"
run kubectl apply -k "$REPO/deploy/platform/library-storage"
if ! $APPLY; then
  echo "   (dry run - stopping before the cluster-side Garage setup)"
  exit 0
fi
kubectl -n "$NS" rollout status statefulset/garage --timeout=300s

step "single-node layout ($CAPACITY)"
if garage layout show 2>/dev/null | grep -q "dc1"; then
  echo "   already applied"
else
  node=$(garage status 2>/dev/null | grep -oE '^[0-9a-f]{16}' | head -1)
  [[ -n "$node" ]] || { echo "   could not read the Garage node id" >&2; exit 1; }
  garage layout assign -z dc1 -c "$CAPACITY" "$node" >/dev/null
  garage layout apply --version 1 >/dev/null
  echo "   applied for node $node"
fi

step "bucket $BUCKET"
if garage bucket info "$BUCKET" >/dev/null 2>&1; then
  echo "   exists"
else
  garage bucket create "$BUCKET" >/dev/null
  echo "   created"
fi

step "API access key -> library-media-s3 Secret"
if kubectl -n "$NS" get secret library-media-s3 >/dev/null 2>&1; then
  echo "   exists - kept"
else
  # Garage shows a key's secret only once, at creation.
  output=$(garage key create "$KEY_NAME")
  key_id=$(awk -F': *' '/Key ID/ {print $2}' <<<"$output" | tr -d '[:space:]')
  secret=$(awk -F': *' '/Secret key/ {print $2}' <<<"$output" | tr -d '[:space:]')
  [[ -n "$key_id" && -n "$secret" ]] || { echo "   could not parse the new key" >&2; exit 1; }
  garage bucket allow --read --write --owner "$BUCKET" --key "$KEY_NAME" >/dev/null
  kubectl -n "$NS" create secret generic library-media-s3 \
    --from-literal=LIBRARY_MEDIA_S3_ENDPOINT=http://garage:3900 \
    --from-literal=LIBRARY_MEDIA_S3_REGION=garage \
    --from-literal=LIBRARY_MEDIA_S3_BUCKET="$BUCKET" \
    --from-literal=LIBRARY_MEDIA_S3_ACCESS_KEY_ID="$key_id" \
    --from-literal=LIBRARY_MEDIA_S3_SECRET_ACCESS_KEY="$secret" >/dev/null
  echo "   created key $key_id"
fi

step "done"
garage status 2>/dev/null | tail -n +1
