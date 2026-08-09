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
function pct(a:number,b:number){ return b ? (a/b-1)*100 : 0; }
function sma(v:number[],n:number){ return v.length<n ? v.reduce((a,b)=>a+b,0)/Math.max(1,v.length) : v.slice(-n).reduce((a,b)=>a+b,0)/n; }
function rsi(v:number[],n=14){ if(v.length<=n)return 50; let g=0,l=0; for(let i=v.length-n;i<v.length;i++){const d=v[i]-v[i-1];if(d>=0)g+=d;else l-=d;} if(!l)return 100; return 100-100/(1+g/l); }
function daysAgo(p:Point[],d:number){ return p[Math.max(0,p.length-1-d)]?.nav ?? p[0]?.nav ?? 0; }
function rangeHigh(v:number[]){return v.length?Math.max(...v):0;}

export async function GET(req:NextRequest){
 try{
  const budget=Math.max(1000,Number(req.nextUrl.searchParams.get("budget")??10000));
  const results=await Promise.all(FUNDS.map(async fund=>{
   try{
    const history=await fetchHistory(fund.amfiCode); const nav=history.at(-1)?.nav??0; const recent=history.slice(-365); const vals=recent.map(x=>x.nav);
    const high52=rangeHigh(vals), low52=vals.length?Math.min(...vals):nav; const last6=history.slice(-182).map(x=>x.nav); const high6=rangeHigh(last6); const low6=last6.length?Math.min(...last6):nav;
    const belowHigh=high52?(high52-nav)/high52*100:0; const below6MHigh=high6?(high6-nav)/high6*100:0; const aboveLow=low52?(nav-low52)/low52*100:0;
    const r3=pct(nav,daysAgo(history,90)); const r6=pct(nav,daysAgo(history,182)); const ma20=sma(vals,20),ma50=sma(vals,50),r=rsi(vals);
    return {...fund,nav,date:history.at(-1)?.date??"",belowHigh,aboveLow,below6MHigh,above6MLow:low6?(nav-low6)/low6*100:0,rsi:r,ma20,ma50,crossover:ma20>=ma50?"Bullish":"Bearish",return3M:r3,return6M:r6,history};
   }catch(e){return {...fund,nav:0,date:"",belowHigh:0,aboveLow:0,below6MHigh:0,above6MLow:0,rsi:50,ma20:0,ma50:0,crossover:"Unavailable",return3M:0,return6M:0,history:[] as Point[],error:String(e)};}
  }));
  const valid=results.filter(x=>x.nav>0); const r3Sorted=[...valid].sort((a,b)=>b.return3M-a.return3M); const r6Sorted=[...valid].sort((a,b)=>b.return6M-a.return6M);
  const rank=(arr:any[],code:string)=>arr.findIndex(x=>x.amfiCode===code)+1;
  const scored=results.map(f=>{
   const r3rank=rank(r3Sorted,f.amfiCode)||Math.max(1,valid.length); const r6rank=rank(r6Sorted,f.amfiCode)||Math.max(1,valid.length);
   const relRank=valid.length?100*(1-((r3rank+r6rank)/2-1)/Math.max(1,valid.length-1)):50;
   const discountScore=Math.min(100,Math.max(0,0.65*Math.min(100,f.belowHigh*5)+0.35*Math.min(100,f.below6MHigh*7)));
   const rsiScore=Math.max(0,Math.min(100,100-Math.abs(f.rsi-45)*2.2));
   const trendScore=f.crossover==="Bullish"?100:25;
   const momentumScore=0.5*relRank+0.5*Math.max(0,Math.min(100,50+f.return3M*2));
   const recoveryScore=Math.max(0,Math.min(100,100-Math.min(100,f.aboveLow)*1.5));
   const opportunity=Math.round(Math.min(100,Math.max(0,0.30*discountScore+0.10*recoveryScore+0.15*rsiScore+0.20*relRank+0.15*momentumScore+0.10*trendScore)));
   return {...f,r3rank,r6rank,relRank,discountScore,recoveryScore,momentumScore,opportunity};
  });
  const top5=[...scored].filter(f=>f.nav>0).sort((a,b)=>b.opportunity-a.opportunity).slice(0,5);
  const topCodes=new Set(top5.map(x=>x.amfiCode));
  const rawWeights=top5.map(f=>Math.max(1,f.opportunity)); const wsum=rawWeights.reduce((a,b)=>a+b,0);
  const top5Alloc=top5.map((f,i)=>({...f,recommendedPct:rawWeights[i]/wsum,recommendedAmount:Math.round((budget*rawWeights[i]/wsum)/10)*10}));
  let diff=budget-top5Alloc.reduce((a,b)=>a+b.recommendedAmount,0); if(top5Alloc.length) top5Alloc[0].recommendedAmount+=diff;
  const final=top5Alloc.map(f=>({...f,selected:true,selectionRank:top5Alloc.findIndex(x=>x.amfiCode===f.amfiCode)+1}));
  return NextResponse.json({success:true,lastUpdated:new Date().toISOString(),funds:scored.map(f=>({...f,selected:topCodes.has(f.amfiCode),allocationPct:topCodes.has(f.amfiCode)?final.find(x=>x.amfiCode===f.amfiCode)?.recommendedPct??0:0,allocation:topCodes.has(f.amfiCode)?final.find(x=>x.amfiCode===f.amfiCode)?.recommendedAmount??0:0})),top5:final,budget,meta:{fundCount:FUNDS.length,source:"mfapi.in",cacheTTLHours:24,selection:"Top 5 by transparent Opportunity Score",formula:{discount:"30% (65% 52W-high discount + 35% 6M-high discount)",recovery:"10%",rsi:"15%",relativeStrength:"20%",momentum:"15%",trend:"10%"}}});
 }catch(e){return NextResponse.json({success:false,error:e instanceof Error?e.message:"Failed to load NAV data"},{status:500});}
}
