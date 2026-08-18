# Development environment secrets and variables

Configure these under **GitHub repository → Settings → Environments → Development**.

## Required GitHub environment secrets

| Name | Purpose |
|---|---|
| `DIGITALOCEAN_ACCESS_TOKEN` | Authenticates GitHub Actions to DOKS and the container registry. |
| `POSTGRES_CA_CERT` | DigitalOcean managed PostgreSQL CA certificate. |
| `POSTGRES_MYMUSICCOACH_PASSWORD` | Password for the application database role. |
| `POSTGRES_KEYCLOAK_PASSWORD` | Password for the Keycloak database role. |
| `CLOUDFLARE_TUNNEL_TOKEN` | Runs the Cloudflare tunnel for the development routes. |

## Required GitHub environment variables

| Name | Purpose |
|---|---|
| `PGHOST` | Managed PostgreSQL hostname. |
| `PGPORT` | PostgreSQL port, normally `25060`. |
| `DOCR_REGISTRY` | DigitalOcean registry name, currently `ap13crow-mymusiccoach`. |

## Already managed inside Kubernetes

Do not duplicate these in GitHub unless the deployment design changes:

- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- Keycloak web client secret and generated administration credentials
- database connection URLs assembled from the foundation secrets

The application workflow creates stable `JWT_SECRET` and `NEXTAUTH_SECRET` values once in the `application-runtime` Kubernetes Secret and reuses them.

## Next optional activation secrets

These are not required for the native Theory, Practice, or Performance workflows.

### Payments

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CONNECT_CLIENT_ID` (only if marketplace/connected-account payouts are enabled)

### External event discovery

- `TICKETMASTER_API_KEY` (the Discovery API Consumer Key; the Consumer Secret is unused)

Missing this secret disables Ticketmaster ingestion cleanly — the worker job logs that
it's skipped and the events page simply shows no external listings.

### Google Calendar synchronization

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_WORKSPACE_CUSTOMER_ID`
- `GOOGLE_TEACHERS_CALENDAR_OWNER`
- `GOOGLE_STUDENTS_CALENDAR_OWNER`

The service-account JSON should be stored as the secret value, not committed as a file.
Calendar-owner addresses do not need passwords. Domain-wide delegation lets the service
account impersonate the configured Workspace users after an administrator authorizes
the required Calendar scopes.

### Transactional email / Keycloak SMTP

Secrets:

- `SMTP_PASSWORD`
- `SMTP_USER` when the provider treats the username as confidential

Variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_FROM`
- `SMTP_FROM_DISPLAY_NAME`
- `SMTP_REPLY_TO`
- `SMTP_SSL`
- `SMTP_STARTTLS`

SMTP is required before production email verification, password recovery, booking
confirmations, reminders, receipts, and teacher/student notifications can be trusted.

### AI-assisted performance assessment

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_API_URL` (variable)
- `DEEPSEEK_MODEL` (variable)

Audio files must be stored privately and passed to an analysis pipeline. The API key
must never be exposed through a `NEXT_PUBLIC_*` variable. AI output supplements a
structured teacher-readable assessment; it is not the assessment itself.

## Product architecture

Theory, Practice, and Performance are native parts of mymusic.coach. Moodle,
LibreBooking, and pretix are not deployment dependencies and require no URLs,
tokens, users, passwords, SSO secrets, or webhook secrets.

Stripe and Google are infrastructure integrations that can be activated later.
Adding a GitHub secret alone does not expose it to a Pod; the deployment workflow
must explicitly synchronize each activated integration into a Kubernetes Secret.
