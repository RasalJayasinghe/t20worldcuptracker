"use client";

import type { GroupStandings } from "@/lib/types";

interface PointsTableProps {
  groups: GroupStandings[];
}

export default function PointsTable({ groups }: PointsTableProps) {
  if (groups.length === 0) {
    return (
      <section className="glass-card p-6 text-center text-sm text-slate-400 sm:p-8">
        No standings data yet. Hit <strong className="text-white">Refresh</strong> or run the seed script.
      </section>
    );
  }

  return (
    <section>
      <h2 className="section-heading mb-4 sm:mb-5">Group Standings</h2>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        {groups.map(({ group, standings }) => (
          <div key={group} className="glass-card">
            {/* Group header */}
            <div className="border-b border-white/[0.06] px-4 py-2.5 sm:px-5 sm:py-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider sm:text-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-cricket-gold sm:h-2 sm:w-2" />
                <span className="text-gradient-gold">Group {group}</span>
              </h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">
                    <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">#</th>
                    <th className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">Team</th>
                    <th className="px-2 py-2.5 text-center font-medium sm:px-4 sm:py-3">P</th>
                    <th className="px-2 py-2.5 text-center font-medium sm:px-4 sm:py-3">W</th>
                    <th className="px-2 py-2.5 text-center font-medium sm:px-4 sm:py-3">L</th>
                    <th className="hidden px-2 py-2.5 text-center font-medium sm:table-cell sm:px-4 sm:py-3">T</th>
                    <th className="hidden px-2 py-2.5 text-center font-medium sm:table-cell sm:px-4 sm:py-3">NR</th>
                    <th className="px-2 py-2.5 text-center font-medium sm:px-4 sm:py-3">Pts</th>
                    <th className="px-3 py-2.5 text-right font-medium sm:px-4 sm:py-3">NRR</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, idx) => {
                    const isLikely = idx < 2;
                    return (
                      <tr
                        key={row.teamId}
                        className={`border-b border-white/[0.03] transition-colors ${
                          isLikely
                            ? "bg-cricket-gold/[0.03] hover:bg-cricket-gold/[0.06]"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500 sm:px-4 sm:py-3 sm:text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-sm sm:text-base">{row.flag}</span>
                            <span className={`text-xs font-medium sm:text-sm ${isLikely ? "text-white" : "text-slate-300"}`}>
                              <span className="hidden sm:inline">{row.teamName}</span>
                              <span className="sm:hidden">{row.shortName}</span>
                            </span>
                            {isLikely && (
                              <span className="ml-0.5 rounded-full border border-cricket-gold/20 bg-cricket-gold/10 px-1.5 py-px text-[7px] font-bold uppercase tracking-widest text-cricket-gold sm:ml-1 sm:px-2 sm:text-[8px]">
                                Likely
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-[11px] text-slate-400 sm:px-4 sm:py-3 sm:text-xs">
                          {row.played}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-[11px] text-green-400 sm:px-4 sm:py-3 sm:text-xs">
                          {row.won}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-[11px] text-red-400/80 sm:px-4 sm:py-3 sm:text-xs">
                          {row.lost}
                        </td>
                        <td className="hidden px-2 py-2.5 text-center font-mono text-[11px] text-slate-500 sm:table-cell sm:px-4 sm:py-3 sm:text-xs">
                          {row.tied}
                        </td>
                        <td className="hidden px-2 py-2.5 text-center font-mono text-[11px] text-slate-500 sm:table-cell sm:px-4 sm:py-3 sm:text-xs">
                          {row.noResult}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-[11px] font-bold text-white sm:px-4 sm:py-3 sm:text-xs">
                          {row.points}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-right font-mono text-[11px] sm:px-4 sm:py-3 sm:text-xs ${
                            row.nrr > 0
                              ? "text-green-400"
                              : row.nrr < 0
                                ? "text-red-400/70"
                                : "text-slate-500"
                          }`}
                        >
                          {row.nrr > 0 ? "+" : ""}
                          {row.nrr.toFixed(3)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
