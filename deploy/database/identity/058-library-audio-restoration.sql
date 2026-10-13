-- Restored versions of the Internet Archive 78 rpm sides (Mild / Medium /
-- Strong), rendered by the audio-restorer deployment (apps/api/src/lib/
-- audioRestoration.ts) and stored in the Library media store. The player
-- offers them beside the untouched original, Strong by default.
BEGIN;

ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "restoredAt" TIMESTAMP(3);
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "restoreAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "restoreError" TEXT;

CREATE TABLE IF NOT EXISTS "LibraryAudioRestoration" (
  "itemId"    TEXT         NOT NULL,
  -- Position in LibraryItem.files (one 78 side per audio file).
  "fileIndex" INTEGER      NOT NULL,
  -- MILD, MEDIUM or STRONG
  "level"     TEXT         NOT NULL,
  "sha256"    TEXT         NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LibraryAudioRestoration_pkey" PRIMARY KEY ("itemId", "fileIndex", "level"),
  CONSTRAINT "LibraryAudioRestoration_itemId_fkey" FOREIGN KEY ("itemId")
    REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LibraryAudioRestoration_sha256_fkey" FOREIGN KEY ("sha256")
    REFERENCES "LibraryMediaObject"("sha256") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LibraryAudioRestoration_sha256_idx" ON "LibraryAudioRestoration"("sha256");

COMMIT;
