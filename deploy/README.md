# Kubernetes architecture

`deploy/` is the Kustomize source of truth for MyMusic.Coach. The production
target is a hardened single-node k3s host reached only through an outbound
Cloudflare Tunnel. The older Docker Compose files and `k8s/deployment.yaml` are
legacy references and must not be deployed.

## Layout

```text
deploy/
  base/                         namespace only
  host/k3s/                     pinned, no-reboot host bootstrap
  operators/keycloak/           pinned official Keycloak Operator
  platform/
    cloudflare-tunnel/           outbound connector
    namespace-policy/            default-deny ingress and resource budgets
    postgres/                    local TLS PostgreSQL and daily backups
  workloads/
    application/                 web, API, worker, Services and policies
    application-database/        ordered schema Job
    keycloak/                    internal Keycloak CR
  overlays/
    dev/                         DOKS migration reference
    prod/                        mymusic.coach k3s targets
```

Runtime Secrets are synchronized by GitHub Actions. No Secret manifest, token,
password, or private key belongs in Git. Production images use immutable commit
tags; the `bootstrap` image names in the production application overlay are
render-time placeholders replaced by the deployment workflow.

## Production topology

- One `web`, `api`, and `worker` replica.
- One local PostgreSQL StatefulSet with TLS, a 50 GiB local-path volume, and
  daily logical backups to a separate 20 GiB local-path volume.
- One Keycloak instance managed by the pinned `26.7.0` operator.
- Two `cloudflared` connector Pods and no ingress controller, LoadBalancer,
  NodePort, Caddy, or public Kubernetes API.
- Namespace default-deny ingress plus explicit web, API, Keycloak, and
  PostgreSQL policies.
- Pod Security `baseline` enforcement with `restricted` audit/warnings because
  the third-party Keycloak Operator is not yet fully restricted-profile clean.

The workflow `.github/workflows/deploy-k3s-production.yml` validates on pull
requests, builds images on GitHub-hosted runners, and performs manual
reconciliation on the restricted `mymusiccoach-prod` runner. See
`docs/production-runbook.md` for the exact bootstrap and cutover sequence.
