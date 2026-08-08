"use client";
import { useState } from "react";
import { BudgetAllocation } from "@/lib/aiEngine";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calculator, RefreshCw } from "lucide-react";

const BUDGET_PRESETS = [10000, 20000, 30000, 50000, 100000];

interface SmartBudgetEngineProps {
  initialBudget: number;
  onBudgetChange: (budget: number) => void;
}

export function SmartBudgetEngine({ initialBudget, onBudgetChange }: SmartBudgetEngineProps) {
  const [budget, setBudget] = useState(initialBudget);
  const [customBudget, setCustomBudget] = useState("");
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [computed, setComputed] = useState(false);

  const computeAllocations = async (b = budget) => {
    setLoading(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: b }),
      });
      const json = await res.json();
      if (json.success) {
        setAllocations(json.data.allocations);
        setComputed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (b: number) => {
    setBudget(b);
    onBudgetChange(b);
    computeAllocations(b);
  };

  const handleCustom = () => {
    const b = parseInt(customBudget);
    if (b > 0) {
      setBudget(b);
      onBudgetChange(b);
      computeAllocations(b);
    }
  };

  const pieData = allocations.map((a) => ({
    name: a.shortName,
    value: a.amount,
    color: a.color,
    pct: a.percentage,
  }));

  return (
    <div className="space-y-4">
      {/* Budget Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-indigo-400" />
            <CardTitle>Smart Budget Engine</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter your monthly investment budget. The AI will dynamically allocate it across all 15 funds based on
            diversification, risk, momentum, and long-term opportunity scoring.
          </p>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2">
            {BUDGET_PRESETS.map((b) => (
              <button
                key={b}
                onClick={() => handlePreset(b)}
                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                  budget === b
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500/50 hover:text-white"
                }`}
              >
                {formatCurrency(b)}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                placeholder="Custom amount..."
                className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleCustom}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => computeAllocations()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {computed ? "Recalculate" : "Calculate"}
            </button>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
            <p className="text-xs text-indigo-300">
              <strong>Monthly Budget: {formatCurrency(budget)}</strong> — Weekly target: {formatCurrency(Math.round(budget / 4.33))} per investment
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Allocation Results */}
      {computed && allocations.length > 0 && (
        <>
          {/* Chart + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Allocation Breakdown</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0d1226", border: "1px solid #1e293b", borderRadius: 8 }}
                        formatter={(v: unknown) => [formatCurrency(Number(v)), ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Allocations</CardTitle>
              </CardHeader>
              <CardBody className="space-y-2">
                {allocations.slice(0, 6).map((a) => (
                  <div key={a.amfiCode} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                    <span className="text-xs text-slate-300 flex-1 truncate">{a.shortName}</span>
                    <Badge label={a.signal} variant="signal" />
                    <span className="text-xs font-bold text-white font-mono w-16 text-right">
                      {formatCurrency(a.amount)}
                    </span>
                    <span className="text-xs text-slate-500 font-mono w-10 text-right">
                      {a.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Full Allocation Table */}
          <Card>
            <CardHeader>
              <CardTitle>Complete AI Budget Allocation — {formatCurrency(budget)}/month</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold">Fund</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">Signal</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">Amount</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold">%</th>
                      <th className="text-right px-4 py-2 text-xs text-slate-500 font-semibold hidden md:table-cell">Weekly SIP</th>
                      <th className="text-left px-4 py-2 text-xs text-slate-500 font-semibold hidden lg:table-cell">AI Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((a) => (
                      <tr key={a.amfiCode} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                            <span className="text-xs text-white font-medium">{a.shortName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Badge label={a.signal} variant="signal" />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="text-xs font-bold text-white font-mono">{formatCurrency(a.amount)}</span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 bg-white/10 rounded-full h-1">
                              <div className="h-1 rounded-full" style={{ width: `${a.percentage}%`, backgroundColor: a.color }} />
                            </div>
                            <span className="text-xs text-slate-400 font-mono">{a.percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right hidden md:table-cell">
                          <span className="text-xs text-slate-400 font-mono">{formatCurrency(Math.round(a.amount / 4.33))}</span>
                        </td>
                        <td className="px-4 py-2 hidden lg:table-cell">
                          <span className="text-xs text-slate-500 line-clamp-1">{a.reason}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/10 bg-white/5">
                      <td colSpan={2} className="px-4 py-3 text-xs font-bold text-slate-300">TOTAL MONTHLY INVESTMENT</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-400 font-mono">
                        {formatCurrency(budget)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-slate-400">100%</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
