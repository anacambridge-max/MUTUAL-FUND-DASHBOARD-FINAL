"use client";
import { SectorScore } from "@/lib/aiEngine";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { formatPercent } from "@/lib/utils";

interface SectorHeatmapProps {
  sectors: SectorScore[];
}

function getHeatColor(value: number): string {
  if (value > 3) return "bg-emerald-500 text-white";
  if (value > 1.5) return "bg-emerald-600/80 text-white";
  if (value > 0.5) return "bg-emerald-700/60 text-emerald-100";
  if (value > -0.5) return "bg-slate-700/60 text-slate-300";
  if (value > -1.5) return "bg-red-800/60 text-red-200";
  if (value > -3) return "bg-red-600/80 text-white";
  return "bg-red-500 text-white";
}

export function SectorHeatmap({ sectors }: SectorHeatmapProps) {
  const sorted = [...sectors].sort((a, b) => b.weeklyReturn - a.weeklyReturn);
  const worstThisWeek = [...sectors].sort((a, b) => a.weeklyReturn - b.weeklyReturn).slice(0, 3);
  const mostAttractive = sectors.filter((s) => s.isAttractive);
  const recovering = sectors.filter((s) => s.weeklyReturn > 0 && s.monthlyReturn < 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sector Heatmap — Weekly Performance</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" /><span className="text-xs text-slate-400">Strong</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-700 rounded" /><span className="text-xs text-slate-400">Neutral</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /><span className="text-xs text-slate-400">Weak</span></div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {sorted.map((sector) => (
              <div
                key={sector.name}
                className={`rounded-lg p-3 text-center transition-all hover:scale-105 cursor-default ${getHeatColor(sector.weeklyReturn)}`}
              >
                <div className="text-xs font-bold truncate">{sector.name}</div>
                <div className="text-sm font-bold mt-1">{formatPercent(sector.weeklyReturn)}</div>
                <div className="text-xs opacity-75">{sector.trend}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Worst Sectors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">⚠️ Worst This Week</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {worstThisWeek.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-red-950/20 border border-red-500/10">
                <span className="text-xs text-slate-300">{s.name}</span>
                <span className="text-xs font-bold text-red-400 font-mono">{formatPercent(s.weeklyReturn)}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Attractive Sectors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-400">💎 Buy The Dip</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {mostAttractive.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No heavily oversold sectors currently</p>
            ) : (
              mostAttractive.map((s) => (
                <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/10">
                  <div>
                    <div className="text-xs text-slate-300">{s.name}</div>
                    <div className="text-xs text-slate-500">1M: {formatPercent(s.monthlyReturn)}</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">{formatPercent(s.weeklyReturn)}</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Recovering Sectors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-400">📈 Recovering</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {recovering.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No clear recovery sectors this week</p>
            ) : (
              recovering.slice(0, 4).map((s) => (
                <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-blue-950/20 border border-blue-500/10">
                  <div>
                    <div className="text-xs text-slate-300">{s.name}</div>
                    <div className="text-xs text-slate-500">1M: {formatPercent(s.monthlyReturn)}</div>
                  </div>
                  <span className="text-xs font-bold text-blue-400 font-mono">{formatPercent(s.weeklyReturn)}</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* Sector Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Full Sector Analysis</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">Sector</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">1W</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">1M</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">3M</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">Momentum</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">Trend</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">Strength</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr key={s.name} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2 text-xs text-slate-300 font-medium">{s.name}</td>
                    <td className={`px-4 py-2 text-right text-xs font-bold font-mono ${s.weeklyReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(s.weeklyReturn)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${s.monthlyReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(s.monthlyReturn)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${s.threeMonthReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(s.threeMonthReturn)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${s.momentum >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(s.momentum)}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`text-xs font-bold ${s.trend === "Bullish" ? "text-emerald-400" : s.trend === "Bearish" ? "text-red-400" : "text-amber-400"}`}>{s.trend}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-16 bg-white/10 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${s.strength}%`, backgroundColor: s.strength > 60 ? "#22c55e" : s.strength > 40 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                        <span className="text-xs text-slate-400 font-mono w-6">{s.strength.toFixed(0)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
