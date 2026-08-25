# Hardened single-node k3s host

This directory bootstraps the Ubuntu 24.04 `acloud6` host for the
MyMusic.Coach production-domain deployment. It intentionally keeps the
Kubernetes API behind the host firewall, disables Traefik and ServiceLB, and
uses Cloudflare Tunnel as the only application ingress path.

The configuration is CIS-aligned rather than a claim of formal certification:
secrets are encrypted at rest, embedded etcd is snapshotted every six hours,
API metadata is audited, EventRateLimit and Pod Security Admission are enabled,
and kubelet/kernel safety settings are explicit. Pod Security is enforced at
`baseline` while violations of `restricted` are audited and warned; the
third-party Keycloak Operator does not currently declare every field required
by a cluster-wide `restricted` policy.

## Install without rebooting

From a clean checkout on the server:

```bash
sudo bash deploy/host/k3s/bootstrap.sh
```

The script does not reboot, reset UFW, remove Docker, or expose port 6443. It
adds only the pod and service CIDR rules required by k3s while preserving the
existing SSH access rule.

After installation, verify:

```bash
sudo k3s kubectl get nodes -o wide
sudo k3s kubectl get pods -A
sudo k3s secrets-encrypt status
sudo k3s etcd-snapshot ls
sudo ss -lntp | grep 6443
sudo ufw status verbose
```

The host remains a single failure domain. Local etcd and PostgreSQL backups
protect against operator mistakes but not physical disk loss; configure an
encrypted off-host copy before storing real customer data.
