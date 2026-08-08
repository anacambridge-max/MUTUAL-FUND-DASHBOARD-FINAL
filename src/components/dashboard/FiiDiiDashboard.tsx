"use client";
import { FiiDiiData } from "@/lib/aiEngine";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface FiiDiiDashboardProps {
  data: FiiDiiData;
}

export function FiiDiiDashboard({ data }: FiiDiiDashboardProps) {
  const flowData = [
    { name: "Daily", FII: data.fiiNet / 10000000, DII: data.diiNet / 10000000 },
    { name: "Weekly", FII: data.weeklyFiiNet / 10000000, DII: data.weeklyDiiNet / 10000000 },
    { name: "Monthly", FII: data.monthlyFiiNet / 10000000, DII: data.monthlyDiiNet / 10000000 },
  ];

  const TrendIcon = data.trend === "Bullish" ? TrendingUp : data.trend === "Bearish" ? TrendingDown : Minus;
  const trendColor = data.trend === "Bullish" ? "text-emerald-400" : data.trend === "Bearish" ? "text-red-400" : "text-amber-400";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FlowCard label="FII Buy" value={data.fiiBuy} color="text-emerald-400" prefix="+" />
        <FlowCard label="FII Sell" value={data.fiiSell} color="text-red-400" prefix="-" />
        <FlowCard label="DII Buy" value={data.diiBuy} color="text-blue-400" prefix="+" />
        <FlowCard label="DII Sell" value={data.diiSell} color="text-orange-400" prefix="-" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NetCard label="FII Net" value={data.fiiNet} />
        <NetCard label="DII Net" value={data.diiNet} />
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendIcon size={16} className={trendColor} />
            <span className={`text-sm font-bold ${trendColor}`}>{data.trend} Flow</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{data.signal}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FII vs DII Net Flows (₹ Crore)</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0d1226", border: "1px solid #1e293b", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                  formatter={(v: unknown) => [`₹${Number(v).toFixed(2)}Cr`, ""]}
                />
                <Legend />
                <Bar dataKey="FII" fill="#6366f1" radius={[4, 4, 0, 0]} name="FII Net" />
                <Bar dataKey="DII" fill="#22c55e" radius={[4, 4, 0, 0]} name="DII Net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investment Signal Based on FII/DII Activity</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">How This Affects Your Portfolio</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{data.signal}</p>
              <div className="mt-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                <p className="text-xs text-indigo-300">
                  <strong>Long-term perspective:</strong> FII/DII flows are short-term signals. 
                  For a 10-15 year horizon, consistent SIP is more important than timing FII flows.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-xs text-slate-400">Weekly FII Net</span>
                <span className={`text-xs font-bold font-mono ${data.weeklyFiiNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {data.weeklyFiiNet >= 0 ? "+" : ""}{(data.weeklyFiiNet / 10000000).toFixed(2)}Cr
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-xs text-slate-400">Weekly DII Net</span>
                <span className={`text-xs font-bold font-mono ${data.weeklyDiiNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {data.weeklyDiiNet >= 0 ? "+" : ""}{(data.weeklyDiiNet / 10000000).toFixed(2)}Cr
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-xs text-slate-400">Monthly FII Net</span>
                <span className={`text-xs font-bold font-mono ${data.monthlyFiiNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {data.monthlyFiiNet >= 0 ? "+" : ""}{(data.monthlyFiiNet / 10000000).toFixed(2)}Cr
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-xs text-slate-400">Monthly DII Net</span>
                <span className={`text-xs font-bold font-mono ${data.monthlyDiiNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {data.monthlyDiiNet >= 0 ? "+" : ""}{(data.monthlyDiiNet / 10000000).toFixed(2)}Cr
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function FlowCard({ label, value, color, prefix }: { label: string; value: number; color: string; prefix: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-sm font-bold font-mono ${color}`}>
        {prefix}{(Math.abs(value) / 10000000).toFixed(2)}Cr
      </div>
    </Card>
  );
}

function NetCard({ label, value }: { label: string; value: number }) {
  const isPos = value >= 0;
  return (
    <Card className="p-4">
      <div className="text-xs text-slate-500 mb-1">{label} (Daily)</div>
      <div className={`text-lg font-bold font-mono ${isPos ? "text-emerald-400" : "text-red-400"}`}>
        {isPos ? "+" : ""}{(value / 10000000).toFixed(2)} Cr
      </div>
      <div className={`text-xs mt-1 ${isPos ? "text-emerald-500" : "text-red-500"}`}>
        {isPos ? "Net Buyer" : "Net Seller"}
      </div>
    </Card>
  );
}
