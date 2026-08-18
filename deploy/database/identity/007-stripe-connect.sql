-- Teacher payouts: adds the Stripe Connect Express account reference that
-- lets course/booking/event revenue be split to the teacher who earned it
-- (via payment_intent_data.transfer_data on checkout) instead of settling
-- entirely in the platform's own Stripe account.
BEGIN;

ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT;
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Unlike a plain constraint (duplicate_object, 42710), ADD CONSTRAINT ...
-- UNIQUE also creates a backing index under the same name - if that index
-- already exists from a prior apply, Postgres raises duplicate_table
-- (42P07) instead, which a duplicate_object-only guard (as used for the
-- foreign keys in 006-community-commerce.sql) doesn't catch. Catch both so
-- re-running this bootstrap Job against an already-migrated database stays
-- a no-op here too.
DO $$ BEGIN
  ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_stripeAccountId_key" UNIQUE ("stripeAccountId");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

COMMIT;
