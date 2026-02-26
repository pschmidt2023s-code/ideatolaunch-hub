import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, AlertTriangle, TrendingDown, Clock, Shield } from "lucide-react";
import { computeCashflow, applyStress, STRESS_PRESETS, type CashflowInput } from "@/lib/cashflow-engine";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";

export function CashflowSurvivalCard() {
  const { plan } = useSubscription();
  const [activeStress, setActiveStress] = useState<number | null>(null);
  const [inputs, setInputs] = useState<CashflowInput>({
    totalCapital: 15000,
    monthlyRevenue: 4500,
    productionCost: 1800,
    packagingCost: 400,
    shippingCost: 350,
    marketingBudget: 800,
    fixedCosts: 300,
    inventoryCost: 3000,
    returnRate: 5,
    paymentDelayDays: 14,
    supplierPrepaymentPercent: 30,
  });

  const effectiveInput = activeStress !== null ? applyStress(inputs, STRESS_PRESETS[activeStress]) : inputs;
  const result = useMemo(() => computeCashflow(effectiveInput), [effectiveInput]);

  const update = (key: keyof CashflowInput, value: number) =>
    setInputs((p) => ({ ...p, [key]: value }));

  const fmt = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  const runwayColor = result.runwayMonths >= 99 ? "text-green-500"
    : result.runwayMonths >= 6 ? "text-green-500"
    : result.runwayMonths >= 3 ? "text-yellow-500" : "text-destructive";

  const healthColor = result.healthScore >= 70 ? "bg-green-500"
    : result.healthScore >= 40 ? "bg-yellow-500" : "bg-destructive";

  const content = (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border p-4 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-accent" />
          <p className="text-xs text-muted-foreground">Runway</p>
          <p className={`text-2xl font-bold ${runwayColor}`}>
            {result.runwayMonths >= 99 ? "∞" : `${result.runwayMonths} Mo.`}
          </p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <TrendingDown className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xs text-muted-foreground">Burn Rate</p>
          <p className="text-2xl font-bold">{fmt(result.monthlyBurnRate)}/Mo.</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
          <p className="text-xs text-muted-foreground">Working Capital Gap</p>
          <p className="text-2xl font-bold">{fmt(result.workingCapitalGap)}</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <Shield className="h-4 w-4 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Health Score</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className={`h-3 rounded-full ${healthColor}`} style={{ width: `${result.healthScore}%`, maxWidth: "80px" }} />
            <span className="text-lg font-bold">{result.healthScore}</span>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {([
          ["totalCapital", "Gesamtkapital (€)"],
          ["monthlyRevenue", "Monatl. Umsatz (€)"],
          ["productionCost", "Produktionskosten (€/Mo.)"],
          ["packagingCost", "Verpackung (€/Mo.)"],
          ["shippingCost", "Versand (€/Mo.)"],
          ["marketingBudget", "Marketing (€/Mo.)"],
          ["fixedCosts", "Fixkosten (€/Mo.)"],
          ["inventoryCost", "Lagerbestand (€)"],
          ["returnRate", "Retourenquote (%)"],
          ["paymentDelayDays", "Zahlungsverzug (Tage)"],
          ["supplierPrepaymentPercent", "Vorauszahlung Lieferant (%)"],
        ] as const).map(([key, label]) => (
          <div key={key}>
            <Label className="text-xs">{label}</Label>
            <Input type="number" value={inputs[key]} onChange={(e) => update(key, +e.target.value)} />
          </div>
        ))}
      </div>

      {/* 12-Month Timeline */}
      <div className="rounded-xl border p-5">
        <h4 className="font-semibold mb-3">📈 12-Monats Cashflow</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Monat</th>
                <th className="py-2 text-right">Einnahmen</th>
                <th className="py-2 text-right">Ausgaben</th>
                <th className="py-2 text-right">Saldo</th>
                <th className="py-2 text-right">Kumuliert</th>
              </tr>
            </thead>
            <tbody>
              {result.timeline.map((m) => (
                <tr key={m.month} className={`border-b ${m.cumulativeBalance < 0 ? "bg-destructive/5" : ""}`}>
                  <td className="py-1.5">{m.month}</td>
                  <td className="py-1.5 text-right text-green-600">{fmt(m.inflow)}</td>
                  <td className="py-1.5 text-right text-destructive">{fmt(m.outflow)}</td>
                  <td className={`py-1.5 text-right font-medium ${m.balance >= 0 ? "text-green-600" : "text-destructive"}`}>{fmt(m.balance)}</td>
                  <td className={`py-1.5 text-right font-medium ${m.cumulativeBalance >= 0 ? "text-green-600" : "text-destructive"}`}>{fmt(m.cumulativeBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {result.breakEvenMonth && (
          <p className="mt-2 text-xs text-accent font-medium">✓ Break-Even ab Monat {result.breakEvenMonth}</p>
        )}
      </div>

      {/* Stress Test */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Stress Test Simulation
        </h4>
        <div className="flex flex-wrap gap-2 mb-3">
          <Button variant={activeStress === null ? "default" : "outline"} size="sm" onClick={() => setActiveStress(null)}>
            Basis
          </Button>
          {STRESS_PRESETS.map((p, i) => (
            <Button key={i} variant={activeStress === i ? "default" : "outline"} size="sm" onClick={() => setActiveStress(i)}>
              {p.label}
            </Button>
          ))}
        </div>
        {activeStress !== null && (
          <div className="grid gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
            <span>📈 Marketing +{STRESS_PRESETS[activeStress].marketingChange}%</span>
            <span>↩️ Retouren +{STRESS_PRESETS[activeStress].returnRateChange}%</span>
            <span>📦 Lieferverzug +{STRESS_PRESETS[activeStress].deliveryDelayDays} Tage</span>
            <span>💰 Umsatz {STRESS_PRESETS[activeStress].priceChange}%</span>
            <span>🏭 Produktion +{STRESS_PRESETS[activeStress].moqChange}%</span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {result.liquidityAlerts.length > 0 && (
        <div className="space-y-2">
          {result.liquidityAlerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              a.type === "critical" ? "border-destructive/30 bg-destructive/5 text-destructive"
              : a.type === "warning" ? "border-yellow-500/30 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400"
              : "border-accent/30 bg-accent/5 text-accent"
            }`}>
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {a.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent" />
          Cashflow Survival Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        {plan === "pro" ? content : (
          <LockedOverlay feature="capitalBurnPredictor" requiredPlan="pro">
            {content}
          </LockedOverlay>
        )}
      </CardContent>
    </Card>
  );
}
