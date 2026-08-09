export const FUNDS = [
  { amfiCode: "120843", name: "Quant Flexi Cap Direct Growth", shortName: "Quant Flexi Cap", category: "Equity", subCategory: "Flexi Cap", riskLevel: "High", sectorFocus: "Multi-Sector", color: "#6366f1" },
  { amfiCode: "118989", name: "HDFC Mid Cap Fund Direct Growth", shortName: "HDFC Mid Cap", category: "Equity", subCategory: "Mid Cap", riskLevel: "High", sectorFocus: "Mid Cap", color: "#3b82f6" },
  { amfiCode: "125497", name: "SBI Small Cap Direct Growth", shortName: "SBI Small Cap", category: "Equity", subCategory: "Small Cap", riskLevel: "Very High", sectorFocus: "Small Cap", color: "#06b6d4" },
  { amfiCode: "119827", name: "SBI Nifty 50 Index Fund Direct Growth", shortName: "SBI Nifty 50", category: "Equity", subCategory: "Index - Large Cap", riskLevel: "Moderate", sectorFocus: "Large Cap", color: "#14b8a6" },
  { amfiCode: "143341", name: "UTI Nifty Next 50 Index Fund Direct Growth", shortName: "UTI Nifty Next 50", category: "Equity", subCategory: "Index - Next 50", riskLevel: "Moderate-High", sectorFocus: "Next 50", color: "#0ea5e9" },
  { amfiCode: "120821", name: "Quant Multi Asset Allocation Fund Direct Growth", shortName: "Quant Multi Asset", category: "Hybrid", subCategory: "Multi Asset", riskLevel: "Moderate-High", sectorFocus: "Multi-Asset", color: "#ec4899" },
  { amfiCode: "150714", name: "UTI Gold ETF FoF Direct Growth", shortName: "UTI Gold ETF FoF", category: "Gold", subCategory: "Gold FoF", riskLevel: "Moderate", sectorFocus: "Gold", color: "#fbbf24" },
  { amfiCode: "119783", name: "SBI Healthcare Opportunities Fund Direct Growth", shortName: "SBI Healthcare", category: "Equity", subCategory: "Sectoral - Healthcare", riskLevel: "Very High", sectorFocus: "Healthcare", color: "#22c55e" },
  { amfiCode: "135800", name: "Tata Digital India Fund Direct Growth", shortName: "Tata Digital India", category: "Equity", subCategory: "Sectoral - Technology", riskLevel: "Very High", sectorFocus: "Technology", color: "#84cc16" },
  { amfiCode: "120833", name: "Quant Infrastructure Direct Growth", shortName: "Quant Infrastructure", category: "Equity", subCategory: "Sectoral - Infrastructure", riskLevel: "Very High", sectorFocus: "Infrastructure", color: "#f97316" },
  { amfiCode: "151791", name: "Quant BFSI Fund Direct Growth", shortName: "Quant BFSI", category: "Equity", subCategory: "Sectoral - BFSI", riskLevel: "Very High", sectorFocus: "Banking & Financial", color: "#eab308" },
  { amfiCode: "144835", name: "Sundaram Services Fund Direct Growth", shortName: "Sundaram Services", category: "Equity", subCategory: "Sectoral - Services", riskLevel: "Very High", sectorFocus: "Services", color: "#a855f7" },
  { amfiCode: "120503", name: "Axis ELSS Tax Saver Direct Growth", shortName: "Axis ELSS", category: "Equity", subCategory: "ELSS", riskLevel: "High", sectorFocus: "Multi-Sector", color: "#ef4444" },
  { amfiCode: "119727", name: "SBI Focused Fund Direct Growth", shortName: "SBI Focused", category: "Equity", subCategory: "Focused", riskLevel: "High", sectorFocus: "Multi-Sector", color: "#fb7185" },
  { amfiCode: "148490", name: "SBI Children's Fund Investment Plan Direct Growth", shortName: "SBI Children's", category: "Equity", subCategory: "Children's Fund", riskLevel: "High", sectorFocus: "Multi-Sector", color: "#f472b6" },
  { amfiCode: "147946", name: "Bandhan Small Cap Fund Direct Growth", shortName: "Bandhan Small Cap", category: "Equity", subCategory: "Small Cap", riskLevel: "Very High", sectorFocus: "Small Cap", color: "#65a30d" },
  { amfiCode: "120586", name: "ICICI Prudential Large Cap Fund Direct Growth", shortName: "ICICI Pru Large Cap", category: "Equity", subCategory: "Large Cap", riskLevel: "Moderate-High", sectorFocus: "Large Cap", color: "#f59e0b" },
  { amfiCode: "120826", name: "Quant Large and Mid Cap Fund Direct Growth", shortName: "Quant Large & Mid", category: "Equity", subCategory: "Large & Mid Cap", riskLevel: "High", sectorFocus: "Multi-Sector", color: "#8b5cf6" },
  { amfiCode: "120823", name: "Quant Multi Cap Fund Direct Growth", shortName: "Quant Multi Cap", category: "Equity", subCategory: "Multi Cap", riskLevel: "High", sectorFocus: "Multi-Sector", color: "#c026d3" },
] as const;

export const FUND_AMFI_CODES = FUNDS.map((f) => f.amfiCode);
export const SECTORS = ["IT","Banking","Financial Services","Infrastructure","Auto","Pharma","FMCG","Consumption","Energy","Power","PSU","Real Estate","Metals","Chemicals","Capital Goods","Manufacturing","Digital"];
export const MARKET_INDICES = [
  { key: "nifty50", label: "Nifty 50" },
  { key: "niftyNext50", label: "Nifty Next 50" },
  { key: "niftyMidcap150", label: "Nifty Midcap 150" },
  { key: "niftySmallcap250", label: "Nifty Smallcap 250" },
  { key: "nifty500", label: "Nifty 500" },
  { key: "sensex", label: "Sensex" },
  { key: "indiaVix", label: "India VIX" },
  { key: "gold", label: "Gold" },
  { key: "usdInr", label: "USD/INR" },
  { key: "bondYield10Y", label: "10Y Bond Yield" },
];
export const SIGNAL_COLORS: Record<string,string> = { "Strong Buy":"#22c55e", Buy:"#4ade80", Accumulate:"#86efac", Hold:"#fbbf24", Reduce:"#f87171", Sell:"#ef4444" };
export const SIGNAL_BG: Record<string,string> = {};
export const MARKET_TREND_COLORS: Record<string,string> = { Bull:"text-emerald-400", Bear:"text-red-400", Correction:"text-orange-400", Recovery:"text-blue-400", Sideways:"text-amber-400" };
