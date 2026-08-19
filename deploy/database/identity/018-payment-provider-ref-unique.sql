-- handleStripeWebhook (payments.ts) is the only thing that sets providerRef
-- (a Stripe checkout session id), and it must be idempotent against Stripe's
-- own webhook retries (CLAUDE.md: "make webhook and job handlers
-- idempotent"). A findFirst-then-create check isn't concurrency-safe on its
-- own - this constraint is the actual guard; the webhook handler now treats
-- the resulting unique-violation as "already processed" and exits quietly.
BEGIN;

-- Materialize the keep/duplicate mapping once (kept = earliest per
-- (provider, providerRef) pair, tiebroken by id), referenced by every
-- statement below - repeating the window-function ranking separately in
-- each one would risk it coming out differently between them. NULL
-- providerRef rows (payments never routed through the webhook) are
-- exempt: standard SQL treats every NULL as distinct, so they never
-- collide and never appear here.
CREATE TEMP TABLE payment_dedup_map ON COMMIT DROP AS
SELECT dup_id, keep_id FROM (
  SELECT
    "id" AS dup_id,
    FIRST_VALUE("id") OVER (
      PARTITION BY "provider", "providerRef"
      ORDER BY "createdAt" ASC, "id" ASC
    ) AS keep_id
  FROM "Payment"
  WHERE "providerRef" IS NOT NULL
) ranked
WHERE dup_id <> keep_id;

-- Re-point every dependent row from a duplicate Payment onto the one being
-- kept, before the duplicates are deleted below. Enrollment.paymentId and
-- EventBooking.paymentId are real foreign keys (unlike Booking.paymentId,
-- a plain column with no FK) - deleting a still-referenced row would fail
-- the migration outright rather than silently leaving anything dangling,
-- but re-point all three for consistency (a dangling Booking.paymentId
-- would otherwise point at a row that no longer exists).
UPDATE "Enrollment" e
SET "paymentId" = m."keep_id"
FROM payment_dedup_map m
WHERE e."paymentId" = m."dup_id";

UPDATE "EventBooking" eb
SET "paymentId" = m."keep_id"
FROM payment_dedup_map m
WHERE eb."paymentId" = m."dup_id";

UPDATE "Booking" b
SET "paymentId" = m."keep_id"
FROM payment_dedup_map m
WHERE b."paymentId" = m."dup_id";

DELETE FROM "Payment" p
USING payment_dedup_map m
WHERE p."id" = m."dup_id";

-- Same duplicate_table (42P07) footgun as 007-stripe-connect.sql and
-- 012-assessment-answer-unique.sql: a UNIQUE constraint's backing index can
-- already exist from a prior partial apply.
DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_provider_providerRef_key" UNIQUE ("provider", "providerRef");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

COMMIT;
