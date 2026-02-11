import { NextResponse } from "next/server";
import type { PredictionRow } from "@/lib/types";
import { getStaticPredictions } from "@/lib/static-fallback";

export const dynamic = "force-dynamic";

export async function GET() {
  // 1. Try live database first
  try {
    const prisma = (await import("@/lib/db")).default;

    const cached = await prisma.prediction.findMany({
      include: { team: true },
    });

    if (cached.length > 0) {
      const rows: PredictionRow[] = cached
        .map((p) => ({
          teamId: p.teamId,
          teamName: p.team.name,
          shortName: p.team.shortName,
          flag: p.team.flag,
          group: p.team.group,
          super8Prob: p.super8Prob,
          semiFinalProb: p.semiFinalProb,
          finalProb: p.finalProb,
          winnerProb: p.winnerProb,
          confidence: p.confidence,
        }))
        .sort((a, b) => b.winnerProb - a.winnerProb);

      return NextResponse.json({
        predictions: rows,
        updatedAt: cached[0]?.updatedAt?.toISOString() ?? new Date().toISOString(),
      });
    }

    // No cache – try computing on the fly
    const { computePredictions } = await import("@/lib/compute-predictions");
    const predictions = await computePredictions();
    return NextResponse.json({
      predictions,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // DB not available – fall through to static data
  }

  // 2. Fall back to pre-generated static data
  const staticData = getStaticPredictions();
  if (staticData) {
    return NextResponse.json(staticData);
  }

  return NextResponse.json({ predictions: [], updatedAt: null });
}
