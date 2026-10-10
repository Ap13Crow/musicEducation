-- Deutsche Nationalbibliothek as a Library source, plus derived columns the
-- federated admin import uses to spot the same work coming from two sources.
-- ALTER TYPE ... ADD VALUE must commit before use, so it runs outside the
-- transaction below.
ALTER TYPE "LibrarySource" ADD VALUE IF NOT EXISTS 'DNB';

BEGIN;

-- Abstract / summary from the source record (DNB MARC 520).
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Main title, lower-cased, accents folded, punctuation collapsed - the same
-- normalisation as apps/api/src/lib/libraryMatch.ts titleKey(). Generated,
-- so every writer (imports, admin edits) keeps it right without code.
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "titleKey" TEXT GENERATED ALWAYS AS (
  btrim(regexp_replace(
    translate(
      lower(split_part(split_part("title", ' : ', 1), ' / ', 1)),
      'àáâãäåāăąçćčďèéêëēėęěìíîïīįłñńňòóôõöøōőŕřśšşťùúûüūůűųýÿźżž',
      'aaaaaaaaacccdeeeeeeeeiiiiiilnnnoooooooorrssstuuuuuuuuyyzzz'
    ),
    '[^a-z0-9]+', ' ', 'g'
  ))
) STORED;

-- First four-digit year in the free-text date ("[ca. 1840]", "1840-1845").
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "year" INTEGER GENERATED ALWAYS AS (
  (substring("date" from '(1[0-9]{3}|20[0-9]{2})'))::integer
) STORED;

CREATE INDEX IF NOT EXISTS "LibraryItem_titleKey_idx" ON "LibraryItem" ("titleKey");
CREATE INDEX IF NOT EXISTS "LibraryItem_year_idx" ON "LibraryItem" ("year");

COMMIT;
