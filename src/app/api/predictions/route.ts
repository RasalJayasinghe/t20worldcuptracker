import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { computePredictions } from "@/lib/compute-predictions";
import type { PredictionRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Try cached predictions first
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

    // No cache – compute on the fly
    const predictions = await computePredictions();
    return NextResponse.json({
      predictions,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/predictions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 },
    );
  }
}
