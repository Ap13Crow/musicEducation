-- ALTER TYPE ... ADD VALUE can't run inside a transaction block on older
-- PostgreSQL, so no BEGIN/COMMIT here; IF NOT EXISTS keeps it idempotent.
ALTER TYPE "LibrarySource" ADD VALUE IF NOT EXISTS 'MUSOPEN';
ALTER TYPE "LibrarySource" ADD VALUE IF NOT EXISTS 'MUTOPIA';
