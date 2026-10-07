# Claude Code guidance — MyMusic.Coach

Read `AGENTS.md` before making changes. Commands live in `docs/development.md`; the
Kubernetes layout lives under `deploy/` (see `deploy/README.md`).

## What this project is right now

MyMusic.Coach is a TypeScript monorepo delivering three product pillars in one app:

1. **Booking** — teacher discovery, availability, exact teacher-defined slots, Stripe payment.
2. **Learning** — native course authoring, publishing, purchase, viewer, progress, assessment.
3. **Events** — teacher-published events plus normalized external discovery (Ticketmaster now,
   Classictic once the contract is signed) and Europeana cultural-heritage content for learning.

All three are **modules of the same application**, not separate platforms. There is no Moodle,
LibreBooking, or pretix in the target system — those were an early reference approach and are being
removed. Do not reintroduce them.

### Workloads

- `apps/web` — Next.js UI (served at `mymusic.coach` in production).
- `apps/api` — GraphQL + webhooks (Stripe at `/api/webhooks/stripe`).
- `apps/worker` — async jobs: webhook processing, email, external-event ingestion, retries.
  (Being introduced; async work currently runs in-process in the API and is moving here.)

Shared code: `packages/database` (Prisma; `db push` in dev, numbered SQL in
`deploy/database/identity/` for production — see Deployment model),
`packages/graphql-schema`, `packages/mcp-server`.

### Platform reality

- Production runs on a hardened **single-node k3s** host, reached through an outbound
  **Cloudflare Tunnel**: `mymusic.coach` → web and `auth.mymusic.coach` → Keycloak.
  There is no public LoadBalancer, ingress controller, Caddy gateway, or exposed Kubernetes API.
  The old DOKS workflows remain migration references until cutover is accepted.
- **Keycloak** is the identity authority (OIDC, PKCE, server-side sessions). The application
  database owns profiles, roles, marketplace, bookings, courses, entitlements, progress.
  `UserExternalIdentity` maps the immutable Keycloak `sub` to the platform user — keep it.
- **Stripe test mode only** in development. Payment state is a state machine; the signed webhook —
  never the browser redirect — confirms payment.
- **Google Calendar / Meet integration is intentionally not in scope for now.** The booking agenda
  is owned entirely by the application database. Do not add Google Calendar coupling unless a task
  explicitly reintroduces it.
- External providers (Ticketmaster, Europeana, later Classictic) are **read-only discovery inputs**
  behind server-side adapters. Their credentials live in the `application-integrations` Kubernetes
  Secret, populated by GitHub Actions — never committed.

## Deployment model (how your changes reach the cluster)

**GitHub is the repository only. Production is built and deployed from the k3s host itself**
(this checkout, `/data/projects/musicedu`), by Claude Code when the owner asks to deploy. Do not
use GitHub Actions or `workflow_dispatch` for production; `.github/workflows/deploy-k3s-production.yml`
is kept as a reference only. Namespace: `mymusic-coach`.

Deploy, in order (stop at the first failure):

```bash
cd /data/projects/musicedu
git push origin main                      # HTTPS remote, PAT in /root/.netrc
SHA=$(git rev-parse HEAD); PREFIX=ghcr.io/ap13crow/mymusiccoach
docker build --file apps/api/Dockerfile    --tag "$PREFIX-api:$SHA" .
docker build --file apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_GRAPHQL_URL=/api/graphql \
  --build-arg NEXT_PUBLIC_ENABLE_LIVE_API=true \
  --build-arg NEXT_PUBLIC_KEYCLOAK_ISSUER=https://auth.mymusic.coach/realms/mymusic-coach \
  --build-arg NEXT_PUBLIC_APP_URL=https://mymusic.coach \
  --tag "$PREFIX-web:$SHA" .
docker build --file apps/worker/Dockerfile --tag "$PREFIX-worker:$SHA" .
for a in api web worker; do docker push "$PREFIX-$a:$SHA"; done

# Schema: every file in deploy/database/identity/ re-runs, so each must be idempotent.
kubectl -n mymusic-coach delete job application-identity-schema --ignore-not-found --wait=true
kubectl apply -k deploy/overlays/prod/application-database
kubectl -n mymusic-coach wait --for=condition=complete --timeout=300s job/application-identity-schema

# Workloads: the prod overlay pins `bootstrap` tags - replace them with the full SHA.
manifest=$(mktemp); kubectl kustomize deploy/overlays/prod/application > "$manifest"
sed -i -e "s|$PREFIX-api:bootstrap|$PREFIX-api:$SHA|g" \
       -e "s|$PREFIX-web:bootstrap|$PREFIX-web:$SHA|g" \
       -e "s|$PREFIX-worker:bootstrap|$PREFIX-worker:$SHA|g" "$manifest"
kubectl apply -f "$manifest"; rm "$manifest"
kubectl -n mymusic-coach rollout status deployment/api deployment/web deployment/worker --timeout=300s
```

- **Schema changes ship as SQL**, not `db push`: a Prisma model/enum/column change needs a new
  numbered, idempotent file in `deploy/database/identity/` (`IF NOT EXISTS`, `ADD VALUE IF NOT
  EXISTS`) **and** an entry in that folder's `kustomization.yaml`, or production breaks at runtime.
- **There is no node/npm on the host.** Test and type-check inside the images: `docker build
  --target builder -f apps/<app>/Dockerfile -t <tag> .` then `docker run --rm <tag> sh -c 'cd /app
  && npm test --workspace @my-music-coach/<app>'`; the web image build runs `next build`
  (type-check). Lockfile updates: `npm install … --package-lock-only` in a `node:20-bookworm-slim`
  container as the repo owner's uid (npm re-sorts `package.json`; restore the original order).
- After a deploy, verify against the public site (`https://mymusic.coach`, public GraphQL at
  `/api/graphql`) rather than assuming the rollout means the feature works.
- Allowed on this host for operational work in `mymusic-coach`: `kubectl get/logs/describe/exec`,
  read checks via `psql` in `postgres-0`, and running worker jobs in the worker pod.
- Still never, without the owner's explicit say-so: rotate credentials, edit Kubernetes Secrets,
  delete data or PVCs, change Cloudflare/GitHub/cloud settings, or touch other namespaces.

## Guardrails

- Never commit `.env` files, secrets, service-account JSON, tokens, or Kubernetes Secret manifests.
- Keep `.env.example` to safe placeholders. No live keys anywhere, ever.
- Do not add mutable `latest` image tags to `deploy/` manifests; use commit SHA tags.
- Treat `docker-compose*.yml`, `docker/`, and `k8s/deployment.yaml` as legacy references only.
- Keep credentials and provider SDK calls server-side. Store timestamps in UTC, keep IANA timezones.
- Make webhook and job handlers idempotent; external callbacks and provider data are untrusted input.
- Keep payment, entitlement, progress, and XP state deterministic and auditable. AI never mutates them.
- Change the Prisma schema only when the task says so; after schema edits, run `db push` (dev) and
  add the matching idempotent SQL file + kustomization entry for production.
- One vertical slice per PR. Add tests with behavior changes; prefer contract tests at boundaries
  and conflict tests for booking/payment. Preserve unrelated changes; keep commits focused.

## Required workflow

1. Read this file and any nearer `AGENTS.md`.
2. `git status` before editing; stage only task-related files.
3. Use `docs/development.md` for install, generate, lint, test, build, and manifest rendering.
4. Run the narrowest relevant checks while working, then repository checks before handoff.
5. Review the staged diff for secret material before committing.
