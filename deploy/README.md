# Kubernetes architecture scaffold

This directory is the provider-neutral Kustomize home for the MyMusic.Coach rebuild. The foundation development overlay renders only the namespace; database credentials, the provider CA, and the Cloudflare Tunnel token are synchronized at deployment time and are never committed. Keycloak and its one-time development realm bootstrap are separate, opt-in overlays so the foundation workflow cannot deploy persistent identity resources as a side effect.

The older `k8s/deployment.yaml` is a legacy reference. It assumes nginx ingress, cert-manager, Redis, in-cluster PostgreSQL, HPAs, and mutable image tags; it must not be used as the target cluster definition.

## Current structure

```text
deploy/
  base/
    namespace.yaml
    kustomization.yaml
  operators/
    keycloak/
      kustomization.yaml
  workloads/
    keycloak/
      keycloak.yaml
      kustomization.yaml
  overlays/
    dev/
      kustomization.yaml
      keycloak/
        kustomization.yaml
      keycloak-realm/
        realm-import.yaml
        kustomization.yaml
    prod/
      kustomization.yaml
  platform/
    cloudflare-tunnel/
      deployment.yaml
      service-account.yaml
      kustomization.yaml
  tests/
    postgres/
      mymusiccoach-job.yaml
      keycloak-job.yaml
      kustomization.yaml
  scripts/
    README.md
```

The PostgreSQL Jobs are one-shot probes. They verify TLS, connectivity, database identity, and schema-creation permission, then roll back their test transaction. They depend on runtime-created `postgres-ca`, `postgres-mymusiccoach`, and `postgres-keycloak` objects.

The Cloudflare Tunnel is a separate platform target so it can be deployed independently after its token exists. It creates one outbound-only `cloudflared` replica for development and no public Kubernetes Service, Ingress, or LoadBalancer.

The official Keycloak Operator is pinned to `26.7.0`. The Keycloak workload uses the existing `postgres-keycloak` Secret and `postgres-ca` ConfigMap, enables PostgreSQL server verification, and exposes only an internal `ClusterIP` Service. The development overlay adds a one-time, resource-bounded realm import. Cloudflare reaches the Service through the outbound tunnel; no ingress controller or public load balancer is created.

## Target topology

- One replica each of `web`, `api`, and `worker` for development.
- Keycloak managed through the pinned official operator, starting with one development replica behind a `ClusterIP`.
- One `cloudflared` Deployment reaching internal `ClusterIP` Services; no initial Caddy, public LoadBalancer, or ingress controller.
- Managed PostgreSQL and S3-compatible object storage preferred. An in-cluster database is a learning-only component, not a production default.
- GitHub Environment secrets for the development phase, with an external secret-management path considered before production. Secret manifests remain uncommitted.
- Immutable image tags or digests. Never use `latest` in target manifests.

The database foundation workflow is documented in `docs/deployment.md`. Cloudflare setup and routing are documented in `docs/cloudflare-tunnel.md`. Rendering does not authorize deployment.
