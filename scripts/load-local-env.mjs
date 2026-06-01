import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

function parseEnvFile(filePath) {
  const raw = readFileSync(filePath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export function loadLocalEnv() {
  const cwd = process.cwd();
  const candidates = [".env.local", ".env"];

  for (const name of candidates) {
    const filePath = path.join(cwd, name);

    if (existsSync(filePath)) {
      parseEnvFile(filePath);
    }
  }
}
