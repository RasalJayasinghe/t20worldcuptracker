/**
 * Static data fallback for serverless deployments (Netlify, Vercel, etc.)
 * where SQLite is not available.
 *
 * Reads pre-generated JSON from public/data/ which is created at build time
 * by scripts/generate-static-data.ts
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

function readStaticJson<T>(filename: string): T | null {
  // Try multiple paths since the working directory varies between
  // local dev, Next.js build, and serverless function runtimes
  const candidates = [
    join(process.cwd(), "public", "data", filename),
    join(process.cwd(), ".next", "server", "public", "data", filename),
  ];

  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        const raw = readFileSync(p, "utf-8");
        return JSON.parse(raw) as T;
      } catch {
        continue;
      }
    }
  }

  return null;
}

export function getStaticStandings() {
  return readStaticJson<{ groups: unknown[]; updatedAt: string }>("standings.json");
}

export function getStaticMatches() {
  return readStaticJson<{ recent: unknown[]; upcoming: unknown[]; updatedAt: string }>("matches.json");
}

export function getStaticPredictions() {
  return readStaticJson<{ predictions: unknown[]; updatedAt: string }>("predictions.json");
}
