import { ensureWaitlistSchema, getWaitlistClient, getWaitlistCount } from "./waitlist-db";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

export type WaitlistPayload = {
	email?: string;
	companyWebsite?: string;
	source?: string;
};

export type WaitlistResult = {
	ok: boolean;
	status: number;
	message: string;
	count?: number;
};

function isValidEmail(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(value: string | undefined) {
	return value?.trim().toLowerCase() ?? "";
}

function getAllowedHosts(request: Request) {
	const hosts = new Set<string>();
	const currentHost =
		request.headers.get("x-forwarded-host") ?? request.headers.get("host");

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

function isAllowedOrigin(request: Request) {
	const origin = request.headers.get("origin");

	if (!origin) {
		return true;
	}

	try {
		return getAllowedHosts(request).has(new URL(origin).host);
	} catch {
		return false;
	}
}

function getClientIp(request: Request) {
	const forwardedFor = request.headers.get("x-forwarded-for");

	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() ?? null;
	}

	return request.headers.get("x-real-ip");
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
	const count = Number(result.rows[0]?.attempt_count ?? 0);

	return count >= MAX_ATTEMPTS_PER_WINDOW;
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

export async function readWaitlistCount(): Promise<WaitlistResult> {
	try {
		const count = await getWaitlistCount();

		return {
			ok: true,
			status: 200,
			message: "Waitlist count loaded.",
			count,
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

export async function joinWaitlist(
	payload: WaitlistPayload,
	request: Request,
): Promise<WaitlistResult> {
	if (!isAllowedOrigin(request)) {
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

		const ipHash = await hashIp(getClientIp(request));

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
				request.headers.get("user-agent")?.slice(0, 512) ?? null,
				request.headers.get("referer")?.slice(0, 512) ?? null,
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
