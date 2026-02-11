/**
 * Web scraper for ESPNcricinfo T20 World Cup 2026 data.
 *
 * Targets:
 *   Standings → https://www.espncricinfo.com/series/icc-men-s-t20-world-cup-2025-26-1502138/points-table-standings
 *   Matches   → https://www.espncricinfo.com/series/icc-men-s-t20-world-cup-2025-26-1502138/match-schedule-fixtures-and-results
 *
 * ESPN's DOM changes between redesigns, so selectors may need updating.
 * When the live structure changes, update the CSS selectors below.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedStanding, ScrapedMatch } from "./types";

// ── Configuration ────────────────────────────────────────

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ── Helpers ──────────────────────────────────────────────

async function fetchPage(url: string): Promise<cheerio.CheerioAPI> {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    timeout: 20_000,
  });
  return cheerio.load(data);
}

function parseFloatSafe(val: string): number {
  // Handle NRR values like "+1.450", "-2.763", or just "0"
  const cleaned = val.replace(/[^0-9.\-+]/g, "");
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

function parseIntSafe(val: string): number {
  // Handle "-" as 0 (Australia has "-" for all stats when they haven't played)
  const cleaned = val.trim();
  if (cleaned === "-" || cleaned === "") return 0;
  const n = parseInt(cleaned.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Clean a team name extracted from ESPN.
 * ESPN team cells often contain position numbers, form badges, etc.
 * e.g. "1 Pakistan" → "Pakistan"
 */
function cleanTeamName(raw: string): string {
  return raw
    .replace(/^\d+\s*/, "") // strip leading position number
    .replace(/\s*(W|L|T|N\/R)\s*$/g, "") // strip trailing form letters
    .trim();
}

// ── Standings scraper ────────────────────────────────────

export async function scrapeStandings(
  url?: string,
): Promise<ScrapedStanding[]> {
  const target = url ?? process.env.SCRAPE_URL_STANDINGS;
  if (!target) throw new Error("No standings URL configured");

  const $ = await fetchPage(target);
  const standings: ScrapedStanding[] = [];
  let currentGroup = "?";

  // ESPN Cricinfo 2025/26 layout: the page contains multiple tables,
  // one per group. Each group section has a heading containing "Group X".
  // We scan the page for group headings and the tables that follow.

  // Strategy: walk through all elements looking for group headings,
  // then parse the next table we find.

  // First, find all text nodes containing "Group X"
  const groupLabels: { group: string }[] = [];

  $("*").each((_i, el) => {
    const text = $(el).text().trim();
    const match = text.match(/^Group\s+([A-D])$/i);
    if (match && el.type === "tag") {
      groupLabels.push({
        group: match[1].toUpperCase(),
      });
    }
  });

  // Parse each table on the page
  $("table").each((_tableIdx, table) => {
    // Determine which group this table belongs to by checking
    // the closest parent or preceding sibling for "Group X" text
    const parentText = $(table).parent().text();
    const grandparentText = $(table).parent().parent().text();

    let group = "?";
    for (const gl of groupLabels) {
      // Check if this group label is an ancestor of this table
      if (
        parentText.includes(`Group ${gl.group}`) ||
        grandparentText.includes(`Group ${gl.group}`)
      ) {
        group = gl.group;
        break;
      }
    }

    // If we couldn't determine the group from parent, try sequential assignment
    if (group === "?" && _tableIdx < groupLabels.length) {
      group = groupLabels[_tableIdx].group;
    }

    currentGroup = group;

    // Parse rows
    $(table)
      .find("tbody tr")
      .each((_rowIdx, row) => {
        const cells = $(row).find("td");
        if (cells.length < 7) return;

        // First cell contains position + team name
        // ESPN wraps team name in an anchor with the team name as text
        let teamName = "";

        // Try to get team name from anchor tag first
        const anchor = $(cells[0]).find("a");
        if (anchor.length > 0) {
          teamName = cleanTeamName(anchor.text().trim());
        }
        if (!teamName) {
          teamName = cleanTeamName($(cells[0]).text().trim());
        }

        if (!teamName || teamName === "-") return;

        // Columns: Teams | M | W | L | T | N/R | PTS | NRR | ...
        const played = parseIntSafe($(cells[1]).text());
        const won = parseIntSafe($(cells[2]).text());
        const lost = parseIntSafe($(cells[3]).text());
        const tied = parseIntSafe($(cells[4]).text());
        const noResult = parseIntSafe($(cells[5]).text());
        const points = parseIntSafe($(cells[6]).text());
        const nrr = parseFloatSafe($(cells[7])?.text() ?? "0");

        standings.push({
          teamName,
          group: currentGroup,
          played,
          won,
          lost,
          tied,
          noResult,
          points,
          nrr,
        });
      });
  });

  console.log(`[scraper] Parsed ${standings.length} standings rows`);
  return standings;
}

// ── Match results / fixtures scraper ─────────────────────

export async function scrapeMatches(url?: string): Promise<ScrapedMatch[]> {
  const target = url ?? process.env.SCRAPE_URL_MATCHES;
  if (!target) throw new Error("No matches URL configured");

  const $ = await fetchPage(target);
  const matches: ScrapedMatch[] = [];

  // ESPN structures the schedule page with match cards.
  // Each card is typically a bordered div containing:
  //   – team names and scores
  //   – result text
  //   – date and venue info

  // Try multiple selector patterns that ESPN uses
  const cardSelectors = [
    ".ds-border-b.ds-border-line",
    "[class*='MatchCard']",
    ".match-score-block",
    ".ci-team-score",
    "a[href*='/full-scorecard'], a[href*='/live-cricket-score']",
  ];

  let cards = $(cardSelectors[0]);
  for (const sel of cardSelectors) {
    const found = $(sel);
    if (found.length > 0) {
      cards = found;
      break;
    }
  }

  cards.each((_i, card) => {
    const fullText = $(card).text().trim();

    // Try to extract team names
    const teamEls = $(card).find(
      "[class*='ci-team-score'], [class*='team-name'], p[class*='ds-text']",
    );

    let homeTeam = "";
    let awayTeam = "";
    let homeScore: string | null = null;
    let awayScore: string | null = null;

    if (teamEls.length >= 2) {
      homeTeam = cleanTeamName($(teamEls[0]).text().trim().split("\n")[0] ?? "");
      awayTeam = cleanTeamName($(teamEls[1]).text().trim().split("\n")[0] ?? "");
    }

    if (!homeTeam || !awayTeam) return;

    // Extract scores
    const scoreEls = $(card).find("[class*='score']");
    if (scoreEls.length >= 2) {
      homeScore = $(scoreEls[0]).text().trim() || null;
      awayScore = $(scoreEls[1]).text().trim() || null;
    }

    // Extract result
    const resultEl = $(card).find(
      "[class*='status-text'], [class*='result'], p[class*='ds-text-tight-s']",
    );
    const result = resultEl.text().trim() || null;

    // Determine status
    const lowerText = fullText.toLowerCase();
    let status: ScrapedMatch["status"] = "upcoming";
    if (result && (result.includes("won") || result.includes("tied"))) {
      status = "completed";
    } else if (lowerText.includes("live") || lowerText.includes("innings")) {
      status = "live";
    }

    // Try to extract group from match text (e.g. "Group A")
    let group: string | null = null;
    const groupMatch = fullText.match(/Group\s+([A-D])/i);
    if (groupMatch) group = groupMatch[1].toUpperCase();

    matches.push({
      homeTeam,
      awayTeam,
      date: null,
      venue: null,
      status,
      stage: "group",
      group,
      homeScore,
      awayScore,
      result,
      winner: null,
    });
  });

  console.log(`[scraper] Parsed ${matches.length} match cards`);
  return matches;
}

// ── Combined scrape ──────────────────────────────────────

export async function scrapeAll() {
  const [standings, matches] = await Promise.allSettled([
    scrapeStandings(),
    scrapeMatches(),
  ]);

  return {
    standings: standings.status === "fulfilled" ? standings.value : [],
    matches: matches.status === "fulfilled" ? matches.value : [],
    errors: [
      ...(standings.status === "rejected"
        ? [`Standings: ${standings.reason}`]
        : []),
      ...(matches.status === "rejected"
        ? [`Matches: ${matches.reason}`]
        : []),
    ],
  };
}
