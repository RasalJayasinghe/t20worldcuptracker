import { NextResponse } from "next/server";
import type { GroupStandings, StandingRow } from "@/lib/types";
import { getStaticStandings } from "@/lib/static-fallback";

export const dynamic = "force-dynamic";

export async function GET() {
  // 1. Try live database first
  try {
    const prisma = (await import("@/lib/db")).default;

    const standings = await prisma.standing.findMany({
      include: { team: true },
      orderBy: [{ group: "asc" }, { points: "desc" }, { nrr: "desc" }],
    });

    if (standings.length > 0) {
      const groupMap = new Map<string, StandingRow[]>();

      for (const s of standings) {
        const row: StandingRow = {
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
        };

        const existing = groupMap.get(s.group) ?? [];
        existing.push(row);
        groupMap.set(s.group, existing);
      }

      const groups: GroupStandings[] = Array.from(groupMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, rows]) => ({ group, standings: rows }));

      return NextResponse.json({ groups, updatedAt: new Date().toISOString() });
    }
  } catch {
    // DB not available – fall through to static data
  }

  // 2. Fall back to pre-generated static data
  const staticData = getStaticStandings();
  if (staticData) {
    return NextResponse.json(staticData);
  }

  return NextResponse.json({ groups: [], updatedAt: null });
}
