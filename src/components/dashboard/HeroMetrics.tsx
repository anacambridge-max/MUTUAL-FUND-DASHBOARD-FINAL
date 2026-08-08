"use client";
import { DashboardData } from "@/lib/aiEngine";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatPercent, getReturnColor } from "@/lib/utils";
import { MARKET_TREND_COLORS } from "@/lib/constants";
import {
  TrendingUp, TrendingDown, Target, Zap, Star,
  AlertTriangle, Activity, DollarSign
} from "lucide-react";

interface HeroMetricsProps {
  data: DashboardData;
  budget: number;
}

export function HeroMetrics({ data, budget }: HeroMetricsProps) {
  const trendColor = MARKET_TREND_COLORS[data.marketData.marketTrend] ?? "text-amber-400";
  const weeklySignalVariant = data.weeklySignal === "BUY" ? "success" : data.weeklySignal === "HOLD" ? "warning" : "danger";
  const monthlySignalVariant = data.monthlySignal === "ACCUMULATE" ? "success" : "warning";

  return (
    <div className="space-y-4">
      {/* Main AI Decision Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-[#0d1226]/80 to-purple-950/80 backdrop-blur-sm p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-transparent to-purple-600/10" />
        <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-indigo-400" />
                <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">AI Investment Decision</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {data.weeklySignal === "BUY" ? "✅ INVEST TODAY" : data.weeklySignal === "HOLD" ? "⏳ HOLD & MONITOR" : "⚠️ REDUCE EXPOSURE"}
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">{data.investmentRecommendation}</p>
            </div>

            <div className="flex items-center gap-6">
              <ScoreRing score={data.portfolioHealthScore} size={90} label="Portfolio Health" />
              <ScoreRing score={data.aiInvestmentScore} size={90} label="AI Investment Score" />
              <ScoreRing score={data.marketOpportunityScore} size={90} label="Opportunity Score" />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">WEEKLY SIGNAL:</span>
              <Badge label={data.weeklySignal} variant={weeklySignalVariant} size="md" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">MONTHLY SIGNAL:</span>
              <Badge label={data.monthlySignal} variant={monthlySignalVariant} size="md" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">MARKET:</span>
              <span className={`text-sm font-bold ${trendColor}`}>{data.marketData.marketTrend.toUpperCase()}</span>
            </div>
            <div className="ml-auto">
              <div className="text-xs text-slate-500">RECOMMENDED INVESTMENT</div>
              <div className="text-xl font-bold text-emerald-400">{formatCurrency(budget)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <QuickCard
          icon={<Star size={14} className="text-amber-400" />}
          label="Best Fund Today"
          value={data.todayBestFund.shortName}
          sub={`AI Score: ${data.todayBestFund.aiScore.toFixed(0)}`}
          color="text-amber-400"
          badge={{ label: data.todayBestFund.signal, variant: "signal" }}
          colSpan={2}
        />
        <QuickCard
          icon={<TrendingDown size={14} className="text-red-400" />}
          label="Worst Performer"
          value={data.todayWorstFund.shortName}
          sub={formatPercent(data.todayWorstFund.return1W) + " (1W)"}
          color="text-red-400"
          colSpan={2}
        />
        <QuickCard
          icon={<Target size={14} className="text-emerald-400" />}
          label="Best Valuation"
          value={data.mostAttractiveValuation.shortName}
          sub={`Opp Score: ${data.mostAttractiveValuation.opportunityScore.toFixed(0)}`}
          color="text-emerald-400"
          colSpan={2}
        />
        <QuickCard
          icon={<AlertTriangle size={14} className="text-orange-400" />}
          label="Most Oversold"
          value={data.mostOversold.shortName}
          sub={`DD: ${formatPercent(data.mostOversold.currentDrawdown)}`}
          color="text-orange-400"
          colSpan={2}
        />
      </div>

      {/* Top 3 Buy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.top3Buy.map((fund, i) => (
          <div
            key={fund.amfiCode}
            className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-[#0d1226]/80 backdrop-blur-sm p-4"
          >
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 font-bold text-sm">#{i + 1}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: fund.color }} />
              <div className="flex-1 pr-8">
                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
                  {i === 0 ? "🏆 TOP PICK THIS WEEK" : i === 1 ? "🥈 2ND BEST OPPORTUNITY" : "🥉 3RD BEST OPPORTUNITY"}
                </div>
                <div className="text-white font-bold text-sm mb-1">{fund.shortName}</div>
                <div className="text-xs text-slate-400 mb-2">{fund.subCategory}</div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-500">AI Score</div>
                    <div className="text-base font-bold text-indigo-400">{fund.aiScore.toFixed(0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">1W</div>
                    <div className={`text-sm font-bold ${getReturnColor(fund.return1W)}`}>{formatPercent(fund.return1W)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">1Y</div>
                    <div className={`text-sm font-bold ${getReturnColor(fund.return1Y)}`}>{formatPercent(fund.return1Y)}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-400 line-clamp-2">{fund.signalReason}</div>
              </div>
            </div>
            <Badge label={fund.signal} variant="signal" size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickCard({
  icon, label, value, sub, color, badge, colSpan = 1
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  badge?: { label: string; variant: "signal" };
  colSpan?: number;
}) {
  return (
    <Card
      className={`p-3 ${colSpan === 2 ? "col-span-2" : ""}`}
      hover
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-sm font-bold ${color} leading-tight`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
      {badge && (
        <div className="mt-2">
          <Badge label={badge.label} variant={badge.variant} />
        </div>
      )}
    </Card>
  );
}
