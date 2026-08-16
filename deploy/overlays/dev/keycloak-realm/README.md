# Development realm bootstrap

This target creates the `mymusic-coach` realm once through the official
Keycloak Realm Import controller. It is intentionally not included by the
regular Keycloak overlay.

The protected workflow:

1. proves the realm is absent;
2. creates or reuses Kubernetes Secret `keycloak-client-secrets`;
3. applies this target and waits for the import condition `Done`;
4. verifies internal OIDC discovery; and
5. deletes the import resource to clean up its Job and Pod.

The manifest contains only the placeholder `${WEB_CLIENT_SECRET}`. The actual
client secret exists only in Kubernetes and Keycloak.

Render without applying:

```bash
kubectl kustomize deploy/overlays/dev/keycloak-realm
```
