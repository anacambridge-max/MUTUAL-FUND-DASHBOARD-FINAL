"use client";
import { MarketData, FundScore } from "@/lib/aiEngine";
import { Card, CardHeader, CardBody, CardTitle } from "@/components/ui/Card";
import { formatNumber, formatPercent, getReturnColor } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IndexOpportunityEngineProps {
  market: MarketData;
  funds: FundScore[];
}

const INDEX_FUND_MAP: Record<string, string[]> = {
  "Nifty 50": ["SBI Nifty 50"],
  "Nifty Next 50": ["UTI Nifty N50"],
  "Nifty Midcap 150": ["HDFC Mid Cap"],
  "Nifty Smallcap 250": ["SBI Small Cap", "Bandhan Small Cap"],
  "Nifty 500": ["Quant Flexi Cap", "Quant Multi Cap"],
};

export function IndexOpportunityEngine({ market, funds }: IndexOpportunityEngineProps) {
  const indices = [
    { name: "Nifty 50", value: market.nifty50, change: market.nifty50Change },
    { name: "Nifty Next 50", value: market.niftyNext50, change: market.niftyNext50Change },
    { name: "Nifty Midcap 150", value: market.niftyMidcap150, change: market.niftyMidcap150Change },
    { name: "Nifty Smallcap 250", value: market.niftySmallcap250, change: market.niftySmallcap250Change },
    { name: "Nifty 500", value: market.nifty500, change: market.nifty500Change },
    { name: "Sensex", value: market.sensex, change: market.sensexChange },
  ];

  const strongest = [...indices].sort((a, b) => b.change - a.change)[0];
  const weakest = [...indices].sort((a, b) => a.change - b.change)[0];

  return (
    <div className="space-y-4">
      {/* Index Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {indices.map((idx) => {
          const isPos = idx.change >= 0;
          const isStrongest = idx.name === strongest.name;
          const isWeakest = idx.name === weakest.name;
          return (
            <Card
              key={idx.name}
              className={`p-4 ${isStrongest ? "border-emerald-500/30 bg-emerald-950/10" : isWeakest ? "border-red-500/30 bg-red-950/10" : ""}`}
              hover
            >
              <div className="text-xs text-slate-500 mb-1 font-mono">{idx.name}</div>
              <div className="text-sm font-bold text-white font-mono">{formatNumber(idx.value, 0)}</div>
              <div className={`flex items-center gap-1 mt-1 ${isPos ? "text-emerald-400" : "text-red-400"}`}>
                {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <span className="text-xs font-bold font-mono">{formatPercent(idx.change)}</span>
              </div>
              {isStrongest && <div className="text-xs text-emerald-400 mt-1">💪 Strongest</div>}
              {isWeakest && <div className="text-xs text-red-400 mt-1">📉 Weakest</div>}
            </Card>
          );
        })}
      </div>

      {/* Index Opportunity Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>📉 Which Index Corrected Most?</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {[...indices].sort((a, b) => a.change - b.change).map((idx) => (
              <div key={idx.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">{idx.name}</span>
                  <span className={`text-xs font-bold font-mono ${getReturnColor(idx.change)}`}>{formatPercent(idx.change)}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.abs(idx.change) * 20}%`,
                      backgroundColor: idx.change >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Which Funds Benefit?</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {Object.entries(INDEX_FUND_MAP).map(([index, fundShortNames]) => {
              const indexData = indices.find((i) => i.name === index);
              const relatedFunds = funds.filter((f) =>
                fundShortNames.some((n) => f.shortName.includes(n))
              );
              if (!indexData || relatedFunds.length === 0) return null;
              return (
                <div key={index} className="p-3 rounded-lg bg-white/3 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">{index}</span>
                    <span className={`text-xs font-bold font-mono ${getReturnColor(indexData.change)}`}>
                      {formatPercent(indexData.change)}
                    </span>
                  </div>
                  {relatedFunds.map((f) => (
                    <div key={f.amfiCode} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
                      <span>{f.shortName}</span>
                      <span className={`ml-auto font-mono ${getReturnColor(f.return1W)}`}>{formatPercent(f.return1W)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Macro Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Macro Economic Indicators</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MacroCard label="India VIX" value={market.indiaVix.toFixed(2)} unit="" status={market.indiaVix > 20 ? "High Fear" : market.indiaVix > 15 ? "Moderate" : "Low Fear"} statusColor={market.indiaVix > 20 ? "text-red-400" : market.indiaVix > 15 ? "text-amber-400" : "text-emerald-400"} />
            <MacroCard label="USD/INR" value={market.usdInr.toFixed(2)} unit="" status={market.usdInr > 84 ? "Weak INR" : "Stable"} statusColor={market.usdInr > 84 ? "text-orange-400" : "text-emerald-400"} />
            <MacroCard label="10Y Bond Yield" value={`${market.bondYield10Y}%`} unit="" status={market.bondYield10Y > 7.5 ? "High" : "Normal"} statusColor={market.bondYield10Y > 7.5 ? "text-red-400" : "text-emerald-400"} />
            <MacroCard label="Inflation" value={`${market.inflation}%`} unit="" status={market.inflation > 6 ? "Above Target" : "In Range"} statusColor={market.inflation > 6 ? "text-red-400" : "text-emerald-400"} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MacroCard({ label, value, unit, status, statusColor }: {
  label: string; value: string; unit: string; status: string; statusColor: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-base font-bold text-white font-mono">{value}{unit}</div>
      <div className={`text-xs mt-1 ${statusColor}`}>{status}</div>
    </div>
  );
}
