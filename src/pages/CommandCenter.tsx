import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { MoneyCard } from "@/components/dashboard/MoneyCard";
import { RiskCard } from "@/components/dashboard/RiskCard";
import { ExecutionCard } from "@/components/dashboard/ExecutionCard";
import { DecisionSimulator } from "@/components/dashboard/DecisionSimulator";
import { FailureCostCards } from "@/components/dashboard/FailureCostCards";
import { PhaseStepper } from "@/components/dashboard/PhaseStepper";
import { ExplainabilityPanel } from "@/components/dashboard/ExplainabilityPanel";
import { SEO } from "@/components/SEO";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import type { ScenarioMode } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Database } from "lucide-react";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistisch" },
  { value: "realistic", label: "Realistisch" },
  { value: "worst-case", label: "Worst Case" },
];

export default function CommandCenter() {
  const [mode, setMode] = useState<ScenarioMode>("realistic");
  const data = useCommandCenterData(mode);

  return (
    <DashboardLayout>
      <SEO
        title="Command Center – BrandOS"
        description="Dein strategisches Cockpit: Confidence, Risk, Runway und Execution auf einen Blick."
        path="/dashboard/command"
      />
      <div className="animate-fade-in space-y-8">
        <PageHeader
          title="Command Center"
          description="Dein strategisches Cockpit – alle kritischen Kennzahlen auf einen Blick."
        />

        {/* No brand or insufficient data */}
        {(!data.ready || !data.sufficient) && (
          <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium">Nicht genügend Daten</p>
              <p className="text-xs text-muted-foreground">
                Fülle mindestens die Finanzkalkulation oder dein Markenprofil aus, um Live-Daten zu sehen.
              </p>
            </div>
          </div>
        )}

        {data.ready && data.sufficient && (
          <>
            {/* Live data badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              <span>Berechnet aus deinen Daten</span>
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            </div>

            {/* Status Bar – 6 metrics */}
            <StatusBar status={data.status} />

            {/* Reality Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reality Mode</span>
              <div className="inline-flex rounded-lg bg-muted p-1">
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

            {/* Top 3 Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <MoneyCard data={data.money} />
              <RiskCard risks={data.risks} />
              <ExecutionCard actions={data.actions} />
            </div>

            <ExplainabilityPanel
              reasoning="Alle Werte werden live aus deinem Markenprofil, Finanzmodell, Compliance- und Produktionsdaten berechnet. Kein Demo – echte Zahlen."
              dataUsed={[
                data.input.hasFinancialModel ? "✓ Finanzkalkulation" : "✗ Finanzkalkulation",
                data.input.hasBrandProfile ? "✓ Markenprofil" : "✗ Markenprofil",
                data.input.hasProductionPlan ? "✓ Produktionsplan" : "✗ Produktionsplan",
                data.input.hasCompliancePlan ? "✓ Compliance" : "✗ Compliance",
                data.input.hasLaunchPlan ? "✓ Launch-Plan" : "✗ Launch-Plan",
                data.input.hasBrandIdentity ? "✓ Markenidentität" : "✗ Markenidentität",
              ]}
              confidence={data.status.riskLevel}
            />

            {/* Phase Stepper */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Founder Journey
              </h2>
              <PhaseStepper />
            </section>

            {/* Decision Simulator */}
            <DecisionSimulator />

            {/* Failure Cost Cards */}
            <FailureCostCards />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
