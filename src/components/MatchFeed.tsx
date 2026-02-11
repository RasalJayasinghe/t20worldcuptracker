"use client";

import type { MatchInfo } from "@/lib/types";

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
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {status === "live" ? "LIVE" : status === "completed" ? "FT" : "Upcoming"}
    </span>
  );
}

function MatchCard({ match }: { match: MatchInfo }) {
  return (
    <div className="glass-card-inner p-4 transition-all hover:border-white/[0.10] hover:bg-white/[0.03]">
      {/* Header: stage + status */}
      <div className="mb-3 flex items-center justify-between">
        <span className="label-text">
          {match.stage}
          {match.group ? ` · Group ${match.group}` : ""}
        </span>
        <StatusBadge status={match.status} />
      </div>

      {/* Teams */}
      <div className="space-y-2">
        {/* Home */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{match.homeTeam.flag}</span>
            <span
              className={`text-sm font-semibold ${
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
            <span className="font-mono text-xs text-slate-300">
              {match.homeScore}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{match.awayTeam.flag}</span>
            <span
              className={`text-sm font-semibold ${
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
            <span className="font-mono text-xs text-slate-300">
              {match.awayScore}
            </span>
          )}
        </div>
      </div>

      {/* Result / date */}
      <div className="mt-3 border-t border-white/[0.04] pt-2.5">
        {match.result ? (
          <p className="text-xs text-slate-400/80">{match.result}</p>
        ) : match.date ? (
          <p className="text-xs text-slate-500">
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
  const noData = recent.length === 0 && upcoming.length === 0;

  if (noData) {
    return (
      <section className="glass-card p-8 text-center text-slate-400">
        No match data yet. Seed the database or refresh from live source.
      </section>
    );
  }

  return (
    <section>
      <h2 className="section-heading mb-5">Match Centre</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent results */}
        {recent.length > 0 && (
          <div>
            <h3 className="label-text mb-3">Recent Results</h3>
            <div className="space-y-3">
              {recent.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <h3 className="label-text mb-3">Upcoming Fixtures</h3>
            <div className="space-y-3">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
