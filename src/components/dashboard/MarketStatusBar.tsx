"use client";
import { MarketData } from "@/lib/aiEngine";
import { formatNumber, formatPercent, getReturnColor } from "@/lib/utils";
import { MARKET_TREND_COLORS } from "@/lib/constants";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketStatusBarProps {
  data: MarketData;
}

const tickers = [
  { key: "nifty50", label: "NIFTY 50", changeKey: "nifty50Change" },
  { key: "niftyNext50", label: "NIFTY NEXT 50", changeKey: "niftyNext50Change" },
  { key: "niftyMidcap150", label: "MIDCAP 150", changeKey: "niftyMidcap150Change" },
  { key: "niftySmallcap250", label: "SMALLCAP 250", changeKey: "niftySmallcap250Change" },
  { key: "sensex", label: "SENSEX", changeKey: "sensexChange" },
  { key: "gold", label: "GOLD", changeKey: "goldChange" },
] as const;

export function MarketStatusBar({ data }: MarketStatusBarProps) {
  const trendColor = MARKET_TREND_COLORS[data.marketTrend] ?? "text-amber-400";

  return (
    <div className="w-full bg-[#0a0f1e] border-b border-white/10">
      {/* Top status bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500 font-mono">LIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">MARKET REGIME:</span>
          <span className={`text-xs font-bold ${trendColor}`}>{data.marketTrend.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">INDIA VIX:</span>
          <span className={`text-xs font-bold ${data.indiaVix > 20 ? "text-red-400" : data.indiaVix > 15 ? "text-amber-400" : "text-emerald-400"}`}>
            {data.indiaVix.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">REPO:</span>
          <span className="text-xs font-bold text-slate-300">{data.repoRate}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">USD/INR:</span>
          <span className="text-xs font-bold text-slate-300">{data.usdInr}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">10Y YIELD:</span>
          <span className="text-xs font-bold text-slate-300">{data.bondYield10Y}%</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">INFLATION:</span>
          <span className="text-xs font-bold text-amber-400">{data.inflation}%</span>
        </div>
      </div>

      {/* Ticker bar */}
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
        {tickers.map((ticker, i) => {
          const value = data[ticker.key as keyof MarketData] as number;
          const change = data[ticker.changeKey as keyof MarketData] as number;
          const isPositive = change >= 0;

          return (
            <div
              key={ticker.key}
              className={`flex items-center gap-3 px-4 py-3 border-r border-white/5 min-w-fit ${i === 0 ? "border-l-0" : ""}`}
            >
              <span className="text-xs text-slate-500 font-mono font-semibold">{ticker.label}</span>
              <span className="text-sm font-bold text-white font-mono">
                {formatNumber(value, 0)}
              </span>
              <div className={`flex items-center gap-0.5 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="text-xs font-bold font-mono">{formatPercent(change)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
