-- Provider genre tags on ExternalEventProjection.classifications aren't
-- aligned to this platform's taxonomy (a Ticketmaster "Classical" tag says
-- nothing about instrument or skill level). These columns are populated by
-- the worker's event-classification job from title/description/
-- classifications via DeepSeek, matching the same instrument/musicStyle/
-- skillLevel dimensions already used to filter and recommend native Events.
BEGIN;

ALTER TABLE "ExternalEventProjection" ADD COLUMN IF NOT EXISTS "instruments" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "ExternalEventProjection" ADD COLUMN IF NOT EXISTS "musicStyles" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "ExternalEventProjection" ADD COLUMN IF NOT EXISTS "skillLevels" TEXT[] NOT NULL DEFAULT '{}';
-- Null until the classification job has processed a row at least once -
-- empty tag arrays are a valid outcome (nothing confidently matched), not
-- "unprocessed", so this needs its own column rather than reusing the tags.
ALTER TABLE "ExternalEventProjection" ADD COLUMN IF NOT EXISTS "classifiedAt" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "ExternalEventProjection_classifiedAt_idx" ON "ExternalEventProjection"("classifiedAt");

COMMIT;
