import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEntry {
  label: string;
  current: number;
  previous: number;
  unit?: string;
  higherIsBetter?: boolean;
}

/**
 * Before/After comparison widget showing metric changes over time.
 */
export function ComparisonTimeline({ entries, title = "Dein Fortschritt" }: { entries: TimelineEntry[]; title?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-card space-y-3">
      <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>

      <div className="space-y-2">
        {entries.map((entry) => {
          const diff = entry.current - entry.previous;
          const pct = entry.previous > 0 ? Math.round((diff / entry.previous) * 100) : 0;
          const positive = entry.higherIsBetter !== false ? diff > 0 : diff < 0;
          const neutral = diff === 0;

          return (
            <div key={entry.label} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div>
                <p className="text-xs font-medium">{entry.label}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-sm font-bold font-mono tabular-nums">
                    {entry.current.toLocaleString("de-DE")}{entry.unit || ""}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-through">
                    {entry.previous.toLocaleString("de-DE")}{entry.unit || ""}
                  </span>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold font-mono",
                neutral && "bg-muted text-muted-foreground",
                positive && "bg-accent/10 text-accent",
                !neutral && !positive && "bg-destructive/10 text-destructive",
              )}>
                {neutral ? <Minus className="h-2.5 w-2.5" /> : positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {pct > 0 ? "+" : ""}{pct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
