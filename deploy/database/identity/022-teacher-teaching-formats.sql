-- TeacherProfile.teachingFormats was declared in schema.graphql and
-- accepted as an updateTeacherProfile argument, but the resolver never
-- persisted it (a hardcoded `teachingFormats() { return [] }` field
-- resolver stood in for real storage). This is the missing column.
BEGIN;

ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "teachingFormats" TEXT[] NOT NULL DEFAULT '{}';

COMMIT;
