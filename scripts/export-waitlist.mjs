import { writeFile } from "node:fs/promises";
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

function toCsvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

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
      `
        create index if not exists idx_waitlist_entries_created_at
        on waitlist_entries(created_at desc);
      `,
    ].map((sql) => ({ sql })),
    "write",
  );
}

async function main() {
  const outputPath =
    process.argv[2] ?? path.join(process.cwd(), "data", "waitlist-export.csv");

  await ensureSchema();

  const result = await client.execute(`
    select email, created_at, source
    from waitlist_entries
    order by created_at desc
  `);

  const lines = [
    ["email", "created_at", "source"].map(toCsvCell).join(","),
    ...result.rows.map((row) =>
      [row.email, row.created_at, row.source].map(toCsvCell).join(","),
    ),
  ];

  await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");

  console.log(`Exported ${result.rows.length} waitlist entries to ${outputPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
