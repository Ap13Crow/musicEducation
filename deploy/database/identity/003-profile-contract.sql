BEGIN;

ALTER TABLE "UserProfile"
  ADD COLUMN IF NOT EXISTS "timezone" TEXT;

UPDATE "UserProfile"
SET "timezone" = 'Europe/Zurich'
WHERE "timezone" IS NULL OR BTRIM("timezone") = '';

ALTER TABLE "UserProfile"
  ALTER COLUMN "timezone" SET DEFAULT 'Europe/Zurich',
  ALTER COLUMN "timezone" SET NOT NULL;

ALTER TABLE "UserProfile"
  ADD COLUMN IF NOT EXISTS "onboardingStep" INTEGER;

UPDATE "UserProfile"
SET "onboardingStep" = 0
WHERE "onboardingStep" IS NULL;

ALTER TABLE "UserProfile"
  ALTER COLUMN "onboardingStep" SET DEFAULT 0,
  ALTER COLUMN "onboardingStep" SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE "UserProfile"
    ADD CONSTRAINT "UserProfile_onboardingStep_check"
    CHECK ("onboardingStep" >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
