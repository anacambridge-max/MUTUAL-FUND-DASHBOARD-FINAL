import { NextRequest, NextResponse } from "next/server";
import { generateNavHistory } from "@/lib/aiEngine";
import { FUND_AMFI_CODES } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const amfiCode = req.nextUrl.searchParams.get("amfiCode") ?? "120843";
    const days = parseInt(req.nextUrl.searchParams.get("days") ?? "365");

    if (!FUND_AMFI_CODES.includes(amfiCode as (typeof FUND_AMFI_CODES)[number])) {
      return NextResponse.json({ success: false, error: "Invalid AMFI code" }, { status: 400 });
    }

    const history = generateNavHistory(amfiCode, Math.min(days, 1825));
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("NAV history API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch NAV history" }, { status: 500 });
  }
}
