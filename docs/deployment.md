# Development deployment

The development cluster is deployed from GitHub Actions. A local repository clone is not required: GitHub stores the source, the workflow authenticates to DigitalOcean Kubernetes, and Kubernetes pulls immutable application images when those workloads are added.

The foundation workflow deploys only the namespace, the managed PostgreSQL CA and credential contracts, and two short-lived database smoke-test Jobs. Keycloak, its development realm, and Cloudflare Tunnel are opt-in workloads with protected workflows. The application workloads remain separate increments; no ingress controller or public LoadBalancer is used.

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

- `plan` renders the pinned official operator, Keycloak custom resource, and one-time development realm import; it rejects committed Kubernetes Secrets and mutable `latest` tags without contacting the cluster.
- `deploy` verifies the database prerequisites, installs Keycloak Operator `26.7.0`, reconciles one Keycloak instance, checks internal health, creates the runtime web-client Secret if the realm does not exist, imports the realm once, cleans up the import Job, and verifies public OIDC discovery through Cloudflare.
- `status` performs read-only cluster inspection and reports the Keycloak custom resource, operator Deployment, Keycloak StatefulSet, internal Service, NetworkPolicy, Pods, public discovery reachability, and available resource metrics.

The workflow refuses cluster access from branches other than `main`. Merging these manifests does not deploy them; a reviewed manual `deploy` run is still required.

The Keycloak custom resource connects to database `keycloak` using the `keycloak_app` account synchronized in `postgres-keycloak`. The database hostname and port remain runtime Secret values. The DigitalOcean CA is mounted from `postgres-ca`, and `db-tls-mode=verify-server` provides encrypted certificate and hostname verification.

The operator creates the bootstrap administrator credentials in the Kubernetes Secret `keycloak-initial-admin`. Do not print, copy into GitHub logs, or commit those values. Realm import and a permanent administrator lifecycle are intentionally separate changes.

The internal service is named `keycloak` and exposes application HTTP on port `8080` plus the management endpoint on port `9000`. Ingress is disabled. The operator-managed NetworkPolicy permits application HTTP from the labelled `cloudflared` Pod in `mymusic-coach`; port `9000` remains internal and is never part of the Cloudflare route.

The initial development sizing is one replica with a 250 millicore/512 MiB request and a 1 CPU/1 GiB limit. Treat this as a measurement baseline. Review `status` output under realistic login and token traffic before changing limits or adding replicas.

## Development realm bootstrap

The development realm is named `mymusic-coach`. It enables self-registration,
uses email addresses as usernames, and assigns `STUDENT` by default. Realm
roles are `STUDENT`, `TEACHER`, and `ADMIN`. Email verification remains
disabled until SMTP is configured.

The confidential `mymusic-coach-web` client accepts
`https://dev.mymusic.coach/*` redirects and requires authorization code flow
with PKCE. On the first bootstrap, the workflow generates its client secret
inside Kubernetes Secret `keycloak-client-secrets` under key
`WEB_CLIENT_SECRET`. If the realm already exists but this Secret is missing,
the workflow fails rather than generating a value that would no longer match
Keycloak.

The `KeycloakRealmImport` resource is creation-only. The workflow applies it
only when discovery proves the realm is absent, waits for `Done`, verifies the
realm internally, and deletes the import resource so its Job and Pod are
cleaned up. The import Job requests 250 millicores and 256 MiB instead of
inheriting Keycloak's larger limits.

The public issuer is
`https://auth-dev.mymusic.coach/realms/mymusic-coach`. The deployment fails if
Cloudflare discovery is unreachable or advertises another issuer.

## Authenticated application milestone

The development application uses two immutable images in one DigitalOcean
Container Registry repository: `api-<commit>` and `web-<commit>`. Keeping both
image variants in repository `mymusiccoach` allows development to use the
Starter registry tier (one repository, 500 MiB) without making either image
public. The workflow uses `DOCR_REGISTRY` when configured, reuses the account's
single existing registry, or creates `ap13crow-mymusiccoach` on the free
Starter tier when no registry exists.

Open **Actions → Development application → Run workflow** on `main`:

- `plan` renders the application and identity-schema targets and builds both
  containers without cluster access or registry writes.
- `deploy` creates/reuses the registry, pushes commit-tagged images, integrates
  it with DOKS, creates stable runtime session secrets inside Kubernetes, applies
  the minimal identity/profile schema, rolls out `api` and `web`, and proves
  that `https://dev.mymusic.coach` exposes web health and the Keycloak provider.
- `status` performs read-only inspection of application workloads and the
  public health route.

Only `web` is reachable from the Cloudflare Tunnel at
`http://web.mymusic-coach.svc.cluster.local:3000`. Browser GraphQL requests go
through `/api/graphql`; the web server forwards the Keycloak bearer token to
the internal `api` ClusterIP. No `api-dev` public route is required.

The first database increment creates only `User`, `UserProfile`,
`GamificationProfile`, and `UserExternalIdentity`. It is intentionally not a
replacement for the reviewed Prisma migration history required before
production. On the first authenticated GraphQL request, the API verifies the
Keycloak token against realm JWKS, links by Keycloak subject, and creates the
local profile with the realm role.

After deployment, perform one browser acceptance test: register through
Keycloak, return to `/dashboard`, confirm the displayed role, sign out, and sign
in again. That proves the interactive authorization-code/PKCE path and the
just-in-time provisioning path that CI cannot exercise without storing a test
user password.

## Secret lifecycle

GitHub Environment secrets are the source for this development phase. The workflow creates the Kubernetes Secrets idempotently on every `deploy-and-test` run. Secrets are never rendered by Kustomize and are never committed.

Rotate every credential that has previously appeared in chat, shell history, screenshots, or repository history before production use. After rotation, update the GitHub Environment secret and run `deploy-and-test` again. Kubernetes will receive the new value without changing a manifest.


## Role-aware acceptance users

Keycloak realm roles are the source of truth for application access. The web
shell uses the roles in the signed-in access token to show the appropriate
workspace, and the API independently enforces the same roles on protected
GraphQL operations.

Use self-registration to create a student acceptance account. To test teacher
or administrator functions, open the realm-specific Keycloak Admin Console,
select the user, and assign the `TEACHER` or `ADMIN` realm role. Sign out of
My Music Coach and sign in again after every role change so Keycloak issues a
fresh access token. The first authenticated GraphQL request creates the local
identity and synchronizes its application role.

Keep acceptance-user passwords out of GitHub, workflow inputs, issue comments,
and chat. Do not add API tokens or provider keys through the browser. External
integration credentials belong in protected GitHub Environment or Kubernetes
Secrets and should be exposed to workloads only when that integration is
implemented.

Realm changes made after bootstrap are live Keycloak state. The
`KeycloakRealmImport` remains creation-only and must not be rerun to manage
individual users or roles.
