const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

type WaitlistPayload = {
	email?: string;
	companyWebsite?: string;
	source?: string;
};

type WaitlistResult = {
	ok: boolean;
	status: number;
	message: string;
	count?: number;
};

type WaitlistClient = ReturnType<typeof import("@libsql/client").createClient>;

declare global {
	// eslint-disable-next-line no-var
	var __avalaunchVercelWaitlistClient: WaitlistClient | undefined;
	// eslint-disable-next-line no-var
	var __avalaunchVercelWaitlistSchemaReady: Promise<void> | undefined;
}

function getDatabaseUrl() {
	return (
		process.env.DATABASE_TURSO_DATABASE_URL ??
		process.env.TURSO_DATABASE_URL ??
		process.env.DATABASE_URL
	);
}

function getAuthToken() {
	return (
		process.env.DATABASE_TURSO_AUTH_TOKEN ??
		process.env.TURSO_AUTH_TOKEN ??
		process.env.DATABASE_AUTH_TOKEN
	);
}

async function getWaitlistClient() {
	if (globalThis.__avalaunchVercelWaitlistClient) {
		return globalThis.__avalaunchVercelWaitlistClient;
	}

	const databaseUrl = getDatabaseUrl();

	if (!databaseUrl) {
		throw new Error("Missing Turso database URL for waitlist storage.");
	}

	const { createClient } = await import("@libsql/client");

	globalThis.__avalaunchVercelWaitlistClient = createClient({
		url: databaseUrl,
		authToken: getAuthToken(),
	});

	return globalThis.__avalaunchVercelWaitlistClient;
}

async function ensureWaitlistSchema() {
	if (globalThis.__avalaunchVercelWaitlistSchemaReady) {
		return globalThis.__avalaunchVercelWaitlistSchemaReady;
	}

	globalThis.__avalaunchVercelWaitlistSchemaReady = (async () => {
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

	return globalThis.__avalaunchVercelWaitlistSchemaReady;
}

async function getWaitlistCount() {
	await ensureWaitlistSchema();

	const client = await getWaitlistClient();
	const result = await client.execute(`
		select count(*) as waitlist_count
		from waitlist_entries
	`);

	return Number(result.rows[0]?.waitlist_count ?? 0);
}

async function readWaitlistCount(): Promise<WaitlistResult> {
	try {
		return {
			ok: true,
			status: 200,
			message: "Waitlist count loaded.",
			count: await getWaitlistCount(),
		};
	} catch (error) {
		console.error("failed to load waitlist count", error);

		return {
			ok: false,
			status: 503,
			message: "Waitlist is temporarily unavailable.",
			count: 0,
		};
	}
}

function isValidEmail(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(value: string | undefined) {
	return value?.trim().toLowerCase() ?? "";
}

function requestHeaders(req: {
	headers: Record<string, string | string[] | undefined>;
}) {
	const headers = new Headers();

	for (const [key, value] of Object.entries(req.headers)) {
		if (Array.isArray(value)) {
			headers.set(key, value.join(","));
		} else if (value) {
			headers.set(key, value);
		}
	}

	return headers;
}

function requestHost(headers: Headers) {
	return headers.get("x-forwarded-host") ?? headers.get("host");
}

function getAllowedHosts(headers: Headers) {
	const hosts = new Set<string>();
	const currentHost = requestHost(headers);

	if (currentHost) {
		hosts.add(currentHost);
	}

	for (const value of [
		process.env.NEXT_PUBLIC_SITE_URL,
		process.env.APP_URL,
		process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: undefined,
		process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
	]) {
		if (!value) continue;

		try {
			hosts.add(new URL(value).host);
		} catch {
			hosts.add(value.replace(/^https?:\/\//, ""));
		}
	}

	return hosts;
}

function isAllowedOrigin(headers: Headers) {
	const origin = headers.get("origin");

	if (!origin) {
		return true;
	}

	try {
		return getAllowedHosts(headers).has(new URL(origin).host);
	} catch {
		return false;
	}
}

function getClientIp(headers: Headers) {
	const forwardedFor = headers.get("x-forwarded-for");

	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() ?? null;
	}

	return headers.get("x-real-ip");
}

async function hashIp(ip: string | null) {
	if (!ip) {
		return null;
	}

	const salt = process.env.WAITLIST_IP_HASH_SALT ?? "avalaunch-waitlist";
	const { createHash } = await import("node:crypto");

	return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

async function hasReachedRateLimit(ipHash: string | null) {
	if (!ipHash) {
		return false;
	}

	const client = await getWaitlistClient();
	const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
	const result = await client.execute({
		sql: `
			select count(*) as attempt_count
			from waitlist_attempts
			where ip_hash = ?
				and created_at >= ?
		`,
		args: [ipHash, cutoff],
	});

	return Number(result.rows[0]?.attempt_count ?? 0) >= MAX_ATTEMPTS_PER_WINDOW;
}

async function recordAttempt(ipHash: string | null, email: string) {
	if (!ipHash) {
		return;
	}

	const client = await getWaitlistClient();

	await client.execute({
		sql: `
			insert into waitlist_attempts (
				ip_hash,
				email,
				created_at
			) values (?, ?, ?)
		`,
		args: [ipHash, email, new Date().toISOString()],
	});
}

async function joinWaitlist(
	payload: WaitlistPayload,
	headers: Headers,
): Promise<WaitlistResult> {
	if (!isAllowedOrigin(headers)) {
		return {
			ok: false,
			status: 403,
			message: "This form can only be submitted from the AvaLaunch site.",
		};
	}

	if (payload.companyWebsite?.trim()) {
		return { ok: true, status: 200, message: "You are on the list." };
	}

	const email = normalizeEmail(payload.email);

	if (!isValidEmail(email)) {
		return {
			ok: false,
			status: 400,
			message: "Enter a valid work email.",
		};
	}

	try {
		await ensureWaitlistSchema();

		const ipHash = await hashIp(getClientIp(headers));

		if (await hasReachedRateLimit(ipHash)) {
			return {
				ok: false,
				status: 429,
				message: "Too many attempts. Try again in a few minutes.",
			};
		}

		await recordAttempt(ipHash, email);

		const client = await getWaitlistClient();
		const existing = await client.execute({
			sql: "select 1 from waitlist_entries where email = ? limit 1",
			args: [email],
		});

		if (existing.rows.length > 0) {
			return {
				ok: true,
				status: 200,
				message: "You are already on the list.",
				count: await getWaitlistCount(),
			};
		}

		await client.execute({
			sql: `
				insert into waitlist_entries (
					email,
					created_at,
					source,
					ip_hash,
					user_agent,
					referrer
				) values (?, ?, ?, ?, ?, ?)
			`,
			args: [
				email,
				new Date().toISOString(),
				payload.source?.trim() || "landing-page",
				ipHash,
				headers.get("user-agent")?.slice(0, 512) ?? null,
				headers.get("referer")?.slice(0, 512) ?? null,
			],
		});

		return {
			ok: true,
			status: 200,
			message: "You are on the list.",
			count: await getWaitlistCount(),
		};
	} catch (error) {
		console.error("waitlist signup failed", error);

		return {
			ok: false,
			status: 503,
			message: "Waitlist is temporarily unavailable.",
		};
	}
}

function parseBody(body: unknown): WaitlistPayload | null {
	if (typeof body === "string") {
		try {
			const parsed = JSON.parse(body);

			return typeof parsed === "object" && parsed ? parsed : null;
		} catch {
			return null;
		}
	}

	return typeof body === "object" && body ? body : null;
}

export default async function handler(req: any, res: any) {
	if (req.method === "GET") {
		const result = await readWaitlistCount();

		return res.status(result.status).json(result);
	}

	if (req.method !== "POST") {
		res.setHeader("allow", "GET, POST");

		return res.status(405).json({
			ok: false,
			status: 405,
			message: "Method not allowed.",
		});
	}

	const payload = parseBody(req.body);

	if (!payload) {
		return res.status(400).json({
			ok: false,
			status: 400,
			message: "Send a valid request body.",
		});
	}

	const result = await joinWaitlist(payload, requestHeaders(req));

	return res.status(result.status).json(result);
}
