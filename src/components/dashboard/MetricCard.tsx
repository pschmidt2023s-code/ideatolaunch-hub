import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { RiskLevel } from "@/lib/command-center-types";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  level?: RiskLevel;
  className?: string;
  children?: React.ReactNode;
  /** Optional trend: positive = up, negative = down, 0 = flat */
  trend?: number;
  /** Optional progress 0-100 for micro-progress bar */
  progress?: number;
}

const levelStyles: Record<RiskLevel, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

const levelBarStyles: Record<RiskLevel, string> = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-destructive",
};

export function MetricCard({ label, value, sub, level, className, children, trend, progress }: MetricCardProps) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-card card-interactive group", className)}>
      {/* Header with label + trend */}
      <div className="flex items-center justify-between">
        <p className="section-label">{label}</p>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              trend > 0 && "bg-success/10 text-success",
              trend < 0 && "bg-destructive/10 text-destructive",
              trend === 0 && "bg-muted text-muted-foreground"
            )}
          >
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {trend !== 0 && <span>{Math.abs(trend)}%</span>}
          </div>
        )}
      </div>

      {/* Value */}
      <p className={cn("mt-2 metric-value", level && levelStyles[level])}>
        {value}
      </p>

      {/* Sub text */}
      {sub && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{sub}</p>}

      {/* Micro progress bar */}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 animate-bar-load",
              level ? levelBarStyles[level] : "bg-accent"
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {children}
    </div>
  );
}