/**
 * Prediction engine – Monte Carlo simulation for T20 World Cup 2026.
 *
 * ═══════════════════════════════════════════════════════════
 * ICC PRE-DETERMINED SUPER 8 SEEDING (official rules)
 * ═══════════════════════════════════════════════════════════
 *
 * X Group: India (X1), Australia (X2), West Indies (X3), South Africa (X4)
 * Y Group: England (Y1), New Zealand (Y2), Pakistan (Y3), Sri Lanka (Y4)
 *
 * Each group sends ONE qualifier to X Group and ONE to Y Group:
 *   Group A → X1 slot (India-seeded),    Y3 slot (Pakistan-seeded)
 *   Group B → X2 slot (Australia-seeded), Y4 slot (Sri Lanka-seeded)
 *   Group C → X3 slot (West Indies-seeded), Y1 slot (England-seeded)
 *   Group D → X4 slot (South Africa-seeded), Y2 slot (New Zealand-seeded)
 *
 * If a pre-seeded team qualifies, they fill their slot.
 * If they don't, whoever qualifies from that group takes their slot.
 *
 * Teams from the SAME group-stage group can NEVER meet in the Super 8.
 *
 * ═══════════════════════════════════════════════════════════
 * Super 8 fixtures (12 matches):
 *   X Group: X1vX4, X2vX3, X3vX4, X1vX2, X2vX4, X1vX3
 *   Y Group: Y2vY3, Y1vY4, Y1vY3, Y2vY4, Y1vY2, Y3vY4
 *
 * Semi-finals:
 *   SF1: X group winner  vs Y group runner-up
 *   SF2: Y group winner  vs X group runner-up
 *
 * Final: SF1 winner vs SF2 winner
 * ═══════════════════════════════════════════════════════════
 */

import type { StandingRow, MatchInfo, PredictionRow } from "./types";

// ── Config ───────────────────────────────────────────────

const SIMULATIONS = 10_000;
const QUALIFY_PER_GROUP = 2;

// ── ICC Pre-determined seeding ───────────────────────────
// For each group-stage group, which team is seeded for X and which for Y.
// "xSeed" / "ySeed" are team names. If that team qualifies (top 2),
// they go to their designated Super 8 group. If they don't qualify,
// the qualifier who replaced them takes their slot.

interface GroupSeeding {
  xSeed: string; // team name pre-seeded for X Group
  ySeed: string; // team name pre-seeded for Y Group
}

const SUPER8_SEEDING: Record<string, GroupSeeding> = {
  A: { xSeed: "India",        ySeed: "Pakistan" },
  B: { xSeed: "Australia",    ySeed: "Sri Lanka" },
  C: { xSeed: "West Indies",  ySeed: "England" },
  D: { xSeed: "South Africa", ySeed: "New Zealand" },
};

// ── Win-probability model ────────────────────────────────

function winProbability(a: StandingRow, b: StandingRow): number {
  const wrA = a.played > 0 ? a.won / a.played : 0.5;
  const wrB = b.played > 0 ? b.won / b.played : 0.5;

  const totalWR = wrA + wrB;
  let prob = totalWR > 0 ? wrA / totalWR : 0.5;

  // NRR tilt (bounded via tanh)
  const nrrDiff = a.nrr - b.nrr;
  prob += Math.tanh(nrrDiff / 2) * 0.08;

  // Points-per-match tilt
  const ppmA = a.played > 0 ? a.points / a.played : 1;
  const ppmB = b.played > 0 ? b.points / b.played : 1;
  const totalPPM = ppmA + ppmB;
  if (totalPPM > 0) {
    prob = prob * 0.7 + (ppmA / totalPPM) * 0.3;
  }

  return Math.max(0.05, Math.min(0.95, prob));
}

// ── Simulation helpers ───────────────────────────────────

function applyResult(
  standings: Map<string, StandingRow>,
  winnerId: string,
  loserId: string,
) {
  const w = standings.get(winnerId);
  const l = standings.get(loserId);
  if (w) {
    w.played += 1;
    w.won += 1;
    w.points += 2;
    w.nrr += Math.random() * 0.4;
  }
  if (l) {
    l.played += 1;
    l.lost += 1;
    l.nrr -= Math.random() * 0.4;
  }
}

function rankGroupByLetter(
  standings: Map<string, StandingRow>,
  group: string,
): string[] {
  return Array.from(standings.values())
    .filter((s) => s.group === group)
    .sort((a, b) => b.points - a.points || b.nrr - a.nrr)
    .map((s) => s.teamId);
}

function rankTeams(
  standings: Map<string, StandingRow>,
  teamIds: string[],
): string[] {
  return teamIds
    .map((id) => standings.get(id)!)
    .filter(Boolean)
    .sort((a, b) => b.points - a.points || b.nrr - a.nrr)
    .map((s) => s.teamId);
}

function freshStanding(
  teamId: string,
  base: StandingRow,
  group: string,
): StandingRow {
  return {
    ...base,
    group,
    stage: "super8",
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    noResult: 0,
    points: 0,
    nrr: base.nrr * 0.3, // dampen carried NRR
    position: null,
  };
}

function roundRobinPairs(teamIds: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      pairs.push([teamIds[i], teamIds[j]]);
    }
  }
  return pairs;
}

// ── Super 8 group assignment (ICC seeding rules) ─────────

/**
 * Given the top-2 qualifiers from a group, assign them to X or Y
 * Super 8 group based on ICC pre-determined seeding.
 *
 * Rules:
 *  - If the X-seeded team qualified → they go to X, other goes to Y
 *  - If the Y-seeded team qualified → they go to Y, other goes to X
 *  - If both seeded teams qualified → each goes to their designated group
 *  - If neither seeded team qualified → 1st place → X slot, 2nd → Y slot
 */
function assignSuper8Group(
  qualifiers: string[], // [1st place, 2nd place] team IDs
  seeding: GroupSeeding,
  teamNameById: Map<string, string>,
): { xTeam: string; yTeam: string } {
  const [first, second] = qualifiers;
  const firstName = teamNameById.get(first) ?? "";
  const secondName = teamNameById.get(second) ?? "";

  const firstIsX = firstName === seeding.xSeed;
  const firstIsY = firstName === seeding.ySeed;
  const secondIsX = secondName === seeding.xSeed;
  const secondIsY = secondName === seeding.ySeed;

  // Both pre-seeded teams qualified
  if (firstIsX && secondIsY) return { xTeam: first, yTeam: second };
  if (firstIsY && secondIsX) return { xTeam: second, yTeam: first };

  // Only X-seeded team qualified
  if (firstIsX) return { xTeam: first, yTeam: second };
  if (secondIsX) return { xTeam: second, yTeam: first };

  // Only Y-seeded team qualified
  if (firstIsY) return { xTeam: second, yTeam: first };
  if (secondIsY) return { xTeam: first, yTeam: second };

  // Neither pre-seeded team qualified → 1st takes X slot, 2nd takes Y slot
  return { xTeam: first, yTeam: second };
}

// ── Main prediction runner ───────────────────────────────

export function runPredictions(
  currentStandings: StandingRow[],
  remainingMatches: MatchInfo[],
  allTeams: {
    id: string;
    name: string;
    shortName: string;
    flag: string;
    group: string;
  }[],
): PredictionRow[] {
  // Build teamId → name lookup
  const teamNameById = new Map(allTeams.map((t) => [t.id, t.name]));

  // Counters
  const counters: Record<
    string,
    { super8: number; semi: number; final: number; winner: number }
  > = {};
  for (const t of allTeams) {
    counters[t.id] = { super8: 0, semi: 0, final: 0, winner: 0 };
  }

  const groups = [...new Set(currentStandings.map((s) => s.group))].sort();
  const standingsMap = new Map(currentStandings.map((s) => [s.teamId, s]));

  const groupMatches = remainingMatches.filter(
    (m) => m.status === "upcoming" && m.stage === "group",
  );

  for (let sim = 0; sim < SIMULATIONS; sim++) {
    // ── 1. Clone group-stage standings ──────────────────
    const simStandings = new Map<string, StandingRow>();
    for (const [id, row] of standingsMap) {
      simStandings.set(id, { ...row });
    }

    // ── 2. Simulate remaining group matches ─────────────
    for (const match of groupMatches) {
      const a = simStandings.get(match.homeTeam.id);
      const b = simStandings.get(match.awayTeam.id);
      if (!a || !b) continue;

      const pA = winProbability(a, b);
      if (Math.random() < pA) {
        applyResult(simStandings, a.teamId, b.teamId);
      } else {
        applyResult(simStandings, b.teamId, a.teamId);
      }
    }

    // ── 3. Determine top-2 per group & assign to Super 8 ──
    const xGroupIds: string[] = []; // X Group (4 teams)
    const yGroupIds: string[] = []; // Y Group (4 teams)

    for (const g of groups) {
      const ranked = rankGroupByLetter(simStandings, g);
      const qualifiers = ranked.slice(0, QUALIFY_PER_GROUP);

      // Record Super 8 qualification
      for (const id of qualifiers) {
        counters[id].super8 += 1;
      }

      // Assign to X or Y based on ICC pre-determined seeding
      const seeding = SUPER8_SEEDING[g];
      if (!seeding) continue;

      const { xTeam, yTeam } = assignSuper8Group(
        qualifiers,
        seeding,
        teamNameById,
      );

      xGroupIds.push(xTeam);
      yGroupIds.push(yTeam);
    }

    if (xGroupIds.length !== 4 || yGroupIds.length !== 4) continue;

    // ── 4. Create fresh Super 8 standings ────────────────
    const s8Standings = new Map<string, StandingRow>();
    for (const id of xGroupIds) {
      const base = simStandings.get(id);
      if (base) s8Standings.set(id, freshStanding(id, base, "X"));
    }
    for (const id of yGroupIds) {
      const base = simStandings.get(id);
      if (base) s8Standings.set(id, freshStanding(id, base, "Y"));
    }

    // ── 5. Simulate Super 8 round-robin ──────────────────
    //   X Group: 6 matches (each of 4 teams plays 3)
    for (const [idA, idB] of roundRobinPairs(xGroupIds)) {
      const baseA = simStandings.get(idA)!;
      const baseB = simStandings.get(idB)!;
      if (!baseA || !baseB) continue;
      const pA = winProbability(baseA, baseB);
      if (Math.random() < pA) {
        applyResult(s8Standings, idA, idB);
      } else {
        applyResult(s8Standings, idB, idA);
      }
    }

    //   Y Group: 6 matches
    for (const [idA, idB] of roundRobinPairs(yGroupIds)) {
      const baseA = simStandings.get(idA)!;
      const baseB = simStandings.get(idB)!;
      if (!baseA || !baseB) continue;
      const pA = winProbability(baseA, baseB);
      if (Math.random() < pA) {
        applyResult(s8Standings, idA, idB);
      } else {
        applyResult(s8Standings, idB, idA);
      }
    }

    // ── 6. Determine Semi-Finalists ──────────────────────
    //   Top 2 from each Super 8 group = 4 teams
    const xRanked = rankTeams(s8Standings, xGroupIds);
    const yRanked = rankTeams(s8Standings, yGroupIds);

    //   SF1: X group winner  vs  Y group runner-up
    //   SF2: Y group winner  vs  X group runner-up
    const sf1A = xRanked[0]; // X #1
    const sf1B = yRanked[1]; // Y #2
    const sf2A = yRanked[0]; // Y #1
    const sf2B = xRanked[1]; // X #2

    const semiFinalists = [sf1A, sf1B, sf2A, sf2B].filter(Boolean);
    for (const id of semiFinalists) {
      counters[id].semi += 1;
    }

    if (semiFinalists.length < 4) continue;

    // ── 7. Simulate Semi-Finals ──────────────────────────
    // SF1: X #1 vs Y #2
    const sf1BaseA = simStandings.get(sf1A);
    const sf1BaseB = simStandings.get(sf1B);
    let finalist1 = sf1A;
    if (sf1BaseA && sf1BaseB) {
      const pA = winProbability(sf1BaseA, sf1BaseB);
      finalist1 = Math.random() < pA ? sf1A : sf1B;
    }

    // SF2: Y #1 vs X #2
    const sf2BaseA = simStandings.get(sf2A);
    const sf2BaseB = simStandings.get(sf2B);
    let finalist2 = sf2A;
    if (sf2BaseA && sf2BaseB) {
      const pA = winProbability(sf2BaseA, sf2BaseB);
      finalist2 = Math.random() < pA ? sf2A : sf2B;
    }

    // ── 8. Record finalists (exactly 2 teams) ────────────
    counters[finalist1].final += 1;
    counters[finalist2].final += 1;

    // ── 9. Simulate the Final ────────────────────────────
    const fA = simStandings.get(finalist1);
    const fB = simStandings.get(finalist2);
    if (fA && fB) {
      const pA = winProbability(fA, fB);
      const champion = Math.random() < pA ? finalist1 : finalist2;
      counters[champion].winner += 1;
    }
  }

  // ── 10. Convert counts to percentages ──────────────────
  const predictions: PredictionRow[] = allTeams.map((t) => {
    const c = counters[t.id];
    return {
      teamId: t.id,
      teamName: t.name,
      shortName: t.shortName,
      flag: t.flag,
      group: t.group,
      super8Prob: +((c.super8 / SIMULATIONS) * 100).toFixed(1),
      semiFinalProb: +((c.semi / SIMULATIONS) * 100).toFixed(1),
      finalProb: +((c.final / SIMULATIONS) * 100).toFixed(1),
      winnerProb: +((c.winner / SIMULATIONS) * 100).toFixed(1),
      confidence: 80,
    };
  });

  return predictions.sort((a, b) => b.winnerProb - a.winnerProb);
}
