import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardCard, MetricDisplay, RiskIndicator, ActionCard, SimulationPanel } from "@/components/dashboard/PremiumComponents";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { SEO } from "@/components/SEO";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import type { ScenarioMode } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Activity, DollarSign, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistic" },
  { value: "realistic", label: "Realistic" },
  { value: "worst-case", label: "Worst Case" },
];

export default function CommandCenter() {
  const [mode, setMode] = useState<ScenarioMode>("realistic");
  const data = useCommandCenterData(mode);

  return (
    <DashboardLayout>
      <SEO title="Command Center – BrandOS" description="Dein strategisches Cockpit." path="/dashboard/command" />
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Capital & Risk Intelligence</p>
          </div>

          {/* Reality Mode Toggle */}
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
            {MODES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-xs font-medium transition-all",
                  mode === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Insufficient data state */}
        {(!data.ready || !data.sufficient) && (
          <DashboardCard className="flex items-center gap-3 border-warning/20 bg-warning/5">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium">Nicht genügend Daten</p>
              <p className="text-xs text-muted-foreground">Fülle mindestens die Finanzkalkulation oder dein Markenprofil aus.</p>
            </div>
          </DashboardCard>
        )}

        {data.ready && data.sufficient && (
          <>
            {/* Live indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <Activity className="h-3 w-3" />
              <span>Live – berechnet aus deinen Daten</span>
            </div>

            {/* Primary Metrics – clean grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <AnimatedCard index={0}>
                <DashboardCard>
                  <MetricDisplay
                    label="Risk Score"
                    value={data.status.founderRiskIndex}
                    sub="/ 100"
                    level={data.status.founderRiskIndex <= 30 ? "high" : data.status.founderRiskIndex <= 60 ? "medium" : "low"}
                    progress={data.status.founderRiskIndex}
                  />
                </DashboardCard>
              </AnimatedCard>

              <AnimatedCard index={1}>
                <DashboardCard>
                  <MetricDisplay
                    label="Capital Health"
                    value={`${100 - data.status.capitalPressure}`}
                    sub="/ 100"
                    level={data.status.capitalPressure <= 30 ? "low" : data.status.capitalPressure <= 60 ? "medium" : "high"}
                    progress={100 - data.status.capitalPressure}
                  />
                </DashboardCard>
              </AnimatedCard>

              <AnimatedCard index={2}>
                <DashboardCard>
                  <MetricDisplay
                    label="Runway"
                    value={`${data.status.runwayMonths}`}
                    sub="Monate"
                    level={data.status.runwayMonths >= 10 ? "low" : data.status.runwayMonths >= 5 ? "medium" : "high"}
                    progress={Math.min(100, (data.status.runwayMonths / 18) * 100)}
                  />
                </DashboardCard>
              </AnimatedCard>

              <AnimatedCard index={3}>
                <DashboardCard>
                  <MetricDisplay
                    label="Break-even"
                    value={data.status.breakEvenDate}
                    size="sm"
                  />
                  <div className="mt-3">
                    <RiskIndicator level={data.status.riskLevel} />
                  </div>
                </DashboardCard>
              </AnimatedCard>
            </div>

            {/* Secondary: Money + Risks + Actions */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Money */}
              <AnimatedCard index={4}>
                <SimulationPanel title="Cashflow">
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Marge</span>
                      <span className={cn("text-xl font-bold tabular-nums", data.money.margin >= 30 ? "text-success" : data.money.margin >= 15 ? "text-warning" : "text-destructive")}>
                        {data.money.margin}%
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Cashflow / Mo.</span>
                      <span className={cn("text-lg font-semibold tabular-nums", data.money.cashflowMonthly >= 0 ? "text-success" : "text-destructive")}>
                        {data.money.cashflowMonthly >= 0 ? "+" : ""}{data.money.cashflowMonthly.toLocaleString("de-DE")} €
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Break-even</span>
                      <span className="text-sm font-medium tabular-nums">{data.money.breakEvenUnits} Stk.</span>
                    </div>
                    {/* Capital bar */}
                    <div className="pt-3 border-t border-border space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Kapital verwendet</span>
                        <span className="font-medium tabular-nums">{Math.round((data.money.capitalUsed / data.money.totalCapital) * 100)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700 animate-bar-load",
                            data.money.capitalUsed / data.money.totalCapital > 0.8 ? "bg-destructive" :
                            data.money.capitalUsed / data.money.totalCapital > 0.5 ? "bg-warning" : "bg-success"
                          )}
                          style={{ width: `${Math.round((data.money.capitalUsed / data.money.totalCapital) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </SimulationPanel>
              </AnimatedCard>

              {/* Risks */}
              <AnimatedCard index={5}>
                <SimulationPanel title="Top Risks">
                  <div className="space-y-3">
                    {data.risks.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <RiskIndicator level={r.level} size="sm" label="" />
                          <span className="text-sm truncate">{r.title}</span>
                        </div>
                        <span className="text-sm font-medium tabular-nums text-destructive shrink-0">
                          -{r.impact.toLocaleString("de-DE")} €
                        </span>
                      </div>
                    ))}
                    {data.risks.length === 0 && (
                      <p className="text-sm text-muted-foreground">Keine Risiken erkannt</p>
                    )}
                  </div>
                </SimulationPanel>
              </AnimatedCard>

              {/* Next Actions */}
              <AnimatedCard index={6}>
                <SimulationPanel title="Next Actions">
                  <div className="space-y-2">
                    {data.actions.map((a) => (
                      <ActionCard key={a.id} label={a.label} priority={a.priority} blocker={a.blocker} />
                    ))}
                    {data.actions.length === 0 && (
                      <p className="text-sm text-muted-foreground">Alle Aufgaben erledigt ✓</p>
                    )}
                  </div>
                </SimulationPanel>
              </AnimatedCard>
            </div>

            {/* Data sources */}
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {[
                { ok: data.input.hasFinancialModel, label: "Finanzen" },
                { ok: data.input.hasBrandProfile, label: "Profil" },
                { ok: data.input.hasProductionPlan, label: "Produktion" },
                { ok: data.input.hasCompliancePlan, label: "Compliance" },
                { ok: data.input.hasLaunchPlan, label: "Launch" },
                { ok: data.input.hasBrandIdentity, label: "Marke" },
              ].map((d) => (
                <span key={d.label} className={cn("rounded-full border px-2.5 py-1", d.ok ? "border-success/30 text-success" : "border-border text-muted-foreground")}>
                  {d.ok ? "✓" : "✗"} {d.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
