-- Schema-parity fix: these eleven Prisma models had no corresponding table in
-- the cluster-bootstrap SQL, so any read/write that touched them failed at
-- runtime (e.g. "Failed to load platform stats: ... The table
-- \"public.Payment\" does not exist"). This file brings the bootstrap back in
-- sync with packages/database/prisma/schema.prisma in one pass — see
-- docs/development.md for how these hand-written files relate to the Prisma
-- schema (db push is the local-dev workflow; this runner is the cluster one).
BEGIN;

DO $$ BEGIN CREATE TYPE "PaymentStatus" AS ENUM ('PENDING','SUCCEEDED','FAILED','REFUNDED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE','YAPEAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "UserCredential" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "passwordHash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'CHF',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "provider" "PaymentProvider" NOT NULL,
  "providerRef" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");

-- Enrollment.paymentId and EventBooking.paymentId already exist as bare
-- columns (004-native-pillars.sql predates this table); add the foreign key
-- now that the referenced table exists, matching the Prisma relation.
DO $$ BEGIN
  ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "EventBooking" ADD CONSTRAINT "EventBooking_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Assessment" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMPTZ,
  "durationSec" INTEGER,
  "skillLevel" TEXT,
  "xpAwarded" INTEGER,
  "aiReport" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Assessment_userId_idx" ON "Assessment"("userId");

CREATE TABLE IF NOT EXISTS "AssessmentQuestion" (
  "id" TEXT PRIMARY KEY,
  "category" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "instrument" TEXT,
  "prompt" TEXT NOT NULL,
  "options" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AssessmentAnswer" (
  "id" TEXT PRIMARY KEY,
  "assessmentId" TEXT NOT NULL REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "questionId" TEXT NOT NULL REFERENCES "AssessmentQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "selectedOption" TEXT,
  "openAnswer" TEXT,
  "isCorrect" BOOLEAN,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AssessmentAnswer_assessmentId_idx" ON "AssessmentAnswer"("assessmentId");
CREATE INDEX IF NOT EXISTS "AssessmentAnswer_questionId_idx" ON "AssessmentAnswer"("questionId");

CREATE TABLE IF NOT EXISTS "FeedPost" (
  "id" TEXT PRIMARY KEY,
  "authorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "content" TEXT NOT NULL,
  "mediaUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "likesCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS "FeedPost_authorId_createdAt_idx" ON "FeedPost"("authorId","createdAt" DESC);

CREATE TABLE IF NOT EXISTS "FeedLike" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "postId" TEXT NOT NULL REFERENCES "FeedPost"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE ("userId","postId")
);
CREATE INDEX IF NOT EXISTS "FeedLike_postId_idx" ON "FeedLike"("postId");

CREATE TABLE IF NOT EXISTS "FeedComment" (
  "id" TEXT PRIMARY KEY,
  "postId" TEXT NOT NULL REFERENCES "FeedPost"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "authorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "FeedComment_postId_idx" ON "FeedComment"("postId");

CREATE TABLE IF NOT EXISTS "Follow" (
  "id" TEXT PRIMARY KEY,
  "followerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "followingId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("followerId","followingId")
);
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");

CREATE TABLE IF NOT EXISTS "Review" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "courseId" TEXT REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "eventId" TEXT REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "bookingId" TEXT UNIQUE REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "rating" INTEGER NOT NULL,
  "body" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);
CREATE INDEX IF NOT EXISTS "Review_courseId_idx" ON "Review"("courseId");
CREATE INDEX IF NOT EXISTS "Review_eventId_idx" ON "Review"("eventId");

CREATE TABLE IF NOT EXISTS "AdminSetting" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);

COMMIT;
