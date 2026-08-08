"use client";
import { useState, useEffect } from "react";
import { FundScore } from "@/lib/aiEngine";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { FUNDS } from "@/lib/constants";
import { formatNumber, formatPercent, getReturnColor } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis, Legend,
} from "recharts";

interface PortfolioChartsProps {
  funds: FundScore[];
  budget: number;
}

export function PortfolioCharts({ funds, budget }: PortfolioChartsProps) {
  const [activeTab, setActiveTab] = useState<"growth" | "nav" | "drawdown" | "riskreturn" | "comparison">("growth");
  const [navHistory, setNavHistory] = useState<Array<{ date: string; nav: number }>>([]);
  const [growthData, setGrowthData] = useState<Array<{ month: string; value: number; invested: number }>>([]);
  const [selectedFund, setSelectedFund] = useState("120843");
  const [loadingNav, setLoadingNav] = useState(false);

  useEffect(() => {
    fetch(`/api/portfolio-growth?budget=${budget}&months=36`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setGrowthData(j.data); });
  }, [budget]);

  useEffect(() => {
    setLoadingNav(true);
    fetch(`/api/nav-history?amfiCode=${selectedFund}&days=365`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setNavHistory(j.data); })
      .finally(() => setLoadingNav(false));
  }, [selectedFund]);

  const tabs = [
    { key: "growth", label: "Portfolio Growth" },
    { key: "nav", label: "NAV Trend" },
    { key: "drawdown", label: "Drawdown" },
    { key: "riskreturn", label: "Risk vs Return" },
    { key: "comparison", label: "Fund Comparison" },
  ] as const;

  const tooltipStyle = {
    contentStyle: { backgroundColor: "#0d1226", border: "1px solid #1e293b", borderRadius: 8 },
    labelStyle: { color: "#e2e8f0", fontSize: 11 },
  };

  const drawdownData = [...funds]
    .sort((a, b) => a.currentDrawdown - b.currentDrawdown)
    .slice(0, 10)
    .map((f) => ({ name: f.shortName, drawdown: f.currentDrawdown, maxDD: f.maxDrawdown, color: f.color }));

  const riskReturnData = funds.map((f) => ({
    name: f.shortName,
    risk: f.volatility,
    return1Y: f.return1Y,
    aiScore: f.aiScore,
    color: f.color,
  }));

  const comparisonFunds = funds.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                activeTab === t.key
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardBody>
        {/* Portfolio Growth */}
        {activeTab === "growth" && growthData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">3-Year Portfolio Projection (₹{(budget / 1000).toFixed(0)}K/month SIP)</h3>
              {growthData.length > 0 && (
                <div className="text-right">
                  <div className="text-xs text-slate-500">Current Portfolio Value</div>
                  <div className="text-sm font-bold text-emerald-400">
                    ₹{(growthData[growthData.length - 1]?.value / 100000).toFixed(2)}L
                  </div>
                </div>
              )}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`₹${(Number(v) / 100000).toFixed(2)}L`, ""]} />
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#valueGrad)" strokeWidth={2} name="Portfolio Value" />
                  <Area type="monotone" dataKey="invested" stroke="#22c55e" fill="url(#investedGrad)" strokeWidth={2} name="Amount Invested" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* NAV Trend */}
        {activeTab === "nav" && (
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h3 className="text-sm font-semibold text-white">NAV History (1 Year)</h3>
              <select
                value={selectedFund}
                onChange={(e) => setSelectedFund(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {FUNDS.map((f) => (
                  <option key={f.amfiCode} value={f.amfiCode} style={{ backgroundColor: "#0d1226" }}>
                    {f.shortName}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-64">
              {loadingNav ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">Loading NAV data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={navHistory.filter((_, i) => i % 3 === 0)}>
                    <defs>
                      <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={(d) => d.slice(5)} interval={20} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${v.toFixed(0)}`} />
                    <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`₹${Number(v).toFixed(4)}`, "NAV"]} />
                    <Area type="monotone" dataKey="nav" stroke="#6366f1" fill="url(#navGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Drawdown */}
        {activeTab === "drawdown" && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Current vs Maximum Drawdown Analysis</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={drawdownData} layout="vertical" barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false}
                    tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} width={100} />
                  <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`${Number(v).toFixed(2)}%`, ""]} />
                  <Legend />
                  <Bar dataKey="drawdown" name="Current DD" radius={[0, 4, 4, 0]}>
                    {drawdownData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="maxDD" name="Max DD" fill="#374151" radius={[0, 4, 4, 0]} opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Risk vs Return */}
        {activeTab === "riskreturn" && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Risk (Volatility) vs 1Y Return Scatter</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="risk" type="number" name="Volatility" tick={{ fill: "#64748b", fontSize: 10 }}
                    label={{ value: "Volatility (%)", position: "insideBottom", fill: "#64748b", fontSize: 10 }} axisLine={false} />
                  <YAxis dataKey="return1Y" type="number" name="1Y Return" tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(v) => `${v.toFixed(0)}%`} axisLine={false} />
                  <ZAxis dataKey="aiScore" range={[40, 200]} />
                  <Tooltip
                    {...tooltipStyle}
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0d1226] border border-slate-700 rounded-lg p-2 text-xs">
                            <p className="text-white font-bold">{d.name}</p>
                            <p className="text-slate-400">Volatility: {d.risk.toFixed(2)}%</p>
                            <p className="text-slate-400">1Y Return: {formatPercent(d.return1Y)}</p>
                            <p className="text-indigo-400">AI Score: {d.aiScore.toFixed(0)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={riskReturnData}>
                    {riskReturnData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Fund Comparison */}
        {activeTab === "comparison" && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Top 6 Funds — Multi-Period Return Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={["1W", "1M", "3M", "6M", "1Y"].map((period) => {
                    const row: Record<string, string | number> = { period };
                    comparisonFunds.forEach((f) => {
                      row[f.shortName] = period === "1W" ? f.return1W :
                        period === "1M" ? f.return1M :
                        period === "3M" ? f.return3M :
                        period === "6M" ? f.return6M : f.return1Y;
                    });
                    return row;
                  })}
                  barSize={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`${Number(v).toFixed(2)}%`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {comparisonFunds.map((f) => (
                    <Bar key={f.amfiCode} dataKey={f.shortName} fill={f.color} radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
