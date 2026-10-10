-- One course in several languages: the English original and its German and
-- French editions share a translationKey (the original's slug), so each
-- course page can link to the others, and the membership's course count
-- counts a course once, not once per language.
BEGIN;

ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "translationKey" TEXT;
CREATE INDEX IF NOT EXISTS "Course_translationKey_idx" ON "Course" ("translationKey");

COMMIT;
