"use client";
import { getScoreColor } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, label, sublabel }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);
  const colorClass = getScoreColor(score);

  const trackColor = "#1e293b";
  const progressColor =
    score >= 80 ? "#10b981" :
    score >= 65 ? "#22c55e" :
    score >= 50 ? "#f59e0b" :
    score >= 35 ? "#f97316" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold ${colorClass}`}>{score.toFixed(0)}</span>
        </div>
      </div>
      {label && <p className="text-xs text-slate-400 text-center font-medium">{label}</p>}
      {sublabel && <p className="text-xs text-slate-500 text-center">{sublabel}</p>}
    </div>
  );
}
