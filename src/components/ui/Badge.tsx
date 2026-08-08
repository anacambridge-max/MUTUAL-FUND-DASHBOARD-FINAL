"use client";
import { cn } from "@/lib/utils";
import { SIGNAL_BG } from "@/lib/constants";

interface BadgeProps {
  label: string;
  variant?: "signal" | "default" | "danger" | "success" | "warning" | "info";
  size?: "sm" | "md";
}

export function Badge({ label, variant = "default", size = "sm" }: BadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  if (variant === "signal") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border font-semibold",
          sizeClass,
          SIGNAL_BG[label] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30"
        )}
      >
        {label}
      </span>
    );
  }

  const variantClass =
    variant === "danger"
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : variant === "success"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : variant === "warning"
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : variant === "info"
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-slate-500/20 text-slate-400 border-slate-500/30";

  return (
    <span className={cn("inline-flex items-center rounded-full border font-medium", sizeClass, variantClass)}>
      {label}
    </span>
  );
}
