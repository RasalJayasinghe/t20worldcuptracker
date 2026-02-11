import { getStaticStandings, getStaticMatches, getStaticPredictions } from "@/lib/static-fallback";
import type { GroupStandings, MatchInfo, PredictionRow } from "@/lib/types";
import Dashboard from "@/components/Dashboard";

/**
 * Server Component – reads static JSON at build time and embeds the data
 * directly into the HTML. No client-side fetch waterfall on first load.
 */
export default function Home() {
  const standingsData = getStaticStandings() as {
    groups: GroupStandings[];
    updatedAt: string;
  } | null;

  const matchesData = getStaticMatches() as {
    recent: MatchInfo[];
    upcoming: MatchInfo[];
    updatedAt: string;
  } | null;

  const predictionsData = getStaticPredictions() as {
    predictions: PredictionRow[];
    updatedAt: string;
  } | null;

  return (
    <Dashboard
      initialGroups={standingsData?.groups ?? []}
      initialRecent={matchesData?.recent ?? []}
      initialUpcoming={matchesData?.upcoming ?? []}
      initialPredictions={predictionsData?.predictions ?? []}
      initialUpdatedAt={standingsData?.updatedAt ?? null}
    />
  );
}
