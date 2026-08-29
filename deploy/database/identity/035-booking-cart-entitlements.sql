-- Booking cart / entitlement extension:
-- - one teacher per cart/order for now (keeps Connect payout and policy logic deterministic)
-- - one Stripe Checkout Session may pay for several lesson bookings
-- - one-off lesson payments are held on the platform until refund/payout policy resolves
-- - package/subscription purchases snapshot legal/refund/usage state.
BEGIN;

ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_REFUNDED';

DO $$ BEGIN
  CREATE TYPE "CheckoutOrderStatus" AS ENUM ('PENDING','PAID','CANCELLED','REFUNDED','PARTIALLY_REFUNDED','COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CheckoutOrderItemType" AS ENUM ('BOOKING','PACKAGE','SUBSCRIPTION','COURSE','EVENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TeacherTransferStatus" AS ENUM ('NOT_REQUIRED','HELD','READY','TRANSFERRED','FAILED','REVERSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LessonPackagePurchaseStatus" AS ENUM ('ACTIVE','REFUNDED','EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE "SubscriptionPurchaseStatus" ADD VALUE IF NOT EXISTS 'CANCELLED_AT_PERIOD_END';

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "providerPaymentIntentId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "providerChargeId" TEXT;

CREATE TABLE IF NOT EXISTS "BookingCart" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "teacherProfileId" TEXT NOT NULL REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "currency" TEXT NOT NULL DEFAULT 'CHF',
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "BookingCart_userId_expiresAt_idx" ON "BookingCart"("userId","expiresAt");
CREATE INDEX IF NOT EXISTS "BookingCart_teacherProfileId_expiresAt_idx" ON "BookingCart"("teacherProfileId","expiresAt");

CREATE TABLE IF NOT EXISTS "CheckoutOrder" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "teacherProfileId" TEXT REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "cartId" TEXT UNIQUE REFERENCES "BookingCart"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "paymentId" TEXT UNIQUE REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "status" "CheckoutOrderStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'CHF',
  "stripeCheckoutSessionId" TEXT UNIQUE,
  "stripePaymentIntentId" TEXT,
  "stripeChargeId" TEXT,
  "teacherTransferStatus" "TeacherTransferStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
  "teacherTransferDueAt" TIMESTAMPTZ,
  "stripeTransferId" TEXT,
  "refundedAt" TIMESTAMPTZ,
  "cancellationReason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "CheckoutOrder_userId_status_idx" ON "CheckoutOrder"("userId","status");
CREATE INDEX IF NOT EXISTS "CheckoutOrder_teacherProfileId_status_idx" ON "CheckoutOrder"("teacherProfileId","status");

CREATE TABLE IF NOT EXISTS "CheckoutOrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "CheckoutOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "type" "CheckoutOrderItemType" NOT NULL,
  "refId" TEXT,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitAmount" DECIMAL(10,2) NOT NULL,
  "totalAmount" DECIMAL(10,2) NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "CheckoutOrderItem_orderId_idx" ON "CheckoutOrderItem"("orderId");

CREATE TABLE IF NOT EXISTS "BookingCartItem" (
  "id" TEXT PRIMARY KEY,
  "cartId" TEXT NOT NULL REFERENCES "BookingCart"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ NOT NULL,
  "durationMin" INTEGER NOT NULL DEFAULT 60,
  "format" "BookingFormat" NOT NULL DEFAULT 'ONLINE',
  "instrument" TEXT,
  "notes" TEXT,
  "bookingId" TEXT REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "BookingCartItem_cartId_idx" ON "BookingCartItem"("cartId");

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "checkoutOrderId" TEXT REFERENCES "CheckoutOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "subscriptionPurchaseId" TEXT;

ALTER TABLE "LessonPackagePurchase" ADD COLUMN IF NOT EXISTS "status" "LessonPackagePurchaseStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "LessonPackagePurchase" ADD COLUMN IF NOT EXISTS "refundableUntil" TIMESTAMPTZ;
ALTER TABLE "LessonPackagePurchase" ADD COLUMN IF NOT EXISTS "firstUsedAt" TIMESTAMPTZ;
ALTER TABLE "LessonPackagePurchase" ADD COLUMN IF NOT EXISTS "includedCourseCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LessonPackagePurchase" ADD COLUMN IF NOT EXISTS "usedCourseCredits" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "SubscriptionPurchase" ADD COLUMN IF NOT EXISTS "includedCourseCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SubscriptionPurchase" ADD COLUMN IF NOT EXISTS "usedCourseCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SubscriptionPurchase" ADD COLUMN IF NOT EXISTS "includedEventCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SubscriptionPurchase" ADD COLUMN IF NOT EXISTS "usedEventCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SubscriptionPurchase" ADD COLUMN IF NOT EXISTS "cancellationEffectiveAt" TIMESTAMPTZ;
ALTER TABLE "SubscriptionPurchase" ADD COLUMN IF NOT EXISTS "monthlyCapHours" INTEGER NOT NULL DEFAULT 10;

UPDATE "AdminSetting"
SET value = '25', "updatedAt" = CURRENT_TIMESTAMP
WHERE key = 'subscription_discount_pct_12mo'
  AND value = '20';

COMMIT;
