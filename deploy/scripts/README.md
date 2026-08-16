# Deployment helper scripts

Future helper scripts belong here. They must be idempotent, fail safely, avoid printing secrets, and default to render or dry-run behavior.

The development Secret contract is currently implemented in `.github/workflows/deploy-dev.yml` so an online-only GitHub workflow can synchronize credentials without requiring a local repository clone. Do not add a script containing embedded credentials or a committed `.env` file.
