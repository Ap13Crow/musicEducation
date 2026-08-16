# Development Keycloak overlay

This overlay currently uses the provider-neutral Keycloak workload unchanged.
It is separate from the development foundation so rerunning the PostgreSQL
smoke-test workflow cannot create or update Keycloak as a side effect.

Render only:

```bash
kubectl kustomize deploy/overlays/dev/keycloak
```
