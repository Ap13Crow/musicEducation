# Keycloak operator

This Kustomization installs the official Keycloak Operator `26.7.0` into the
`mymusic-coach` namespace. The version is pinned because an operator upgrade
can also upgrade Keycloak and its database schema.

Render it without contacting a cluster:

```bash
kubectl kustomize deploy/operators/keycloak
```

The namespace and runtime database objects must already exist. The protected
development workflow installs the operator, waits for its Deployment, and only
then applies the Keycloak custom resource.
