# Production runbook: single-node k3s

This runbook moves MyMusic.Coach to the Ubuntu 24.04 `acloud6` host. The target
is a hardened single-node k3s cluster, local encrypted-at-rest PostgreSQL, and
an outbound Cloudflare Tunnel. Caddy, Docker Compose, MicroK8s, Moodle,
LibreBooking, pretix, Redis, and MinIO are not part of this architecture.

The host is a single failure domain. The setup is production-oriented, but it
is not highly available. Local snapshots and database dumps do not protect
against physical disk loss; add an encrypted off-host backup before storing
customer data.

## 1. Install k3s without rebooting

Clone the merged repository on the server and run the reviewed bootstrap:

```bash
cd /data/projects
git clone https://github.com/Ap13Crow/musicEducation.git mymusiccoach
cd mymusiccoach
sudo bash deploy/host/k3s/bootstrap.sh
```

The script pins k3s, enables Kubernetes secret encryption, audit logging,
Pod Security Admission, EventRateLimit, compressed etcd snapshots, and
resource safeguards. It preserves UFW's public default-deny policy, does not
open ports 80, 443, or 6443, and does not reboot the host.

Verify the installation:

```bash
sudo k3s kubectl get nodes -o wide
sudo k3s kubectl get pods -A
sudo k3s secrets-encrypt status
sudo k3s etcd-snapshot ls
sudo ufw status verbose
```

## 2. Register the deployment runner

Use a dedicated GitHub Actions runner on `acloud6`. This runner is allowed to
deploy but is never used for pull-request builds; GitHub-hosted runners build
and publish the images.

```bash
sudo useradd --system --create-home --shell /bin/bash mymusiccoach-runner
sudo usermod -aG k3s-deployer mymusiccoach-runner
sudo install -d -o mymusiccoach-runner -g mymusiccoach-runner /opt/actions-runner
```

In GitHub, open **Settings → Actions → Runners → New self-hosted runner**.
Run the displayed Linux x64 download and registration commands from
`/opt/actions-runner` as `mymusiccoach-runner`, and add the custom label
`mymusiccoach-prod`. Then install the runner as a systemd service using the
commands displayed by GitHub.

The final runner labels must include:

- `self-hosted`
- `linux`
- `x64`
- `mymusiccoach-prod`

Confirm that the runner user can read the local kubeconfig:

```bash
sudo -u mymusiccoach-runner env KUBECONFIG=/etc/rancher/k3s/k3s.yaml kubectl get nodes
```

Protect the GitHub `development` Environment with required reviewers. The new
production workflow temporarily uses this existing Environment so its current
secret values can be reused without copying or exposing them.

## 3. Create the new Cloudflare Tunnel

Create a remotely managed tunnel for the production domain. Configure these
public hostnames in Cloudflare Zero Trust:

| Public hostname | Tunnel service |
| --- | --- |
| `mymusic.coach` | `http://web.mymusic-coach.svc.cluster.local:3000` |
| `auth.mymusic.coach` | `http://keycloak.mymusic-coach.svc.cluster.local:8080` |

Create a Cloudflare Redirect Rule from `www.mymusic.coach/*` to
`https://mymusic.coach/$1`. There is no public API hostname: browser GraphQL
requests use `/api/graphql` through the web service. Do not create an SMTP
tunnel route; application mail leaves the worker directly over TCP 587.

Replace the GitHub Environment secret `CLOUDFLARE_TUNNEL_TOKEN` with the token
for this new tunnel. All other existing integration and database secrets can
be reused unchanged.

## 4. Deploy from GitHub Actions

After this change is merged to `main`, open **Actions → Production k3s
platform → Run workflow**:

1. Run `plan` to validate all rendered manifests.
2. Run `deploy` and approve the protected Environment when prompted.
3. Run `status` after the rollout.
4. Run `diagnose` to verify workload state and SMTP TCP reachability.

The deployment creates fresh test databases, internal PostgreSQL TLS, stable
application and OIDC secrets, Keycloak, the realm, `web`, `api`, `worker`, and
two Cloudflare connector Pods. It builds immutable SHA-tagged images on a
GitHub-hosted runner and never copies secret values into the checkout.

The first deployment can pull private GHCR images with the workflow token. For
reliable pulls after future cache loss, either make the three GHCR packages
public or add a long-lived `GHCR_PULL_TOKEN` Environment secret with only
`read:packages` scope.

## 5. Acceptance checks

```bash
sudo k3s kubectl -n mymusic-coach get keycloak,statefulset,deployment,pod,pvc
curl --fail https://mymusic.coach/api/health
curl --fail https://auth.mymusic.coach/realms/mymusic-coach/.well-known/openid-configuration
nc -4 -vz smtp-relay.gmail.com 587
```

Expected public firewall state remains SSH-only. Cloudflare connectors initiate
outbound connections, so no HTTP, HTTPS, Kubernetes API, or SMTP inbound rule
is required.

## 6. Backups and recovery

k3s stores compressed etcd snapshots every six hours and keeps 28. PostgreSQL
runs a daily logical backup and keeps 14 days on a separate local PVC. Before
real customer data is accepted, copy both backup sets to encrypted off-host
storage and test restoration. Do not delete the DigitalOcean deployment until
the public health, login, booking, and mail flows all pass on k3s.
