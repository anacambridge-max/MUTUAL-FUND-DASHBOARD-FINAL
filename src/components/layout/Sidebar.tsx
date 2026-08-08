"use client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, TrendingUp, Calendar, BarChart2, Globe, Activity,
  Layers, Zap, RefreshCw, ChevronRight, Bot
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Main" },
  { id: "weekly", label: "Weekly Engine", icon: Calendar, section: "Main" },
  { id: "monthly", label: "Monthly Engine", icon: TrendingUp, section: "Main" },
  { id: "budget", label: "Smart Budget", icon: Zap, section: "Main" },
  { id: "charts", label: "Charts & Analysis", icon: BarChart2, section: "Analysis" },
  { id: "sectors", label: "Sector Analysis", icon: Layers, section: "Analysis" },
  { id: "indices", label: "Index Opportunities", icon: Activity, section: "Analysis" },
  { id: "market", label: "Market Analysis", icon: Globe, section: "Analysis" },
  { id: "fii", label: "FII / DII", icon: TrendingUp, section: "Analysis" },
  { id: "gold", label: "Gold Dashboard", icon: Bot, section: "Assets" },
  { id: "funds", label: "All 15 Funds", icon: Layers, section: "Assets" },
];

const sections = ["Main", "Analysis", "Assets"];

export function Sidebar({ activeTab, onTabChange, onRefresh, isRefreshing }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-56 bg-[#080c18] border-r border-white/5 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">AI Fund Engine</div>
            <div className="text-xs text-indigo-400 leading-tight">PRO</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-4">
        {sections.map((section) => {
          const items = NAV_ITEMS.filter((n) => n.section === section);
          return (
            <div key={section}>
              <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider px-2 mb-1">
                {section}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all",
                        isActive
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                          : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                      )}
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Refresh */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/30 transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh All Data"}
        </button>
        <div className="text-xs text-slate-600 text-center mt-2">15 Funds · Real-time AI</div>
      </div>
    </aside>
  );
}
