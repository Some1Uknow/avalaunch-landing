import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@libsql/client";

const databaseUrl =
  process.env.DATABASE_TURSO_DATABASE_URL ??
  process.env.TURSO_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "file:./data/waitlist.db";
const authToken = databaseUrl.startsWith("file:")
  ? undefined
  : process.env.DATABASE_TURSO_AUTH_TOKEN ??
    process.env.TURSO_AUTH_TOKEN ??
    process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url: databaseUrl, authToken });

const dataPath = path.join(process.cwd(), "data", "waitlist.json");

async function ensureSchema() {
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
    ].map((sql) => ({ sql })),
    "write",
  );
}

async function main() {
  await ensureSchema();

  const raw = await readFile(dataPath, "utf8");
  const entries = JSON.parse(raw);

  if (!Array.isArray(entries)) {
    throw new Error("waitlist.json is not an array.");
  }

  let imported = 0;

  for (const entry of entries) {
    const email =
      typeof entry?.email === "string" ? entry.email.trim().toLowerCase() : "";
    const createdAt =
      typeof entry?.createdAt === "string"
        ? entry.createdAt
        : new Date().toISOString();

    if (!email) {
      continue;
    }

    const result = await client.execute({
      sql: `
        insert or ignore into waitlist_entries (
          email,
          created_at,
          source
        ) values (?, ?, 'landing-page')
      `,
      args: [email, createdAt],
    });

    imported += Number(result.rowsAffected ?? 0);
  }

  console.log(`Imported ${imported} waitlist entries from ${dataPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
