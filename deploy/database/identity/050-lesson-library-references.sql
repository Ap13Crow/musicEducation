-- Teachers attach Library items or whole Library folders to a lesson as
-- references (apps/api/src/resolvers/lessonLibrary.ts). A folder reference
-- stays live: what the teacher adds to the folder later shows in the lesson.
BEGIN;

CREATE TABLE IF NOT EXISTS "LessonLibraryReference" (
  "id"        TEXT         NOT NULL,
  "lessonId"  TEXT         NOT NULL,
  "itemId"    TEXT,
  "folderId"  TEXT,
  "note"      TEXT,
  "order"     INTEGER      NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LessonLibraryReference_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LessonLibraryReference_one_target" CHECK (("itemId" IS NULL) <> ("folderId" IS NULL)),
  CONSTRAINT "LessonLibraryReference_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LessonLibraryReference_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LessonLibraryReference_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "LibraryFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "LessonLibraryReference_lessonId_itemId_key" ON "LessonLibraryReference" ("lessonId", "itemId");
CREATE UNIQUE INDEX IF NOT EXISTS "LessonLibraryReference_lessonId_folderId_key" ON "LessonLibraryReference" ("lessonId", "folderId");
CREATE INDEX IF NOT EXISTS "LessonLibraryReference_itemId_idx" ON "LessonLibraryReference" ("itemId");
CREATE INDEX IF NOT EXISTS "LessonLibraryReference_folderId_idx" ON "LessonLibraryReference" ("folderId");

COMMIT;
