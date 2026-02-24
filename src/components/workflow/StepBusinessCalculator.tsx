import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

export function StepBusinessCalculator() {
  const [costs, setCosts] = useState({
    production: 0,
    packaging: 0,
    shipping: 0,
    marketing: 0,
  });

  const update = (key: string, value: string) => {
    setCosts((p) => ({ ...p, [key]: parseFloat(value) || 0 }));
  };

  const total = costs.production + costs.packaging + costs.shipping;
  const recommended = useMemo(() => Math.round(total * 2.8 * 100) / 100, [total]);
  const margin = useMemo(
    () => (recommended > 0 ? Math.round(((recommended - total) / recommended) * 100) : 0),
    [recommended, total]
  );
  const breakEven = useMemo(
    () => (recommended - total > 0 ? Math.ceil(costs.marketing / (recommended - total)) : 0),
    [costs.marketing, recommended, total]
  );

  const scenarios = [
    { label: "Niedrig", units: 50, revenue: 50 * recommended, profit: 50 * (recommended - total) - costs.marketing },
    { label: "Mittel", units: 200, revenue: 200 * recommended, profit: 200 * (recommended - total) - costs.marketing },
    { label: "Skaliert", units: 1000, revenue: 1000 * recommended, profit: 1000 * (recommended - total) - costs.marketing },
  ];

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-6 text-lg font-semibold">Kosten eingeben</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { key: "production", label: "Produktionskosten / Stück" },
            { key: "packaging", label: "Verpackungskosten / Stück" },
            { key: "shipping", label: "Versandkosten / Stück" },
            { key: "marketing", label: "Marketing-Budget (gesamt)" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-7"
                  value={costs[key as keyof typeof costs] || ""}
                  onChange={(e) => update(key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: DollarSign, label: "Empf. Preis", value: formatCurrency(recommended), color: "text-accent" },
          { icon: TrendingUp, label: "Marge", value: `${margin}%`, color: "text-success" },
          { icon: Target, label: "Break-Even", value: `${breakEven} Stück`, color: "text-info" },
          { icon: BarChart3, label: "Stückkosten", value: formatCurrency(total), color: "text-muted-foreground" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className={`h-4 w-4 ${color}`} />
              {label}
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Scenarios */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">Profit-Szenarien</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {scenarios.map(({ label, units, revenue, profit }) => (
            <div key={label} className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{units} Einheiten</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Umsatz</span>
                  <span className="font-medium">{formatCurrency(revenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gewinn</span>
                  <span className={`font-semibold ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
