# Repository guidance for coding agents

## Mission and scope

`Ap13Crow/musicEducation` is the canonical repository for the MyMusic.Coach rebuild. Preserve the existing product behavior unless a task explicitly authorizes a business-logic change. Port presentation and interaction patterns from `musicEducation2` one vertical slice at a time; do not import Taskade/Genesis infrastructure, browser-side authentication, or platform-specific data contracts.

The target runtime has three application workloads: `web`, `api`, and `worker`. Keycloak owns identity. PostgreSQL owns application state. Google Calendar, Stripe Connect, object storage, and external event systems are integrations behind server-side boundaries. The Booking, Learning, and Event Cores remain modules of the application rather than separate platform authorities.

## Safety rules

- Never commit `.env` files, credentials, private keys, Kubernetes Secrets, service-account JSON, mailbox passwords, or real API tokens.
- Keep `.env.example` to safe placeholders. Development payments must use Stripe test mode.
- Do not deploy, run `kubectl apply`, change cloud resources, rotate live credentials, or modify GitHub settings outside the protected GitHub Actions workflow without explicit user authorization.
- Treat `docker-compose*.yml`, `docker/`, and `k8s/deployment.yaml` as legacy migration references. The new provider-neutral Kubernetes scaffold is under `deploy/`.
- Do not add mutable `latest` image tags to target manifests. Future image references must use commit tags or digests.
- Do not reintroduce Caddy, Redis, MinIO, Moodle, LibreBooking, or pretix into the initial cluster unless an approved architecture decision requires them.
- Avoid schema migrations and generated artifacts unless the task explicitly includes them. Never edit an existing migration after it has been shared.
- Preserve unrelated user changes. Keep commits focused and report any pre-existing test failure separately.

## Required workflow

1. Read this file and the nearest nested `AGENTS.md`, if one exists.
2. Inspect `git status` before editing and stage only task-related files.
3. Use the commands in `docs/development.md` for install, generation, lint, test, build, and manifest rendering.
4. Run the narrowest relevant checks while working, then the repository-level checks before handoff when feasible.
5. Review the staged diff for secret material before committing.

## Architecture conventions

- Use TypeScript and existing workspace boundaries: `apps/*` for deployable applications and `packages/*` for shared code.
- Keep integration credentials and provider SDK calls server-side.
- Store timestamps in UTC and retain the user's IANA timezone for scheduling rules.
- Make webhook and job handlers idempotent; external callbacks are untrusted input.
- Keep payment, entitlement, progress, XP, and achievement state deterministic and auditable.
- Add tests with behavior changes. Prefer contract tests at integration boundaries and conflict/concurrency tests for booking and payment flows.
- Use Kustomize for the initial Kubernetes layout. Keep `base` provider-neutral and put environment differences in `overlays`.
- Build application images on GitHub-hosted runners. The production self-hosted runner is only for manual, protected k3s reconciliation and diagnostics; never target it from pull-request jobs.
