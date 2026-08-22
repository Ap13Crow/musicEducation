-- Phase 4 (scoped): advance-booking/cancellation policy fields, manual
-- approval hold state, and per-instrument student capacity. Full versioned
-- policy snapshots onto contracts/packages/subscriptions are Phase 5 work
-- (there is no contract/entitlement model yet to snapshot onto) - these are
-- the teacher's live default policy fields for now.
BEGIN;

ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "leadDays" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "cancellationDays" INTEGER NOT NULL DEFAULT 2;
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "autoApproveNewStudents" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "autoApproveRecurringStudents" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "holdExpiresAt" TIMESTAMPTZ;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "lateCancellation" BOOLEAN;

CREATE TABLE IF NOT EXISTS "TeacherInstrumentCapacity" (
  "id" TEXT PRIMARY KEY,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "instrument" TEXT NOT NULL,
  "maxActiveStudents" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("teacherProfileId", "instrument")
);

COMMIT;
