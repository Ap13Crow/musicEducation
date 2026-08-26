-- Splits TeacherProfile's overloaded isAvailable flag into two independent
-- switches. Previously isAvailable alone gated both booking eligibility
-- (bookSession) AND public directory/search visibility (the `teachers`
-- query) - a teacher pausing new bookings was silently removed from the
-- directory entirely, even though the UI copy only ever described the
-- booking half. isPublic now owns directory visibility; isAvailable keeps
-- booking eligibility only. Existing rows inherit their previous effective
-- visibility from isAvailable; future profiles default to public unless the
-- application explicitly creates them privately (for example an ADMIN).
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TeacherProfile'
      AND column_name = 'isPublic'
  ) THEN
    ALTER TABLE "TeacherProfile"
      ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

    -- Preserve the visibility users had before the flags were separated.
    -- This backfill only runs while creating the column, so later user choices
    -- are never overwritten when the idempotent schema Job is replayed.
    UPDATE "TeacherProfile"
    SET "isPublic" = "isAvailable";
  END IF;
END
$$;

COMMIT;
