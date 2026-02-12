/**
 * Automated ESPN sync script.
 *
 * Scrapes the latest standings from ESPNcricinfo, merges with
 * existing match data, re-runs predictions, and writes updated
 * JSON files to public/data/.
 *
 * Usage:
 *   npx tsx scripts/sync-from-espn.ts
 *
 * Called by:
 *   - GitHub Actions cron workflow (.github/workflows/sync-data.yml)
 *   - Manual invocation for live updates
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import axios from "axios";
import * as cheerio from "cheerio";

import type {
  StandingRow,
  MatchInfo,
  PredictionRow,
  GroupStandings,
} from "../src/lib/types";

// ── ESPN URL ──────────────────────────────────────────────

const ESPN_STANDINGS_URL =
  process.env.SCRAPE_URL_STANDINGS ??
  "https://www.espncricinfo.com/series/icc-men-s-t20-world-cup-2025-26-1502138/points-table-standings";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

// ── Team registry (maps ESPN names → our shortNames) ─────

const TEAMS = [
  { name: "Pakistan",              shortName: "PAK", flag: "\u{1F1F5}\u{1F1F0}", group: "A" },
  { name: "India",                 shortName: "IND", flag: "\u{1F1EE}\u{1F1F3}", group: "A" },
  { name: "Netherlands",           shortName: "NED", flag: "\u{1F1F3}\u{1F1F1}", group: "A" },
  { name: "Namibia",               shortName: "NAM", flag: "\u{1F1F3}\u{1F1E6}", group: "A" },
  { name: "United States of America", shortName: "USA", flag: "\u{1F1FA}\u{1F1F8}", group: "A" },
  { name: "Australia",             shortName: "AUS", flag: "\u{1F1E6}\u{1F1FA}", group: "B" },
  { name: "Zimbabwe",              shortName: "ZIM", flag: "\u{1F1FF}\u{1F1FC}", group: "B" },
  { name: "Sri Lanka",             shortName: "SL",  flag: "\u{1F1F1}\u{1F1F0}", group: "B" },
  { name: "Ireland",               shortName: "IRE", flag: "\u{1F1EE}\u{1F1EA}", group: "B" },
  { name: "Oman",                  shortName: "OMA", flag: "\u{1F1F4}\u{1F1F2}", group: "B" },
  { name: "West Indies",           shortName: "WI",  flag: "\u{1F3CF}",           group: "C" },
  { name: "Scotland",              shortName: "SCO", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}", group: "C" },
  { name: "England",               shortName: "ENG", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", group: "C" },
  { name: "Nepal",                 shortName: "NEP", flag: "\u{1F1F3}\u{1F1F5}", group: "C" },
  { name: "Italy",                 shortName: "ITA", flag: "\u{1F1EE}\u{1F1F9}", group: "C" },
  { name: "New Zealand",           shortName: "NZ",  flag: "\u{1F1F3}\u{1F1FF}", group: "D" },
  { name: "South Africa",          shortName: "SA",  flag: "\u{1F1FF}\u{1F1E6}", group: "D" },
  { name: "Afghanistan",           shortName: "AFG", flag: "\u{1F1E6}\u{1F1EB}", group: "D" },
  { name: "United Arab Emirates",  shortName: "UAE", flag: "\u{1F1E6}\u{1F1EA}", group: "D" },
  { name: "Canada",                shortName: "CAN", flag: "\u{1F1E8}\u{1F1E6}", group: "D" },
];

// ESPN name variants → our canonical short name
const NAME_MAP: Record<string, string> = {
  "pakistan": "PAK",
  "india": "IND",
  "netherlands": "NED",
  "namibia": "NAM",
  "united states of america": "USA",
  "usa": "USA",
  "u.s.a.": "USA",
  "united states": "USA",
  "australia": "AUS",
  "zimbabwe": "ZIM",
  "sri lanka": "SL",
  "ireland": "IRE",
  "oman": "OMA",
  "west indies": "WI",
  "windies": "WI",
  "scotland": "SCO",
  "england": "ENG",
  "nepal": "NEP",
  "italy": "ITA",
  "new zealand": "NZ",
  "south africa": "SA",
  "afghanistan": "AFG",
  "united arab emirates": "UAE",
  "u.a.e.": "UAE",
  "uae": "UAE",
  "canada": "CAN",
};

function resolveShortName(espnName: string): string | null {
  const lower = espnName.toLowerCase().trim();
  if (NAME_MAP[lower]) return NAME_MAP[lower];

  // Fuzzy: check if any key is a substring
  for (const [key, val] of Object.entries(NAME_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }

  return null;
}

function findTeam(short: string) {
  return TEAMS.find((t) => t.shortName === short)!;
}

function buildTeamId(shortName: string): string {
  return `static-${shortName.toLowerCase()}`;
}

// ── ESPN Scraper ──────────────────────────────────────────

interface ScrapedRow {
  teamName: string;
  group: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  nrr: number;
}

function parseIntSafe(val: string): number {
  const cleaned = val.trim();
  if (cleaned === "-" || cleaned === "") return 0;
  const n = parseInt(cleaned.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

function parseFloatSafe(val: string): number {
  const cleaned = val.replace(/[^0-9.\-+]/g, "");
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

function cleanTeamName(raw: string): string {
  return raw
    .replace(/^\d+\s*/, "")
    .replace(/\s*(W|L|T|N\/R)\s*$/g, "")
    .trim();
}

async function fetchWithRetry(url: string): Promise<string> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[sync] Attempt ${attempt}/${MAX_RETRIES}: ${url}`);
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": UA,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
          Connection: "keep-alive",
        },
        timeout: 30_000,
        maxRedirects: 5,
      });
      return data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      console.warn(
        `[sync] Attempt ${attempt} failed: ${status ?? (err as Error).message}`,
      );
      if (attempt < MAX_RETRIES) {
        console.log(`[sync] Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Unreachable");
}

async function scrapeESPNStandings(): Promise<ScrapedRow[]> {
  console.log(`[sync] Fetching standings from ESPN...`);

  const html = await fetchWithRetry(ESPN_STANDINGS_URL);
  const $ = cheerio.load(html);
  const rows: ScrapedRow[] = [];

  // Find group labels
  const groupLabels: string[] = [];
  $("*").each((_i, el) => {
    const text = $(el).text().trim();
    const match = text.match(/^Group\s+([A-D])$/i);
    if (match && el.type === "tag") {
      const g = match[1].toUpperCase();
      if (!groupLabels.includes(g)) groupLabels.push(g);
    }
  });

  console.log(`[sync] Found group labels: ${groupLabels.join(", ")}`);

  // Parse each table
  $("table").each((tableIdx, table) => {
    const parentText = $(table).parent().text();
    const grandparentText = $(table).parent().parent().text();

    let group = "?";
    for (const gl of groupLabels) {
      if (
        parentText.includes(`Group ${gl}`) ||
        grandparentText.includes(`Group ${gl}`)
      ) {
        group = gl;
        break;
      }
    }

    if (group === "?" && tableIdx < groupLabels.length) {
      group = groupLabels[tableIdx];
    }

    $(table)
      .find("tbody tr")
      .each((_rowIdx, row) => {
        const cells = $(row).find("td");
        if (cells.length < 7) return;

        let teamName = "";
        const anchor = $(cells[0]).find("a");
        if (anchor.length > 0) {
          teamName = cleanTeamName(anchor.text().trim());
        }
        if (!teamName) {
          teamName = cleanTeamName($(cells[0]).text().trim());
        }
        if (!teamName || teamName === "-") return;

        rows.push({
          teamName,
          group,
          played: parseIntSafe($(cells[1]).text()),
          won: parseIntSafe($(cells[2]).text()),
          lost: parseIntSafe($(cells[3]).text()),
          tied: parseIntSafe($(cells[4]).text()),
          noResult: parseIntSafe($(cells[5]).text()),
          points: parseIntSafe($(cells[6]).text()),
          nrr: parseFloatSafe($(cells[7])?.text() ?? "0"),
        });
      });
  });

  console.log(`[sync] Scraped ${rows.length} standings rows`);
  return rows;
}

// ── __NEXT_DATA__ fallback ────────────────────────────────
// ESPN Cricinfo uses Next.js. If HTML table parsing fails, try
// extracting the embedded JSON from the __NEXT_DATA__ script tag.

async function tryNextDataFallback(): Promise<ScrapedRow[]> {
  const html = await fetchWithRetry(ESPN_STANDINGS_URL);
  const $ = cheerio.load(html);

  const nextDataScript = $("#__NEXT_DATA__").html();
  if (!nextDataScript) {
    throw new Error("No __NEXT_DATA__ found on page");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nextData = JSON.parse(nextDataScript) as any;

  const rows: ScrapedRow[] = [];

  // Navigate the ESPN Next.js data structure to find standings
  // Path varies but typically: props.appPageProps.data.content.standings
  const findStandings = (obj: Record<string, unknown>, depth = 0): void => {
    if (depth > 10) return;
    if (!obj || typeof obj !== "object") return;

    // Look for arrays that look like standing entries
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (item && typeof item === "object") {
          findStandings(item as Record<string, unknown>, depth + 1);
        }
      }
      return;
    }

    // Check if this object has group standings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = obj as any;
    if (o.teamName && typeof o.matchesPlayed === "number") {
      const teamName =
        typeof o.teamName === "string"
          ? o.teamName
          : o.team?.name ?? o.team?.longName ?? "";
      const group = o.group?.name ?? o.groupName ?? "?";
      rows.push({
        teamName,
        group: typeof group === "string" ? group.replace("Group ", "") : "?",
        played: o.matchesPlayed ?? 0,
        won: o.matchesWon ?? 0,
        lost: o.matchesLost ?? 0,
        tied: o.matchesTied ?? 0,
        noResult: o.noResult ?? o.matchesNoResult ?? 0,
        points: o.points ?? 0,
        nrr: parseFloat(o.nrr ?? o.netRunRate ?? "0") || 0,
      });
    }

    // Recurse into object properties
    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        findStandings(value as Record<string, unknown>, depth + 1);
      }
    }
  };

  findStandings(nextData);
  console.log(`[sync] __NEXT_DATA__ fallback found ${rows.length} rows`);
  return rows;
}

// ── Build JSON outputs ───────────────────────────────────

function buildStandings(scraped: ScrapedRow[]): {
  groups: GroupStandings[];
  updatedAt: string;
} {
  const groupMap = new Map<string, StandingRow[]>();

  for (const s of scraped) {
    const shortName = resolveShortName(s.teamName);
    if (!shortName) {
      console.warn(`[sync] Unknown team: "${s.teamName}" – skipping`);
      continue;
    }

    const team = findTeam(shortName);
    if (!team) continue;

    const row: StandingRow = {
      teamId: buildTeamId(shortName),
      teamName: team.name,
      shortName: team.shortName,
      flag: team.flag,
      group: s.group !== "?" ? s.group : team.group,
      stage: "group",
      played: s.played,
      won: s.won,
      lost: s.lost,
      tied: s.tied,
      noResult: s.noResult,
      points: s.points,
      nrr: s.nrr,
      position: null,
    };

    const arr = groupMap.get(row.group) ?? [];
    arr.push(row);
    groupMap.set(row.group, arr);
  }

  // Sort within each group
  for (const [, rows] of groupMap) {
    rows.sort((a, b) => b.points - a.points || b.nrr - a.nrr);
  }

  const groups: GroupStandings[] = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, standings]) => ({ group, standings }));

  return { groups, updatedAt: new Date().toISOString() };
}

async function buildPredictions(
  standings: StandingRow[],
  matches: MatchInfo[],
): Promise<{ predictions: PredictionRow[]; updatedAt: string }> {
  const { runPredictions } = await import("../src/lib/predictions");

  const allTeams = TEAMS.map((t) => ({
    id: buildTeamId(t.shortName),
    name: t.name,
    shortName: t.shortName,
    flag: t.flag,
    group: t.group,
  }));

  const predictions = runPredictions(standings, matches, allTeams);

  return { predictions, updatedAt: new Date().toISOString() };
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  const outDir = join(process.cwd(), "public", "data");
  mkdirSync(outDir, { recursive: true });

  // 1. Scrape ESPN standings
  let scraped: ScrapedRow[];
  try {
    scraped = await scrapeESPNStandings();
    if (scraped.length < 15) {
      console.warn(
        `[sync] Only ${scraped.length} rows scraped (expected 20). ` +
          `Trying __NEXT_DATA__ fallback...`,
      );
      scraped = await tryNextDataFallback();
    }
  } catch (err) {
    console.warn("[sync] HTML scrape failed, trying __NEXT_DATA__ fallback...");
    try {
      scraped = await tryNextDataFallback();
    } catch {
      console.error("[sync] All scraping methods failed.");
      console.log(
        "[sync] ESPN may be blocking requests from this IP. " +
          "This typically works from GitHub Actions (cloud IPs).",
      );
      console.log("[sync] No changes written.");
      process.exit(1);
    }
  }

  if (scraped.length < 15) {
    console.error(
      `[sync] Only ${scraped.length} rows scraped – expected at least 15. Aborting to prevent bad data.`,
    );
    process.exit(1);
  }

  // 2. Build standings JSON
  console.log("[sync] Building standings...");
  const standingsData = buildStandings(scraped);
  const standingsJson = JSON.stringify(standingsData);

  // 3. Check if standings actually changed
  const standingsPath = join(outDir, "standings.json");
  let changed = true;
  if (existsSync(standingsPath)) {
    const existing = readFileSync(standingsPath, "utf-8");
    const existingParsed = JSON.parse(existing);
    // Compare without updatedAt
    const oldGroups = JSON.stringify(existingParsed.groups);
    const newGroups = JSON.stringify(standingsData.groups);
    if (oldGroups === newGroups) {
      console.log("[sync] Standings unchanged – no update needed.");
      changed = false;
    }
  }

  if (!changed) {
    console.log("[sync] Data is already up to date. Exiting.");
    process.exit(0);
  }

  // 4. Write standings
  writeFileSync(standingsPath, standingsJson);
  console.log(`[sync] Wrote standings.json (${standingsData.groups.length} groups)`);

  // 5. Load existing matches (we don't scrape matches, keep hardcoded)
  const matchesPath = join(outDir, "matches.json");
  let matchesData: { recent: MatchInfo[]; upcoming: MatchInfo[]; updatedAt: string };
  if (existsSync(matchesPath)) {
    matchesData = JSON.parse(readFileSync(matchesPath, "utf-8"));
    matchesData.updatedAt = new Date().toISOString();
    writeFileSync(matchesPath, JSON.stringify(matchesData));
    console.log(`[sync] Refreshed matches.json timestamp`);
  } else {
    // Fall back to generating from generate-static-data.ts
    console.log("[sync] No existing matches.json – run `npm run generate-data` first.");
    process.exit(1);
  }

  // 6. Build all standing rows + match infos for predictions
  const allStandingRows: StandingRow[] = standingsData.groups.flatMap(
    (g) => g.standings,
  );
  const allMatches: MatchInfo[] = [
    ...matchesData.recent,
    ...matchesData.upcoming,
  ];

  // 7. Re-run predictions
  console.log("[sync] Running prediction engine (10k simulations)...");
  const predictionsData = await buildPredictions(allStandingRows, allMatches);
  writeFileSync(join(outDir, "predictions.json"), JSON.stringify(predictionsData));
  console.log(`[sync] Wrote predictions.json (${predictionsData.predictions.length} teams)`);

  // 8. Summary
  console.log("\n[sync] Update complete!");
  console.log("Top 5 predicted champions:");
  predictionsData.predictions.slice(0, 5).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.flag} ${p.teamName} – ${p.winnerProb}%`);
  });

  // Signal to GitHub Actions that changes were made
  console.log("\nDATA_CHANGED=true");
}

main().catch((e) => {
  console.error("[sync] Fatal error:", e);
  process.exit(1);
});
