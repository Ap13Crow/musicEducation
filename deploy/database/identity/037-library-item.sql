BEGIN;

DO $$ BEGIN
  CREATE TYPE "LibrarySource" AS ENUM ('BNF');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "LibraryItemCategory" AS ENUM ('SHEET_MUSIC', 'AUDIO_RECORDING', 'BOOK', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "LibraryItem" (
  "id"                TEXT          NOT NULL,
  "source"            "LibrarySource"  NOT NULL DEFAULT 'BNF',
  "ark"               TEXT          NOT NULL,
  "category"          "LibraryItemCategory" NOT NULL,
  "title"             TEXT          NOT NULL,
  "creator"           TEXT,
  "date"              TEXT,
  "documentType"      TEXT,
  "isPublicDomainWork" BOOLEAN      NOT NULL DEFAULT false,
  "catalogueUrl"      TEXT,
  "permalink"         TEXT          NOT NULL,
  "thumbnailUrl"      TEXT,
  "seedQuery"         TEXT,
  "hiddenAt"          TIMESTAMP(3),
  "ingestedAt"        TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LibraryItem_source_ark_key"
  ON "LibraryItem"("source", "ark");

CREATE INDEX IF NOT EXISTS "LibraryItem_category_hiddenAt_idx"
  ON "LibraryItem"("category", "hiddenAt");

COMMIT;
