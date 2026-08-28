-- Upload-only teacher-application rows are drafts, not reviewable
-- submissions. The wizard saves files as the applicant goes, then only
-- applyForTeacher moves the row to PENDING after the final review step.
ALTER TYPE "TeacherApplicationStatus" ADD VALUE IF NOT EXISTS 'DRAFT' BEFORE 'PENDING';

UPDATE "TeacherApplication"
SET "status" = 'DRAFT', "updatedAt" = CURRENT_TIMESTAMP
WHERE "status" = 'PENDING'
  AND (
    "headline" IS NULL OR btrim("headline") = '' OR
    "bio" IS NULL OR btrim("bio") = '' OR
    cardinality("instruments") = 0 OR
    "birthdate" IS NULL OR
    "motivation" IS NULL OR btrim("motivation") = '' OR
    "cvUrl" IS NULL OR
    "videoUrl" IS NULL OR btrim("videoUrl") = '' OR
    "street" IS NULL OR btrim("street") = '' OR
    "houseNumber" IS NULL OR btrim("houseNumber") = '' OR
    "postalCode" IS NULL OR btrim("postalCode") = '' OR
    "city" IS NULL OR btrim("city") = '' OR
    "country" IS NULL OR btrim("country") = ''
  );
