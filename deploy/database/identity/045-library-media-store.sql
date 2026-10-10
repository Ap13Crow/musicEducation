BEGIN;

DO $$ BEGIN
  CREATE TYPE "LibraryMediaKind" AS ENUM ('SCORE', 'FILE', 'PAGE', 'TRACK');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "mirroredAt" TIMESTAMP(3);
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "mirrorError" TEXT;
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "mirrorAttempts" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "LibraryMediaObject" (
  "sha256"      TEXT         NOT NULL,
  "contentType" TEXT         NOT NULL,
  "size"        INTEGER      NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LibraryMediaObject_pkey" PRIMARY KEY ("sha256")
);

CREATE TABLE IF NOT EXISTS "LibraryItemMedia" (
  "id"              TEXT               NOT NULL,
  "itemId"          TEXT               NOT NULL,
  "kind"            "LibraryMediaKind" NOT NULL,
  "position"        INTEGER            NOT NULL,
  "label"           TEXT,
  "durationSeconds" INTEGER,
  "sha256"          TEXT               NOT NULL,
  "sourceUrl"       TEXT               NOT NULL,
  "createdAt"       TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LibraryItemMedia_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LibraryItemMedia_itemId_fkey" FOREIGN KEY ("itemId")
    REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LibraryItemMedia_sha256_fkey" FOREIGN KEY ("sha256")
    REFERENCES "LibraryMediaObject"("sha256") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "LibraryItemMedia_itemId_kind_position_key"
  ON "LibraryItemMedia"("itemId", "kind", "position");
CREATE INDEX IF NOT EXISTS "LibraryItemMedia_sha256_idx" ON "LibraryItemMedia"("sha256");

COMMIT;
