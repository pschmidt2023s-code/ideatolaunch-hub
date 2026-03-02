import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/command-center-types";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  level?: RiskLevel;
  className?: string;
}

const levelStyles: Record<RiskLevel, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

export function MetricCard({ label, value, sub, level, className }: MetricCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-card", className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", level && levelStyles[level])}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
