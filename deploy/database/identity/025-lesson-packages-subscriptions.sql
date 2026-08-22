-- Phase 5 (scoped): prepaid lesson packages, upfront-term subscriptions,
-- course bundling via existing Enrollment. True monthly recurring billing
-- (Stripe Subscription objects) is out of scope for this phase - both
-- product types here are single upfront Stripe Checkout payments.
BEGIN;

CREATE TABLE IF NOT EXISTS "LessonPackageOffer" (
  "id" TEXT PRIMARY KEY,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "instrument" TEXT,
  "lessonCount" INTEGER NOT NULL,
  "pricePerPackage" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'CHF',
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "LessonPackageOffer_teacherProfileId_idx" ON "LessonPackageOffer"("teacherProfileId");

CREATE TABLE IF NOT EXISTS "LessonPackagePurchase" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "offerId" TEXT REFERENCES "LessonPackageOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "instrument" TEXT,
  "lessonCount" INTEGER NOT NULL,
  "pricePaid" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL,
  "policyLeadDays" INTEGER NOT NULL,
  "policyCancellationDays" INTEGER NOT NULL,
  "paymentId" TEXT UNIQUE,
  "purchasedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "LessonPackagePurchase_userId_idx" ON "LessonPackagePurchase"("userId");
CREATE INDEX IF NOT EXISTS "LessonPackagePurchase_teacherProfileId_idx" ON "LessonPackagePurchase"("teacherProfileId");

DO $$ BEGIN
  CREATE TYPE "LessonCreditEntryType" AS ENUM ('GRANT','CONSUME','RESTORE','EXPIRE','ADJUST');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "LessonCreditLedgerEntry" (
  "id" TEXT PRIMARY KEY,
  "purchaseId" TEXT NOT NULL REFERENCES "LessonPackagePurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "type" "LessonCreditEntryType" NOT NULL,
  "amount" INTEGER NOT NULL,
  "bookingId" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "LessonCreditLedgerEntry_purchaseId_idx" ON "LessonCreditLedgerEntry"("purchaseId");

CREATE TABLE IF NOT EXISTS "SubscriptionOffer" (
  "id" TEXT PRIMARY KEY,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "includedHoursPerMonth" INTEGER NOT NULL,
  "termMonths" INTEGER NOT NULL,
  "monthlyPrice" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'CHF',
  "includedCourseIds" TEXT[] NOT NULL DEFAULT '{}',
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "SubscriptionOffer_teacherProfileId_idx" ON "SubscriptionOffer"("teacherProfileId");

DO $$ BEGIN
  CREATE TYPE "SubscriptionPurchaseStatus" AS ENUM ('ACTIVE','CANCELLED','EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "SubscriptionPurchase" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "offerId" TEXT REFERENCES "SubscriptionOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "termMonths" INTEGER NOT NULL,
  "includedHoursPerMonth" INTEGER NOT NULL,
  "monthlyPrice" DECIMAL(10,2) NOT NULL,
  "discountPct" INTEGER NOT NULL,
  "totalPricePaid" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL,
  "includedCourseIds" TEXT[] NOT NULL DEFAULT '{}',
  "policyLeadDays" INTEGER NOT NULL,
  "policyCancellationDays" INTEGER NOT NULL,
  "paymentId" TEXT UNIQUE,
  "status" "SubscriptionPurchaseStatus" NOT NULL DEFAULT 'ACTIVE',
  "startsAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "cancelledAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "SubscriptionPurchase_userId_idx" ON "SubscriptionPurchase"("userId");
CREATE INDEX IF NOT EXISTS "SubscriptionPurchase_teacherProfileId_idx" ON "SubscriptionPurchase"("teacherProfileId");

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "packagePurchaseId" TEXT;

COMMIT;
