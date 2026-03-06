import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import type { MoneySummary } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";

export function MoneyCard({ data }: { data: MoneySummary }) {
  const usedPct = Math.round((data.capitalUsed / data.totalCapital) * 100);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4 group hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
            <DollarSign className="h-4 w-4 text-success" />
          </div>
          <span className="text-sm font-semibold">Money</span>
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
          data.capitalDelta >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          {data.capitalDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {data.capitalDelta >= 0 ? "+" : ""}{data.capitalDelta.toLocaleString("de-DE")} €
        </div>
      </div>

      {/* Key metrics */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Marge</span>
          <span className={cn("text-2xl font-bold tabular-nums", data.margin >= 30 ? "text-success" : data.margin >= 15 ? "text-warning" : "text-destructive")}>
            {data.margin}%
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Break-even</span>
          <span className="text-lg font-bold tabular-nums">{data.breakEvenUnits} Stk.</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Cashflow / Mo.</span>
          <span className={cn("text-lg font-bold tabular-nums", data.cashflowMonthly >= 0 ? "text-success" : "text-destructive")}>
            {data.cashflowMonthly >= 0 ? "+" : ""}{data.cashflowMonthly.toLocaleString("de-DE")} €
          </span>
        </div>
      </div>

      {/* Capital bar */}
      <div className="space-y-1.5 border-t pt-3">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Kapital verwendet</span>
          <span className="font-semibold tabular-nums">{usedPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500 animate-bar-load", usedPct > 80 ? "bg-destructive" : usedPct > 50 ? "bg-warning" : "bg-success")}
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
