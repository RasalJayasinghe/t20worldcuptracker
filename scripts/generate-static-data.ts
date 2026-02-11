/**
 * Build-time static data generator.
 *
 * Runs the seed data + prediction engine and outputs JSON files
 * to public/data/ so the app works on serverless platforms (Netlify)
 * where SQLite is not available.
 *
 * Run:  npx tsx scripts/generate-static-data.ts
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// ── Import prediction engine (relative path since we're outside src/) ──
// We inline the data here to avoid Prisma/DB dependencies at build time.

import type {
  StandingRow,
  MatchInfo,
  PredictionRow,
  GroupStandings,
} from "../src/lib/types";

// ── Teams ──────────────────────────────────────────────────

const TEAMS = [
  // Group A
  { name: "Pakistan",              shortName: "PAK", flag: "\u{1F1F5}\u{1F1F0}", group: "A" },
  { name: "India",                 shortName: "IND", flag: "\u{1F1EE}\u{1F1F3}", group: "A" },
  { name: "Netherlands",           shortName: "NED", flag: "\u{1F1F3}\u{1F1F1}", group: "A" },
  { name: "Namibia",               shortName: "NAM", flag: "\u{1F1F3}\u{1F1E6}", group: "A" },
  { name: "United States of America", shortName: "USA", flag: "\u{1F1FA}\u{1F1F8}", group: "A" },

  // Group B
  { name: "Zimbabwe",              shortName: "ZIM", flag: "\u{1F1FF}\u{1F1FC}", group: "B" },
  { name: "Sri Lanka",             shortName: "SL",  flag: "\u{1F1F1}\u{1F1F0}", group: "B" },
  { name: "Ireland",               shortName: "IRE", flag: "\u{1F1EE}\u{1F1EA}", group: "B" },
  { name: "Oman",                  shortName: "OMA", flag: "\u{1F1F4}\u{1F1F2}", group: "B" },
  { name: "Australia",             shortName: "AUS", flag: "\u{1F1E6}\u{1F1FA}", group: "B" },

  // Group C
  { name: "West Indies",           shortName: "WI",  flag: "\u{1F3CF}",           group: "C" },
  { name: "Scotland",              shortName: "SCO", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}", group: "C" },
  { name: "England",               shortName: "ENG", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", group: "C" },
  { name: "Nepal",                 shortName: "NEP", flag: "\u{1F1F3}\u{1F1F5}", group: "C" },
  { name: "Italy",                 shortName: "ITA", flag: "\u{1F1EE}\u{1F1F9}", group: "C" },

  // Group D
  { name: "New Zealand",           shortName: "NZ",  flag: "\u{1F1F3}\u{1F1FF}", group: "D" },
  { name: "South Africa",          shortName: "SA",  flag: "\u{1F1FF}\u{1F1E6}", group: "D" },
  { name: "Afghanistan",           shortName: "AFG", flag: "\u{1F1E6}\u{1F1EB}", group: "D" },
  { name: "United Arab Emirates",  shortName: "UAE", flag: "\u{1F1E6}\u{1F1EA}", group: "D" },
  { name: "Canada",                shortName: "CAN", flag: "\u{1F1E8}\u{1F1E6}", group: "D" },
];

// ── Standings ──────────────────────────────────────────────

interface SeedStanding {
  short: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  nr: number;
  pts: number;
  nrr: number;
}

const STANDINGS: SeedStanding[] = [
  // Group A
  { short: "PAK", played: 2, won: 2, lost: 0, tied: 0, nr: 0, pts: 4, nrr:  0.932 },
  { short: "IND", played: 1, won: 1, lost: 0, tied: 0, nr: 0, pts: 2, nrr:  1.450 },
  { short: "NED", played: 2, won: 1, lost: 1, tied: 0, nr: 0, pts: 2, nrr:  0.356 },
  { short: "NAM", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -1.033 },
  { short: "USA", played: 2, won: 0, lost: 2, tied: 0, nr: 0, pts: 0, nrr: -1.525 },

  // Group B
  { short: "AUS", played: 1, won: 1, lost: 0, tied: 0, nr: 0, pts: 2, nrr:  3.350 },
  { short: "ZIM", played: 1, won: 1, lost: 0, tied: 0, nr: 0, pts: 2, nrr:  2.702 },
  { short: "SL",  played: 1, won: 1, lost: 0, tied: 0, nr: 0, pts: 2, nrr:  1.000 },
  { short: "IRE", played: 2, won: 0, lost: 2, tied: 0, nr: 0, pts: 0, nrr: -2.175 },
  { short: "OMA", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -2.702 },

  // Group C
  { short: "WI",  played: 1, won: 1, lost: 0, tied: 0, nr: 0, pts: 2, nrr:  1.750 },
  { short: "SCO", played: 2, won: 1, lost: 1, tied: 0, nr: 0, pts: 2, nrr:  0.950 },
  { short: "ENG", played: 1, won: 1, lost: 0, tied: 0, nr: 0, pts: 2, nrr:  0.200 },
  { short: "NEP", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -0.200 },
  { short: "ITA", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -3.650 },

  // Group D
  { short: "NZ",  played: 2, won: 2, lost: 0, tied: 0, nr: 0, pts: 4, nrr:  1.919 },
  { short: "SA",  played: 2, won: 2, lost: 0, tied: 0, nr: 0, pts: 4, nrr:  1.425 },
  { short: "AFG", played: 2, won: 0, lost: 2, tied: 0, nr: 0, pts: 0, nrr: -0.555 },
  { short: "UAE", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -2.763 },
  { short: "CAN", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -2.850 },
];

// ── Matches ────────────────────────────────────────────────

interface SeedMatch {
  home: string;
  away: string;
  homeScore: string | null;
  awayScore: string | null;
  result: string | null;
  winner: string | null;
  status: "completed" | "upcoming" | "live";
  group: string;
  venue: string;
  dayOffset: number;
}

const MATCHES: SeedMatch[] = [
  // Completed
  { home: "NED", away: "PAK", homeScore: "148/9 (20)", awayScore: "149/7 (19.3)", result: "Pakistan won by 3 wickets", winner: "PAK", status: "completed", group: "A", venue: "Ahmedabad", dayOffset: 0 },
  { home: "SCO", away: "WI",  homeScore: "147/10 (20)", awayScore: "182/5 (20)", result: "West Indies won by 35 runs", winner: "WI", status: "completed", group: "C", venue: "Colombo", dayOffset: 0 },
  { home: "IND", away: "USA", homeScore: "161/5 (20)", awayScore: "132/8 (20)", result: "India won by 29 runs", winner: "IND", status: "completed", group: "A", venue: "Ahmedabad", dayOffset: 0 },
  { home: "AFG", away: "NZ",  homeScore: "182/7 (20)", awayScore: "183/5 (17.5)", result: "New Zealand won by 5 wickets", winner: "NZ", status: "completed", group: "D", venue: "Delhi", dayOffset: 1 },
  { home: "ENG", away: "NEP", homeScore: "184/6 (20)", awayScore: "180/7 (20)", result: "England won by 4 runs", winner: "ENG", status: "completed", group: "C", venue: "Colombo", dayOffset: 1 },
  { home: "SL",  away: "IRE", homeScore: "163/5 (20)", awayScore: "143/8 (20)", result: "Sri Lanka won by 20 runs", winner: "SL", status: "completed", group: "B", venue: "Galle", dayOffset: 1 },
  { home: "ITA", away: "SCO", homeScore: "134/10 (20)", awayScore: "207/3 (20)", result: "Scotland won by 73 runs", winner: "SCO", status: "completed", group: "C", venue: "Colombo", dayOffset: 2 },
  { home: "OMA", away: "ZIM", homeScore: "103/10 (20)", awayScore: "106/2 (13.3)", result: "Zimbabwe won by 8 wickets", winner: "ZIM", status: "completed", group: "B", venue: "Galle", dayOffset: 2 },
  { home: "CAN", away: "SA",  homeScore: "156/8 (20)", awayScore: "213/4 (20)", result: "South Africa won by 57 runs", winner: "SA", status: "completed", group: "D", venue: "Delhi", dayOffset: 2 },
  { home: "NAM", away: "NED", homeScore: "156/7 (20)", awayScore: "159/3 (18)", result: "Netherlands won by 7 wickets", winner: "NED", status: "completed", group: "A", venue: "Ahmedabad", dayOffset: 3 },
  { home: "NZ",  away: "UAE", homeScore: "175/0 (15.2)", awayScore: "173/6 (20)", result: "New Zealand won by 10 wickets", winner: "NZ", status: "completed", group: "D", venue: "Delhi", dayOffset: 3 },
  { home: "PAK", away: "USA", homeScore: "190/9 (20)", awayScore: "158/8 (20)", result: "Pakistan won by 32 runs", winner: "PAK", status: "completed", group: "A", venue: "Ahmedabad", dayOffset: 3 },
  { home: "AFG", away: "SA",  homeScore: "169/8 (20)", awayScore: "170/4 (18.3)", result: "South Africa won by 6 wickets", winner: "SA", status: "completed", group: "D", venue: "Delhi", dayOffset: 4 },
  { home: "AUS", away: "IRE", homeScore: "182/4 (20)", awayScore: "115/10 (17)", result: "Australia won by 67 runs", winner: "AUS", status: "completed", group: "B", venue: "Galle", dayOffset: 4 },

  // Upcoming
  { home: "ENG", away: "WI",  homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "C", venue: "Colombo", dayOffset: 4 },
  { home: "SL",  away: "OMA", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "B", venue: "Galle", dayOffset: 5 },
  { home: "ITA", away: "NEP", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "C", venue: "Colombo", dayOffset: 5 },
  { home: "IND", away: "NAM", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "A", venue: "Ahmedabad", dayOffset: 6 },
  { home: "AUS", away: "ZIM", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "B", venue: "Galle", dayOffset: 6 },
  { home: "CAN", away: "UAE", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "D", venue: "Delhi", dayOffset: 7 },
  { home: "NED", away: "USA", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "A", venue: "Ahmedabad", dayOffset: 8 },
  { home: "IRE", away: "OMA", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "B", venue: "Galle", dayOffset: 8 },
  { home: "ENG", away: "SCO", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "C", venue: "Colombo", dayOffset: 9 },
  { home: "NZ",  away: "SA",  homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "D", venue: "Delhi", dayOffset: 9 },
  { home: "NEP", away: "WI",  homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "C", venue: "Colombo", dayOffset: 10 },
  { home: "NAM", away: "USA", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "A", venue: "Ahmedabad", dayOffset: 10 },
  { home: "IND", away: "PAK", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "A", venue: "Ahmedabad", dayOffset: 11 },
  { home: "AFG", away: "UAE", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "D", venue: "Delhi", dayOffset: 12 },
  { home: "ENG", away: "ITA", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "C", venue: "Colombo", dayOffset: 12 },
  { home: "AUS", away: "SL",  homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "B", venue: "Galle", dayOffset: 13 },
  { home: "CAN", away: "NZ",  homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "D", venue: "Delhi", dayOffset: 13 },
  { home: "IRE", away: "ZIM", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "B", venue: "Galle", dayOffset: 14 },
  { home: "NEP", away: "SCO", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "C", venue: "Colombo", dayOffset: 14 },
  { home: "SA",  away: "UAE", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "D", venue: "Delhi", dayOffset: 15 },
  { home: "NAM", away: "PAK", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "A", venue: "Ahmedabad", dayOffset: 15 },
  { home: "IND", away: "NED", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "A", venue: "Ahmedabad", dayOffset: 16 },
  { home: "ITA", away: "WI",  homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "C", venue: "Colombo", dayOffset: 16 },
  { home: "SL",  away: "ZIM", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "B", venue: "Galle", dayOffset: 17 },
  { home: "AFG", away: "CAN", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "D", venue: "Delhi", dayOffset: 17 },
  { home: "AUS", away: "OMA", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "B", venue: "Galle", dayOffset: 18 },
];

// ── Build the data ─────────────────────────────────────────

const tournamentStart = new Date("2026-02-07T00:00:00Z");

function buildTeamId(shortName: string): string {
  return `static-${shortName.toLowerCase()}`;
}

function findTeam(short: string) {
  return TEAMS.find((t) => t.shortName === short)!;
}

// ── Standings JSON ─────────────────────────────────────────

function buildStandings(): { groups: GroupStandings[]; updatedAt: string } {
  const groupMap = new Map<string, StandingRow[]>();

  for (const s of STANDINGS) {
    const team = findTeam(s.short);
    const row: StandingRow = {
      teamId: buildTeamId(s.short),
      teamName: team.name,
      shortName: team.shortName,
      flag: team.flag,
      group: team.group,
      stage: "group",
      played: s.played,
      won: s.won,
      lost: s.lost,
      tied: s.tied,
      noResult: s.nr,
      points: s.pts,
      nrr: s.nrr,
      position: null,
    };

    const arr = groupMap.get(team.group) ?? [];
    arr.push(row);
    groupMap.set(team.group, arr);
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

// ── Matches JSON ───────────────────────────────────────────

function buildMatches(): {
  recent: MatchInfo[];
  upcoming: MatchInfo[];
  updatedAt: string;
} {
  const recent: MatchInfo[] = [];
  const upcoming: MatchInfo[] = [];

  MATCHES.forEach((m, i) => {
    const homeTeam = findTeam(m.home);
    const awayTeam = findTeam(m.away);
    const date = new Date(tournamentStart);
    date.setDate(date.getDate() + m.dayOffset);

    const info: MatchInfo = {
      id: `match-${i}`,
      matchNum: i + 1,
      homeTeam: {
        id: buildTeamId(m.home),
        name: homeTeam.name,
        shortName: homeTeam.shortName,
        flag: homeTeam.flag,
        group: homeTeam.group,
      },
      awayTeam: {
        id: buildTeamId(m.away),
        name: awayTeam.name,
        shortName: awayTeam.shortName,
        flag: awayTeam.flag,
        group: awayTeam.group,
      },
      date: date.toISOString(),
      venue: m.venue,
      status: m.status,
      stage: "group",
      group: m.group,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      result: m.result,
      winnerId: m.winner ? buildTeamId(m.winner) : null,
    };

    if (m.status === "completed" || m.status === "live") {
      recent.push(info);
    } else {
      upcoming.push(info);
    }
  });

  // Recent: newest first
  recent.reverse();
  // Upcoming: soonest first (already in order)

  return {
    recent: recent.slice(0, 10),
    upcoming: upcoming.slice(0, 10),
    updatedAt: new Date().toISOString(),
  };
}

// ── Predictions JSON ───────────────────────────────────────

async function buildPredictions(): Promise<{
  predictions: PredictionRow[];
  updatedAt: string;
}> {
  // Dynamic import to avoid TS config issues
  const { runPredictions } = await import("../src/lib/predictions");

  const allTeams = TEAMS.map((t) => ({
    id: buildTeamId(t.shortName),
    name: t.name,
    shortName: t.shortName,
    flag: t.flag,
    group: t.group,
  }));

  const standingRows: StandingRow[] = STANDINGS.map((s) => {
    const team = findTeam(s.short);
    return {
      teamId: buildTeamId(s.short),
      teamName: team.name,
      shortName: team.shortName,
      flag: team.flag,
      group: team.group,
      stage: "group",
      played: s.played,
      won: s.won,
      lost: s.lost,
      tied: s.tied,
      noResult: s.nr,
      points: s.pts,
      nrr: s.nrr,
      position: null,
    };
  });

  const matchInfos: MatchInfo[] = MATCHES.map((m, i) => {
    const homeTeam = findTeam(m.home);
    const awayTeam = findTeam(m.away);
    return {
      id: `match-${i}`,
      matchNum: i + 1,
      homeTeam: {
        id: buildTeamId(m.home),
        name: homeTeam.name,
        shortName: homeTeam.shortName,
        flag: homeTeam.flag,
        group: homeTeam.group,
      },
      awayTeam: {
        id: buildTeamId(m.away),
        name: awayTeam.name,
        shortName: awayTeam.shortName,
        flag: awayTeam.flag,
        group: awayTeam.group,
      },
      date: null,
      venue: m.venue,
      status: m.status,
      stage: "group",
      group: m.group,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      result: m.result,
      winnerId: m.winner ? buildTeamId(m.winner) : null,
    };
  });

  const predictions = runPredictions(standingRows, matchInfos, allTeams);

  return {
    predictions,
    updatedAt: new Date().toISOString(),
  };
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  const outDir = join(process.cwd(), "public", "data");
  mkdirSync(outDir, { recursive: true });

  console.log("Generating static standings data...");
  const standings = buildStandings();
  writeFileSync(join(outDir, "standings.json"), JSON.stringify(standings));
  console.log(`  -> ${standings.groups.length} groups`);

  console.log("Generating static matches data...");
  const matches = buildMatches();
  writeFileSync(join(outDir, "matches.json"), JSON.stringify(matches));
  console.log(`  -> ${matches.recent.length} recent, ${matches.upcoming.length} upcoming`);

  console.log("Running prediction engine (10k simulations)...");
  const predictions = await buildPredictions();
  writeFileSync(join(outDir, "predictions.json"), JSON.stringify(predictions));
  console.log(`  -> ${predictions.predictions.length} teams predicted`);

  console.log("\nStatic data written to public/data/");
  console.log("Top 5 predicted champions:");
  predictions.predictions.slice(0, 5).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.flag} ${p.teamName} – ${p.winnerProb}%`);
  });
}

main().catch((e) => {
  console.error("Static data generation failed:", e);
  process.exit(1);
});
