"use client";
import { FundScore, DashboardData } from "@/lib/aiEngine";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { formatPercent, formatNumber, getReturnColor, getScoreColor } from "@/lib/utils";
import { getDaysToNextFriday } from "@/lib/utils";
import { Calendar, TrendingDown, ArrowUpRight, Zap } from "lucide-react";

interface WeeklyDecisionEngineProps {
  data: DashboardData;
}

export function WeeklyDecisionEngine({ data }: WeeklyDecisionEngineProps) {
  const daysToFriday = getDaysToNextFriday();
  const sortedByDrawdown = [...data.funds].sort((a, b) => a.currentDrawdown - b.currentDrawdown);
  const highestWeeklyDD = sortedByDrawdown[0];
  const highestMonthlyDD = [...data.funds].sort((a, b) => a.return1M - b.return1M)[0];
  const highestRecovery = [...data.funds].sort((a, b) => b.momentum - a.momentum)[0];

  return (
    <div className="space-y-4">
      {/* Weekly Timer Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-indigo-400" />
          <div>
            <div className="text-sm font-bold text-white">Weekly Investment Decision</div>
            <div className="text-xs text-slate-400">
              {daysToFriday === 0 ? "Today is Friday — Perfect day to invest!" : `${daysToFriday} day${daysToFriday > 1 ? "s" : ""} until next Friday investment review`}
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-400">{daysToFriday}</div>
          <div className="text-xs text-slate-500">Days Left</div>
        </div>
      </div>

      {/* Top 5 Buy This Week */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            <CardTitle>🏆 TOP 5 BUY THIS WEEK</CardTitle>
          </div>
          <span className="text-xs text-indigo-400 font-mono">AI RANKED</span>
        </CardHeader>
        <CardBody className="space-y-3">
          {data.top5Buy.map((fund, i) => (
            <WeeklyFundRow key={fund.amfiCode} fund={fund} rank={i + 1} />
          ))}
        </CardBody>
      </Card>

      {/* 3 Key Signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SpecialFundCard
          fund={highestWeeklyDD}
          title="Highest Weekly Drawdown"
          subtitle="Deepest 1-week correction"
          icon={<TrendingDown size={14} className="text-orange-400" />}
          color="orange"
          metric={formatPercent(highestWeeklyDD.return1W)}
          metricLabel="1W Return"
        />
        <SpecialFundCard
          fund={highestMonthlyDD}
          title="Highest Monthly Drawdown"
          subtitle="Best entry opportunity"
          icon={<TrendingDown size={14} className="text-red-400" />}
          color="red"
          metric={formatPercent(highestMonthlyDD.return1M)}
          metricLabel="1M Return"
        />
        <SpecialFundCard
          fund={highestRecovery}
          title="Highest Recovery Potential"
          subtitle="Strongest momentum"
          icon={<ArrowUpRight size={14} className="text-emerald-400" />}
          color="emerald"
          metric={formatPercent(highestRecovery.momentum)}
          metricLabel="Momentum"
        />
      </div>

      {/* Funds to Avoid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-400">⚠️ FUNDS TO AVOID THIS WEEK</CardTitle>
          <Badge label="LOW AI SCORE" variant="danger" />
        </CardHeader>
        <CardBody className="space-y-2">
          {data.fundsToAvoid.map((fund) => (
            <div key={fund.amfiCode} className="flex items-center justify-between p-3 rounded-lg border border-red-500/10 bg-red-950/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fund.color }} />
                <div>
                  <div className="text-xs text-slate-300">{fund.shortName}</div>
                  <div className="text-xs text-slate-500">{fund.signalReason}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-500">AI Score</div>
                  <div className={`text-sm font-bold ${getScoreColor(fund.aiScore)}`}>{fund.aiScore.toFixed(0)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">1W</div>
                  <div className={`text-xs font-bold ${getReturnColor(fund.return1W)}`}>{formatPercent(fund.return1W)}</div>
                </div>
                <Badge label={fund.signal} variant="signal" />
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500 italic mt-2">
            Note: "Avoid" means skip NEW purchases this week. Continue SIP if already invested.
          </p>
        </CardBody>
      </Card>

      {/* Full Weekly Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Opportunity Analysis — All 15 Funds</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">Fund</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">1W</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">1M</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">3M</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">6M</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">1Y</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">DD</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold hidden lg:table-cell">Momentum</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">AI</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">Opp</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">Signal</th>
                </tr>
              </thead>
              <tbody>
                {[...data.funds].sort((a, b) => a.weeklyRank - b.weeklyRank).map((fund) => (
                  <tr key={fund.amfiCode} className="border-b border-white/5 hover:bg-white/3">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono w-4">#{fund.weeklyRank}</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fund.color }} />
                        <span className="text-xs text-white">{fund.shortName}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-2 text-right text-xs font-mono font-bold ${getReturnColor(fund.return1W)}`}>{formatPercent(fund.return1W)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.return1M)}`}>{formatPercent(fund.return1M)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.return3M)}`}>{formatPercent(fund.return3M)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.return6M)}`}>{formatPercent(fund.return6M)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.return1Y)}`}>{formatPercent(fund.return1Y)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.currentDrawdown)}`}>{formatPercent(fund.currentDrawdown)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono hidden lg:table-cell ${getReturnColor(fund.momentum)}`}>{formatPercent(fund.momentum)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-bold font-mono ${getScoreColor(fund.aiScore)}`}>{fund.aiScore.toFixed(0)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getScoreColor(fund.opportunityScore)}`}>{fund.opportunityScore.toFixed(0)}</td>
                    <td className="px-4 py-2 text-right"><Badge label={fund.signal} variant="signal" /></td>
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

function WeeklyFundRow({ fund, rank }: { fund: FundScore; rank: number }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${rank <= 3 ? "border-emerald-500/20 bg-emerald-950/10" : "border-white/5 bg-white/3"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rank === 1 ? "bg-amber-500/20 text-amber-400" : rank === 2 ? "bg-slate-500/20 text-slate-300" : rank === 3 ? "bg-orange-700/20 text-orange-400" : "bg-white/5 text-slate-500"}`}>
        {rank}
      </div>
      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: fund.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{fund.shortName}</span>
          <Badge label={fund.signal} variant="signal" />
        </div>
        <div className="text-xs text-slate-400 truncate">{fund.signalReason}</div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-center">
          <div className="text-xs text-slate-500">AI Score</div>
          <div className={`text-base font-bold ${getScoreColor(fund.aiScore)}`}>{fund.aiScore.toFixed(0)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">1W</div>
          <div className={`text-sm font-bold ${getReturnColor(fund.return1W)}`}>{formatPercent(fund.return1W)}</div>
        </div>
        <div className="text-center hidden md:block">
          <div className="text-xs text-slate-500">1Y</div>
          <div className={`text-sm font-bold ${getReturnColor(fund.return1Y)}`}>{formatPercent(fund.return1Y)}</div>
        </div>
      </div>
    </div>
  );
}

function SpecialFundCard({
  fund, title, subtitle, icon, color, metric, metricLabel
}: {
  fund: FundScore;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  metric: string;
  metricLabel: string;
}) {
  return (
    <Card className={`border-${color}-500/20 bg-${color}-950/10`} hover>
      <CardBody>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <div>
            <div className="text-xs font-bold text-white">{title}</div>
            <div className="text-xs text-slate-500">{subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fund.color }} />
          <span className="text-sm font-bold text-white">{fund.shortName}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">{metricLabel}</div>
            <div className={`text-lg font-bold font-mono ${color === "emerald" ? "text-emerald-400" : color === "orange" ? "text-orange-400" : "text-red-400"}`}>{metric}</div>
          </div>
          <ScoreRing score={fund.aiScore} size={52} />
        </div>
        <div className="mt-2 text-xs text-slate-400 line-clamp-2">{fund.signalReason}</div>
      </CardBody>
    </Card>
  );
}
