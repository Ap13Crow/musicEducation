-- Splits TeacherProfile's overloaded isAvailable flag into two independent
-- switches. Previously isAvailable alone gated both booking eligibility
-- (bookSession) AND public directory/search visibility (the `teachers`
-- query) - a teacher pausing new bookings was silently removed from the
-- directory entirely, even though the UI copy only ever described the
-- booking half. isPublic now owns directory visibility; isAvailable keeps
-- booking eligibility only. Defaults to true so every existing teacher's
-- current directory visibility is unchanged by this migration.
BEGIN;

ALTER TABLE "TeacherProfile" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT true;

COMMIT;
