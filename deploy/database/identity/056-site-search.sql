-- One search standard for every public search bar (apps/api/src/lib/
-- siteSearch.ts): the Library's accent-insensitive word search over a stored
-- tsvector (migration 048), with a similar-word fallback and "did you mean".
-- Courses, native events and external events get the same kind of stored
-- vector here; teachers are few and span two tables, so theirs is computed
-- per query instead.

-- array_to_string is only STABLE (it takes anyarray); for text[] it cannot
-- change, so this wrapper may be used in a generated column.
CREATE OR REPLACE FUNCTION search_tags(text[]) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE
  AS $$ SELECT coalesce(array_to_string($1, ' '), '') $$;

BEGIN;

-- Weights: A title, B tags and place, D description.
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "searchVector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("title", ''))), 'A') ||
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("shortSummary", '') || ' ' || search_tags("instruments") || ' ' || search_tags("musicStyles"))), 'B') ||
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("description", ''))), 'D')
) STORED;
CREATE INDEX IF NOT EXISTS "Course_searchVector_idx" ON "Course" USING gin ("searchVector");

ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "searchVector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("title", ''))), 'A') ||
  setweight(to_tsvector('simple'::regconfig, library_unaccent(
    search_tags("instruments") || ' ' || search_tags("musicStyles") || ' ' ||
    coalesce("venueName", '') || ' ' || coalesce("city", '') || ' ' || coalesce("country", ''))), 'B') ||
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("description", ''))), 'D')
) STORED;
CREATE INDEX IF NOT EXISTS "Event_searchVector_idx" ON "Event" USING gin ("searchVector");

ALTER TABLE "ExternalEventProjection" ADD COLUMN IF NOT EXISTS "searchVector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("title", ''))), 'A') ||
  setweight(to_tsvector('simple'::regconfig, library_unaccent(
    search_tags("instruments") || ' ' || search_tags("musicStyles") || ' ' || search_tags("classifications") || ' ' ||
    coalesce("venueName", '') || ' ' || coalesce("city", '') || ' ' || coalesce("country", ''))), 'B') ||
  setweight(to_tsvector('simple'::regconfig, library_unaccent(coalesce("description", ''))), 'D')
) STORED;
CREATE INDEX IF NOT EXISTS "ExternalEventProjection_searchVector_idx" ON "ExternalEventProjection" USING gin ("searchVector");

COMMIT;
