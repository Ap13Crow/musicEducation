-- Lesson/LessonSlide.sourceUrl and .attribution were added to the Prisma
-- schema with the BnF integration (importBnfSlide/importBnfAudio) without a
-- migration. Prisma reads every column of a model, so creating or reading
-- lessons failed with P2022 on databases built from these migrations.
BEGIN;

ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "attribution" TEXT;
ALTER TABLE "LessonSlide" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "LessonSlide" ADD COLUMN IF NOT EXISTS "attribution" TEXT;

COMMIT;
