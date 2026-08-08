import { NextRequest, NextResponse } from "next/server";
import { generatePortfolioGrowth } from "@/lib/aiEngine";

export async function GET(req: NextRequest) {
  try {
    const budget = parseInt(req.nextUrl.searchParams.get("budget") ?? "10000");
    const months = parseInt(req.nextUrl.searchParams.get("months") ?? "36");
    const data = generatePortfolioGrowth(budget, Math.min(months, 180));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Portfolio growth API error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate growth data" }, { status: 500 });
  }
}
