import { NextRequest, NextResponse } from "next/server";
import { generateDashboardData, computeBudgetAllocations } from "@/lib/aiEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const budget = parseInt(body.budget ?? "10000");
    const data = generateDashboardData(budget);
    const allocations = computeBudgetAllocations(budget, data.funds);
    return NextResponse.json({ success: true, data: { allocations, totalBudget: budget } });
  } catch (error) {
    console.error("Budget API error:", error);
    return NextResponse.json({ success: false, error: "Failed to compute allocations" }, { status: 500 });
  }
}
