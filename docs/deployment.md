# Development deployment

The development cluster is deployed from GitHub Actions. A local repository clone is not required: GitHub stores the source, the workflow authenticates to DigitalOcean Kubernetes, and Kubernetes pulls immutable application images when those workloads are added.

The foundation workflow deploys only the namespace, the managed PostgreSQL CA and credential contracts, and two short-lived database smoke-test Jobs. Keycloak is the first opt-in persistent workload and has its own workflow. The application, realm configuration, Cloudflare Tunnel, ingress controller, and public LoadBalancer remain deferred.

## GitHub environment

Create a GitHub Environment named `development` in **Settings → Environments**. Protect it with required reviewers if the repository plan supports that feature. Add these environment variables:

| Variable | Value |
| --- | --- |
| `PGHOST` | Hostname from the DigitalOcean database connection details |
| `PGPORT` | `25060` |

Add these environment secrets:

| Secret | Purpose |
| --- | --- |
| `DIGITALOCEAN_ACCESS_TOKEN` | Allows the workflow to obtain a short-lived kubeconfig for `mymusiccoach-dev` |
| `POSTGRES_CA_CERT` | Complete contents of the downloaded DigitalOcean CA certificate |
| `POSTGRES_MYMUSICCOACH_PASSWORD` | Password for `mymusiccoach_app` |
| `POSTGRES_KEYCLOAK_PASSWORD` | Password for `keycloak_app` |

Do not use `doadmin` for application workloads. Do not store database passwords, API keys, the CA file, kubeconfig files, or a DigitalOcean token in Git, workflow YAML, issue comments, or pull-request descriptions.

Use a narrowly scoped DigitalOcean token where possible. This workflow only needs to discover the named Kubernetes cluster and obtain its kubeconfig; it does not create or modify DigitalOcean databases.

## Foundation workflow operations

Open **Actions → Development foundation → Run workflow** on the `main` branch and choose one operation:

- `plan` renders both Kustomize targets and rejects committed Kubernetes `Secret` objects. It does not contact the cluster.
- `deploy-and-test` authenticates to the exact DOKS context, applies the namespace, synchronizes the CA and two distinct database Secrets, and runs both TLS and schema-permission probes.
- `cleanup-tests` removes only the two smoke-test Jobs. It leaves the namespace, CA ConfigMap, and Secrets intact.

The workflow will refuse to deploy from any branch other than `main`. Its GitHub Environment creates a review boundary for cluster access, while its concurrency group prevents overlapping development deployments.

## What a successful test proves

Each Job uses PostgreSQL `verify-full` TLS, connects with its dedicated account to its dedicated database, starts a transaction, creates a table in `public`, and rolls back. Success therefore proves:

1. the DOKS workload can reach the managed database through its trusted-source rule;
2. the server certificate validates against the configured CA and hostname;
3. the credentials select the intended database and user; and
4. the user can create schema objects without leaving a test table behind; and
5. each account is denied access to the other application's database.

It does not yet run Prisma migrations or create Keycloak tables. Those are separate, reviewable deployment increments after this foundation succeeds.

## Keycloak deployment

After `deploy-and-test` succeeds, open **Actions → Development Keycloak → Run workflow** on the `main` branch and choose one operation:

- `plan` renders the pinned official operator and the Keycloak custom resource, rejects committed Kubernetes Secrets and mutable `latest` tags, and does not contact the cluster.
- `deploy` verifies the existing `postgres-keycloak` Secret and `postgres-ca` ConfigMap, installs Keycloak Operator `26.7.0`, reconciles one Keycloak instance, waits for readiness, checks the management health endpoint, verifies that the Service is a `ClusterIP`, and reports Pod resource use when metrics are available.
- `status` performs read-only cluster inspection and reports the Keycloak custom resource, Deployments, internal Service, NetworkPolicy, Pods, and available resource metrics.

The workflow refuses cluster access from branches other than `main`. Merging these manifests does not deploy them; a reviewed manual `deploy` run is still required.

The Keycloak custom resource connects to database `keycloak` using the `keycloak_app` account synchronized in `postgres-keycloak`. The database hostname and port remain runtime Secret values. The DigitalOcean CA is mounted from `postgres-ca`, and `db-tls-mode=verify-server` provides encrypted certificate and hostname verification.

The operator creates the bootstrap administrator credentials in the Kubernetes Secret `keycloak-initial-admin`. Do not print, copy into GitHub logs, or commit those values. Realm import and a permanent administrator lifecycle are intentionally separate changes.

The internal service is named `keycloak` and exposes application HTTP on port `8080` plus the management endpoint on port `9000`. Ingress is disabled, and the operator-managed NetworkPolicy allows those ports only from the `mymusic-coach` namespace. This keeps the first deployment private while still allowing a later `cloudflared` Pod in the same namespace to connect.

The initial development sizing is one replica with a 250 millicore/512 MiB request and a 1 CPU/1 GiB limit. Treat this as a measurement baseline. Review `status` output under realistic login and token traffic before changing limits, adding replicas, importing the realm, or exposing Keycloak through Cloudflare.

## Secret lifecycle

GitHub Environment secrets are the source for this development phase. The workflow creates the Kubernetes Secrets idempotently on every `deploy-and-test` run. Secrets are never rendered by Kustomize and are never committed.

Rotate every credential that has previously appeared in chat, shell history, screenshots, or repository history before production use. After rotation, update the GitHub Environment secret and run `deploy-and-test` again. Kubernetes will receive the new value without changing a manifest.
