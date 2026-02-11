"use client";

import { useState, useCallback } from "react";
import HeroHeader from "@/components/HeroHeader";
import PointsTable from "@/components/PointsTable";
import MatchFeed from "@/components/MatchFeed";
import PredictionsPanel from "@/components/PredictionsPanel";
import Footer from "@/components/Footer";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import type { GroupStandings, MatchInfo, PredictionRow } from "@/lib/types";

const REFRESH_MS = parseInt(
  process.env.NEXT_PUBLIC_REFRESH_INTERVAL_MS ?? "300000",
  10,
);

export default function Home() {
  const [groups, setGroups] = useState<GroupStandings[]>([]);
  const [recent, setRecent] = useState<MatchInfo[]>([]);
  const [upcoming, setUpcoming] = useState<MatchInfo[]>([]);
  const [predictions, setPredictions] = useState<PredictionRow[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [standingsRes, matchesRes, predictionsRes] = await Promise.all([
        fetch("/api/standings"),
        fetch("/api/matches"),
        fetch("/api/predictions"),
      ]);

      if (standingsRes.ok) {
        const data = await standingsRes.json();
        setGroups(data.groups ?? []);
        setLastUpdated(data.updatedAt);
      }

      if (matchesRes.ok) {
        const data = await matchesRes.json();
        setRecent(data.recent ?? []);
        setUpcoming(data.upcoming ?? []);
      }

      if (predictionsRes.ok) {
        const data = await predictionsRes.json();
        setPredictions(data.predictions ?? []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every REFRESH_MS
  useAutoRefresh(fetchAll, REFRESH_MS);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Trigger server-side scrape + prediction recalc
      await fetch("/api/refresh", { method: "POST" });
      // Then reload dashboard data
      await fetchAll();
    } catch (err) {
      console.error("Manual refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchAll]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#07090f]">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-blue-500/[0.02] blur-[120px]" />
        <div className="absolute right-1/4 top-2/3 h-[400px] w-[400px] rounded-full bg-cricket-gold/[0.015] blur-[100px]" />
      </div>

      <HeroHeader
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
      />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {/* Points Table */}
        <PointsTable groups={groups} />

        {/* Match Feed */}
        <MatchFeed recent={recent} upcoming={upcoming} />

        {/* Predictions */}
        <PredictionsPanel predictions={predictions} />
      </main>

      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
