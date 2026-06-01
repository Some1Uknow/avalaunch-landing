import { createClient, type Client } from "@libsql/client";

const LOCAL_DATABASE_URL = "file:./data/waitlist.db";

declare global {
  // eslint-disable-next-line no-var
  var __waitlistClient: Client | undefined;
  // eslint-disable-next-line no-var
  var __waitlistSchemaReady: Promise<void> | undefined;
}

function getDatabaseUrl() {
  if (process.env.DATABASE_TURSO_DATABASE_URL) {
    return process.env.DATABASE_TURSO_DATABASE_URL;
  }

  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.VERCEL === "1") {
    return null;
  }

  return LOCAL_DATABASE_URL;
}

function getAuthToken(databaseUrl: string) {
  if (databaseUrl.startsWith("file:")) {
    return undefined;
  }

  return (
    process.env.DATABASE_TURSO_AUTH_TOKEN ??
    process.env.TURSO_AUTH_TOKEN ??
    process.env.DATABASE_AUTH_TOKEN
  );
}

export function getWaitlistClient() {
  if (globalThis.__waitlistClient) {
    return globalThis.__waitlistClient;
  }

  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "Missing TURSO_DATABASE_URL. Install the Turso Vercel integration or set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
    );
  }

  const authToken = getAuthToken(databaseUrl);

  globalThis.__waitlistClient = createClient({
    url: databaseUrl,
    authToken,
  });

  return globalThis.__waitlistClient;
}

export async function ensureWaitlistSchema() {
  if (globalThis.__waitlistSchemaReady) {
    return globalThis.__waitlistSchemaReady;
  }

  const client = getWaitlistClient();

  globalThis.__waitlistSchemaReady = (async () => {
    await client.batch(
      [
        `
          create table if not exists waitlist_entries (
            id integer primary key,
            email text not null unique,
            created_at text not null,
            source text not null default 'landing-page',
            ip_hash text,
            user_agent text,
            referrer text
          );
        `,
        `
          create index if not exists idx_waitlist_entries_created_at
          on waitlist_entries(created_at desc);
        `,
        `
          create table if not exists waitlist_attempts (
            id integer primary key,
            ip_hash text not null,
            email text,
            created_at text not null
          );
        `,
        `
          create index if not exists idx_waitlist_attempts_ip_created_at
          on waitlist_attempts(ip_hash, created_at desc);
        `,
      ].map((sql) => ({ sql })),
      "write",
    );
  })();

  return globalThis.__waitlistSchemaReady;
}

export async function getWaitlistCount() {
  await ensureWaitlistSchema();

  const client = getWaitlistClient();
  const result = await client.execute(`
    select count(*) as waitlist_count
    from waitlist_entries
  `);

  return Number(result.rows[0]?.waitlist_count ?? 0);
}
