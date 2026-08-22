-- Phase 7: external event engagement - "recently viewed", post-event
-- attendance confirmation, and evaluation (which credits XP through the
-- existing EVENT_ATTENDED award, same as a native ticketed event).
BEGIN;

ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "externalEventProjectionId" TEXT REFERENCES "ExternalEventProjection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "Review_externalEventProjectionId_idx" ON "Review"("externalEventProjectionId");

CREATE TABLE IF NOT EXISTS "ExternalEventEngagement" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "externalEventProjectionId" TEXT NOT NULL REFERENCES "ExternalEventProjection"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "firstViewedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastViewedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "attendanceConfirmedAt" TIMESTAMPTZ,
  "xpAwardedAt" TIMESTAMPTZ,
  UNIQUE ("userId", "externalEventProjectionId")
);
CREATE INDEX IF NOT EXISTS "ExternalEventEngagement_userId_lastViewedAt_idx" ON "ExternalEventEngagement"("userId", "lastViewedAt");

COMMIT;
