-- mymusic.coach Plus revenue share (apps/api/src/lib/membershipRevenue.ts).
-- Every paid membership month is a slice: two thirds go to the teachers whose
-- courses the member completed in that month (split per completed course),
-- one third - and everything when nothing was completed - to the platform.
-- A yearly invoice becomes twelve monthly slices. Quiz questions can show a
-- picture (music notation for note-reading questions).
BEGIN;

CREATE TABLE IF NOT EXISTS "MembershipRevenueSlice" (
  "id"               TEXT         NOT NULL,
  "userId"           TEXT         NOT NULL,
  "plan"             TEXT         NOT NULL,
  "stripeInvoiceId"  TEXT         NOT NULL,
  -- 0 for a monthly invoice; 0-11 for the months of a yearly one.
  "sliceIndex"       INTEGER      NOT NULL DEFAULT 0,
  "periodStart"      TIMESTAMP(3) NOT NULL,
  "periodEnd"        TIMESTAMP(3) NOT NULL,
  "currency"         TEXT         NOT NULL DEFAULT 'CHF',
  "amountCents"      INTEGER      NOT NULL,
  "teacherPoolCents" INTEGER      NOT NULL,
  -- Set when the slice is settled (after periodEnd): what the platform keeps.
  "platformCents"    INTEGER,
  "settledAt"        TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MembershipRevenueSlice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MembershipRevenueSlice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "MembershipRevenueSlice_stripeInvoiceId_sliceIndex_key" ON "MembershipRevenueSlice" ("stripeInvoiceId", "sliceIndex");
CREATE INDEX IF NOT EXISTS "MembershipRevenueSlice_settledAt_periodEnd_idx" ON "MembershipRevenueSlice" ("settledAt", "periodEnd");

CREATE TABLE IF NOT EXISTS "MembershipTeacherShare" (
  "id"               TEXT         NOT NULL,
  "sliceId"          TEXT         NOT NULL,
  "teacherProfileId" TEXT         NOT NULL,
  "courseId"         TEXT         NOT NULL,
  "enrollmentId"     TEXT         NOT NULL,
  "amountCents"      INTEGER      NOT NULL,
  -- Stripe transfer to the teacher's connected account, once paid out.
  "stripeTransferId" TEXT,
  "paidAt"           TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MembershipTeacherShare_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MembershipTeacherShare_sliceId_fkey" FOREIGN KEY ("sliceId") REFERENCES "MembershipRevenueSlice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MembershipTeacherShare_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MembershipTeacherShare_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "MembershipTeacherShare_sliceId_enrollmentId_key" ON "MembershipTeacherShare" ("sliceId", "enrollmentId");
CREATE INDEX IF NOT EXISTS "MembershipTeacherShare_teacherProfileId_paidAt_idx" ON "MembershipTeacherShare" ("teacherProfileId", "paidAt");

ALTER TABLE "QuizQuestion" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

COMMIT;
