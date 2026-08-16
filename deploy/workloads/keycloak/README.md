# Keycloak workload

This provider-neutral workload creates one operator-managed Keycloak instance.
It expects these runtime objects in `mymusic-coach`:

- Secret `postgres-keycloak` with `PGHOST`, `PGPORT`, `PGUSER`, and
  `PGPASSWORD` keys;
- ConfigMap `postgres-ca` with a PEM-encoded `ca.crt` key.

The database name is `keycloak`; the synchronized username is `keycloak_app`.
Keycloak verifies the PostgreSQL server name and certificate against the CA.

The operator creates a Service named `keycloak`. It remains a `ClusterIP`, and
the Keycloak CR explicitly disables ingress. The external hostname is fixed to
`https://auth-dev.mymusic.coach`, and Keycloak accepts Cloudflare's
`X-Forwarded-*` headers. HTTP traffic is restricted to the `cloudflared` Pod
in `mymusic-coach`; the management port remains internal. Environment-specific
realm bootstrap resources live in the development overlay.

The 512 MiB request and 1 GiB limit are a conservative development starting
point, not a production sizing decision. Observe actual usage before changing
replicas or advancing this workload to production.
