BEGIN;

-- Permanent /l/<shortId> share links. Existing rows get an id derived from
-- their primary key (stable if this file re-runs); new rows get a random one
-- from the column default.
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "shortId" TEXT;
UPDATE "LibraryItem" SET "shortId" = substr(md5("id"), 1, 10) WHERE "shortId" IS NULL;
ALTER TABLE "LibraryItem"
  ALTER COLUMN "shortId" SET DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 10);
ALTER TABLE "LibraryItem" ALTER COLUMN "shortId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "LibraryItem_shortId_key" ON "LibraryItem"("shortId");

COMMIT;
