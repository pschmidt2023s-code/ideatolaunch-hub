import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/command-center-types";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  level?: RiskLevel;
  className?: string;
  children?: React.ReactNode;
}

const levelStyles: Record<RiskLevel, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

export function MetricCard({ label, value, sub, level, className, children }: MetricCardProps) {
  return (
    <div className={cn("rounded-2xl border bg-card p-6 shadow-card transition-shadow hover:shadow-md", className)}>
      <p className="section-label">{label}</p>
      <p className={cn("mt-2 metric-value", level && levelStyles[level])}>
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{sub}</p>}
      {children}
    </div>
  );
}