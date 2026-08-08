import { NextRequest, NextResponse } from "next/server";
import { generateDashboardData } from "@/lib/aiEngine";

export async function GET(req: NextRequest) {
  try {
    const budget = parseInt(req.nextUrl.searchParams.get("budget") ?? "10000");
    const data = generateDashboardData(budget);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate dashboard data" }, { status: 500 });
  }
}
