import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { MatchInfo, TeamInfo } from "@/lib/types";

export const dynamic = "force-dynamic";

function toTeamInfo(t: {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  group: string;
}): TeamInfo {
  return {
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    flag: t.flag,
    group: t.group,
  };
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: { date: "desc" },
    });

    const recent: MatchInfo[] = [];
    const upcoming: MatchInfo[] = [];

    for (const m of matches) {
      const info: MatchInfo = {
        id: m.id,
        matchNum: m.matchNum,
        homeTeam: toTeamInfo(m.homeTeam),
        awayTeam: toTeamInfo(m.awayTeam),
        date: m.date?.toISOString() ?? null,
        venue: m.venue,
        status: m.status as MatchInfo["status"],
        stage: m.stage,
        group: m.group,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        result: m.result,
        winnerId: m.winnerId,
      };

      if (m.status === "completed" || m.status === "live") {
        recent.push(info);
      } else {
        upcoming.push(info);
      }
    }

    // Recent: newest first (already sorted desc)
    // Upcoming: soonest first
    upcoming.sort(
      (a, b) =>
        new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime(),
    );

    return NextResponse.json({
      recent: recent.slice(0, 10),
      upcoming: upcoming.slice(0, 10),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/matches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 },
    );
  }
}
