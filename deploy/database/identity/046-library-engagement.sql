-- ALTER TYPE ... ADD VALUE must commit before the value is used, so it runs
-- outside the transaction below.
ALTER TYPE "XpAwardReason" ADD VALUE IF NOT EXISTS 'LIBRARY_READ';
ALTER TYPE "XpAwardReason" ADD VALUE IF NOT EXISTS 'LIBRARY_LISTEN';

BEGIN;

DO $$ BEGIN
  CREATE TYPE "LibraryEngagementMode" AS ENUM ('READ', 'LISTEN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "LibraryEngagement" (
  "id"              TEXT                    NOT NULL,
  "userId"          TEXT                    NOT NULL,
  "itemId"          TEXT                    NOT NULL,
  "mode"            "LibraryEngagementMode" NOT NULL,
  "activeSeconds"   INTEGER                 NOT NULL DEFAULT 0,
  "progress"        DOUBLE PRECISION        NOT NULL DEFAULT 0,
  "length"          INTEGER,
  "lastHeartbeatAt" TIMESTAMP(3),
  "completedAt"     TIMESTAMP(3),
  "xpAwarded"       INTEGER                 NOT NULL DEFAULT 0,
  "startedAt"       TIMESTAMP(3)            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)            NOT NULL,
  CONSTRAINT "LibraryEngagement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LibraryEngagement_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LibraryEngagement_itemId_fkey" FOREIGN KEY ("itemId")
    REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "LibraryEngagement_userId_itemId_mode_key"
  ON "LibraryEngagement"("userId", "itemId", "mode");
CREATE INDEX IF NOT EXISTS "LibraryEngagement_itemId_idx" ON "LibraryEngagement"("itemId");
CREATE INDEX IF NOT EXISTS "LibraryEngagement_userId_updatedAt_idx" ON "LibraryEngagement"("userId", "updatedAt");

COMMIT;
