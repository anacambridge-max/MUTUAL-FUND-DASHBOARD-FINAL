import { FUNDS } from "./constants";

export interface FundScore {
  amfiCode: string;
  name: string;
  shortName: string;
  color: string;
  nav: number;
  return1W: number;
  return1M: number;
  return3M: number;
  return6M: number;
  return1Y: number;
  return3Y: number;
  return5Y: number;
  rollingReturn1Y: number;
  maxDrawdown: number;
  currentDrawdown: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  momentum: number;
  aiScore: number;
  riskScore: number;
  opportunityScore: number;
  weeklyRank: number;
  monthlyRank: number;
  signal: string;
  signalReason: string;
  category: string;
  subCategory: string;
  riskLevel: string;
  sectorFocus: string;
}

export interface MarketData {
  nifty50: number;
  nifty50Change: number;
  niftyNext50: number;
  niftyNext50Change: number;
  niftyMidcap150: number;
  niftyMidcap150Change: number;
  niftySmallcap250: number;
  niftySmallcap250Change: number;
  nifty500: number;
  nifty500Change: number;
  sensex: number;
  sensexChange: number;
  indiaVix: number;
  gold: number;
  goldChange: number;
  silver: number;
  usdInr: number;
  bondYield10Y: number;
  repoRate: number;
  inflation: number;
  marketTrend: string;
  marketScore: number;
}

export interface SectorScore {
  name: string;
  weeklyReturn: number;
  monthlyReturn: number;
  threeMonthReturn: number;
  momentum: number;
  trend: string;
  strength: number;
  isAttractive: boolean;
}

export interface FiiDiiData {
  fiiBuy: number;
  fiiSell: number;
  fiiNet: number;
  diiBuy: number;
  diiSell: number;
  diiNet: number;
  weeklyFiiNet: number;
  weeklyDiiNet: number;
  monthlyFiiNet: number;
  monthlyDiiNet: number;
  trend: string;
  signal: string;
}

export interface BudgetAllocation {
  amfiCode: string;
  name: string;
  shortName: string;
  color: string;
  amount: number;
  percentage: number;
  reason: string;
  signal: string;
}

export interface DashboardData {
  lastUpdated: string;
  marketData: MarketData;
  funds: FundScore[];
  sectors: SectorScore[];
  fiiDii: FiiDiiData;
  portfolioHealthScore: number;
  aiInvestmentScore: number;
  marketOpportunityScore: number;
  weeklySignal: string;
  monthlySignal: string;
  todayBestFund: FundScore;
  todayWorstFund: FundScore;
  mostAttractiveValuation: FundScore;
  mostOversold: FundScore;
  mostOverbought: FundScore;
  top3Buy: FundScore[];
  top5Buy: FundScore[];
  fundsToAvoid: FundScore[];
  investmentRecommendation: string;
  goldData: GoldData;
}

export interface GoldData {
  price: number;
  weeklyReturn: number;
  monthlyReturn: number;
  yearlyReturn: number;
  momentum: number;
  trend: string;
  allocationPercent: number;
  targetAllocation: number;
  signal: string;
  riskScore: number;
  suggestedInvestment: number;
  reason: string;
}

// ─── Deterministic seeded random for reproducible daily data ──────────────────
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function gaussianRandom(mean: number, std: number, seed: number): number {
  const u1 = seededRandom(seed);
  const u2 = seededRandom(seed + 1);
  const z = Math.sqrt(-2 * Math.log(u1 + 0.001)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

// ─── AI Score Computation ─────────────────────────────────────────────────────
function computeAIScore(fund: Partial<FundScore>, marketScore: number): number {
  const weights = {
    return1Y: 0.20,
    return3M: 0.15,
    momentum: 0.15,
    sharpeRatio: 0.15,
    sortinoRatio: 0.10,
    currentDrawdown: 0.10,
    rollingReturn1Y: 0.10,
    marketAlignment: 0.05,
  };

  const r1y = Math.min(100, Math.max(0, ((fund.return1Y ?? 0) + 30) * 2));
  const r3m = Math.min(100, Math.max(0, ((fund.return3M ?? 0) + 20) * 3));
  const mom = Math.min(100, Math.max(0, ((fund.momentum ?? 0) + 10) * 5));
  const sharpe = Math.min(100, Math.max(0, ((fund.sharpeRatio ?? 0) + 1) * 33));
  const sortino = Math.min(100, Math.max(0, ((fund.sortinoRatio ?? 0) + 1) * 33));
  const drawdown = Math.min(100, Math.max(0, 100 + (fund.currentDrawdown ?? 0) * 3));
  const rolling = Math.min(100, Math.max(0, ((fund.rollingReturn1Y ?? 0) + 20) * 2.5));
  const mktAlign = marketScore;

  const score =
    r1y * weights.return1Y +
    r3m * weights.return3M +
    mom * weights.momentum +
    sharpe * weights.sharpeRatio +
    sortino * weights.sortinoRatio +
    drawdown * weights.currentDrawdown +
    rolling * weights.rollingReturn1Y +
    mktAlign * weights.marketAlignment;

  return Math.min(100, Math.max(0, score));
}

function computeOpportunityScore(fund: Partial<FundScore>): number {
  // Higher opportunity when oversold (negative drawdown) and positive momentum
  const drawdownBonus = Math.abs(Math.min(0, fund.currentDrawdown ?? 0)) * 2;
  const momentumScore = (fund.momentum ?? 0) * 3;
  const returnScore = (fund.return3M ?? 0) * 1.5;
  const base = 50 + drawdownBonus + momentumScore - returnScore;
  return Math.min(100, Math.max(0, base));
}

function computeRiskScore(fund: Partial<FundScore>): number {
  const volScore = Math.min(40, (fund.volatility ?? 15) * 1.5);
  const drawScore = Math.min(40, Math.abs(fund.maxDrawdown ?? 0));
  const catScore = fund.subCategory?.includes("Small Cap") ? 20 :
    fund.subCategory?.includes("Sectoral") ? 18 :
    fund.subCategory?.includes("Mid Cap") ? 15 :
    fund.subCategory?.includes("Flexi") ? 12 : 10;
  return Math.min(100, volScore + drawScore + catScore);
}

function getSignal(aiScore: number, opportunityScore: number): string {
  if (aiScore >= 80 && opportunityScore >= 70) return "Strong Buy";
  if (aiScore >= 70 || opportunityScore >= 70) return "Buy";
  if (aiScore >= 55) return "Accumulate";
  if (aiScore >= 40) return "Hold";
  return "Reduce";
}

function getSignalReason(fund: Partial<FundScore>, signal: string): string {
  const reasons: string[] = [];
  if ((fund.currentDrawdown ?? 0) < -10) reasons.push(`${Math.abs(fund.currentDrawdown ?? 0).toFixed(1)}% drawdown creates entry opportunity`);
  if ((fund.momentum ?? 0) > 3) reasons.push(`strong momentum of +${(fund.momentum ?? 0).toFixed(1)}%`);
  if ((fund.momentum ?? 0) < -3) reasons.push(`weak momentum of ${(fund.momentum ?? 0).toFixed(1)}%`);
  if ((fund.sharpeRatio ?? 0) > 1.5) reasons.push(`excellent Sharpe ratio of ${(fund.sharpeRatio ?? 0).toFixed(2)}`);
  if ((fund.return1Y ?? 0) > 20) reasons.push(`strong 1Y return of +${(fund.return1Y ?? 0).toFixed(1)}%`);
  if ((fund.return1Y ?? 0) < 5) reasons.push(`weak 1Y return of ${(fund.return1Y ?? 0).toFixed(1)}%`);

  const base = signal === "Strong Buy" ? "Excellent entry point." :
    signal === "Buy" ? "Good buying opportunity." :
    signal === "Accumulate" ? "Accumulate gradually." :
    signal === "Hold" ? "Maintain current allocation." : "Reduce exposure.";

  return reasons.length > 0 ? `${base} ${reasons.join(", ")}.` : base;
}

// ─── Main Data Generator ──────────────────────────────────────────────────────
export function generateDashboardData(monthlyBudget = 10000): DashboardData {
  const seed = getDaySeed();

  // Market data
  const nifty50 = 22000 + gaussianRandom(500, 800, seed);
  const niftyNext50 = 62000 + gaussianRandom(1000, 1500, seed + 1);
  const niftyMidcap150 = 17000 + gaussianRandom(400, 600, seed + 2);
  const niftySmallcap250 = 10500 + gaussianRandom(300, 500, seed + 3);
  const sensex = 73000 + gaussianRandom(2000, 3000, seed + 4);
  const indiaVix = 13 + gaussianRandom(1, 3, seed + 5);
  const goldPrice = 72000 + gaussianRandom(1000, 2000, seed + 6);

  const n50Change = gaussianRandom(-0.5, 1.2, seed + 10);
  const nn50Change = gaussianRandom(-0.3, 1.4, seed + 11);
  const midChange = gaussianRandom(-0.4, 1.6, seed + 12);
  const smChange = gaussianRandom(-0.5, 1.8, seed + 13);
  const goldChange = gaussianRandom(0.1, 0.8, seed + 14);

  const broadMarketChange = (n50Change + nn50Change + midChange + smChange) / 4;
  const marketScore = Math.min(100, Math.max(0, 50 + broadMarketChange * 10));
  const marketTrend = broadMarketChange > 1 ? "Bull" :
    broadMarketChange < -1 ? "Bear" :
    broadMarketChange < -0.3 ? "Correction" :
    broadMarketChange > 0.3 ? "Recovery" : "Sideways";

  const marketData: MarketData = {
    nifty50: Math.round(nifty50),
    nifty50Change: parseFloat(n50Change.toFixed(2)),
    niftyNext50: Math.round(niftyNext50),
    niftyNext50Change: parseFloat(nn50Change.toFixed(2)),
    niftyMidcap150: Math.round(niftyMidcap150),
    niftyMidcap150Change: parseFloat(midChange.toFixed(2)),
    niftySmallcap250: Math.round(niftySmallcap250),
    niftySmallcap250Change: parseFloat(smChange.toFixed(2)),
    nifty500: Math.round(niftySmallcap250 * 1.05),
    nifty500Change: parseFloat(((n50Change + smChange) / 2).toFixed(2)),
    sensex: Math.round(sensex),
    sensexChange: parseFloat((n50Change * 1.02).toFixed(2)),
    indiaVix: parseFloat(Math.max(9, indiaVix).toFixed(2)),
    gold: Math.round(goldPrice),
    goldChange: parseFloat(goldChange.toFixed(2)),
    silver: Math.round(85000 + gaussianRandom(500, 1000, seed + 20)),
    usdInr: parseFloat((83.5 + gaussianRandom(0, 0.5, seed + 21)).toFixed(2)),
    bondYield10Y: parseFloat((7.1 + gaussianRandom(0, 0.15, seed + 22)).toFixed(2)),
    repoRate: 6.5,
    inflation: parseFloat((4.8 + gaussianRandom(0, 0.3, seed + 23)).toFixed(2)),
    marketTrend,
    marketScore: parseFloat(marketScore.toFixed(2)),
  };

  // Sector data
  const sectorNames = [
    "IT", "Banking", "Financial Services", "Infrastructure", "Auto",
    "Pharma", "FMCG", "Consumption", "Energy", "Power",
    "PSU", "Real Estate", "Metals", "Chemicals", "Capital Goods",
    "Manufacturing", "Digital",
  ];

  const sectors: SectorScore[] = sectorNames.map((name, i) => {
    const weeklyReturn = gaussianRandom(broadMarketChange, 2.5, seed + 100 + i);
    const monthlyReturn = gaussianRandom(weeklyReturn * 4, 4, seed + 200 + i);
    const threeMonthReturn = gaussianRandom(monthlyReturn * 3, 6, seed + 300 + i);
    const momentum = weeklyReturn * 0.4 + monthlyReturn * 0.3 * 0.25 + seededRandom(seed + 400 + i) * 2 - 1;
    const strength = Math.min(100, Math.max(0, 50 + momentum * 10));
    const trend = weeklyReturn > 1 ? "Bullish" : weeklyReturn < -1 ? "Bearish" : "Neutral";
    return {
      name,
      weeklyReturn: parseFloat(weeklyReturn.toFixed(2)),
      monthlyReturn: parseFloat(monthlyReturn.toFixed(2)),
      threeMonthReturn: parseFloat(threeMonthReturn.toFixed(2)),
      momentum: parseFloat(momentum.toFixed(2)),
      trend,
      strength: parseFloat(strength.toFixed(2)),
      isAttractive: weeklyReturn < -2 && monthlyReturn < -5,
    };
  });

  // FII/DII data
  const fiiNet = gaussianRandom(-500, 3000, seed + 500) * 100;
  const diiNet = gaussianRandom(1000, 2000, seed + 501) * 100;
  const fiiDii: FiiDiiData = {
    fiiBuy: Math.abs(fiiNet) + Math.abs(gaussianRandom(2000, 1000, seed + 502) * 100),
    fiiSell: Math.abs(gaussianRandom(2000, 1000, seed + 503) * 100),
    fiiNet: parseFloat(fiiNet.toFixed(2)),
    diiBuy: Math.abs(diiNet) + Math.abs(gaussianRandom(1000, 500, seed + 504) * 100),
    diiSell: Math.abs(gaussianRandom(1000, 500, seed + 505) * 100),
    diiNet: parseFloat(diiNet.toFixed(2)),
    weeklyFiiNet: parseFloat((fiiNet * 5 + gaussianRandom(0, 5000, seed + 506)).toFixed(2)),
    weeklyDiiNet: parseFloat((diiNet * 5).toFixed(2)),
    monthlyFiiNet: parseFloat((fiiNet * 22).toFixed(2)),
    monthlyDiiNet: parseFloat((diiNet * 22).toFixed(2)),
    trend: fiiNet > 1000 ? "Bullish" : fiiNet < -1000 ? "Bearish" : "Neutral",
    signal: fiiNet > 0
      ? "FII buying supports bullish momentum. Consider increasing equity allocation."
      : "FII selling pressure. DII support providing stability. Maintain SIP strategy.",
  };

  // Fund scores
  const navBaseValues: Record<string, number> = {
    "120843": 98.5, "120826": 75.2, "120823": 82.1, "120821": 45.8,
    "120833": 31.2, "151791": 22.4, "135800": 42.7, "119827": 195.3,
    "143341": 48.6, "130498": 118.9, "125497": 155.7, "147946": 28.4,
    "120323": 395.6, "120503": 82.3, "150714": 15.2,
  };

  const fundScores: FundScore[] = FUNDS.map((fund, i) => {
    const s = seed + i * 50;
    const navBase = navBaseValues[fund.amfiCode] || 100;
    const nav = navBase * (1 + gaussianRandom(0, 0.005, s));

    // Returns based on category/risk
    const riskMultiplier = fund.riskLevel === "Very High" ? 1.3 :
      fund.riskLevel === "High" ? 1.1 : 0.9;

    const return1W = gaussianRandom(broadMarketChange * riskMultiplier, 1.5, s + 1);
    const return1M = gaussianRandom(return1W * 4 * 0.9, 3, s + 2);
    const return3M = gaussianRandom(return1M * 3 * 0.85, 5, s + 3);
    const return6M = gaussianRandom(return3M * 2 * 0.8, 7, s + 4);
    const return1Y = gaussianRandom(return6M * 2 * 0.75, 10, s + 5);
    const return3Y = gaussianRandom(15 * riskMultiplier, 8, s + 6);
    const return5Y = gaussianRandom(18 * riskMultiplier, 6, s + 7);
    const rollingReturn1Y = gaussianRandom(return1Y * 0.9, 5, s + 8);

    const maxDrawdown = gaussianRandom(-25 * riskMultiplier, 8, s + 9);
    const currentDrawdown = gaussianRandom(-8 * riskMultiplier, 5, s + 10);
    const volatility = Math.abs(gaussianRandom(15 * riskMultiplier, 4, s + 11));
    const sharpeRatio = gaussianRandom(1.2, 0.5, s + 12);
    const sortinoRatio = gaussianRandom(1.4, 0.6, s + 13);
    const momentum = gaussianRandom(return1W * 1.2, 1, s + 14);

    const partial: Partial<FundScore> = {
      return1Y, return3M, momentum, sharpeRatio, sortinoRatio,
      currentDrawdown, rollingReturn1Y, maxDrawdown, volatility,
      subCategory: fund.subCategory,
    };

    const aiScore = parseFloat(computeAIScore(partial, marketScore).toFixed(2));
    const opportunityScore = parseFloat(computeOpportunityScore(partial).toFixed(2));
    const riskScore = parseFloat(computeRiskScore(partial).toFixed(2));
    const signal = getSignal(aiScore, opportunityScore);

    return {
      amfiCode: fund.amfiCode,
      name: fund.name,
      shortName: fund.shortName,
      color: fund.color,
      category: fund.category,
      subCategory: fund.subCategory ?? "",
      riskLevel: fund.riskLevel,
      sectorFocus: fund.sectorFocus ?? "",
      nav: parseFloat(nav.toFixed(4)),
      return1W: parseFloat(return1W.toFixed(2)),
      return1M: parseFloat(return1M.toFixed(2)),
      return3M: parseFloat(return3M.toFixed(2)),
      return6M: parseFloat(return6M.toFixed(2)),
      return1Y: parseFloat(return1Y.toFixed(2)),
      return3Y: parseFloat(return3Y.toFixed(2)),
      return5Y: parseFloat(return5Y.toFixed(2)),
      rollingReturn1Y: parseFloat(rollingReturn1Y.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      currentDrawdown: parseFloat(currentDrawdown.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      sortinoRatio: parseFloat(sortinoRatio.toFixed(2)),
      momentum: parseFloat(momentum.toFixed(2)),
      aiScore,
      riskScore,
      opportunityScore,
      weeklyRank: 0,
      monthlyRank: 0,
      signal,
      signalReason: getSignalReason(partial, signal),
    };
  });

  // Assign ranks
  const rankedByAI = [...fundScores].sort((a, b) => b.aiScore - a.aiScore);
  rankedByAI.forEach((f, i) => {
    f.weeklyRank = i + 1;
    f.monthlyRank = i + 1;
  });

  // Dashboard computations
  const portfolioHealthScore = parseFloat(
    (fundScores.reduce((s, f) => s + f.aiScore, 0) / fundScores.length).toFixed(2)
  );
  const aiInvestmentScore = parseFloat(marketScore.toFixed(2));
  const marketOpportunityScore = parseFloat(
    (fundScores.reduce((s, f) => s + f.opportunityScore, 0) / fundScores.length).toFixed(2)
  );

  const top5Buy = rankedByAI.slice(0, 5);
  const top3Buy = rankedByAI.slice(0, 3);
  const fundsToAvoid = rankedByAI.slice(-3);

  const todayBestFund = rankedByAI[0];
  const todayWorstFund = rankedByAI[rankedByAI.length - 1];
  const mostOversold = [...fundScores].sort((a, b) => a.currentDrawdown - b.currentDrawdown)[0];
  const mostOverbought = [...fundScores].sort((a, b) => b.return1M - a.return1M)[0];
  const mostAttractiveValuation = [...fundScores].sort(
    (a, b) => b.opportunityScore - a.opportunityScore
  )[0];

  const weeklySignal = aiInvestmentScore >= 60 ? "BUY" : aiInvestmentScore >= 40 ? "HOLD" : "REDUCE";
  const monthlySignal = portfolioHealthScore >= 55 ? "ACCUMULATE" : "HOLD";

  // Gold data
  const goldData: GoldData = {
    price: marketData.gold,
    weeklyReturn: parseFloat(goldChange.toFixed(2)),
    monthlyReturn: parseFloat((goldChange * 4 + gaussianRandom(0, 0.5, seed + 600)).toFixed(2)),
    yearlyReturn: parseFloat((gaussianRandom(12, 5, seed + 601)).toFixed(2)),
    momentum: parseFloat(gaussianRandom(1, 2, seed + 602).toFixed(2)),
    trend: goldChange > 0.5 ? "Bullish" : goldChange < -0.5 ? "Bearish" : "Neutral",
    allocationPercent: 10,
    targetAllocation: 10,
    signal: goldChange > 0.3 ? "Hold" : goldChange < -0.5 ? "Buy" : "Accumulate",
    riskScore: 35,
    suggestedInvestment: Math.round(monthlyBudget * 0.1),
    reason:
      goldChange > 0.3
        ? "Gold trending up. Hold existing position and accumulate on dips."
        : "Gold showing weakness. Good accumulation opportunity for long-term hedge.",
  };

  return {
    lastUpdated: new Date().toISOString(),
    marketData,
    funds: fundScores,
    sectors,
    fiiDii,
    portfolioHealthScore,
    aiInvestmentScore,
    marketOpportunityScore,
    weeklySignal,
    monthlySignal,
    todayBestFund,
    todayWorstFund,
    mostAttractiveValuation,
    mostOversold,
    mostOverbought,
    top3Buy,
    top5Buy,
    fundsToAvoid,
    investmentRecommendation: `${top3Buy[0].shortName} is the top pick this week with an AI Score of ${top3Buy[0].aiScore.toFixed(0)}. Market trend is ${marketTrend}. ${weeklySignal === "BUY" ? "Good time to invest." : "Maintain SIP strategy."}`,
    goldData,
  };
}

export function computeBudgetAllocations(
  monthlyBudget: number,
  fundScores: FundScore[]
): BudgetAllocation[] {
  const eligibleFunds = fundScores.filter(
    (f) => f.signal !== "Reduce" && f.amfiCode !== "150714"
  );

  const totalScore = eligibleFunds.reduce((s, f) => s + f.aiScore, 0);
  const goldFund = fundScores.find((f) => f.amfiCode === "150714")!;

  const goldAmount = Math.round(monthlyBudget * 0.08);
  const equityBudget = monthlyBudget - goldAmount;

  const allocations: BudgetAllocation[] = eligibleFunds.map((fund) => {
    const rawPct = (fund.aiScore / totalScore) * 100;
    const amount = Math.round((rawPct / 100) * equityBudget);
    return {
      amfiCode: fund.amfiCode,
      name: fund.name,
      shortName: fund.shortName,
      color: fund.color,
      amount,
      percentage: parseFloat(((amount / monthlyBudget) * 100).toFixed(1)),
      reason: fund.signalReason,
      signal: fund.signal,
    };
  });

  if (goldFund) {
    allocations.push({
      amfiCode: goldFund.amfiCode,
      name: goldFund.name,
      shortName: goldFund.shortName,
      color: goldFund.color,
      amount: goldAmount,
      percentage: parseFloat(((goldAmount / monthlyBudget) * 100).toFixed(1)),
      reason: "Strategic 8% gold allocation for portfolio diversification and inflation hedge.",
      signal: "Accumulate",
    });
  }

  return allocations.sort((a, b) => b.amount - a.amount);
}

export function generateNavHistory(
  amfiCode: string,
  days: number
): Array<{ date: string; nav: number }> {
  const navBases: Record<string, number> = {
    "120843": 98.5, "120826": 75.2, "120823": 82.1, "120821": 45.8,
    "120833": 31.2, "151791": 22.4, "135800": 42.7, "119827": 195.3,
    "143341": 48.6, "130498": 118.9, "125497": 155.7, "147946": 28.4,
    "120323": 395.6, "120503": 82.3, "150714": 15.2,
  };

  const base = navBases[amfiCode] || 100;
  const seed = parseInt(amfiCode);
  const result = [];
  let nav = base * 0.6;

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const daySeed = seed + parseInt(d.toISOString().slice(0, 10).replace(/-/g, ""));
    const dailyReturn = gaussianRandom(0.04, 0.8, daySeed) / 100;
    nav = nav * (1 + dailyReturn);
    result.push({
      date: d.toISOString().slice(0, 10),
      nav: parseFloat(nav.toFixed(4)),
    });
  }

  return result;
}

export function generatePortfolioGrowth(
  monthlyBudget: number,
  months: number
): Array<{ month: string; value: number; invested: number }> {
  const seed = getDaySeed();
  const result = [];
  let totalValue = 0;
  let totalInvested = 0;
  const annualReturn = 0.15;
  const monthlyReturn = annualReturn / 12;

  for (let i = months; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    const volatility = gaussianRandom(0, 0.02, seed + i);
    totalValue = (totalValue + monthlyBudget) * (1 + monthlyReturn + volatility);
    totalInvested += monthlyBudget;
    result.push({
      month: monthStr,
      value: Math.round(totalValue),
      invested: totalInvested,
    });
  }
  return result;
}
