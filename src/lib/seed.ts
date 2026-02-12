/**
 * Seed script – populates the database with T20 World Cup 2026 teams,
 * current standings, match results, and initial predictions.
 *
 * Run:  npm run db:seed
 *
 * Data reflects the live tournament state as of Feb 11, 2026.
 * Source: https://www.espncricinfo.com/series/icc-men-s-t20-world-cup-2025-26-1502138/points-table-standings
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── T20 World Cup 2026: 20 teams in 4 groups of 5 ───────
// Hosted in India & Sri Lanka, Feb–Mar 2026

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

// ── Live standings as of Feb 11, 2026 ────────────────────

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
  // Group A – ESPN Feb 11 (end of day)
  { short: "PAK", played: 2, won: 2, lost: 0, tied: 0, nr: 0, pts: 4, nrr:  0.932 },
  { short: "IND", played: 1, won: 1, lost: 0, tied: 0, nr: 0, pts: 2, nrr:  1.450 },
  { short: "NED", played: 2, won: 1, lost: 1, tied: 0, nr: 0, pts: 2, nrr:  0.356 },
  { short: "NAM", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -1.033 },
  { short: "USA", played: 2, won: 0, lost: 2, tied: 0, nr: 0, pts: 0, nrr: -1.525 },

  // Group B – SL beat OMA by 105 runs (Feb 12)
  { short: "SL",  played: 2, won: 2, lost: 0, tied: 0, nr: 0, pts: 4, nrr:  3.125 },
  { short: "AUS", played: 1, won: 1, lost: 0, tied: 0, nr: 0, pts: 2, nrr:  3.350 },
  { short: "ZIM", played: 1, won: 1, lost: 0, tied: 0, nr: 0, pts: 2, nrr:  2.702 },
  { short: "IRE", played: 2, won: 0, lost: 2, tied: 0, nr: 0, pts: 0, nrr: -2.175 },
  { short: "OMA", played: 2, won: 0, lost: 2, tied: 0, nr: 0, pts: 0, nrr: -4.306 },

  // Group C – WI beat ENG by 30 runs
  { short: "WI",  played: 2, won: 2, lost: 0, tied: 0, nr: 0, pts: 4, nrr:  1.625 },
  { short: "SCO", played: 2, won: 1, lost: 1, tied: 0, nr: 0, pts: 2, nrr:  0.950 },
  { short: "ENG", played: 2, won: 1, lost: 1, tied: 0, nr: 0, pts: 2, nrr: -0.650 },
  { short: "NEP", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -0.200 },
  { short: "ITA", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -3.650 },

  // Group D – SA beat AFG via Super Over
  { short: "NZ",  played: 2, won: 2, lost: 0, tied: 0, nr: 0, pts: 4, nrr:  1.919 },
  { short: "SA",  played: 2, won: 2, lost: 0, tied: 0, nr: 0, pts: 4, nrr:  1.425 },
  { short: "AFG", played: 2, won: 0, lost: 2, tied: 0, nr: 0, pts: 0, nrr: -0.555 },
  { short: "UAE", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -2.763 },
  { short: "CAN", played: 1, won: 0, lost: 1, tied: 0, nr: 0, pts: 0, nrr: -2.850 },
];

// ── Match results & upcoming fixtures ────────────────────

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
  dayOffset: number; // days from Feb 7, 2026 (tournament start)
}

const MATCHES: SeedMatch[] = [
  // ── Completed matches ──────────────────────────────────

  // Day 1 – Feb 7
  { home: "NED", away: "PAK", homeScore: "148/9 (20)", awayScore: "149/7 (19.3)", result: "Pakistan won by 3 wickets", winner: "PAK", status: "completed", group: "A", venue: "Ahmedabad", dayOffset: 0 },
  { home: "SCO", away: "WI",  homeScore: "147/10 (20)", awayScore: "182/5 (20)", result: "West Indies won by 35 runs", winner: "WI", status: "completed", group: "C", venue: "Colombo", dayOffset: 0 },
  { home: "IND", away: "USA", homeScore: "161/5 (20)", awayScore: "132/8 (20)", result: "India won by 29 runs", winner: "IND", status: "completed", group: "A", venue: "Ahmedabad", dayOffset: 0 },

  // Day 2 – Feb 8
  { home: "AFG", away: "NZ",  homeScore: "182/7 (20)", awayScore: "183/5 (17.5)", result: "New Zealand won by 5 wickets", winner: "NZ", status: "completed", group: "D", venue: "Delhi", dayOffset: 1 },
  { home: "ENG", away: "NEP", homeScore: "184/6 (20)", awayScore: "180/7 (20)", result: "England won by 4 runs", winner: "ENG", status: "completed", group: "C", venue: "Colombo", dayOffset: 1 },
  { home: "SL",  away: "IRE", homeScore: "163/5 (20)", awayScore: "143/8 (20)", result: "Sri Lanka won by 20 runs", winner: "SL", status: "completed", group: "B", venue: "Galle", dayOffset: 1 },

  // Day 3 – Feb 9
  { home: "ITA", away: "SCO", homeScore: "134/10 (20)", awayScore: "207/3 (20)", result: "Scotland won by 73 runs", winner: "SCO", status: "completed", group: "C", venue: "Colombo", dayOffset: 2 },
  { home: "OMA", away: "ZIM", homeScore: "103/10 (20)", awayScore: "106/2 (13.3)", result: "Zimbabwe won by 8 wickets", winner: "ZIM", status: "completed", group: "B", venue: "Galle", dayOffset: 2 },
  { home: "CAN", away: "SA",  homeScore: "156/8 (20)", awayScore: "213/4 (20)", result: "South Africa won by 57 runs", winner: "SA", status: "completed", group: "D", venue: "Delhi", dayOffset: 2 },

  // Day 4 – Feb 10
  { home: "NAM", away: "NED", homeScore: "156/7 (20)", awayScore: "159/3 (18)", result: "Netherlands won by 7 wickets", winner: "NED", status: "completed", group: "A", venue: "Ahmedabad", dayOffset: 3 },
  { home: "NZ",  away: "UAE", homeScore: "175/0 (15.2)", awayScore: "173/6 (20)", result: "New Zealand won by 10 wickets", winner: "NZ", status: "completed", group: "D", venue: "Delhi", dayOffset: 3 },
  { home: "PAK", away: "USA", homeScore: "190/9 (20)", awayScore: "158/8 (20)", result: "Pakistan won by 32 runs", winner: "PAK", status: "completed", group: "A", venue: "Ahmedabad", dayOffset: 3 },

  // ── Day 5 – Feb 11 ─────────────────────────────────────
  { home: "AFG", away: "SA",  homeScore: "187 (19.4)", awayScore: "187/6 (20)", result: "Match tied (South Africa won the 2nd Super Over)", winner: "SA", status: "completed", group: "D", venue: "Ahmedabad", dayOffset: 4 },
  { home: "AUS", away: "IRE", homeScore: "182/6 (20)", awayScore: "115 (16.5)", result: "Australia won by 67 runs", winner: "AUS", status: "completed", group: "B", venue: "Colombo (RPS)", dayOffset: 4 },
  { home: "ENG", away: "WI",  homeScore: "166 (19)", awayScore: "196/6 (20)", result: "West Indies won by 30 runs", winner: "WI", status: "completed", group: "C", venue: "Wankhede", dayOffset: 4 },

  // ── Day 6 – Feb 12 ─────────────────────────────────────
  { home: "SL",  away: "OMA", homeScore: "225/5 (20)", awayScore: "120/9 (20)", result: "Sri Lanka won by 105 runs", winner: "SL", status: "completed", group: "B", venue: "Pallekele", dayOffset: 5 },

  // ── Upcoming fixtures ──────────────────────────────────
  { home: "ITA", away: "NEP", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "C", venue: "Wankhede", dayOffset: 5 },
  { home: "IND", away: "NAM", homeScore: null, awayScore: null, result: null, winner: null, status: "upcoming", group: "A", venue: "Delhi", dayOffset: 5 },
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

// ── Main seed function ──────────────────────────────────

async function seed() {
  console.log("Clearing existing data…");
  await prisma.prediction.deleteMany();
  await prisma.standing.deleteMany();
  await prisma.match.deleteMany();
  await prisma.scrapeLog.deleteMany();
  await prisma.team.deleteMany();

  console.log("Seeding 20 teams…");
  const teamMap = new Map<string, string>(); // shortName → id

  for (const t of TEAMS) {
    const created = await prisma.team.create({ data: t });
    teamMap.set(t.shortName, created.id);
  }

  console.log("Seeding standings…");
  for (const s of STANDINGS) {
    const teamId = teamMap.get(s.short);
    if (!teamId) continue;
    const team = TEAMS.find((t) => t.shortName === s.short)!;

    await prisma.standing.create({
      data: {
        teamId,
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
      },
    });
  }

  console.log(`Seeding ${MATCHES.length} matches…`);
  const tournamentStart = new Date("2026-02-07T00:00:00Z");
  let matchNum = 1;

  for (const m of MATCHES) {
    const homeId = teamMap.get(m.home);
    const awayId = teamMap.get(m.away);
    if (!homeId || !awayId) continue;

    const date = new Date(tournamentStart);
    date.setDate(date.getDate() + m.dayOffset);

    await prisma.match.create({
      data: {
        matchNum: matchNum++,
        homeTeamId: homeId,
        awayTeamId: awayId,
        date,
        venue: m.venue,
        status: m.status,
        stage: "group",
        group: m.group,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        result: m.result,
        winnerId: m.winner ? teamMap.get(m.winner) ?? null : null,
      },
    });
  }

  // ── Compute initial predictions ────────────────────────
  console.log("Computing predictions (Monte Carlo, 10 000 sims)…");

  // Import dynamically to avoid circular deps
  const { runPredictions } = await import("./predictions");

  const allTeams = TEAMS.map((t) => ({
    id: teamMap.get(t.shortName)!,
    name: t.name,
    shortName: t.shortName,
    flag: t.flag,
    group: t.group,
  }));

  const standingRows = STANDINGS.map((s) => {
    const team = TEAMS.find((t) => t.shortName === s.short)!;
    return {
      teamId: teamMap.get(s.short)!,
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

  const matchInfos = MATCHES.map((m, i) => ({
    id: `seed-${i}`,
    matchNum: i + 1,
    homeTeam: {
      id: teamMap.get(m.home)!,
      name: TEAMS.find((t) => t.shortName === m.home)!.name,
      shortName: m.home,
      flag: TEAMS.find((t) => t.shortName === m.home)!.flag,
      group: TEAMS.find((t) => t.shortName === m.home)!.group,
    },
    awayTeam: {
      id: teamMap.get(m.away)!,
      name: TEAMS.find((t) => t.shortName === m.away)!.name,
      shortName: m.away,
      flag: TEAMS.find((t) => t.shortName === m.away)!.flag,
      group: TEAMS.find((t) => t.shortName === m.away)!.group,
    },
    date: null,
    venue: m.venue,
    status: m.status as "upcoming" | "live" | "completed",
    stage: "group",
    group: m.group,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    result: m.result,
    winnerId: m.winner ? teamMap.get(m.winner) ?? null : null,
  }));

  const predictions = runPredictions(standingRows, matchInfos, allTeams);

  for (const p of predictions) {
    await prisma.prediction.create({
      data: {
        teamId: p.teamId,
        super8Prob: p.super8Prob,
        semiFinalProb: p.semiFinalProb,
        finalProb: p.finalProb,
        winnerProb: p.winnerProb,
        confidence: p.confidence,
      },
    });
  }

  console.log("\nTop 5 predicted champions:");
  predictions.slice(0, 5).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.flag} ${p.teamName} – ${p.winnerProb}% winner, ${p.super8Prob}% Super 8`);
  });

  console.log("\nSeed complete!");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
