import prisma from "@/lib/db";
import { runPredictions } from "@/lib/predictions";
import type { StandingRow, MatchInfo, TeamInfo, PredictionRow } from "@/lib/types";

/** Recompute predictions from current data and persist to DB */
export async function computePredictions(): Promise<PredictionRow[]> {
  const teams = await prisma.team.findMany();
  const standings = await prisma.standing.findMany({ include: { team: true } });
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true },
  });

  const standingRows: StandingRow[] = standings.map((s) => ({
    teamId: s.teamId,
    teamName: s.team.name,
    shortName: s.team.shortName,
    flag: s.team.flag,
    group: s.group,
    stage: s.stage,
    played: s.played,
    won: s.won,
    lost: s.lost,
    tied: s.tied,
    noResult: s.noResult,
    points: s.points,
    nrr: s.nrr,
    position: s.position,
  }));

  const toTeam = (t: (typeof teams)[0]): TeamInfo => ({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    flag: t.flag,
    group: t.group,
  });

  const matchInfos: MatchInfo[] = matches.map((m) => ({
    id: m.id,
    matchNum: m.matchNum,
    homeTeam: toTeam(m.homeTeam),
    awayTeam: toTeam(m.awayTeam),
    date: m.date?.toISOString() ?? null,
    venue: m.venue,
    status: m.status as MatchInfo["status"],
    stage: m.stage,
    group: m.group,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    result: m.result,
    winnerId: m.winnerId,
  }));

  const allTeams = teams.map((t) => ({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    flag: t.flag,
    group: t.group,
  }));

  const predictions = runPredictions(standingRows, matchInfos, allTeams);

  // Persist to DB
  for (const p of predictions) {
    await prisma.prediction.upsert({
      where: { teamId: p.teamId },
      update: {
        super8Prob: p.super8Prob,
        semiFinalProb: p.semiFinalProb,
        finalProb: p.finalProb,
        winnerProb: p.winnerProb,
        confidence: p.confidence,
      },
      create: {
        teamId: p.teamId,
        super8Prob: p.super8Prob,
        semiFinalProb: p.semiFinalProb,
        finalProb: p.finalProb,
        winnerProb: p.winnerProb,
        confidence: p.confidence,
      },
    });
  }

  return predictions;
}
