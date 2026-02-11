"use client";

import type { GroupStandings } from "@/lib/types";

interface PointsTableProps {
  groups: GroupStandings[];
}

export default function PointsTable({ groups }: PointsTableProps) {
  if (groups.length === 0) {
    return (
      <section className="glass-card p-8 text-center text-slate-400">
        No standings data yet. Hit <strong className="text-white">Refresh</strong> or run the seed script.
      </section>
    );
  }

  return (
    <section>
      <h2 className="section-heading mb-5">Group Standings</h2>

      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map(({ group, standings }) => (
          <div key={group} className="glass-card">
            {/* Group header */}
            <div className="border-b border-white/[0.06] px-5 py-3">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <span className="inline-block h-2 w-2 rounded-full bg-cricket-gold" />
                <span className="text-gradient-gold">Group {group}</span>
              </h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Team</th>
                    <th className="px-4 py-3 text-center font-medium">P</th>
                    <th className="px-4 py-3 text-center font-medium">W</th>
                    <th className="px-4 py-3 text-center font-medium">L</th>
                    <th className="px-4 py-3 text-center font-medium">T</th>
                    <th className="px-4 py-3 text-center font-medium">NR</th>
                    <th className="px-4 py-3 text-center font-medium">Pts</th>
                    <th className="px-4 py-3 text-right font-medium">NRR</th>
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
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{row.flag}</span>
                            <span className={`font-medium ${isLikely ? "text-white" : "text-slate-300"}`}>
                              <span className="hidden sm:inline">{row.teamName}</span>
                              <span className="sm:hidden">{row.shortName}</span>
                            </span>
                            {isLikely && (
                              <span className="ml-1 rounded-full border border-cricket-gold/20 bg-cricket-gold/10 px-2 py-px text-[8px] font-bold uppercase tracking-widest text-cricket-gold">
                                Likely
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-400 font-mono text-xs">
                          {row.played}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-green-400">
                          {row.won}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-red-400/80">
                          {row.lost}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-slate-500">
                          {row.tied}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-slate-500">
                          {row.noResult}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs font-bold text-white">
                          {row.points}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono text-xs ${
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
