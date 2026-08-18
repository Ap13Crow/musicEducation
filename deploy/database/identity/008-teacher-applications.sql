-- Self-service "become a teacher" flow: a student submits a short application
-- (headline/bio/instruments/experience) instead of the role changing on the
-- spot. Only reviewTeacherApplication (ADMIN) approving one promotes the
-- applicant's role to TEACHER — see apps/api/src/resolvers/teacherApplications.ts.
BEGIN;

DO $$ BEGIN CREATE TYPE "TeacherApplicationStatus" AS ENUM ('PENDING','APPROVED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "TeacherApplication" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "headline" TEXT,
  "bio" TEXT,
  "instruments" TEXT[] NOT NULL DEFAULT '{}',
  "experienceYears" INTEGER,
  "status" "TeacherApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS "TeacherApplication_status_idx" ON "TeacherApplication"("status");

COMMIT;
