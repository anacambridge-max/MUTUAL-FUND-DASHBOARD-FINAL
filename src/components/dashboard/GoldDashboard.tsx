"use client";
import { GoldData } from "@/lib/aiEngine";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Shield } from "lucide-react";

interface GoldDashboardProps {
  data: GoldData;
}

export function GoldDashboard({ data }: GoldDashboardProps) {
  const trendColor = data.trend === "Bullish" ? "text-amber-400" :
    data.trend === "Bearish" ? "text-red-400" : "text-slate-400";
  const TrendIcon = data.trend !== "Bearish" ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-[#0d1226]/80 to-yellow-950/30 p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🥇</span>
              <span className="text-xs text-amber-400 font-bold tracking-widest uppercase">Gold Dashboard — Separate Asset Class</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">₹{formatNumber(data.price, 0)} / 10g</div>
            <div className={`flex items-center gap-2 ${trendColor}`}>
              <TrendIcon size={16} />
              <span className="text-sm font-bold">{data.trend} Trend</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <ScoreRing score={100 - data.riskScore} size={80} label="Safety Score" />
            <div className="space-y-2">
              <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs text-amber-400 mb-1">Suggested This Month</div>
                <div className="text-lg font-bold text-white">{formatCurrency(data.suggestedInvestment)}</div>
              </div>
              <Badge
                label={data.signal === "Hold" ? "HOLD" : data.signal === "Buy" ? "BUY" : "ACCUMULATE"}
                variant={data.signal === "Buy" ? "success" : data.signal === "Hold" ? "warning" : "info"}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GoldMetric label="Weekly Return" value={data.weeklyReturn} isPercent />
        <GoldMetric label="Monthly Return" value={data.monthlyReturn} isPercent />
        <GoldMetric label="1 Year Return" value={data.yearlyReturn} isPercent />
        <GoldMetric label="Momentum" value={data.momentum} isPercent />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Gold Allocation</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Allocation</span>
                <span className="text-sm font-bold text-amber-400">{data.allocationPercent}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-amber-400"
                  style={{ width: `${data.allocationPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Target Allocation</span>
                <span className="text-sm font-bold text-white">{data.targetAllocation}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Status</span>
                <span className={`text-xs font-bold ${data.allocationPercent >= data.targetAllocation ? "text-emerald-400" : "text-amber-400"}`}>
                  {data.allocationPercent >= data.targetAllocation ? "On Target" : "Under-allocated"}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* AI Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-400">🤖 AI Gold Recommendation</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">{data.reason}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/10 space-y-1">
              <p className="text-xs text-amber-400 font-bold">Long-term Perspective (10–15 Years)</p>
              <p className="text-xs text-slate-400">
                Gold serves as a hedge against inflation, currency depreciation, and black swan events.
                Maintaining 8–12% allocation is recommended for long-term wealth preservation.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <DecisionCard label="Buy Gold?" value={data.signal === "Buy" || data.signal === "Accumulate"} />
              <DecisionCard label="Hold Gold?" value={data.signal === "Hold"} />
              <DecisionCard label="Skip Week?" value={data.weeklyReturn > 2} />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function GoldMetric({ label, value, isPercent }: { label: string; value: number; isPercent?: boolean }) {
  const isPos = value >= 0;
  return (
    <Card className="p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${isPos ? "text-amber-400" : "text-red-400"}`}>
        {isPos ? "+" : ""}{isPercent ? `${value.toFixed(2)}%` : value}
      </div>
    </Card>
  );
}

function DecisionCard({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={`p-2 rounded-lg text-center border ${value ? "bg-emerald-950/30 border-emerald-500/20" : "bg-red-950/20 border-red-500/10"}`}>
      <div className="text-lg">{value ? "✅" : "❌"}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
