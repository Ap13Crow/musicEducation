# Development deployment

The development cluster is deployed from GitHub Actions. A local repository clone is not required: GitHub stores the source, the workflow authenticates to DigitalOcean Kubernetes, and Kubernetes pulls immutable application images when those workloads are added.

The first automation increment intentionally deploys only the namespace, the managed PostgreSQL CA and credential contracts, and two short-lived database smoke-test Jobs. It does not deploy Keycloak, the application, Cloudflare Tunnel, an ingress controller, or a public LoadBalancer yet.

## GitHub environment

Create a GitHub Environment named `development` in **Settings → Environments**. Protect it with required reviewers if the repository plan supports that feature. Add these environment variables:

| Variable | Value |
| --- | --- |
| `POSTGRES_HOST` | Hostname from the DigitalOcean database's private connection details |
| `POSTGRES_PORT` | `25060` |

Add these environment secrets:

| Secret | Purpose |
| --- | --- |
| `DIGITALOCEAN_ACCESS_TOKEN` | Allows the workflow to obtain a short-lived kubeconfig for `mymusiccoach-dev` |
| `POSTGRES_CA_CERT` | Complete contents of the downloaded DigitalOcean CA certificate |
| `POSTGRES_MYMUSICCOACH_PASSWORD` | Password for `mymusiccoach_app` |
| `POSTGRES_KEYCLOAK_PASSWORD` | Password for `keycloak_app` |

Do not use `doadmin` for application workloads. Do not store database passwords, API keys, the CA file, kubeconfig files, or a DigitalOcean token in Git, workflow YAML, issue comments, or pull-request descriptions.

Use a narrowly scoped DigitalOcean token where possible. This workflow only needs to discover the named Kubernetes cluster and obtain its kubeconfig; it does not create or modify DigitalOcean databases.

## Workflow operations

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

## Secret lifecycle

GitHub Environment secrets are the source for this development phase. The workflow creates the Kubernetes Secrets idempotently on every `deploy-and-test` run. Secrets are never rendered by Kustomize and are never committed.

Rotate every credential that has previously appeared in chat, shell history, screenshots, or repository history before production use. After rotation, update the GitHub Environment secret and run `deploy-and-test` again. Kubernetes will receive the new value without changing a manifest.
