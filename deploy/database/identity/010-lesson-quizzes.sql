-- Coursera-style lesson quizzes: single/multiple-choice questions with
-- points, graded server-side (correct options never leave the API to a
-- student — see apps/api/src/resolvers/quizzes.ts). feedbackMode controls
-- whether a student sees correctness right after each question or only
-- once the whole quiz is submitted.
BEGIN;

DO $$ BEGIN CREATE TYPE "QuizQuestionType" AS ENUM ('SINGLE_CHOICE','MULTIPLE_CHOICE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "QuizFeedbackMode" AS ENUM ('IMMEDIATE','AT_END');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "feedbackMode" "QuizFeedbackMode" NOT NULL DEFAULT 'IMMEDIATE';

CREATE TABLE IF NOT EXISTS "QuizQuestion" (
  "id" TEXT PRIMARY KEY,
  "lessonId" TEXT NOT NULL REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "text" TEXT NOT NULL,
  "type" "QuizQuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE',
  "points" INTEGER NOT NULL DEFAULT 1,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "QuizOption" (
  "id" TEXT PRIMARY KEY,
  "questionId" TEXT NOT NULL REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "text" TEXT NOT NULL,
  "isCorrect" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "QuizAttempt" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "lessonId" TEXT NOT NULL REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "score" INTEGER NOT NULL DEFAULT 0,
  "maxScore" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  UNIQUE ("userId","lessonId")
);
CREATE TABLE IF NOT EXISTS "QuizAnswer" (
  "id" TEXT PRIMARY KEY,
  "attemptId" TEXT NOT NULL REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "questionId" TEXT NOT NULL REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "selectedOptionIds" TEXT[] NOT NULL DEFAULT '{}',
  "isCorrect" BOOLEAN NOT NULL DEFAULT false,
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "answeredAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("attemptId","questionId")
);

CREATE INDEX IF NOT EXISTS "QuizQuestion_lessonId_order_idx" ON "QuizQuestion"("lessonId","order");
CREATE INDEX IF NOT EXISTS "QuizOption_questionId_order_idx" ON "QuizOption"("questionId","order");

COMMIT;
