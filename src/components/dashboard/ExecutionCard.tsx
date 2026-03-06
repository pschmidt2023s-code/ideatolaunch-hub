import { Zap, AlertCircle, ChevronRight } from "lucide-react";
import type { ExecutionAction } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";

const priorityDot: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-muted-foreground/40",
};

const priorityLabel: Record<string, string> = {
  critical: "text-destructive bg-destructive/10",
  high: "text-warning bg-warning/10",
  medium: "text-muted-foreground bg-muted",
};

export function ExecutionCard({ actions }: { actions: ExecutionAction[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4 group hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Zap className="h-4 w-4 text-accent" />
        </div>
        <span className="text-sm font-semibold">Execution</span>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {actions.map((a, i) => (
          <div
            key={a.id}
            className={cn(
              "rounded-xl border p-3 space-y-1.5 transition-colors hover:bg-muted/50",
              i === 0 && "border-accent/20 bg-accent/5"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", priorityLabel[a.priority])}>
                  {a.priority}
                </span>
                <span className="text-sm font-medium truncate">{a.label}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
            {a.blocker && (
              <div className="flex items-center gap-1.5 text-[11px] text-destructive ml-1">
                <AlertCircle className="h-3 w-3" />
                Blocker: {a.blocker}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
