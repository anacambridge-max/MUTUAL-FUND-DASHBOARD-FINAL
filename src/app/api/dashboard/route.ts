import { NextRequest, NextResponse } from "next/server";
import { FUNDS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Point = { date: string; nav: number };

type MfApiResponse = { meta?: { scheme_name?: string; scheme_code?: string }; data?: Array<{ date: string; nav: string }> };

const cache = new Map<string, { at: number; value: Point[] }>();
const TTL = 24 * 60 * 60 * 1000;

async function fetchHistory(code: string): Promise<Point[]> {
  const hit = cache.get(code);
  if (hit && Date.now() - hit.at < TTL) return hit.value;
  const res = await fetch(`https://api.mfapi.in/mf/${code}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`mfapi ${code}: ${res.status}`);
  const json = (await res.json()) as MfApiResponse;
  const value = (json.data ?? []).map(x => ({ date: x.date, nav: Number(x.nav) })).filter(x => Number.isFinite(x.nav)).reverse();
  cache.set(code, { at: Date.now(), value });
  return value;
}

function pct(a: number, b: number) { return b ? (a / b - 1) * 100 : 0; }
function sma(values: number[], n: number) { return values.length < n ? values.reduce((a,b)=>a+b,0)/Math.max(1,values.length) : values.slice(-n).reduce((a,b)=>a+b,0)/n; }
function rsi(values: number[], n=14) {
  if (values.length <= n) return 50;
  let gain=0, loss=0;
  for (let i=values.length-n; i<values.length; i++) { const d=values[i]-values[i-1]; if(d>=0) gain+=d; else loss-=d; }
  if (!loss) return 100;
  return 100 - 100/(1+gain/loss);
}
function daysAgo(points: Point[], days: number) { return points[Math.max(0, points.length-1-days)]?.nav ?? points[0]?.nav ?? 0; }
function xirr(cash: Array<{date: Date; amount: number}>) {
  if (cash.length < 2) return 0;
  const t0 = cash[0].date.getTime();
  const f = (r:number) => cash.reduce((s,c)=>s+c.amount/Math.pow(1+r,(c.date.getTime()-t0)/31557600000),0);
  let lo=-0.9999, hi=10;
  for(let i=0;i<80;i++){const mid=(lo+hi)/2;if(f(mid)>0)lo=mid;else hi=mid;}
  return ((lo+hi)/2)*100;
}

export async function GET(req: NextRequest) {
  try {
    const budget = Math.max(1000, Number(req.nextUrl.searchParams.get("budget") ?? 10000));
    const results = await Promise.all(FUNDS.map(async fund => {
      try {
        const history = await fetchHistory(fund.amfiCode);
        const nav = history.at(-1)?.nav ?? 0;
        const recent = history.slice(-365);
        const vals = recent.map(x=>x.nav);
        const high52 = Math.max(...vals, nav), low52 = Math.min(...vals, nav);
        const belowHigh = high52 ? (high52-nav)/high52*100 : 0;
        const aboveLow = low52 ? (nav-low52)/low52*100 : 0;
        const r3 = pct(nav, daysAgo(history, 90));
        const r6 = pct(nav, daysAgo(history, 182));
        const ma20=sma(vals,20), ma50=sma(vals,50), r=rsi(vals);
        return { ...fund, nav, date: history.at(-1)?.date ?? "", belowHigh, aboveLow, rsi:r, ma20, ma50, crossover:ma20>=ma50?"Bullish":"Bearish", return3M:r3, return6M:r6, history };
      } catch (e) { return { ...fund, nav:0,date:"",belowHigh:0,aboveLow:0,rsi:50,ma20:0,ma50:0,crossover:"Unavailable",return3M:0,return6M:0,history:[] as Point[], error:String(e) }; }
    }));
    const valid = results.filter(x=>x.nav>0);
    const r3Sorted=[...valid].sort((a,b)=>b.return3M-a.return3M);
    const r6Sorted=[...valid].sort((a,b)=>b.return6M-a.return6M);
    const rank=(arr:any[], code:string)=>arr.findIndex(x=>x.amfiCode===code)+1;
    const scored = results.map(f=>{
      const r3rank=rank(r3Sorted,f.amfiCode)||valid.length, r6rank=rank(r6Sorted,f.amfiCode)||valid.length;
      const relRank=(valid.length?100*(1-((r3rank+r6rank)/2-1)/Math.max(1,valid.length-1)):50);
      const highScore=Math.min(100,Math.max(0,f.belowHigh*3));
      const rsiScore=Math.max(0,Math.min(100,(50-Math.abs(f.rsi-40))*2));
      const trend=f.crossover==="Bullish"?15:0;
      const opportunity=Math.round(Math.min(100,Math.max(0,0.4*highScore+0.3*rsiScore+0.3*relRank+trend)));
      return {...f,r3rank,r6rank,relRank,opportunity};
    });
    const minPct=0.03, maxPct=0.20;
    const weights=scored.map(f=>Math.max(0.01, f.opportunity/100));
    const floorTotal=minPct*FUNDS.length;
    const remaining=Math.max(0,1-floorTotal);
    const wsum=weights.reduce((a,b)=>a+b,0);
    const allocations=scored.map((f,i)=>{
      const raw=minPct+remaining*(weights[i]/Math.max(wsum,1));
      return {...f, allocationPct:Math.min(maxPct,raw)};
    });
    const cappedSum=allocations.reduce((a,b)=>a+b.allocationPct,0);
    const norm=allocations.map(f=>({...f,allocationPct:f.allocationPct/cappedSum,allocation:Math.round(budget*f.allocationPct/cappedSum/10)*10}));
    return NextResponse.json({success:true, lastUpdated:new Date().toISOString(), funds:norm, portfolio:{totalInvested:0,currentValue:0,gain:0,gainPct:0,xirr:0}, meta:{fundCount:FUNDS.length, source:"mfapi.in", cacheTTLHours:24, heuristic:{formula:"40% distance from 52-week high + 30% RSI condition + 30% relative 3M/6M rank + small MA trend adjustment", minPct, maxPct}}});
  } catch(e) { return NextResponse.json({success:false,error:e instanceof Error?e.message:"Failed to load NAV data"},{status:500}); }
}
