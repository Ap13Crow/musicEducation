-- Course access beyond buying a course (apps/api/src/lib/courseAccess.ts):
-- a platform-wide membership (mymusic.coach Plus, a Stripe subscription),
-- teacher invitations by email, and the reason each enrollment exists.
BEGIN;

CREATE TABLE IF NOT EXISTS "PlatformMembership" (
  "id"                   TEXT         NOT NULL,
  "userId"               TEXT         NOT NULL,
  -- MONTHLY or YEARLY
  "plan"                 TEXT         NOT NULL,
  -- Stripe's subscription status: active, trialing, past_due, canceled, ...
  "status"               TEXT         NOT NULL,
  "stripeSubscriptionId" TEXT         NOT NULL,
  "stripeCustomerId"     TEXT,
  "currentPeriodEnd"     TIMESTAMP(3) NOT NULL,
  "cancelAtPeriodEnd"    BOOLEAN      NOT NULL DEFAULT false,
  -- Last time the status was re-read from Stripe.
  "checkedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlatformMembership_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlatformMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PlatformMembership_userId_key" ON "PlatformMembership" ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "PlatformMembership_stripeSubscriptionId_key" ON "PlatformMembership" ("stripeSubscriptionId");

CREATE TABLE IF NOT EXISTS "CourseInvitation" (
  "id"          TEXT         NOT NULL,
  "courseId"    TEXT         NOT NULL,
  -- Lower-cased; matched against the invitee's account email.
  "email"       TEXT         NOT NULL,
  "invitedById" TEXT         NOT NULL,
  -- Set once the invitee is enrolled through the invitation.
  "userId"      TEXT,
  "enrolledAt"  TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CourseInvitation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CourseInvitation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CourseInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CourseInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "CourseInvitation_courseId_email_key" ON "CourseInvitation" ("courseId", "email");
CREATE INDEX IF NOT EXISTS "CourseInvitation_email_idx" ON "CourseInvitation" ("email");

-- PURCHASE, FREE, MEMBERSHIP, TEACHER_SUBSCRIPTION, TEACHER_STUDENT,
-- INVITATION. Null on older rows (treated as permanent access).
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "accessReason" TEXT;

COMMIT;
