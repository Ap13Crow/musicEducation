-- Extend the durable transactional mail queue to event bookings. Event
-- confirmation/cancellation mail must survive relay failures just like lesson
-- mail and must never be sent synchronously from a booking request/webhook.

ALTER TYPE "MailOutboxKind" ADD VALUE IF NOT EXISTS 'EVENT_CONFIRMATION';
ALTER TYPE "MailOutboxKind" ADD VALUE IF NOT EXISTS 'EVENT_CANCELLED';

ALTER TABLE "MailOutboxMessage"
  ADD COLUMN IF NOT EXISTS "eventBookingId" TEXT;

CREATE INDEX IF NOT EXISTS "MailOutboxMessage_eventBookingId_idx"
  ON "MailOutboxMessage"("eventBookingId");
