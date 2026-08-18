-- Address and birthdate for teacher applications. birthdate is verified
-- server-side (applyForTeacher rejects under-18 applicants) - self-employed
-- teachers on the platform must be adults; full identity verification is a
-- later phase, this is the quality/legal floor for now.
BEGIN;

ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "birthdate" DATE;

COMMIT;
