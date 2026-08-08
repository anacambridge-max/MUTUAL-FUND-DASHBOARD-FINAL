"use client";
import { useState, useEffect, useCallback } from "react";
import { DashboardData } from "@/lib/aiEngine";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { MarketStatusBar } from "@/components/dashboard/MarketStatusBar";
import { HeroMetrics } from "@/components/dashboard/HeroMetrics";
import { FundRankingTable } from "@/components/dashboard/FundRankingTable";
import { WeeklyDecisionEngine } from "@/components/dashboard/WeeklyDecisionEngine";
import { MonthlyDecisionEngine } from "@/components/dashboard/MonthlyDecisionEngine";
import { SmartBudgetEngine } from "@/components/dashboard/SmartBudgetEngine";
import { PortfolioCharts } from "@/components/dashboard/PortfolioCharts";
import { SectorHeatmap } from "@/components/dashboard/SectorHeatmap";
import { FiiDiiDashboard } from "@/components/dashboard/FiiDiiDashboard";
import { GoldDashboard } from "@/components/dashboard/GoldDashboard";
import { IndexOpportunityEngine } from "@/components/dashboard/IndexOpportunityEngine";
import { AllFundsView } from "@/components/dashboard/AllFundsView";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { RefreshCw } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [budget, setBudget] = useState(10000);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch(`/api/dashboard?budget=${budget}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [budget]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchData(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <PageLoader />;
  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
      <div className="text-center">
        <div className="text-red-400 text-lg font-bold mb-2">Failed to load dashboard</div>
        <button onClick={() => fetchData()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Retry
        </button>
      </div>
    </div>
  );

  const tabContent: Record<string, React.ReactNode> = {
    dashboard: (
      <div className="space-y-6 animate-fadeIn">
        <HeroMetrics data={data} budget={budget} />
        <FundRankingTable funds={data.funds} title="AI Fund Rankings — All 15 Funds" />
      </div>
    ),
    weekly: <WeeklyDecisionEngine data={data} />,
    monthly: <MonthlyDecisionEngine data={data} />,
    budget: (
      <SmartBudgetEngine
        initialBudget={budget}
        onBudgetChange={(b) => { setBudget(b); }}
      />
    ),
    charts: <PortfolioCharts funds={data.funds} budget={budget} />,
    sectors: <SectorHeatmap sectors={data.sectors} />,
    indices: <IndexOpportunityEngine market={data.marketData} funds={data.funds} />,
    market: <MarketAnalysisView data={data} />,
    fii: <FiiDiiDashboard data={data.fiiDii} />,
    gold: <GoldDashboard data={data.goldData} />,
    funds: <AllFundsView funds={data.funds} />,
  };

  const tabLabels: Record<string, string> = {
    dashboard: "Dashboard",
    weekly: "Weekly Decision Engine",
    monthly: "Monthly Decision Engine",
    budget: "Smart Budget Engine",
    charts: "Charts & Analysis",
    sectors: "Sector Analysis",
    indices: "Index Opportunities",
    market: "Market Analysis",
    fii: "FII / DII Dashboard",
    gold: "Gold Dashboard",
    funds: "All 15 Funds",
  };

  return (
    <div className="flex min-h-screen bg-[#070b14]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={() => fetchData(true)}
        isRefreshing={refreshing}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={() => fetchData(true)}
          isRefreshing={refreshing}
          lastUpdated={data.lastUpdated}
        />
        <MarketStatusBar data={data.marketData} />

        <main className="flex-1 p-4 lg:p-6">
          {/* Page Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-white">{tabLabels[activeTab]}</h1>
              <p className="text-xs text-slate-500">
                Last updated: {new Date(data.lastUpdated).toLocaleString("en-IN")} · 15 funds · 10–15Y horizon
              </p>
            </div>
            {refreshing && (
              <div className="flex items-center gap-2 text-indigo-400 text-xs">
                <RefreshCw size={12} className="animate-spin" />
                <span>Updating AI scores...</span>
              </div>
            )}
          </div>

          {tabContent[activeTab] ?? tabContent["dashboard"]}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>AI Mutual Fund Investment Decision Engine PRO · 15 Funds Fixed Portfolio</span>
            <span>For Long-term Wealth Creation · 10–15 Year Horizon · Not Financial Advice</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Inline Market Analysis View
function MarketAnalysisView({ data }: { data: DashboardData }) {
  const { marketData: m } = data;

  const metrics = [
    { label: "Nifty 50", value: m.nifty50.toLocaleString("en-IN"), change: m.nifty50Change },
    { label: "Nifty Next 50", value: m.niftyNext50.toLocaleString("en-IN"), change: m.niftyNext50Change },
    { label: "Nifty Midcap 150", value: m.niftyMidcap150.toLocaleString("en-IN"), change: m.niftyMidcap150Change },
    { label: "Nifty Smallcap 250", value: m.niftySmallcap250.toLocaleString("en-IN"), change: m.niftySmallcap250Change },
    { label: "Nifty 500", value: m.nifty500.toLocaleString("en-IN"), change: m.nifty500Change },
    { label: "Sensex", value: m.sensex.toLocaleString("en-IN"), change: m.sensexChange },
    { label: "India VIX", value: m.indiaVix.toFixed(2), change: null },
    { label: "Gold (10g)", value: `₹${m.gold.toLocaleString("en-IN")}`, change: m.goldChange },
    { label: "Silver", value: `₹${m.silver.toLocaleString("en-IN")}`, change: null },
    { label: "USD/INR", value: m.usdInr.toFixed(2), change: null },
    { label: "10Y Bond Yield", value: `${m.bondYield10Y}%`, change: null },
    { label: "Repo Rate", value: `${m.repoRate}%`, change: null },
    { label: "Inflation", value: `${m.inflation}%`, change: null },
    { label: "Market Score", value: m.marketScore.toFixed(0), change: null },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Market Regime */}
      <div className={`p-4 rounded-xl border ${m.marketTrend === "Bull" ? "border-emerald-500/30 bg-emerald-950/20" : m.marketTrend === "Bear" ? "border-red-500/30 bg-red-950/20" : "border-amber-500/30 bg-amber-950/20"}`}>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Current Market Regime</div>
        <div className={`text-3xl font-bold ${m.marketTrend === "Bull" ? "text-emerald-400" : m.marketTrend === "Bear" ? "text-red-400" : "text-amber-400"}`}>
          {m.marketTrend === "Bull" ? "🐂" : m.marketTrend === "Bear" ? "🐻" : m.marketTrend === "Recovery" ? "📈" : m.marketTrend === "Correction" ? "📉" : "↔️"} {m.marketTrend.toUpperCase()} MARKET
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Market Score: <strong className="text-white">{m.marketScore.toFixed(0)}/100</strong> ·
          {m.marketTrend === "Bull" ? " Strong uptrend — Ideal time to invest across all funds." :
           m.marketTrend === "Bear" ? " Bearish phase — Focus on index funds and value picks. Excellent SIP opportunity." :
           m.marketTrend === "Recovery" ? " Recovery underway — Increase allocation to high-quality funds." :
           m.marketTrend === "Correction" ? " Healthy correction — Strong buying opportunity for long-term investors." :
           " Sideways market — Continue SIP. Accumulate quality funds."}
        </p>
      </div>

      {/* All Market Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="p-3 rounded-xl border border-white/8 bg-white/4 hover:bg-white/6 transition-colors">
            <div className="text-xs text-slate-500 mb-1 leading-tight">{m.label}</div>
            <div className="text-sm font-bold text-white font-mono">{m.value}</div>
            {m.change !== null && (
              <div className={`text-xs font-bold font-mono mt-0.5 ${m.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {m.change >= 0 ? "+" : ""}{m.change.toFixed(2)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20">
          <h3 className="text-sm font-bold text-indigo-400 mb-2">📊 Long-term Investor Analysis</h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li>• <strong>India VIX at {m.indiaVix.toFixed(2)}</strong>: {m.indiaVix < 15 ? "Low volatility — Market stability conducive to investing" : m.indiaVix < 20 ? "Moderate volatility — Normal market conditions" : "High volatility — Excellent opportunity for SIP averaging"}</li>
            <li>• <strong>Bond Yield at {m.bondYield10Y}%</strong>: {m.bondYield10Y > 7.5 ? "Rising yields may pressure equity valuations short-term" : "Yield levels favorable for equity allocation"}</li>
            <li>• <strong>Inflation at {m.inflation}%</strong>: {m.inflation > 6 ? "Above RBI target — Equity funds provide better inflation-beating returns" : "Within target range — Positive for equity markets"}</li>
            <li>• <strong>Repo Rate at {m.repoRate}%</strong>: {m.repoRate > 6.5 ? "Higher rates may slow growth — prefer quality funds" : "Rate environment supports equity growth"}</li>
          </ul>
        </div>
        <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-950/20">
          <h3 className="text-sm font-bold text-purple-400 mb-2">💡 Investment Decision Today</h3>
          <div className="space-y-2 text-xs text-slate-300">
            <p><strong>Should you invest this week?</strong></p>
            <p className={`text-sm font-bold ${data.weeklySignal === "BUY" ? "text-emerald-400" : "text-amber-400"}`}>
              {data.weeklySignal === "BUY" ? "✅ YES — Market conditions are favorable" : data.weeklySignal === "HOLD" ? "⏳ MAINTAIN SIP — Continue regular investment" : "⚠️ CAUTIOUS — Stick to SIP, avoid lump sum"}
            </p>
            <p className="text-slate-400">
              For a 10–15 year investor, every week is a good week to invest via SIP.
              Market timing is less important than consistency. The best time to invest was 10 years ago.
              The second best time is today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
