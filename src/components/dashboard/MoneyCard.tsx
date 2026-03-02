import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MoneySummary } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";

export function MoneyCard({ data }: { data: MoneySummary }) {
  const usedPct = Math.round((data.capitalUsed / data.totalCapital) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4 text-success" /> Money
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Marge</span>
          <span className={cn("text-xl font-bold tabular-nums", data.margin >= 30 ? "text-success" : data.margin >= 15 ? "text-warning" : "text-destructive")}>
            {data.margin}%
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Break-even</span>
          <span className="text-lg font-semibold tabular-nums">{data.breakEvenUnits} Stk.</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Cashflow / Monat</span>
          <span className={cn("text-lg font-semibold tabular-nums", data.cashflowMonthly >= 0 ? "text-success" : "text-destructive")}>
            {data.cashflowMonthly >= 0 ? "+" : ""}{data.cashflowMonthly.toLocaleString("de-DE")} €
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Kapital verwendet</span>
            <span>{usedPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className={cn("h-2 rounded-full transition-all", usedPct > 80 ? "bg-destructive" : usedPct > 50 ? "bg-warning" : "bg-success")}
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
