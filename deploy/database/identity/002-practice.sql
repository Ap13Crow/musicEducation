BEGIN;

CREATE TABLE IF NOT EXISTS "TeacherProfile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "bio" TEXT,
  "instruments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "musicStyles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "hourlyRate" DECIMAL(10,2),
  "currency" TEXT NOT NULL DEFAULT 'CHF',
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "calendlyUsername" TEXT,
  "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalReviews" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "TeacherProfile_hourlyRate_check" CHECK ("hourlyRate" IS NULL OR "hourlyRate" >= 0),
  CONSTRAINT "TeacherProfile_avgRating_check" CHECK ("avgRating" >= 0 AND "avgRating" <= 5),
  CONSTRAINT "TeacherProfile_totalReviews_check" CHECK ("totalReviews" >= 0)
);

CREATE TABLE IF NOT EXISTS "TeacherCertification" (
  "id" TEXT PRIMARY KEY,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT NOT NULL,
  "issuingBody" TEXT,
  "issuedYear" INTEGER,
  "documentUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeacherCertification_issuedYear_check"
    CHECK ("issuedYear" IS NULL OR ("issuedYear" >= 1900 AND "issuedYear" <= 2200))
);

CREATE TABLE IF NOT EXISTS "TeacherAvailability" (
  "id" TEXT PRIMARY KEY,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Zurich',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeacherAvailability_dayOfWeek_check" CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  CONSTRAINT "TeacherAvailability_startTime_check" CHECK ("startTime" ~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$'),
  CONSTRAINT "TeacherAvailability_endTime_check" CHECK ("endTime" ~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$'),
  CONSTRAINT "TeacherAvailability_timeRange_check" CHECK ("startTime" < "endTime")
);

CREATE TABLE IF NOT EXISTS "StudentAvailability" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Zurich',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentAvailability_dayOfWeek_check" CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  CONSTRAINT "StudentAvailability_startTime_check" CHECK ("startTime" ~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$'),
  CONSTRAINT "StudentAvailability_endTime_check" CHECK ("endTime" ~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$'),
  CONSTRAINT "StudentAvailability_timeRange_check" CHECK ("startTime" < "endTime")
);

CREATE INDEX IF NOT EXISTS "TeacherCertification_teacherProfileId_idx"
  ON "TeacherCertification"("teacherProfileId");
CREATE INDEX IF NOT EXISTS "TeacherAvailability_teacherProfileId_dayOfWeek_idx"
  ON "TeacherAvailability"("teacherProfileId", "dayOfWeek");
CREATE INDEX IF NOT EXISTS "StudentAvailability_userId_dayOfWeek_idx"
  ON "StudentAvailability"("userId", "dayOfWeek");
CREATE INDEX IF NOT EXISTS "TeacherProfile_discovery_idx"
  ON "TeacherProfile"("isAvailable", "avgRating" DESC);

COMMIT;
