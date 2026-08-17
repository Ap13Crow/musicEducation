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

### Google Calendar synchronization

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_WORKSPACE_CUSTOMER_ID`
- `GOOGLE_TEACHERS_CALENDAR_OWNER`
- `GOOGLE_STUDENTS_CALENDAR_OWNER`

The service-account JSON should be stored as the secret value, not committed as a file.

## Product architecture

Theory, Practice, and Performance are native parts of mymusic.coach. Moodle,
LibreBooking, and pretix are not deployment dependencies and require no URLs,
tokens, users, passwords, SSO secrets, or webhook secrets.

Stripe and Google are infrastructure integrations that can be activated later.
Adding a GitHub secret alone does not expose it to a Pod; the deployment workflow
must explicitly synchronize each activated integration into a Kubernetes Secret.
