-- Phase 6 (scoped): calendar subscription feed token, and the schema
-- contract for a future OAuth-backed Google/Microsoft busy-time sync
-- (deliberately not implemented yet - see the ExternalCalendarConnection
-- model comment in schema.prisma and CLAUDE.md's Google Calendar guardrail).
BEGIN;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "calendarFeedToken" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_calendarFeedToken_key" ON "User"("calendarFeedToken");

DO $$ BEGIN
  CREATE TYPE "ExternalCalendarProvider" AS ENUM ('GOOGLE', 'MICROSOFT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExternalCalendarConnectionStatus" AS ENUM ('CONNECTED', 'ERROR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ExternalCalendarConnection" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "provider" "ExternalCalendarProvider" NOT NULL,
  "status" "ExternalCalendarConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
  "externalAccountEmail" TEXT,
  "lastSyncedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "provider")
);

CREATE TABLE IF NOT EXISTS "ExternalBusyInterval" (
  "id" TEXT PRIMARY KEY,
  "connectionId" TEXT NOT NULL REFERENCES "ExternalCalendarConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "fetchedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ExternalBusyInterval_connectionId_startsAt_idx" ON "ExternalBusyInterval"("connectionId", "startsAt");

COMMIT;
