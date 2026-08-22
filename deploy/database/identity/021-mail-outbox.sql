-- Durable transactional-email outbox. Booking confirmation (and future
-- booking-lifecycle) emails are written into this table in the same
-- transaction as the state change they announce, instead of calling the
-- SMTP relay synchronously from the request path. apps/worker polls PENDING
-- rows and delivers them with retry/backoff; a delivery that keeps failing
-- becomes DEAD_LETTER, visible to admins via Query.mailOutbox, rather than
-- silently vanishing (the previous synchronous sendMail() behavior).
--
-- notificationEmail is a second, optional address a user can set distinct
-- from their account email (User.email) - outbox recipients are the unique
-- set of both when both are present, never duplicated.
BEGIN;

ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "notificationEmail" TEXT;

DO $$ BEGIN
  CREATE TYPE "MailOutboxStatus" AS ENUM ('PENDING','SENT','FAILED','DEAD_LETTER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MailOutboxKind" AS ENUM ('BOOKING_CONFIRMATION','BOOKING_CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "MailOutboxMessage" (
  "id" TEXT PRIMARY KEY,
  "kind" "MailOutboxKind" NOT NULL,
  "bookingId" TEXT,
  "recipients" TEXT[] NOT NULL,
  "subject" TEXT NOT NULL,
  "html" TEXT NOT NULL,
  "status" "MailOutboxStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 8,
  "lastError" TEXT,
  "nextAttemptAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- The worker's poll query is "next batch of PENDING/FAILED-but-due rows,
-- oldest due first" - this index covers exactly that filter+sort.
CREATE INDEX IF NOT EXISTS "MailOutboxMessage_status_nextAttemptAt_idx"
  ON "MailOutboxMessage"("status", "nextAttemptAt");
CREATE INDEX IF NOT EXISTS "MailOutboxMessage_bookingId_idx" ON "MailOutboxMessage"("bookingId");

COMMIT;
