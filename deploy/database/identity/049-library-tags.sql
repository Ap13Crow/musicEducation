-- Library items tagged with the same vocabulary as profiles, courses and
-- events (instruments, music styles, learner level) by the worker's
-- library-classification job, for recommendations and search filters.
BEGIN;

ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "instruments" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "musicStyles" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "skillLevels" TEXT[] NOT NULL DEFAULT '{}';
-- Set once the classifier has looked at the item (tags may stay empty).
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "classifiedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "LibraryItem_instruments_idx" ON "LibraryItem" USING gin ("instruments");
CREATE INDEX IF NOT EXISTS "LibraryItem_musicStyles_idx" ON "LibraryItem" USING gin ("musicStyles");
CREATE INDEX IF NOT EXISTS "LibraryItem_classifiedAt_idx" ON "LibraryItem" ("classifiedAt");

COMMIT;
