BEGIN;

DO $$ BEGIN CREATE TYPE "ExternalEventProvider" AS ENUM ('TICKETMASTER','CLASSICTIC');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ExternalEventProjection" (
  "id" TEXT PRIMARY KEY, "provider" "ExternalEventProvider" NOT NULL, "providerId" TEXT NOT NULL,
  "title" TEXT NOT NULL, "description" TEXT, "url" TEXT NOT NULL, "imageUrl" TEXT,
  "startsAt" TIMESTAMPTZ NOT NULL, "endsAt" TIMESTAMPTZ, "timezone" TEXT,
  "venueName" TEXT, "city" TEXT, "country" TEXT, "latitude" DOUBLE PRECISION, "longitude" DOUBLE PRECISION,
  "minPrice" DECIMAL(10,2), "maxPrice" DECIMAL(10,2), "currency" TEXT,
  "classifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "attribution" TEXT NOT NULL, "raw" JSONB,
  "fetchedAt" TIMESTAMPTZ NOT NULL, "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ NOT NULL,
  UNIQUE ("provider","providerId")
);

CREATE INDEX IF NOT EXISTS "ExternalEventProjection_startsAt_idx" ON "ExternalEventProjection"("startsAt");
CREATE INDEX IF NOT EXISTS "ExternalEventProjection_city_idx" ON "ExternalEventProjection"("city");

COMMIT;
