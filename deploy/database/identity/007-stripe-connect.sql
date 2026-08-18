-- Teacher payouts: adds the Stripe Connect Express account reference that
-- lets course/booking/event revenue be split to the teacher who earned it
-- (via payment_intent_data.transfer_data on checkout) instead of settling
-- entirely in the platform's own Stripe account.
BEGIN;

ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT;
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_stripeAccountId_key" UNIQUE ("stripeAccountId");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
