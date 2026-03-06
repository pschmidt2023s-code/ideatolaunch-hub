import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/command-center-types";

/* ── DashboardCard ─────────────────────────────────────────── */
interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export function DashboardCard({ children, className, interactive }: DashboardCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-5 transition-all duration-150",
      interactive && "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
      className,
    )}>
      {children}
    </div>
  );
}

/* ── MetricDisplay ─────────────────────────────────────────── */
interface MetricDisplayProps {
  label: string;
  value: string | number;
  sub?: string;
  level?: RiskLevel;
  progress?: number;
  size?: "sm" | "md" | "lg";
}

const levelColor: Record<RiskLevel, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

const levelBarColor: Record<RiskLevel, string> = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-destructive",
};

export function MetricDisplay({ label, value, sub, level, progress, size = "md" }: MetricDisplayProps) {
  const valueClass = {
    sm: "text-lg font-semibold",
    md: "text-2xl font-bold",
    lg: "text-4xl font-bold",
  }[size];

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn("tabular-nums tracking-tight", valueClass, level && levelColor[level])}>
        {value}
        {sub && <span className="text-xs font-normal text-muted-foreground ml-1">{sub}</span>}
      </p>
      {progress !== undefined && (
        <div className="h-1 rounded-full bg-muted overflow-hidden mt-2">
          <div
            className={cn("h-full rounded-full transition-all duration-700 animate-bar-load", level ? levelBarColor[level] : "bg-accent")}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ── RiskIndicator ─────────────────────────────────────────── */
interface RiskIndicatorProps {
  level: RiskLevel;
  label?: string;
  size?: "sm" | "md";
}

const riskDot: Record<RiskLevel, string> = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-destructive",
};

const riskLabel: Record<RiskLevel, string> = {
  low: "Stable",
  medium: "Warning",
  high: "Critical",
};

export function RiskIndicator({ level, label, size = "md" }: RiskIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("rounded-full", riskDot[level], size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")} />
      <span className={cn("font-medium", levelColor[level], size === "sm" ? "text-xs" : "text-sm")}>
        {label ?? riskLabel[level]}
      </span>
    </div>
  );
}

/* ── ActionCard ────────────────────────────────────────────── */
interface ActionCardProps {
  label: string;
  priority: "critical" | "high" | "medium";
  blocker?: string;
  onClick?: () => void;
}

const priorityStyles: Record<string, string> = {
  critical: "border-destructive/20 bg-destructive/5",
  high: "border-warning/20 bg-warning/5",
  medium: "border-border",
};

const priorityBadge: Record<string, string> = {
  critical: "text-destructive bg-destructive/10",
  high: "text-warning bg-warning/10",
  medium: "text-muted-foreground bg-muted",
};

export function ActionCard({ label, priority, blocker, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/30",
        priorityStyles[priority],
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", priorityBadge[priority])}>
          {priority}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {blocker && (
        <p className="mt-1.5 text-[11px] text-destructive/80 pl-1">⚠ {blocker}</p>
      )}
    </button>
  );
}

/* ── SimulationPanel ───────────────────────────────────────── */
interface SimulationPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SimulationPanel({ title, children, className }: SimulationPanelProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
