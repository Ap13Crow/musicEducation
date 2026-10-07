BEGIN;

-- One-time correction, idempotent on re-run: BnF rows ingested before
-- categorizeDocumentTypes (packages/bnf-gallica/src/libraryIngest.ts) were
-- categorized from a single dc:type label, which filed manuscript scores
-- ("manuscript music") and genre-only scores ("Genre musical : rondo")
-- under OTHER. Only the stored label is available here; the next ingest
-- that touches a row recategorizes it from the full dc:type list.
UPDATE "LibraryItem"
SET "category" = 'SHEET_MUSIC', "updatedAt" = CURRENT_TIMESTAMP
WHERE "source" = 'BNF'
  AND "category" = 'OTHER'
  AND (
    lower("documentType") LIKE '%manuscript music%'
    OR lower("documentType") LIKE '%musique manuscrite%'
    OR lower("documentType") LIKE '%printed music%'
    OR lower("documentType") ~ '^\s*genre musical\s*:'
  );

COMMIT;
