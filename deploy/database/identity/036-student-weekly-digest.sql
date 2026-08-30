-- Weekly student engagement digest:
--   * opt-out flag on the profile
--   * decline marker for external event reminders
--   * outbox kind + per-user/week delivery guard for idempotent worker sends

ALTER TABLE "UserProfile"
  ADD COLUMN IF NOT EXISTS "weeklyDigestEmailEnabled" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "ExternalEventEngagement"
  ADD COLUMN IF NOT EXISTS "attendanceDeclinedAt" TIMESTAMPTZ;

ALTER TYPE "MailOutboxKind" ADD VALUE IF NOT EXISTS 'STUDENT_WEEKLY_DIGEST';

CREATE TABLE IF NOT EXISTS "StudentWeeklyDigestDelivery" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "weekStart" TIMESTAMPTZ NOT NULL,
  "weekEnd" TIMESTAMPTZ NOT NULL,
  "mailOutboxMessageId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentWeeklyDigestDelivery_userId_weekStart_key" UNIQUE ("userId", "weekStart")
);

CREATE INDEX IF NOT EXISTS "StudentWeeklyDigestDelivery_weekStart_idx"
  ON "StudentWeeklyDigestDelivery"("weekStart");
