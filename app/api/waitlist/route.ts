import { createHash } from "node:crypto";
import { ensureWaitlistSchema, getWaitlistClient } from "@/lib/waitlist-db";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

type WaitlistPayload = {
  email?: string;
  companyWebsite?: string;
  source?: string;
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
    if (!value) {
      continue;
    }

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

function hashIp(ip: string | null) {
  if (!ip) {
    return null;
  }

  const salt = process.env.WAITLIST_IP_HASH_SALT ?? "avalaunch-waitlist";

  return createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
}

async function hasReachedRateLimit(ipHash: string | null) {
  if (!ipHash) {
    return false;
  }

  const client = getWaitlistClient();
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

  const client = getWaitlistClient();

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

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return Response.json(
      { message: "This form can only be submitted from the AvaLaunch site." },
      { status: 403 },
    );
  }

  let payload: WaitlistPayload;

  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return Response.json(
      { message: "Send a valid request body." },
      { status: 400 },
    );
  }

  if (payload.companyWebsite?.trim()) {
    return Response.json({ message: "You are on the list." });
  }

  const email = normalizeEmail(payload.email);

  if (!isValidEmail(email)) {
    return Response.json(
      { message: "Enter a valid work email." },
      { status: 400 },
    );
  }

  try {
    await ensureWaitlistSchema();

    const ipHash = hashIp(getClientIp(request));

    if (await hasReachedRateLimit(ipHash)) {
      return Response.json(
        { message: "Too many attempts. Try again in a few minutes." },
        { status: 429 },
      );
    }

    await recordAttempt(ipHash, email);

    const client = getWaitlistClient();
    const existing = await client.execute({
      sql: "select 1 from waitlist_entries where email = ? limit 1",
      args: [email],
    });

    if (existing.rows.length > 0) {
      return Response.json({ message: "You are already on the list." });
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

    return Response.json({ message: "You are on the list." });
  } catch (error) {
    console.error("waitlist signup failed", error);

    return Response.json(
      { message: "Waitlist is temporarily unavailable." },
      { status: 503 },
    );
  }
}
