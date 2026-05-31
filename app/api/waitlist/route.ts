import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type WaitlistEntry = {
  email: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const WAITLIST_PATH = path.join(DATA_DIR, "waitlist.json");

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function readEntries() {
  try {
    const file = await readFile(WAITLIST_PATH, "utf8");
    return JSON.parse(file) as WaitlistEntry[];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { email?: string };
  const email = payload.email?.trim().toLowerCase() ?? "";

  if (!isValidEmail(email)) {
    return Response.json(
      { message: "Enter a valid work email." },
      { status: 400 },
    );
  }

  await mkdir(DATA_DIR, { recursive: true });
  const entries = await readEntries();

  if (entries.some((entry) => entry.email === email)) {
    return Response.json({ message: "You are already on the list." });
  }

  entries.push({
    email,
    createdAt: new Date().toISOString(),
  });

  await writeFile(WAITLIST_PATH, JSON.stringify(entries, null, 2));

  return Response.json({ message: "You are on the list." });
}
