-- Object storage (S3-compatible / DigitalOcean Spaces) uploads: teacher
-- application CV/audio-sample/document files, and per-slide course decks.
-- Files themselves live in the S3_BUCKET configured via the
-- application-integrations Secret (see apps/api/src/lib/storage.ts) -
-- only URLs are stored here.
BEGIN;

-- ADD VALUE IF NOT EXISTS is already idempotent on its own (PG12+); unlike
-- CREATE TYPE elsewhere in this directory, this must NOT be wrapped in a
-- DO $$ ... $$ block - ALTER TYPE ... ADD VALUE cannot run inside a
-- function/procedure body, only as a plain top-level statement.
ALTER TYPE "LessonContentType" ADD VALUE IF NOT EXISTS 'SLIDES';

ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "cvUrl" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "audioSampleUrl" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "documentUrls" TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS "LessonSlide" (
  "id" TEXT PRIMARY KEY,
  "lessonId" TEXT NOT NULL REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  "fileUrl" TEXT NOT NULL,
  "title" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "LessonSlideView" (
  "id" TEXT PRIMARY KEY,
  "enrollmentId" TEXT NOT NULL REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "slideId" TEXT NOT NULL REFERENCES "LessonSlide"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "viewedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("enrollmentId","slideId")
);

CREATE INDEX IF NOT EXISTS "LessonSlide_lessonId_order_idx" ON "LessonSlide"("lessonId","order");

COMMIT;
