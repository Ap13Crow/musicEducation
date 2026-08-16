# Kubernetes architecture scaffold

This directory is the provider-neutral Kustomize home for the MyMusic.Coach rebuild. It is intentionally a bootstrap: the committed overlays currently render only the namespace and do not deploy application workloads.

The older `k8s/deployment.yaml` is a legacy reference. It assumes nginx ingress, cert-manager, Redis, in-cluster PostgreSQL, HPAs, and mutable image tags; it must not be used as the target cluster definition.

## Proposed structure

```text
deploy/
  base/
    namespace.yaml
    web-deployment.yaml
    web-service.yaml
    api-deployment.yaml
    api-service.yaml
    worker-deployment.yaml
    keycloak.yaml
    cloudflared-deployment.yaml
    network-policies.yaml
    service-account.yaml
    kustomization.yaml
  overlays/
    dev/
      kustomization.yaml
      patches.yaml
    prod/
      kustomization.yaml
      patches.yaml
  scripts/
    create-dev-secrets.sh
```

The namespace is the only Kubernetes resource in the bootstrap commit. Add each workload in a dedicated, reviewable infrastructure change after its image, health checks, resources, configuration contract, and secret source have been agreed.

## Target topology

- One replica each of `web`, `api`, and `worker` for development.
- Keycloak from the beginning, preferably managed through the official operator.
- One `cloudflared` Deployment reaching internal `ClusterIP` Services; no initial Caddy, public LoadBalancer, or ingress controller.
- Managed PostgreSQL and S3-compatible object storage preferred. An in-cluster database is a learning-only component, not a production default.
- Secrets created from local ignored files for early labs, then GitHub Environment secrets or an approved external secret-management path. Secret manifests remain uncommitted.
- Immutable image tags or digests. Never use `latest` in target manifests.

Render checks are documented in `docs/development.md`. Rendering does not authorize deployment.
