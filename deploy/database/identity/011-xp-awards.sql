-- XP audit ledger for grants outside per-lesson (Lesson.xpReward) and
-- assessment (Assessment.xpAwarded) completion, which already increment
-- GamificationProfile directly (see apps/api/src/resolvers/xp.ts):
-- profile completion, first teacher booking, event attendance (all
-- automatic, one-time per user - or per event for attendance), and
-- teacher/admin-awarded course bonuses (repeatable, bounded by the
-- xp.courseBonus.min/max AdminSetting keys).
BEGIN;

DO $$ BEGIN
  CREATE TYPE "XpAwardReason" AS ENUM ('PROFILE_COMPLETED', 'TEACHER_FOUND', 'EVENT_ATTENDED', 'COURSE_BONUS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "XpAward" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "reason" "XpAwardReason" NOT NULL,
  "refId" TEXT,
  "enrollmentId" TEXT,
  "amount" INTEGER NOT NULL,
  "note" TEXT,
  "awardedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Relies on Postgres's NULL <> NULL semantics in unique indexes: rows with
-- a null refId (COURSE_BONUS) never collide with each other, so those stay
-- repeatable, while PROFILE_COMPLETED/TEACHER_FOUND ('self') and
-- EVENT_ATTENDED (the event id) are enforced one-time-per-key.
CREATE UNIQUE INDEX IF NOT EXISTS "XpAward_userId_reason_refId_key" ON "XpAward"("userId", "reason", "refId");
CREATE INDEX IF NOT EXISTS "XpAward_userId_idx" ON "XpAward"("userId");

COMMIT;
