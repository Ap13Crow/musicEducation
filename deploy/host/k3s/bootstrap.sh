#!/usr/bin/env bash
set -euo pipefail

K3S_VERSION="v1.36.3+k3s1"
POD_CIDR="10.42.0.0/16"
SERVICE_CIDR="10.43.0.0/16"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root." >&2
  exit 1
fi

if [[ "$(uname -m)" != "x86_64" ]]; then
  echo "This reviewed bootstrap currently targets the x86_64 production host." >&2
  exit 1
fi

if [[ -e /etc/systemd/system/k3s.service || -x /usr/local/bin/k3s ]]; then
  echo "K3s is already installed; refusing to overwrite an existing cluster." >&2
  exit 1
fi

for file in config.yaml psa.yaml eventconfig.yaml audit.yaml; do
  test -f "$SCRIPT_DIR/$file" || {
    echo "Missing $SCRIPT_DIR/$file. Run this script from a complete repository checkout." >&2
    exit 1
  }
done

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends ca-certificates curl jq openssl

getent group k3s-deployer >/dev/null || groupadd --system k3s-deployer

install -d -m 0755 /etc/rancher/k3s
install -d -m 0700 /var/lib/rancher/k3s/server/logs
install -m 0640 -o root -g root "$SCRIPT_DIR/config.yaml" /etc/rancher/k3s/config.yaml
install -m 0600 -o root -g root "$SCRIPT_DIR/psa.yaml" /var/lib/rancher/k3s/server/psa.yaml
install -m 0600 -o root -g root "$SCRIPT_DIR/eventconfig.yaml" /var/lib/rancher/k3s/server/eventconfig.yaml
install -m 0600 -o root -g root "$SCRIPT_DIR/audit.yaml" /var/lib/rancher/k3s/server/audit.yaml

cat >/etc/sysctl.d/90-kubelet.conf <<'EOF'
vm.panic_on_oom=0
vm.overcommit_memory=1
kernel.panic=10
kernel.panic_on_oops=1
EOF
sysctl -p /etc/sysctl.d/90-kubelet.conf

if command -v ufw >/dev/null 2>&1 && ufw status | grep -Fq 'Status: active'; then
  # Preserve the existing SSH rule and default-deny public posture. These
  # additions only permit pod/service networking; port 6443 remains closed to
  # the public Internet and is consumed locally by the deployment runner.
  ufw allow from "$POD_CIDR" to any comment 'k3s pod network'
  ufw allow from "$SERVICE_CIDR" to any comment 'k3s service network'
  ufw route allow from "$POD_CIDR" to any comment 'k3s routed pod egress'
  ufw reload
fi

curl --proto '=https' --tlsv1.2 -sfL https://get.k3s.io \
  | INSTALL_K3S_VERSION="$K3S_VERSION" sh -

for attempt in $(seq 1 60); do
  if /usr/local/bin/k3s kubectl get node >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" -eq 60 ]]; then
    journalctl -u k3s --no-pager -n 200 >&2 || true
    echo "K3s did not become ready." >&2
    exit 1
  fi
  sleep 2
done

/usr/local/bin/k3s kubectl wait --for=condition=Ready node --all --timeout=180s
/usr/local/bin/k3s kubectl patch serviceaccount default -n default \
  --type=merge -p '{"automountServiceAccountToken":false}'
/usr/local/bin/k3s kubectl patch serviceaccount default -n kube-public \
  --type=merge -p '{"automountServiceAccountToken":false}'
/usr/local/bin/k3s kubectl patch serviceaccount default -n kube-node-lease \
  --type=merge -p '{"automountServiceAccountToken":false}'

find /var/lib/rancher/k3s/server/tls -maxdepth 1 -type f -name '*.crt' -exec chmod 0600 {} +

echo
echo "K3s $K3S_VERSION is ready. No reboot was requested or performed."
/usr/local/bin/k3s kubectl get nodes -o wide
/usr/local/bin/k3s kubectl get pods -A
