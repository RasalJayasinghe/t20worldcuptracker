"use client";

import { useState, useMemo } from "react";
import type { MatchInfo } from "@/lib/types";

/** Show fewer cards on mobile to speed up initial paint */
const MOBILE_CARD_LIMIT = 5;
const DESKTOP_CARD_LIMIT = 10;

function useIsMobile() {
  // Safe SSR check – default to mobile limit, expand on client
  const [isMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : true,
  );
  return isMobile;
}

interface MatchFeedProps {
  recent: MatchInfo[];
  upcoming: MatchInfo[];
}

function StatusBadge({ status }: { status: MatchInfo["status"] }) {
  const styles = {
    live: "border-red-500/30 bg-red-500/10 text-red-400 animate-pulse-slow",
    completed: "border-white/[0.06] bg-white/[0.03] text-slate-400",
    upcoming: "border-cricket-gold/20 bg-cricket-gold/10 text-cricket-gold",
  };

  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:px-2.5 sm:text-[9px] ${styles[status]}`}
    >
      {status === "live" ? "LIVE" : status === "completed" ? "FT" : "Upcoming"}
    </span>
  );
}

function MatchCard({ match }: { match: MatchInfo }) {
  return (
    <div className="glass-card-inner p-3 transition-all hover:border-white/[0.10] hover:bg-white/[0.03] sm:p-4">
      {/* Header: stage + status */}
      <div className="mb-2 flex items-center justify-between sm:mb-3">
        <span className="label-text text-[10px] sm:text-[11px]">
          {match.stage}
          {match.group ? ` · Group ${match.group}` : ""}
        </span>
        <StatusBadge status={match.status} />
      </div>

      {/* Teams */}
      <div className="space-y-1.5 sm:space-y-2">
        {/* Home */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">{match.homeTeam.flag}</span>
            <span
              className={`text-xs font-semibold sm:text-sm ${
                match.winnerId === match.homeTeam.id
                  ? "text-white"
                  : "text-slate-300/80"
              }`}
            >
              {match.homeTeam.shortName}
            </span>
            {match.winnerId === match.homeTeam.id && (
              <span className="text-[10px] text-cricket-gold">&#x2714;</span>
            )}
          </div>
          {match.homeScore && (
            <span className="font-mono text-[11px] text-slate-300 sm:text-xs">
              {match.homeScore}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">{match.awayTeam.flag}</span>
            <span
              className={`text-xs font-semibold sm:text-sm ${
                match.winnerId === match.awayTeam.id
                  ? "text-white"
                  : "text-slate-300/80"
              }`}
            >
              {match.awayTeam.shortName}
            </span>
            {match.winnerId === match.awayTeam.id && (
              <span className="text-[10px] text-cricket-gold">&#x2714;</span>
            )}
          </div>
          {match.awayScore && (
            <span className="font-mono text-[11px] text-slate-300 sm:text-xs">
              {match.awayScore}
            </span>
          )}
        </div>
      </div>

      {/* Result / date */}
      <div className="mt-2 border-t border-white/[0.04] pt-2 sm:mt-3 sm:pt-2.5">
        {match.result ? (
          <p className="text-[11px] text-slate-400/80 sm:text-xs">{match.result}</p>
        ) : match.date ? (
          <p className="text-[11px] text-slate-500 sm:text-xs">
            {new Date(match.date).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {match.venue ? ` · ${match.venue}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function MatchFeed({ recent, upcoming }: MatchFeedProps) {
  const isMobile = useIsMobile();
  const limit = isMobile ? MOBILE_CARD_LIMIT : DESKTOP_CARD_LIMIT;

  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const visibleRecent = useMemo(
    () => (showAllRecent ? recent : recent.slice(0, limit)),
    [recent, limit, showAllRecent],
  );
  const visibleUpcoming = useMemo(
    () => (showAllUpcoming ? upcoming : upcoming.slice(0, limit)),
    [upcoming, limit, showAllUpcoming],
  );

  const noData = recent.length === 0 && upcoming.length === 0;

  if (noData) {
    return (
      <section className="glass-card p-6 text-center text-sm text-slate-400 sm:p-8">
        No match data yet. Seed the database or refresh from live source.
      </section>
    );
  }

  return (
    <section>
      <h2 className="section-heading mb-4 sm:mb-5">Match Centre</h2>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent results */}
        {recent.length > 0 && (
          <div>
            <h3 className="label-text mb-2 sm:mb-3">Recent Results</h3>
            <div className="space-y-2 sm:space-y-3">
              {visibleRecent.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
              {!showAllRecent && recent.length > limit && (
                <button
                  onClick={() => setShowAllRecent(true)}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  Show all {recent.length} results
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <h3 className="label-text mb-2 sm:mb-3">Upcoming Fixtures</h3>
            <div className="space-y-2 sm:space-y-3">
              {visibleUpcoming.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
              {!showAllUpcoming && upcoming.length > limit && (
                <button
                  onClick={() => setShowAllUpcoming(true)}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  Show all {upcoming.length} fixtures
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
