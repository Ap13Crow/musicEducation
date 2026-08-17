BEGIN;

DO $$ BEGIN CREATE TYPE "CourseStatus" AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "BookingStatus" AS ENUM ('PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "BookingFormat" AS ENUM ('IN_PERSON','ONLINE','HYBRID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EventType" AS ENUM ('MASTERCLASS','WORKSHOP','CONCERT','COMPETITION','OPEN_MIC','LECTURE','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EventFormat" AS ENUM ('IN_PERSON','ONLINE','HYBRID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EventBookingStatus" AS ENUM ('PENDING','CONFIRMED','CANCELLED','REFUNDED','ATTENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL UNIQUE, "slug" TEXT NOT NULL UNIQUE,
  "parentId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Course" (
  "id" TEXT PRIMARY KEY, "slug" TEXT NOT NULL UNIQUE, "title" TEXT NOT NULL,
  "description" TEXT, "shortSummary" TEXT, "level" "SkillLevel" NOT NULL DEFAULT 'BEGINNER',
  "instruments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "musicStyles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "price" DECIMAL(10,2) NOT NULL DEFAULT 0, "currency" TEXT NOT NULL DEFAULT 'CHF',
  "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT', "isFreeTier" BOOLEAN NOT NULL DEFAULT false,
  "language" TEXT NOT NULL DEFAULT 'en', "thumbnailUrl" TEXT,
  "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "teacherProfileId" TEXT REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "moodleCourseId" INTEGER, "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalReviews" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "CourseSection" (
  "id" TEXT PRIMARY KEY, "courseId" TEXT NOT NULL REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "Lesson" (
  "id" TEXT PRIMARY KEY, "sectionId" TEXT NOT NULL REFERENCES "CourseSection"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT NOT NULL, "description" TEXT, "videoUrl" TEXT, "duration" INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0, "xpReward" INTEGER NOT NULL DEFAULT 10,
  "isPreview" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Enrollment" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "courseId" TEXT NOT NULL REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "paymentId" TEXT UNIQUE, "progress" DOUBLE PRECISION NOT NULL DEFAULT 0, "completedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ NOT NULL,
  UNIQUE ("userId","courseId")
);
CREATE TABLE IF NOT EXISTS "LessonProgress" (
  "id" TEXT PRIMARY KEY, "enrollmentId" TEXT NOT NULL REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "lessonId" TEXT NOT NULL REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "completedAt" TIMESTAMPTZ, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("enrollmentId","lessonId")
);

CREATE TABLE IF NOT EXISTS "Booking" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "startsAt" TIMESTAMPTZ NOT NULL, "endsAt" TIMESTAMPTZ, "durationMin" INTEGER NOT NULL DEFAULT 60,
  "format" "BookingFormat" NOT NULL DEFAULT 'ONLINE', "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "paymentId" TEXT, "instrument" TEXT, "notes" TEXT, "meetingUrl" TEXT,
  "zoomMeetingId" TEXT, "zoomJoinUrl" TEXT, "zoomStartUrl" TEXT, "externalBookingId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT PRIMARY KEY, "slug" TEXT NOT NULL UNIQUE, "title" TEXT NOT NULL, "description" TEXT,
  "type" "EventType" NOT NULL, "format" "EventFormat" NOT NULL,
  "instruments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "musicStyles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "skillLevels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "thumbnailUrl" TEXT, "videoStreamUrl" TEXT,
  "startsAt" TIMESTAMPTZ NOT NULL, "endsAt" TIMESTAMPTZ, "timezone" TEXT NOT NULL DEFAULT 'Europe/Zurich',
  "venueName" TEXT, "venueAddress" TEXT, "city" TEXT, "country" TEXT,
  "latitude" DOUBLE PRECISION, "longitude" DOUBLE PRECISION, "onlineMeetingUrl" TEXT,
  "price" DECIMAL(10,2) NOT NULL DEFAULT 0, "currency" TEXT NOT NULL DEFAULT 'CHF',
  "maxCapacity" INTEGER, "currentCapacity" INTEGER NOT NULL DEFAULT 0, "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "publisherId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "EventBooking" (
  "id" TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "status" "EventBookingStatus" NOT NULL DEFAULT 'PENDING', "paymentId" TEXT UNIQUE,
  "bookedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "pretixOrderCode" TEXT UNIQUE,
  "email" TEXT, "total" DOUBLE PRECISION, "currency" TEXT, "checkedIn" BOOLEAN NOT NULL DEFAULT false,
  UNIQUE ("userId","eventId")
);

CREATE INDEX IF NOT EXISTS "Course_status_createdAt_idx" ON "Course"("status","createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Enrollment_userId_idx" ON "Enrollment"("userId");
CREATE INDEX IF NOT EXISTS "Booking_userId_startsAt_idx" ON "Booking"("userId","startsAt" DESC);
CREATE INDEX IF NOT EXISTS "Booking_teacher_startsAt_idx" ON "Booking"("teacherProfileId","startsAt");
CREATE INDEX IF NOT EXISTS "Event_published_startsAt_idx" ON "Event"("isPublished","startsAt");
CREATE INDEX IF NOT EXISTS "EventBooking_userId_idx" ON "EventBooking"("userId");

COMMIT;
