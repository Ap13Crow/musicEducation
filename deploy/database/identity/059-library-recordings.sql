-- Recordings uploaded by teachers and admins (LibrarySource UPLOAD), shown
-- in the public Library and usable in courses and on event cards; and noise
-- reduction for every Library recording, not only the Internet Archive 78s
-- (apps/api/src/lib/audioRestoration.ts, apps/api/src/lib/libraryRecordings.ts).

-- ALTER TYPE ... ADD VALUE stays outside the transaction (see 041).
ALTER TYPE "LibrarySource" ADD VALUE IF NOT EXISTS 'UPLOAD';

BEGIN;

ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "performers" TEXT;
-- The teacher or admin who uploaded the recording. Only they (and admins)
-- may use it in a course or on an event.
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "uploadedById" TEXT;
-- Under copyright: who holds the rights, the exact wording the uploader
-- confirmed (granting mymusic.coach unlimited and unrestricted use) and
-- when. All three null for a public-domain upload.
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "rightsHolder" TEXT;
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "rightsGrant" TEXT;
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "rightsGrantedAt" TIMESTAMP(3);
-- HISTORIC (78s, cylinders, early transfers) or MODERN - which set of
-- Mild/Medium/Strong filters made the restored versions. Null on 78s
-- restored before profiles existed: those are HISTORIC.
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "restoreProfile" TEXT;

DO $$
BEGIN
  ALTER TABLE "LibraryItem" ADD CONSTRAINT "LibraryItem_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "LibraryItem_uploadedById_idx" ON "LibraryItem"("uploadedById");

-- Recordings presented on a platform event's card.
CREATE TABLE IF NOT EXISTS "EventRecording" (
  "id"        TEXT         NOT NULL,
  "eventId"   TEXT         NOT NULL,
  "itemId"    TEXT         NOT NULL,
  "order"     INTEGER      NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventRecording_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EventRecording_eventId_fkey" FOREIGN KEY ("eventId")
    REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "EventRecording_itemId_fkey" FOREIGN KEY ("itemId")
    REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventRecording_eventId_itemId_key" ON "EventRecording"("eventId", "itemId");
CREATE INDEX IF NOT EXISTS "EventRecording_itemId_idx" ON "EventRecording"("itemId");

-- 78s whose archive.org download failed now fall back to our own copy:
-- give them their attempts back.
UPDATE "LibraryItem" SET "restoreAttempts" = 0, "restoreError" = NULL
WHERE "restoredAt" IS NULL AND "restoreError" = 'fetch failed';

COMMIT;
