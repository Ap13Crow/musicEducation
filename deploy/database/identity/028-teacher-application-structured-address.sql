-- Replace the single free-text "address" line on teacher applications with
-- structured fields (street, house number, postal code, city, state,
-- country), validated server-side in applyForTeacher. The old "address"
-- column is left in place as an unused legacy column (matches this
-- codebase's convention - see Course.moodleCourseId, EventBooking
-- .pretixOrderCode) rather than dropped, since it may still hold data from
-- applications submitted before this change.
BEGIN;

ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "street" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "houseNumber" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "TeacherApplication" ADD COLUMN IF NOT EXISTS "country" TEXT;

COMMIT;
