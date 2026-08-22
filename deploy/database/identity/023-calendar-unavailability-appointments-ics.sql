-- Phase 3 (scoped): unavailability blocks with privacy-safe labels,
-- personal appointments, and RFC 5545 ICS support on the mail outbox.
BEGIN;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "icsSequence" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "MailOutboxMessage" ADD COLUMN IF NOT EXISTS "icsContent" TEXT;
ALTER TABLE "MailOutboxMessage" ADD COLUMN IF NOT EXISTS "icsMethod" TEXT;

DO $$ BEGIN
  CREATE TYPE "UnavailabilityLabel" AS ENUM ('UNAVAILABLE','PRIVATE_APPOINTMENT','HOLIDAY','VACATION','OTHER_UNAVAILABLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "TeacherUnavailability" (
  "id" TEXT PRIMARY KEY,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "label" "UnavailabilityLabel" NOT NULL DEFAULT 'UNAVAILABLE',
  "note" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "TeacherUnavailability_teacherProfileId_startsAt_endsAt_idx"
  ON "TeacherUnavailability"("teacherProfileId", "startsAt", "endsAt");

CREATE TABLE IF NOT EXISTS "PersonalAppointment" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT NOT NULL,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "PersonalAppointment_userId_startsAt_endsAt_idx"
  ON "PersonalAppointment"("userId", "startsAt", "endsAt");

COMMIT;
