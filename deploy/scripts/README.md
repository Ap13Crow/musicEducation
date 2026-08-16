# Deployment helper scripts

Future helper scripts belong here. They must be idempotent, fail safely, avoid printing secrets, and default to render or dry-run behavior.

The proposed `create-dev-secrets.sh` is deliberately not included in the bootstrap. Define and review the exact Secret contract before adding a script that reads local credentials.
