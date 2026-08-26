-- Adds User.status so a Keycloak-side identity deletion can be reconciled
-- into Postgres as a soft "DEACTIVATED" marker instead of either (a) doing
-- nothing, leaving the app record behind forever with no indication its
-- identity is gone, or (b) hard-deleting the row and losing bookings/
-- payments/history that reference it. Set by adminDeactivateUser (an admin
-- action, apps/api/src/resolvers/admin.ts) and by the worker's
-- keycloak-user-sync reconciliation job (a daily safety net for identities
-- still deleted directly in the Keycloak console).
BEGIN;

DO $$ BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

COMMIT;
