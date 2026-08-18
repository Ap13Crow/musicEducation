-- Revisiting a question (e.g. going back a step in onboarding) must update
-- the existing answer, not add a second row - completeAssessment scores
-- off assessment.answers.length, so a duplicate would inflate totalAnswered
-- and silently skew the resulting score/skill level. The frontend never
-- actually called submitAssessmentAnswer before this change (a separate
-- bug fixed alongside this one), so this table is expected to be empty in
-- every environment that reaches this file - no dedup step needed.
BEGIN;

-- Same duplicate_table (42P07) footgun as 007-stripe-connect.sql: a UNIQUE
-- constraint's backing index can already exist from a prior partial apply.
DO $$ BEGIN
  ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_assessmentId_questionId_key" UNIQUE ("assessmentId", "questionId");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

COMMIT;
