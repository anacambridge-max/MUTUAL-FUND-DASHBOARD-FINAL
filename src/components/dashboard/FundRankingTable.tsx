"use client";
import { FundScore } from "@/lib/aiEngine";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { formatPercent, formatNumber, getReturnColor, getScoreColor } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useState } from "react";

interface FundRankingTableProps {
  funds: FundScore[];
  title?: string;
}

type SortKey = "weeklyRank" | "aiScore" | "return1W" | "return1M" | "return1Y" | "opportunityScore" | "currentDrawdown";

export function FundRankingTable({ funds, title = "Fund Rankings" }: FundRankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("weeklyRank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = [...funds].sort((a, b) => {
    const aVal = a[sortKey] as number;
    const bVal = b[sortKey] as number;
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(k)}
      className={`text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${sortKey === k ? "text-indigo-400" : "text-slate-500"}`}
    >
      {label}{sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-indigo-400" />
          <span className="text-xs text-indigo-400 font-mono">15 FUNDS</span>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="text-left px-4 py-3">
                  <SortBtn k="weeklyRank" label="Rank" />
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-semibold uppercase">Fund</th>
                <th className="text-right px-4 py-3">
                  <SortBtn k="aiScore" label="AI Score" />
                </th>
                <th className="text-right px-4 py-3">
                  <SortBtn k="return1W" label="1W %" />
                </th>
                <th className="text-right px-4 py-3">
                  <SortBtn k="return1M" label="1M %" />
                </th>
                <th className="text-right px-4 py-3">
                  <SortBtn k="return1Y" label="1Y %" />
                </th>
                <th className="text-right px-4 py-3 hidden lg:table-cell">
                  <SortBtn k="currentDrawdown" label="DD" />
                </th>
                <th className="text-right px-4 py-3 hidden lg:table-cell text-xs text-slate-500 font-semibold uppercase tracking-wider">Sharpe</th>
                <th className="text-right px-4 py-3 hidden xl:table-cell text-xs text-slate-500 font-semibold uppercase tracking-wider">Momentum</th>
                <th className="text-right px-4 py-3">
                  <SortBtn k="opportunityScore" label="Opp" />
                </th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">Signal</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((fund, i) => (
                <tr
                  key={fund.amfiCode}
                  className={`border-b border-white/5 transition-colors hover:bg-white/4 ${i < 3 ? "bg-emerald-950/10" : i >= sorted.length - 3 ? "bg-red-950/10" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-500"}`}>
                        #{i + 1}
                      </span>
                      {i === 0 && <span className="text-xs">🏆</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fund.color }} />
                      <div>
                        <div className="text-white font-medium text-xs">{fund.shortName}</div>
                        <div className="text-slate-500 text-xs">{fund.subCategory}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold font-mono ${getScoreColor(fund.aiScore)}`}>
                      {fund.aiScore.toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className={`flex items-center justify-end gap-1 text-xs font-bold font-mono ${getReturnColor(fund.return1W)}`}>
                      {fund.return1W >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {formatPercent(fund.return1W)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold font-mono ${getReturnColor(fund.return1M)}`}>
                      {formatPercent(fund.return1M)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold font-mono ${getReturnColor(fund.return1Y)}`}>
                      {formatPercent(fund.return1Y)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className={`text-xs font-mono ${getReturnColor(fund.currentDrawdown)}`}>
                      {formatPercent(fund.currentDrawdown)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className={`text-xs font-mono ${fund.sharpeRatio >= 1.5 ? "text-emerald-400" : fund.sharpeRatio >= 1 ? "text-amber-400" : "text-red-400"}`}>
                      {formatNumber(fund.sharpeRatio)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden xl:table-cell">
                    <span className={`text-xs font-mono ${getReturnColor(fund.momentum)}`}>
                      {formatPercent(fund.momentum)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold font-mono ${getScoreColor(fund.opportunityScore)}`}>
                      {fund.opportunityScore.toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge label={fund.signal} variant="signal" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
