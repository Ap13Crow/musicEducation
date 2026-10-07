BEGIN;

CREATE TABLE IF NOT EXISTS "LibraryItemThumbnail" (
  "itemId"      TEXT         NOT NULL,
  "contentType" TEXT         NOT NULL,
  "bytes"       BYTEA        NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LibraryItemThumbnail_pkey" PRIMARY KEY ("itemId"),
  CONSTRAINT "LibraryItemThumbnail_itemId_fkey" FOREIGN KEY ("itemId")
    REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

COMMIT;
