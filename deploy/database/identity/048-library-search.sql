-- Library full-text search (apps/api/src/lib/librarySearch.ts): accent-
-- insensitive word search over a stored tsvector, trigram similarity for
-- "did you mean" and similar-term matches. Both extensions are "trusted"
-- (PostgreSQL 13+), so the database owner may create them.
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- unaccent() is only STABLE (its dictionary could change); pinning the
-- dictionary makes it safe to use in a generated column and an index.
CREATE OR REPLACE FUNCTION library_unaccent(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
  AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;

BEGIN;

-- 'simple' configuration: no stemming, so French, German, English and
-- Italian titles all match word for word. Weights: A title, B creator,
-- C type and date, D description - searching one field filters by weight.
ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "searchVector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("title", ''))), 'A') ||
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("creator", ''))), 'B') ||
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("documentType", '') || ' ' || coalesce("date", ''))), 'C') ||
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("description", ''))), 'D')
) STORED;

CREATE INDEX IF NOT EXISTS "LibraryItem_searchVector_idx" ON "LibraryItem" USING gin ("searchVector");
CREATE INDEX IF NOT EXISTS "LibraryItem_title_creator_trgm_idx" ON "LibraryItem"
  USING gin ((library_unaccent(lower("title" || ' ' || coalesce("creator", '')))) gin_trgm_ops);

COMMIT;
