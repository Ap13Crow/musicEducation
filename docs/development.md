# Development and validation commands

This repository is an npm workspace managed by Turborepo. Run commands from the repository root when using a local development checkout. The deployment path itself is GitHub-based and does not require a clone; see `docs/deployment.md`.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer (the repository pins npm 10.9.4)
- Docker with Compose v2 only when working with the legacy local stack
- `kubectl` with Kustomize support only for rendering the new deployment scaffold

## Initial setup

```bash
npm ci
cp .env.example .env
npm run db:generate
```

The copied `.env` is ignored by Git. Replace placeholders only with local or sandbox values. Keep production credentials outside the repository.

## Daily development

```bash
npm run dev
```

Run one workspace when a focused process is sufficient:

```bash
npm run dev --workspace @my-music-coach/web
npm run dev --workspace @my-music-coach/api
```

## Validation

Run the focused check first, followed by the repository-level checks before handoff:

```bash
npm run db:generate
npm run build
npm test
npm run lint
```

Build the database workspace before the API tests so its generated Prisma client and declaration files are available. On a new machine, `prisma generate` downloads a platform-specific engine from `binaries.prisma.sh`.

At the bootstrap baseline, the repository-wide lint command is expected to report that ESLint 9 has no flat `eslint.config.*` file. Do not bypass that result; add the configuration in a dedicated tooling change.

Useful focused commands:

```bash
npm test --workspace @my-music-coach/api -- --runInBand
npm run build --workspace @my-music-coach/api
npm run build --workspace @my-music-coach/web
npx prettier --check .
```

## Web end-to-end tests (Playwright)

`apps/web/e2e` is a Playwright suite that drives real pages in a browser against a `next dev`
server with no live API, Keycloak, or database behind it:

- `apps/web/e2e/fixtures/auth.ts` mints a NextAuth session cookie directly (the same
  `next-auth/jwt` encoding NextAuth itself uses), so a test can act as a signed-in user of a given
  role without a real Keycloak login redirect.
- `page.route('**/graphql', ...)` intercepts Apollo's requests, so a test can assert exactly what
  the browser sent (`e2e/availability-save.spec.ts` — the regression test for a real bug where the
  save button leaked Apollo's `__typename`/`id` into a mutation input) or control exactly what it
  receives back (`e2e/admin-stats.spec.ts` — pins the admin overview to whatever `adminStats`
  returns, and never the demo numbers that used to be hardcoded there).

This intentionally does not cover the real Keycloak OIDC redirect or live API/database behavior —
that needs the full stack running (the Compose reference stack below). Run it locally:

```bash
npm install --workspace @my-music-coach/web
npx --workspace @my-music-coach/web playwright install --with-deps chromium
npm run test:e2e --workspace @my-music-coach/web
```

CI runs this suite (`e2e-web` in `.github/workflows/deploy-application.yml`) on every pull request
that touches `apps/web`, and it gates the `deploy` operation alongside `validate`.

Database commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

`db:migrate` targets the database in `DATABASE_URL`. Confirm the target before running it; do not run migrations against a shared or production database without explicit authorization.

## Kubernetes scaffold validation

Render manifests without contacting a cluster:

```bash
kubectl kustomize deploy/overlays/dev
kubectl kustomize deploy/overlays/prod
kubectl kustomize deploy/operators/keycloak
kubectl kustomize deploy/overlays/dev/keycloak
kubectl kustomize deploy/tests/postgres
```

These are render-only checks. Rendering the operator target downloads the pinned official Keycloak manifests. The protected GitHub workflows described in `docs/deployment.md` are the authorized development deployment path.

## Legacy Compose stack

The current Compose topology remains available as a migration reference:

```bash
docker compose config
docker compose up -d --build
docker compose down
```

It is not the target Kubernetes architecture. Starting or deleting the full stack can be expensive or destructive, so confirm the intended scope before using it.
