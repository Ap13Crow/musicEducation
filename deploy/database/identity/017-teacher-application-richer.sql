-- Richer "become a teacher" application: private review fields (gender,
-- motivation - never shown publicly) plus a required YouTube presentation
-- video link. TeacherProfile gains the fields the approved application
-- copies onto the public profile: experienceYears and the intro video
-- (with a teacher-controlled visibility toggle, defaulting to visible).
BEGIN;

ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "motivation" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;

ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER;
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "introVideoUrl" TEXT;
ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "introVideoVisible" BOOLEAN NOT NULL DEFAULT true;

COMMIT;
