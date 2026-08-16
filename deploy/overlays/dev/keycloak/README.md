# Development Keycloak overlay

This overlay configures the provider-neutral Keycloak workload for the
development cluster. It is separate from the foundation so rerunning the
PostgreSQL smoke-test workflow cannot create or update Keycloak as a side
effect.

The Keycloak workload is rendered with:

```bash
kubectl kustomize deploy/overlays/dev/keycloak
```

The one-time realm bootstrap is a separate target because its
`KeycloakRealmImport` resource creates a Job and must only be applied after
Keycloak and the runtime OIDC client Secret are ready:

```bash
kubectl kustomize deploy/overlays/dev/keycloak-realm
```
