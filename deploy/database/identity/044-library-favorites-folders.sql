BEGIN;

CREATE TABLE IF NOT EXISTS "LibraryFavorite" (
  "userId"    TEXT         NOT NULL,
  "itemId"    TEXT         NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LibraryFavorite_pkey" PRIMARY KEY ("userId", "itemId"),
  CONSTRAINT "LibraryFavorite_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LibraryFavorite_itemId_fkey" FOREIGN KEY ("itemId")
    REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LibraryFavorite_itemId_idx" ON "LibraryFavorite"("itemId");

CREATE TABLE IF NOT EXISTS "LibraryFolder" (
  "id"        TEXT         NOT NULL,
  "shortId"   TEXT         NOT NULL DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 10),
  "ownerId"   TEXT         NOT NULL,
  "parentId"  TEXT,
  "name"      TEXT         NOT NULL,
  "isPublic"  BOOLEAN      NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LibraryFolder_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LibraryFolder_ownerId_fkey" FOREIGN KEY ("ownerId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LibraryFolder_parentId_fkey" FOREIGN KEY ("parentId")
    REFERENCES "LibraryFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "LibraryFolder_shortId_key" ON "LibraryFolder"("shortId");
CREATE INDEX IF NOT EXISTS "LibraryFolder_ownerId_idx" ON "LibraryFolder"("ownerId");
CREATE INDEX IF NOT EXISTS "LibraryFolder_parentId_idx" ON "LibraryFolder"("parentId");

CREATE TABLE IF NOT EXISTS "LibraryFolderItem" (
  "folderId" TEXT         NOT NULL,
  "itemId"   TEXT         NOT NULL,
  "addedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LibraryFolderItem_pkey" PRIMARY KEY ("folderId", "itemId"),
  CONSTRAINT "LibraryFolderItem_folderId_fkey" FOREIGN KEY ("folderId")
    REFERENCES "LibraryFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LibraryFolderItem_itemId_fkey" FOREIGN KEY ("itemId")
    REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LibraryFolderItem_itemId_idx" ON "LibraryFolderItem"("itemId");

COMMIT;
