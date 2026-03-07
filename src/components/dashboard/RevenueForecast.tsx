import { useMemo } from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function RevenueForecast() {
  const { data: cmdData } = useCommandCenterData();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  const forecast = useMemo(() => {
    const fin = cmdData?.financial;
    if (!fin?.recommended_price || !fin?.production_cost) return null;

    const price = Number(fin.recommended_price);
    const cogs = Number(fin.production_cost) + Number(fin.packaging_cost || 0) + Number(fin.shipping_cost || 0);
    const margin = price - cogs;
    const breakEven = Number(fin.break_even_units || 100);
    const marketingBudget = Number(fin.marketing_budget || 500);

    // Simple 12-month forecast model
    const months = [];
    let cumulativeRevenue = 0;
    let cumulativeProfit = 0;

    for (let m = 1; m <= 12; m++) {
      // Growth curve: starts slow, accelerates, then plateaus
      const growthFactor = 1 - Math.exp(-m / 4);
      const monthlyUnits = Math.round(breakEven * 0.3 * growthFactor * (1 + m * 0.08));
      const revenue = monthlyUnits * price;
      const costs = monthlyUnits * cogs + marketingBudget * (m <= 3 ? 1.5 : 1);
      const profit = revenue - costs;

      cumulativeRevenue += revenue;
      cumulativeProfit += profit;

      months.push({
        month: isDE ? `M${m}` : `M${m}`,
        revenue: Math.round(revenue),
        profit: Math.round(profit),
        units: monthlyUnits,
        cumRevenue: Math.round(cumulativeRevenue),
        cumProfit: Math.round(cumulativeProfit),
      });
    }

    const breakEvenMonth = months.findIndex((m) => m.cumProfit > 0) + 1;

    return { months, breakEvenMonth, margin, yearlyRevenue: cumulativeRevenue, yearlyProfit: cumulativeProfit };
  }, [cmdData, isDE]);

  if (!forecast) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {isDE ? "Finanzmodell erforderlich für Umsatzprognose" : "Financial model required for revenue forecast"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{isDE ? "Umsatzprognose" : "Revenue Forecast"}</h3>
            <p className="text-[11px] text-muted-foreground">{isDE ? "12-Monats-Projektion" : "12-month projection"}</p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-lg font-bold">€{Math.round(forecast.yearlyRevenue).toLocaleString("de-DE")}</p>
          <p className="text-[10px] text-muted-foreground">{isDE ? "Jahresumsatz" : "Yearly Revenue"}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className={cn("text-lg font-bold", forecast.yearlyProfit > 0 ? "text-success" : "text-destructive")}>
            €{Math.round(forecast.yearlyProfit).toLocaleString("de-DE")}
          </p>
          <p className="text-[10px] text-muted-foreground">{isDE ? "Jahresgewinn" : "Yearly Profit"}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-lg font-bold">
            {forecast.breakEvenMonth > 0 ? `M${forecast.breakEvenMonth}` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">Break-Even</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast.months}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `€${v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                `€${value.toLocaleString("de-DE")}`,
                name === "revenue" ? (isDE ? "Umsatz" : "Revenue") : (isDE ? "Gewinn" : "Profit"),
              ]}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.1)" strokeWidth={2} />
            <Area type="monotone" dataKey="profit" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.1)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
