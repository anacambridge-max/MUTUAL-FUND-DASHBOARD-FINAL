import { NextRequest, NextResponse } from "next/server";
import { FUNDS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
type Point={date:string;nav:number};
type MfApiResponse={data?:Array<{date:string;nav:string}>};
const cache=new Map<string,{at:number;value:Point[]}>(); const TTL=86400000;
async function fetchHistory(code:string):Promise<Point[]>{const hit=cache.get(code);if(hit&&Date.now()-hit.at<TTL)return hit.value;const res=await fetch(`https://api.mfapi.in/mf/${code}`,{cache:"no-store"});if(!res.ok)throw Error(`mfapi ${code}: ${res.status}`);const j=await res.json() as MfApiResponse;const v=(j.data??[]).map(x=>({date:x.date,nav:Number(x.nav)})).filter(x=>Number.isFinite(x.nav)).reverse();cache.set(code,{at:Date.now(),value:v});return v;}
const pct=(a:number,b:number)=>b?(a/b-1)*100:0;
const sma=(v:number[],n:number)=>v.length<n?v.reduce((a,b)=>a+b,0)/Math.max(1,v.length):v.slice(-n).reduce((a,b)=>a+b,0)/n;
function rsi(v:number[],n=14){if(v.length<=n)return 50;let g=0,l=0;for(let i=v.length-n;i<v.length;i++){const d=v[i]-v[i-1];if(d>=0)g+=d;else l-=d;}return l?100-100/(1+g/l):100;}
const ago=(p:Point[],d:number)=>p[Math.max(0,p.length-1-d)]?.nav??p[0]?.nav??0;
const rank=(a:any[],code:string)=>a.findIndex(x=>x.amfiCode===code)+1;
export async function GET(req:NextRequest){try{
 const budget=Math.max(1000,Number(req.nextUrl.searchParams.get("budget")??10000));
 const results=await Promise.all(FUNDS.map(async fund=>{try{const history=await fetchHistory(fund.amfiCode);const nav=history.at(-1)?.nav??0;const vals=history.slice(-365).map(x=>x.nav);const h52=Math.max(...vals,nav),l52=Math.min(...vals,nav);const v6=history.slice(-182).map(x=>x.nav),h6=Math.max(...v6,nav);const belowHigh=h52?(h52-nav)/h52*100:0,below6MHigh=h6?(h6-nav)/h6*100:0,aboveLow=l52?(nav-l52)/l52*100:0;const r3=pct(nav,ago(history,90)),r6=pct(nav,ago(history,182)),ma20=sma(vals,20),ma50=sma(vals,50),rv=rsi(vals);return {...fund,nav,date:history.at(-1)?.date??"",belowHigh,below6MHigh,aboveLow,rsi:rv,ma20,ma50,crossover:ma20>=ma50?"Bullish":"Bearish",return3M:r3,return6M:r6,history};}catch(e){return {...fund,nav:0,date:"",belowHigh:0,below6MHigh:0,aboveLow:0,rsi:50,ma20:0,ma50:0,crossover:"Unavailable",return3M:0,return6M:0,history:[] as Point[],error:String(e)};}}));
 const valid=results.filter(x=>x.nav>0),r3s=[...valid].sort((a,b)=>b.return3M-a.return3M),r6s=[...valid].sort((a,b)=>b.return6M-a.return6M);
 const scored=results.map(f=>{const r3rank=rank(r3s,f.amfiCode)||Math.max(1,valid.length),r6rank=rank(r6s,f.amfiCode)||Math.max(1,valid.length);const relativeStrength=valid.length?100*(1-((r3rank+r6rank)/2-1)/Math.max(1,valid.length-1)):50;const valuationScore=Math.max(0,Math.min(100,50+f.return6M*1.5));const rsiScore=Math.max(0,Math.min(100,100-Math.abs(f.rsi-45)*2.2));const momentumScore=Math.max(0,Math.min(100,50+f.return3M*2));const trendScore=f.crossover==="Bullish"?100:25;const recoveryScore=Math.max(0,Math.min(100,100-f.aboveLow*1.5));
 const overallScore=Math.round(.20*relativeStrength+.20*momentumScore+.20*rsiScore+.15*trendScore+.15*valuationScore+.10*recoveryScore);
 const discountScore=Math.round(.65*Math.min(100,f.belowHigh*5)+.35*Math.min(100,f.below6MHigh*7));
 const totalScore=Math.round(.70*overallScore+.30*discountScore);
 return {...f,r3rank,r6rank,relativeStrength,overallScore,discountScore,totalScore};});
 const top5=[...scored].filter(f=>f.nav>0).sort((a,b)=>b.totalScore-a.totalScore).slice(0,5);const weights=top5.map(f=>Math.max(1,f.totalScore));const sum=weights.reduce((a,b)=>a+b,0);const alloc=top5.map((f,i)=>({...f,recommendedPct:weights[i]/sum,recommendedAmount:Math.round(budget*weights[i]/sum/10)*10}));let diff=budget-alloc.reduce((a,b)=>a+b.recommendedAmount,0);if(alloc.length)alloc[0].recommendedAmount+=diff;const codes=new Set(alloc.map(x=>x.amfiCode));
 return NextResponse.json({success:true,lastUpdated:new Date().toISOString(),budget,top5:alloc,funds:scored.map(f=>{const a=alloc.find(x=>x.amfiCode===f.amfiCode);return {...f,selected:codes.has(f.amfiCode),allocationPct:a?.recommendedPct??0,allocation:a?.recommendedAmount??0};}),meta:{fundCount:FUNDS.length,source:"mfapi.in",selection:"Top 5 by Total Score",scoring:{overall:"70%",discount:"30%",overallComponents:{relativeStrength:"20%",momentum:"20%",RSI:"20%",trend:"15%",valuation:"15%",recovery:"10%"},discountComponents:{"52WeekHighDiscount":"65%","6MonthHighDiscount":"35%"}},note:"Discount is a separate score; Top 5 selection is based on Total Score, not discount alone."}});
}catch(e){return NextResponse.json({success:false,error:e instanceof Error?e.message:"Failed to load NAV data"},{status:500});}}
