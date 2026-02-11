import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { scrapeAll } from "@/lib/scraper";
import { computePredictions } from "@/lib/compute-predictions";

export const dynamic = "force-dynamic";

/**
 * POST /api/refresh
 * Triggers a fresh scrape, updates the DB, then recomputes predictions.
 */
export async function POST() {
  const startTime = Date.now();

  try {
    // 1. Scrape
    const { standings, matches, errors } = await scrapeAll();

    // Log scrape attempt
    await prisma.scrapeLog.create({
      data: {
        source: "espncricinfo",
        status: errors.length > 0 ? "error" : "success",
        message: errors.length > 0 ? errors.join("; ") : null,
        dataType: "all",
      },
    });

    // 2. Upsert standings
    for (const s of standings) {
      const team = await prisma.team.findUnique({
        where: { name: s.teamName },
      });
      if (!team) continue;

      await prisma.standing.upsert({
        where: {
          teamId_stage: { teamId: team.id, stage: "group" },
        },
        update: {
          group: s.group,
          played: s.played,
          won: s.won,
          lost: s.lost,
          tied: s.tied,
          noResult: s.noResult,
          points: s.points,
          nrr: s.nrr,
        },
        create: {
          teamId: team.id,
          group: s.group,
          stage: "group",
          played: s.played,
          won: s.won,
          lost: s.lost,
          tied: s.tied,
          noResult: s.noResult,
          points: s.points,
          nrr: s.nrr,
        },
      });
    }

    // 3. Recompute predictions
    const predictions = await computePredictions();

    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      scraped: {
        standings: standings.length,
        matches: matches.length,
      },
      predictions: predictions.length,
      errors,
      elapsedMs: elapsed,
    });
  } catch (error) {
    console.error("POST /api/refresh error:", error);

    await prisma.scrapeLog.create({
      data: {
        source: "espncricinfo",
        status: "error",
        message: String(error),
        dataType: "all",
      },
    });

    return NextResponse.json(
      { error: "Refresh failed", detail: String(error) },
      { status: 500 },
    );
  }
}
