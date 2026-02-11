"use client";

interface HeroHeaderProps {
  lastUpdated: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function HeroHeader({
  lastUpdated,
  isRefreshing,
  onRefresh,
}: HeroHeaderProps) {
  return (
    <header className="noise-overlay relative overflow-hidden border-b border-white/[0.06] bg-[#07090f]">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cricket-gold/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-blue-500/[0.04] blur-[80px]" />

      {/* Decorative arcs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full border border-white/[0.04]" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-48 w-48 rounded-full border border-cricket-gold/[0.06]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {/* Title block */}
          <div className="animate-fade-up">
            <p className="label-text text-cricket-gold/80">
              ICC Men&apos;s T20 World Cup 2026
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              <span className="text-gradient-white">T20 World Cup</span>{" "}
              <span className="text-gradient-gold">Tracker</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400/80">
              Live standings, match results &amp; qualification predictions
              updated throughout the tournament.
            </p>
          </div>

          {/* Status + refresh */}
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-slow" />
                <span className="text-xs text-slate-500">
                  {new Date(lastUpdated).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="group flex items-center gap-2 rounded-lg border border-cricket-gold/30 bg-cricket-gold/10 px-4 py-2 text-sm font-semibold text-cricket-gold transition-all hover:border-cricket-gold/50 hover:bg-cricket-gold/20 disabled:opacity-40"
            >
              <svg
                className={`h-4 w-4 transition-transform group-hover:rotate-45 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
