-- Public professional photo shown on the teacher directory/profile to guests
-- and other users - deliberately separate from UserProfile.avatarUrl (the
-- private account avatar, set via POST /profile/avatar). Nullable: an
-- approved teacher who hasn't uploaded one yet falls back to an honest
-- neutral placeholder in the UI rather than silently reusing the account
-- avatar.
BEGIN;

ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "publicImageUrl" TEXT;

-- Captured at application time (requestUploadUrl purpose:
-- TEACHER_PROFILE_IMAGE) and copied onto TeacherProfile.publicImageUrl on
-- approval, the same way videoUrl -> introVideoUrl already works.
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

COMMIT;
