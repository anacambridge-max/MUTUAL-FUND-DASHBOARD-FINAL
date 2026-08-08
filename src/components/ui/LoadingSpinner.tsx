"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-12 h-12" : "w-8 h-8";
  return (
    <div className={`${sizeClass} border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin`} />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#070B14] flex flex-col items-center justify-center z-50 gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: "reverse" }} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-indigo-400 font-bold text-lg tracking-wider">AI ENGINE</p>
        <p className="text-slate-500 text-sm mt-1 animate-pulse">Analyzing 15 funds · Computing scores · Generating signals</p>
      </div>
    </div>
  );
}
