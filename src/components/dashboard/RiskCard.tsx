import { AlertTriangle } from "lucide-react";
import type { RiskItem, RiskLevel } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";

const dot: Record<RiskLevel, string> = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-destructive",
};

const barColor: Record<RiskLevel, string> = {
  low: "bg-success/20",
  medium: "bg-warning/20",
  high: "bg-destructive/20",
};

export function RiskCard({ risks }: { risks: RiskItem[] }) {
  const maxImpact = Math.max(...risks.map((r) => r.impact), 1);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4 group hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
        </div>
        <span className="text-sm font-semibold">Risk</span>
      </div>

      {/* Risk items with heat bars */}
      <div className="space-y-3">
        {risks.map((r) => {
          const pct = Math.round((r.impact / maxImpact) * 100);
          return (
            <div key={r.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", dot[r.level])} />
                  <span className="text-sm truncate">{r.title}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-destructive shrink-0">
                  -{r.impact.toLocaleString("de-DE")} €
                </span>
              </div>
              {/* Heat bar */}
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500 animate-bar-load", dot[r.level])}
                  style={{ width: `${pct}%`, opacity: 0.6 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
