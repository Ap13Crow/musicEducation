-- handleStripeWebhook (payments.ts) is the only thing that sets providerRef
-- (a Stripe checkout session id), and it must be idempotent against Stripe's
-- own webhook retries (CLAUDE.md: "make webhook and job handlers
-- idempotent"). A findFirst-then-create check isn't concurrency-safe on its
-- own - this constraint is the actual guard; the webhook handler now treats
-- the resulting unique-violation as "already processed" and exits quietly.
BEGIN;

-- A duplicate (provider, providerRef) pair could already exist from before
-- this constraint existed (the webhook's earlier findFirst-only check was
-- exactly the kind of race this migration closes) - keep the earliest row
-- per pair and drop the rest first, or the constraint below fails to apply.
-- NULL providerRef rows (payments never routed through the webhook) are
-- exempt: standard SQL treats every NULL as distinct, so they never collide
-- and are left untouched.
DELETE FROM "Payment"
WHERE "id" IN (
  SELECT "id" FROM (
    SELECT "id",
           ROW_NUMBER() OVER (
             PARTITION BY "provider", "providerRef"
             ORDER BY "createdAt" ASC, "id" ASC
           ) AS rn
    FROM "Payment"
    WHERE "providerRef" IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Same duplicate_table (42P07) footgun as 007-stripe-connect.sql and
-- 012-assessment-answer-unique.sql: a UNIQUE constraint's backing index can
-- already exist from a prior partial apply.
DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_provider_providerRef_key" UNIQUE ("provider", "providerRef");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

COMMIT;
