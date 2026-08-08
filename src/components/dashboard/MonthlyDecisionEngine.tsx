"use client";
import { DashboardData, FundScore } from "@/lib/aiEngine";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPercent, getReturnColor, getScoreColor } from "@/lib/utils";
import { ArrowUpCircle, MinusCircle, ArrowDownCircle } from "lucide-react";

interface MonthlyDecisionEngineProps {
  data: DashboardData;
}

export function MonthlyDecisionEngine({ data }: MonthlyDecisionEngineProps) {
  const sorted = [...data.funds].sort((a, b) => b.aiScore - a.aiScore);
  const increase = sorted.slice(0, 5);
  const maintain = sorted.slice(5, 10);
  const reduce = sorted.slice(10);

  const getRollingColor = (v: number) =>
    v > 15 ? "text-emerald-400" : v > 8 ? "text-green-400" : v > 0 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-4">
      {/* Monthly Summary */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Monthly Investment Signal</span>
          <Badge label={data.monthlySignal} variant="info" size="md" />
        </div>
        <p className="text-sm text-slate-300">
          Portfolio Health Score: <strong className={getScoreColor(data.portfolioHealthScore)}>{data.portfolioHealthScore.toFixed(0)}/100</strong>.
          The AI recommends increasing allocation to high-performing funds while maintaining diversification across all risk categories.
        </p>
      </div>

      {/* Three Allocation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AllocationGroup
          funds={increase}
          title="Increase Allocation"
          subtitle="Top 5 — Strongest AI Score"
          icon={<ArrowUpCircle size={16} className="text-emerald-400" />}
          borderColor="border-emerald-500/20"
          bgColor="bg-emerald-950/10"
          badgeVariant="success"
          badgeLabel="INCREASE"
        />
        <AllocationGroup
          funds={maintain}
          title="Maintain Allocation"
          subtitle="Mid-tier — Steady performers"
          icon={<MinusCircle size={16} className="text-amber-400" />}
          borderColor="border-amber-500/20"
          bgColor="bg-amber-950/10"
          badgeVariant="warning"
          badgeLabel="MAINTAIN"
        />
        <AllocationGroup
          funds={reduce}
          title="Reduce Allocation"
          subtitle="Bottom tier — Review needed"
          icon={<ArrowDownCircle size={16} className="text-red-400" />}
          borderColor="border-red-500/20"
          bgColor="bg-red-950/10"
          badgeVariant="danger"
          badgeLabel="REDUCE"
        />
      </div>

      {/* Detailed Monthly Report */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Fund Performance Report</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">#</th>
                  <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">Fund</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">1M</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">3M</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">6M</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">1Y</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">3Y</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold hidden lg:table-cell">Rolling 1Y</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">AI</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((fund, i) => (
                  <tr key={fund.amfiCode} className={`border-b border-white/5 hover:bg-white/3 ${i < 5 ? "bg-emerald-950/5" : i >= 10 ? "bg-red-950/5" : ""}`}>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-bold font-mono ${i < 5 ? "text-emerald-400" : i < 10 ? "text-amber-400" : "text-red-400"}`}>#{i + 1}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fund.color }} />
                        <span className="text-xs text-white">{fund.shortName}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.return1M)}`}>{formatPercent(fund.return1M)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.return3M)}`}>{formatPercent(fund.return3M)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.return6M)}`}>{formatPercent(fund.return6M)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.return1Y)}`}>{formatPercent(fund.return1Y)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono ${getReturnColor(fund.return3Y)}`}>{formatPercent(fund.return3Y)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-mono hidden lg:table-cell ${getRollingColor(fund.rollingReturn1Y)}`}>{formatPercent(fund.rollingReturn1Y)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-bold ${getScoreColor(fund.aiScore)}`}>{fund.aiScore.toFixed(0)}</td>
                    <td className="px-4 py-2 text-right">
                      <Badge
                        label={i < 5 ? "INCREASE" : i < 10 ? "MAINTAIN" : "REDUCE"}
                        variant={i < 5 ? "success" : i < 10 ? "warning" : "danger"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Monthly Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-blue-400">📊 Long-term Wealth Strategy</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>With a <strong className="text-white">10–15 year horizon</strong>, your monthly SIP strategy should focus on:</p>
            <ul className="space-y-1 text-slate-400">
              <li>✅ Consistency over market timing</li>
              <li>✅ Averaging down during corrections (increase allocation to top funds)</li>
              <li>✅ Rebalancing quarterly (not monthly)</li>
              <li>✅ Maintaining sectoral diversification</li>
              <li>✅ Gold at 8–10% for inflation hedge</li>
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-purple-400">🧮 Compounding Projection</CardTitle></CardHeader>
          <CardBody className="space-y-2">
            {[
              { label: "Projected 10Y Value (15% CAGR)", multiplier: Math.pow(1.15, 10) },
              { label: "Projected 15Y Value (15% CAGR)", multiplier: Math.pow(1.15, 15) },
              { label: "Projected 10Y Value (12% CAGR)", multiplier: Math.pow(1.12, 10) },
            ].map(({ label, multiplier }) => (
              <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="text-xs font-bold text-purple-400 font-mono">
                  ₹{((10000 * 12 * multiplier) / 100000).toFixed(2)}L/yr SIP
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function AllocationGroup({
  funds, title, subtitle, icon, borderColor, bgColor, badgeVariant, badgeLabel,
}: {
  funds: FundScore[];
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  badgeVariant: "success" | "warning" | "danger";
  badgeLabel: string;
}) {
  return (
    <Card className={`border ${borderColor} ${bgColor}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-2">
        {funds.map((fund) => (
          <div key={fund.amfiCode} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: fund.color }} />
            <span className="text-xs text-slate-300 flex-1 truncate">{fund.shortName}</span>
            <span className={`text-xs font-mono font-bold ${getScoreColor(fund.aiScore)}`}>{fund.aiScore.toFixed(0)}</span>
          </div>
        ))}
        <div className="mt-3">
          <Badge label={badgeLabel} variant={badgeVariant} size="md" />
        </div>
      </CardBody>
    </Card>
  );
}
