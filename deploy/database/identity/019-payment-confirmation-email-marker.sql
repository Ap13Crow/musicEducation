-- Durable "confirmation email dispatched" marker for handleStripeWebhook
-- (payments.ts) - a retried delivery checks this instead of "did I just
-- create the Payment row," so a delivery that created the row but crashed
-- before setting this still gets a real retry at sending the confirmation.
BEGIN;

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "confirmationEmailAt" TIMESTAMPTZ;

COMMIT;
