"use client";
import { RefreshCw, Bot, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "budget", label: "Budget" },
  { id: "charts", label: "Charts" },
  { id: "sectors", label: "Sectors" },
  { id: "indices", label: "Indices" },
  { id: "fii", label: "FII/DII" },
  { id: "gold", label: "Gold" },
  { id: "funds", label: "All Funds" },
];

export function TopNav({ activeTab, onTabChange, onRefresh, isRefreshing, lastUpdated }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#080c18]/95 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white leading-tight">AI Fund Engine PRO</div>
            <div className="text-xs text-slate-500">15 Funds · 10–15Y Horizon</div>
          </div>
        </div>

        {/* Desktop nav tabs */}
        <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-xs text-slate-600 font-mono">
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString("en-IN") : "--:--"}
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/30 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{isRefreshing ? "..." : "Refresh"}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#080c18] p-3">
          <div className="grid grid-cols-3 gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
                className={cn(
                  "px-2 py-2 text-xs rounded-lg font-medium transition-all text-center",
                  activeTab === item.id
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 bg-white/5"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
