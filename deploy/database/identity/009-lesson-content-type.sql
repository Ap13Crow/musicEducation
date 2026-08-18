-- Lessons could previously only carry a single "videoUrl" and were always
-- rendered as an HTML5 <video> tag by the viewer. This adds a content-type
-- tag so the same field can also point at a YouTube video (embedded via
-- iframe) or a hosted audio file (rendered with <audio>) — see
-- apps/api/src/resolvers/courses.ts and apps/web/.../courses/[slug]/learn.
BEGIN;

DO $$ BEGIN CREATE TYPE "LessonContentType" AS ENUM ('VIDEO','YOUTUBE','AUDIO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "contentType" "LessonContentType" NOT NULL DEFAULT 'VIDEO';

COMMIT;
