"use client";
import { FundScore } from "@/lib/aiEngine";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { formatNumber, formatPercent, getReturnColor, getScoreColor } from "@/lib/utils";
import { FUNDS } from "@/lib/constants";

interface AllFundsViewProps {
  funds: FundScore[];
}

export function AllFundsView({ funds }: AllFundsViewProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
        <h2 className="text-base font-bold text-white mb-1">Your 15-Fund Permanent Portfolio</h2>
        <p className="text-xs text-slate-400">
          These are your fixed funds for 10–15 year wealth creation. The AI never recommends adding or removing any fund from this list.
        </p>
      </div>

      {/* Fund Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {funds.map((fund) => (
          <FundDetailCard key={fund.amfiCode} fund={fund} />
        ))}
      </div>
    </div>
  );
}

function FundDetailCard({ fund }: { fund: FundScore }) {
  return (
    <Card hover glow>
      <CardBody className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-2 flex-1">
            <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: fund.color }} />
            <div>
              <div className="text-sm font-bold text-white leading-tight">{fund.shortName}</div>
              <div className="text-xs text-slate-500">{fund.subCategory}</div>
              <div className="text-xs text-slate-600">AMFI: {fund.amfiCode}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge label={fund.signal} variant="signal" />
            <span className="text-xs text-slate-500 font-mono">NAV ₹{fund.nav.toFixed(2)}</span>
          </div>
        </div>

        {/* Score Row */}
        <div className="flex items-center justify-around mb-3 p-2 rounded-lg bg-white/5">
          <ScoreRing score={fund.aiScore} size={52} label="AI" />
          <ScoreRing score={fund.opportunityScore} size={52} label="Opp" />
          <ScoreRing score={100 - fund.riskScore} size={52} label="Safety" />
        </div>

        {/* Returns Grid */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {[
            { label: "1W", value: fund.return1W },
            { label: "1M", value: fund.return1M },
            { label: "3M", value: fund.return3M },
            { label: "1Y", value: fund.return1Y },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-1.5 rounded bg-white/5">
              <div className="text-xs text-slate-500">{label}</div>
              <div className={`text-xs font-bold font-mono ${getReturnColor(value)}`}>{formatPercent(value)}</div>
            </div>
          ))}
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Drawdown</span>
            <span className={`font-mono font-bold ${getReturnColor(fund.currentDrawdown)}`}>{formatPercent(fund.currentDrawdown)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Sharpe</span>
            <span className={`font-mono ${fund.sharpeRatio >= 1.5 ? "text-emerald-400" : fund.sharpeRatio >= 1 ? "text-amber-400" : "text-red-400"}`}>{formatNumber(fund.sharpeRatio)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Volatility</span>
            <span className="text-slate-300 font-mono">{formatNumber(fund.volatility)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Momentum</span>
            <span className={`font-mono ${getReturnColor(fund.momentum)}`}>{formatPercent(fund.momentum)}</span>
          </div>
        </div>

        {/* AI Reason */}
        <div className="p-2 rounded-lg bg-indigo-950/20 border border-indigo-500/10">
          <p className="text-xs text-slate-400 leading-relaxed">{fund.signalReason}</p>
        </div>

        {/* Risk Level */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-500">Risk Level:</span>
          <span className={`text-xs font-bold ${
            fund.riskLevel === "Very High" ? "text-red-400" :
            fund.riskLevel === "High" ? "text-orange-400" :
            fund.riskLevel === "Moderate-High" ? "text-amber-400" : "text-green-400"
          }`}>{fund.riskLevel}</span>
        </div>
      </CardBody>
    </Card>
  );
}
