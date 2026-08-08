import {
  pgTable,
  serial,
  varchar,
  numeric,
  integer,
  timestamp,
  text,
  boolean,
  date,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ─── Funds Master ──────────────────────────────────────────────────────────────
export const funds = pgTable("funds", {
  id: serial("id").primaryKey(),
  amfiCode: varchar("amfi_code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  shortName: varchar("short_name", { length: 60 }).notNull(),
  category: varchar("category", { length: 60 }).notNull(),
  subCategory: varchar("sub_category", { length: 60 }),
  riskLevel: varchar("risk_level", { length: 20 }).notNull(),
  sectorFocus: varchar("sector_focus", { length: 80 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── NAV History ───────────────────────────────────────────────────────────────
export const navHistory = pgTable(
  "nav_history",
  {
    id: serial("id").primaryKey(),
    fundId: integer("fund_id")
      .notNull()
      .references(() => funds.id),
    navDate: date("nav_date").notNull(),
    nav: numeric("nav", { precision: 18, scale: 4 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("nav_fund_date_idx").on(t.fundId, t.navDate)]
);

// ─── Fund Metrics (computed daily) ────────────────────────────────────────────
export const fundMetrics = pgTable("fund_metrics", {
  id: serial("id").primaryKey(),
  fundId: integer("fund_id")
    .notNull()
    .references(() => funds.id),
  metricDate: date("metric_date").notNull(),
  nav: numeric("nav", { precision: 18, scale: 4 }),
  return1W: numeric("return_1w", { precision: 10, scale: 4 }),
  return1M: numeric("return_1m", { precision: 10, scale: 4 }),
  return3M: numeric("return_3m", { precision: 10, scale: 4 }),
  return6M: numeric("return_6m", { precision: 10, scale: 4 }),
  return1Y: numeric("return_1y", { precision: 10, scale: 4 }),
  return3Y: numeric("return_3y", { precision: 10, scale: 4 }),
  return5Y: numeric("return_5y", { precision: 10, scale: 4 }),
  rollingReturn1Y: numeric("rolling_return_1y", { precision: 10, scale: 4 }),
  rollingReturn3Y: numeric("rolling_return_3y", { precision: 10, scale: 4 }),
  maxDrawdown: numeric("max_drawdown", { precision: 10, scale: 4 }),
  currentDrawdown: numeric("current_drawdown", { precision: 10, scale: 4 }),
  volatility: numeric("volatility", { precision: 10, scale: 4 }),
  sharpeRatio: numeric("sharpe_ratio", { precision: 10, scale: 4 }),
  sortinoRatio: numeric("sortino_ratio", { precision: 10, scale: 4 }),
  momentum: numeric("momentum", { precision: 10, scale: 4 }),
  aiScore: numeric("ai_score", { precision: 6, scale: 2 }),
  riskScore: numeric("risk_score", { precision: 6, scale: 2 }),
  opportunityScore: numeric("opportunity_score", { precision: 6, scale: 2 }),
  weeklyRank: integer("weekly_rank"),
  monthlyRank: integer("monthly_rank"),
  signal: varchar("signal", { length: 20 }),
  signalReason: text("signal_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Market Data ───────────────────────────────────────────────────────────────
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  dataDate: date("data_date").notNull(),
  nifty50: numeric("nifty50", { precision: 12, scale: 2 }),
  nifty50Change: numeric("nifty50_change", { precision: 8, scale: 4 }),
  niftyNext50: numeric("nifty_next50", { precision: 12, scale: 2 }),
  niftyNext50Change: numeric("nifty_next50_change", { precision: 8, scale: 4 }),
  niftyMidcap150: numeric("nifty_midcap150", { precision: 12, scale: 2 }),
  niftyMidcap150Change: numeric("nifty_midcap150_change", {
    precision: 8,
    scale: 4,
  }),
  niftySmallcap250: numeric("nifty_smallcap250", { precision: 12, scale: 2 }),
  niftySmallcap250Change: numeric("nifty_smallcap250_change", {
    precision: 8,
    scale: 4,
  }),
  nifty500: numeric("nifty500", { precision: 12, scale: 2 }),
  nifty500Change: numeric("nifty500_change", { precision: 8, scale: 4 }),
  sensex: numeric("sensex", { precision: 12, scale: 2 }),
  sensexChange: numeric("sensex_change", { precision: 8, scale: 4 }),
  indiaVix: numeric("india_vix", { precision: 8, scale: 2 }),
  gold: numeric("gold", { precision: 12, scale: 2 }),
  goldChange: numeric("gold_change", { precision: 8, scale: 4 }),
  silver: numeric("silver", { precision: 12, scale: 2 }),
  usdInr: numeric("usd_inr", { precision: 8, scale: 4 }),
  bondYield10Y: numeric("bond_yield_10y", { precision: 8, scale: 4 }),
  repoRate: numeric("repo_rate", { precision: 8, scale: 4 }),
  inflation: numeric("inflation", { precision: 8, scale: 4 }),
  marketTrend: varchar("market_trend", { length: 20 }),
  marketScore: numeric("market_score", { precision: 6, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Sector Data ───────────────────────────────────────────────────────────────
export const sectorData = pgTable("sector_data", {
  id: serial("id").primaryKey(),
  dataDate: date("data_date").notNull(),
  sectorName: varchar("sector_name", { length: 60 }).notNull(),
  weeklyReturn: numeric("weekly_return", { precision: 10, scale: 4 }),
  monthlyReturn: numeric("monthly_return", { precision: 10, scale: 4 }),
  threeMonthReturn: numeric("three_month_return", { precision: 10, scale: 4 }),
  momentum: numeric("momentum", { precision: 10, scale: 4 }),
  trend: varchar("trend", { length: 20 }),
  strength: numeric("strength", { precision: 6, scale: 2 }),
  isAttractive: boolean("is_attractive").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── FII DII Flows ─────────────────────────────────────────────────────────────
export const fiiDiiData = pgTable("fii_dii_data", {
  id: serial("id").primaryKey(),
  dataDate: date("data_date").notNull(),
  fiiBuy: numeric("fii_buy", { precision: 14, scale: 2 }),
  fiiSell: numeric("fii_sell", { precision: 14, scale: 2 }),
  fiiNet: numeric("fii_net", { precision: 14, scale: 2 }),
  diiBuy: numeric("dii_buy", { precision: 14, scale: 2 }),
  diiSell: numeric("dii_sell", { precision: 14, scale: 2 }),
  diiNet: numeric("dii_net", { precision: 14, scale: 2 }),
  weeklyFiiNet: numeric("weekly_fii_net", { precision: 14, scale: 2 }),
  weeklyDiiNet: numeric("weekly_dii_net", { precision: 14, scale: 2 }),
  monthlyFiiNet: numeric("monthly_fii_net", { precision: 14, scale: 2 }),
  monthlyDiiNet: numeric("monthly_dii_net", { precision: 14, scale: 2 }),
  trend: varchar("trend", { length: 20 }),
  signal: text("signal"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Portfolio Budget ──────────────────────────────────────────────────────────
export const portfolioSettings = pgTable("portfolio_settings", {
  id: serial("id").primaryKey(),
  monthlyBudget: numeric("monthly_budget", { precision: 14, scale: 2 }).default(
    "10000"
  ),
  weeklyBudget: numeric("weekly_budget", { precision: 14, scale: 2 }),
  riskProfile: varchar("risk_profile", { length: 20 }).default("aggressive"),
  investmentHorizon: integer("investment_horizon").default(10),
  goldAllocationTarget: numeric("gold_allocation_target", {
    precision: 6,
    scale: 2,
  }).default("10"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Budget Allocations ────────────────────────────────────────────────────────
export const budgetAllocations = pgTable("budget_allocations", {
  id: serial("id").primaryKey(),
  allocationDate: date("allocation_date").notNull(),
  totalBudget: numeric("total_budget", { precision: 14, scale: 2 }).notNull(),
  allocations: jsonb("allocations").notNull(),
  aiReasoning: text("ai_reasoning"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Weekly Rankings ───────────────────────────────────────────────────────────
export const weeklyRankings = pgTable("weekly_rankings", {
  id: serial("id").primaryKey(),
  weekDate: date("week_date").notNull(),
  rankings: jsonb("rankings").notNull(),
  top3Buy: jsonb("top3_buy"),
  top5Buy: jsonb("top5_buy"),
  fundsToAvoid: jsonb("funds_to_avoid"),
  bestOpportunity: integer("best_opportunity").references(() => funds.id),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Monthly Rankings ──────────────────────────────────────────────────────────
export const monthlyRankings = pgTable("monthly_rankings", {
  id: serial("id").primaryKey(),
  monthDate: date("month_date").notNull(),
  rankings: jsonb("rankings").notNull(),
  increaseAllocation: jsonb("increase_allocation"),
  maintainAllocation: jsonb("maintain_allocation"),
  reduceAllocation: jsonb("reduce_allocation"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── AI Reports ────────────────────────────────────────────────────────────────
export const aiReports = pgTable("ai_reports", {
  id: serial("id").primaryKey(),
  reportDate: date("report_date").notNull(),
  reportType: varchar("report_type", { length: 30 }).notNull(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
