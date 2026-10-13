// Prisma needs DATABASE_URL; the cluster provides PG* variables (Secret
// postgres-mymusiccoach) and the CA at /etc/postgres-ca. Shared by the API
// (src/index.ts) and the audio restorer (src/audioRestorer.ts).
export function configureDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  const required = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'] as const;
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Database configuration is missing: ${missing.join(', ')}`);
  }

  const user = encodeURIComponent(process.env.PGUSER!);
  const password = encodeURIComponent(process.env.PGPASSWORD!);
  const host = process.env.PGHOST!;
  const port = process.env.PGPORT!;
  const database = encodeURIComponent(process.env.PGDATABASE!);
  const query = new URLSearchParams({
    schema: 'public',
    sslmode: process.env.PGSSLMODE ?? 'verify-full',
    sslrootcert: process.env.PGSSLROOTCERT ?? '/etc/postgres-ca/ca.crt',
  });
  process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${database}?${query}`;
}
