-- A successful lesson payment creates an approval request, not a confirmed
-- calendar commitment. Persist the student/teacher request notifications in
-- the same durable outbox used by confirmation and cancellation mail.

ALTER TYPE "MailOutboxKind" ADD VALUE IF NOT EXISTS 'BOOKING_REQUEST';
