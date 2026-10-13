-- Recordings and scores of the same work (apps/api/src/lib/libraryWorkLinks.ts),
-- so a recording's page can offer its score and a score's page its
-- recordings. Recomputed after every Library import; a pair an admin marked
-- "not this work" keeps its rejectedAt and is never shown or re-created.
BEGIN;

CREATE TABLE IF NOT EXISTS "LibraryWorkLink" (
  "recordingId" TEXT         NOT NULL,
  "scoreId"     TEXT         NOT NULL,
  -- CATALOGUE (same composer and Op./K./BWV/D./Hob. number) or TITLE
  -- (same composer and the same distinctive title words), or MANUAL
  -- (apps/api/src/lib/libraryWorkLinksManual.ts, reviewed by hand).
  "method"      TEXT         NOT NULL,
  "rejectedAt"  TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LibraryWorkLink_pkey" PRIMARY KEY ("recordingId", "scoreId"),
  CONSTRAINT "LibraryWorkLink_recordingId_fkey" FOREIGN KEY ("recordingId")
    REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LibraryWorkLink_scoreId_fkey" FOREIGN KEY ("scoreId")
    REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LibraryWorkLink_scoreId_idx" ON "LibraryWorkLink"("scoreId");

COMMIT;
