"use client";

import { useState } from "react";
import type { PredictionRow } from "@/lib/types";

interface PredictionsPanelProps {
  predictions: PredictionRow[];
}

type Stage = "super8" | "semi" | "final" | "winner";

const STAGE_CONFIG: Record<
  Stage,
  {
    label: string;
    key: keyof PredictionRow;
    color: string;
    highlightColor: string;
    qualifyCount: number;
    qualifyLabel: string;
    badgeLabel: string;
    badgeStyle: string;
  }
> = {
  super8: {
    label: "Super 8",
    key: "super8Prob",
    color: "bg-blue-500/30",
    highlightColor: "bg-blue-500",
    qualifyCount: 8,
    qualifyLabel: "Super 8 qualifier",
    badgeLabel: "Q",
    badgeStyle: "border-blue-500/25 bg-blue-500/10 text-blue-400",
  },
  semi: {
    label: "Semi-Finals",
    key: "semiFinalProb",
    color: "bg-violet-500/30",
    highlightColor: "bg-violet-500",
    qualifyCount: 4,
    qualifyLabel: "Semi-Finalist",
    badgeLabel: "SF",
    badgeStyle: "border-violet-500/25 bg-violet-500/10 text-violet-400",
  },
  final: {
    label: "Final",
    key: "finalProb",
    color: "bg-cricket-gold/30",
    highlightColor: "bg-cricket-gold",
    qualifyCount: 2,
    qualifyLabel: "Finalist",
    badgeLabel: "Final",
    badgeStyle: "border-cricket-gold/25 bg-cricket-gold/10 text-cricket-gold",
  },
  winner: {
    label: "Champion",
    key: "winnerProb",
    color: "bg-green-500/30",
    highlightColor: "bg-green-500",
    qualifyCount: 1,
    qualifyLabel: "Champion",
    badgeLabel: "Favourite",
    badgeStyle: "border-green-500/25 bg-green-500/10 text-green-400",
  },
};

function ProbabilityBar({
  value,
  color,
  max,
}: {
  value: number;
  color: string;
  max: number;
}) {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04] sm:h-2.5">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function PredictionsPanel({
  predictions,
}: PredictionsPanelProps) {
  const [stage, setStage] = useState<Stage>("super8");

  if (predictions.length === 0) {
    return (
      <section className="glass-card p-6 text-center text-sm text-slate-400 sm:p-8">
        No predictions available. Seed data and run a prediction cycle.
      </section>
    );
  }

  const cfg = STAGE_CONFIG[stage];
  const sorted = [...predictions].sort(
    (a, b) => (b[cfg.key] as number) - (a[cfg.key] as number),
  );
  const maxProb = Math.max(...sorted.map((p) => p[cfg.key] as number), 1);
  const qualifyCount = cfg.qualifyCount;

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h2 className="section-heading">Qualification Predictions</h2>
        <span className="label-text text-slate-500/70">
          Based on current form &middot; 10k simulations
        </span>
      </div>

      {/* Stage tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 sm:mb-5 sm:gap-1.5">
        {(Object.keys(STAGE_CONFIG) as Stage[]).map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all sm:px-4 sm:py-2 sm:text-xs ${
              stage === s
                ? "bg-cricket-gold/90 text-slate-900 shadow-lg shadow-cricket-gold/10"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            {STAGE_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Probability list */}
      <div className="glass-card">
        {/* Qualifying zone header */}
        <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2 sm:px-5 sm:py-2.5">
          <div
            className={`h-1.5 w-1.5 rounded-full ${cfg.highlightColor} animate-pulse-slow`}
          />
          <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 sm:text-[10px]">
            Most likely {cfg.qualifyLabel}
            {qualifyCount > 1 ? "s" : ""} ({qualifyCount})
          </span>
        </div>

        <div>
          {sorted.map((p, idx) => {
            const prob = p[cfg.key] as number;
            if (prob === 0 && idx > 10) return null;

            const isQualifying = idx < qualifyCount;
            const isCutoffRow = idx === qualifyCount;
            const barColor = isQualifying ? cfg.highlightColor : cfg.color;

            return (
              <div key={p.teamId}>
                {/* Cutoff divider */}
                {isCutoffRow && (
                  <div className="relative flex items-center px-4 py-1 sm:px-5 sm:py-1.5">
                    <div className="flex-1 border-t border-dashed border-white/[0.08]" />
                    <span className="mx-2 text-[8px] font-bold uppercase tracking-[0.15em] text-slate-600 sm:mx-3 sm:text-[9px]">
                      Cutoff
                    </span>
                    <div className="flex-1 border-t border-dashed border-white/[0.08]" />
                  </div>
                )}

                <div
                  className={`flex items-center gap-2 px-3 py-2 transition-colors sm:gap-4 sm:px-5 sm:py-2.5 ${
                    isQualifying
                      ? "bg-white/[0.02] hover:bg-white/[0.04]"
                      : "opacity-50 hover:bg-white/[0.02] hover:opacity-70"
                  }`}
                >
                  {/* Rank */}
                  <span
                    className={`w-4 text-right font-mono text-[10px] sm:w-5 sm:text-[11px] ${
                      isQualifying ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {idx + 1}
                  </span>

                  {/* Flag */}
                  <span className="text-sm sm:text-base">{p.flag}</span>

                  {/* Team name + badge */}
                  <div className="flex w-20 items-center gap-1 sm:w-44 sm:gap-2">
                    <span
                      className={`truncate text-xs font-medium sm:text-sm ${
                        isQualifying ? "text-white" : "text-slate-400"
                      }`}
                    >
                      <span className="sm:hidden">{p.shortName ?? p.teamName}</span>
                      <span className="hidden sm:inline">{p.teamName}</span>
                    </span>
                    {isQualifying && (
                      <span
                        className={`hidden shrink-0 rounded-full border px-2 py-px text-[8px] font-bold uppercase tracking-wider sm:inline-block ${cfg.badgeStyle}`}
                      >
                        {cfg.badgeLabel}
                      </span>
                    )}
                  </div>

                  {/* Bar */}
                  <div className="flex-1">
                    <ProbabilityBar
                      value={prob}
                      color={barColor}
                      max={maxProb}
                    />
                  </div>

                  {/* Percentage */}
                  <span
                    className={`w-11 text-right font-mono text-[11px] sm:w-14 sm:text-xs ${
                      isQualifying ? "font-semibold text-white" : "text-slate-600"
                    }`}
                  >
                    {prob.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
