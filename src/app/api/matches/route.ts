import { NextResponse } from "next/server";
import type { MatchInfo, TeamInfo } from "@/lib/types";
import { getStaticMatches } from "@/lib/static-fallback";

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
  // 1. Try live database first
  try {
    const prisma = (await import("@/lib/db")).default;

    const matches = await prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: { date: "desc" },
    });

    if (matches.length > 0) {
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

      upcoming.sort(
        (a, b) =>
          new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime(),
      );

      return NextResponse.json({
        recent: recent.slice(0, 10),
        upcoming: upcoming.slice(0, 10),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch {
    // DB not available – fall through to static data
  }

  // 2. Fall back to pre-generated static data
  const staticData = getStaticMatches();
  if (staticData) {
    return NextResponse.json(staticData);
  }

  return NextResponse.json({ recent: [], upcoming: [], updatedAt: null });
}
