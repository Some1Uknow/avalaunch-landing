const LOCAL_DATABASE_URL = "file:./data/waitlist.db";
type WaitlistClient = ReturnType<typeof import("@libsql/client").createClient>;

declare global {
	// eslint-disable-next-line no-var
	var __avalaunchWaitlistClient: WaitlistClient | undefined;
	// eslint-disable-next-line no-var
	var __avalaunchWaitlistSchemaReady: Promise<void> | undefined;
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

export async function getWaitlistClient() {
	if (globalThis.__avalaunchWaitlistClient) {
		return globalThis.__avalaunchWaitlistClient;
	}

	const databaseUrl = getDatabaseUrl();

	if (!databaseUrl) {
		throw new Error(
			"Missing TURSO_DATABASE_URL. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN for production waitlist storage.",
		);
	}

	const { createClient } = await import("@libsql/client");

	if (databaseUrl.startsWith("file:")) {
		const { mkdir } = await import("node:fs/promises");
		const { dirname } = await import("node:path");
		const databasePath = databaseUrl.replace(/^file:/, "");

		await mkdir(dirname(databasePath), { recursive: true });
	}

	globalThis.__avalaunchWaitlistClient = createClient({
		url: databaseUrl,
		authToken: getAuthToken(databaseUrl),
	});

	return globalThis.__avalaunchWaitlistClient;
}

export async function ensureWaitlistSchema() {
	if (globalThis.__avalaunchWaitlistSchemaReady) {
		return globalThis.__avalaunchWaitlistSchemaReady;
	}

	globalThis.__avalaunchWaitlistSchemaReady = (async () => {
		const client = await getWaitlistClient();

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

	return globalThis.__avalaunchWaitlistSchemaReady;
}

export async function getWaitlistCount() {
	await ensureWaitlistSchema();

	const client = await getWaitlistClient();
	const result = await client.execute(`
		select count(*) as waitlist_count
		from waitlist_entries
	`);

	return Number(result.rows[0]?.waitlist_count ?? 0);
}
