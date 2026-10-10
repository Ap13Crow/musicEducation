-- Two more Library sources for historic and openly licensed recordings:
-- the Internet Archive's 78 rpm collections (lib/archive78.ts) and
-- Europeana (lib/europeana.ts). Enum values can't be added inside a
-- transaction that uses them, and nothing here needs one.
ALTER TYPE "LibrarySource" ADD VALUE IF NOT EXISTS 'INTERNET_ARCHIVE';
ALTER TYPE "LibrarySource" ADD VALUE IF NOT EXISTS 'EUROPEANA';
