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
import { getMockData, type ScenarioMode } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistisch" },
  { value: "realistic", label: "Realistisch" },
  { value: "worst-case", label: "Worst Case" },
];

export default function CommandCenter() {
  const [mode, setMode] = useState<ScenarioMode>("realistic");
  const data = getMockData(mode);

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

        {/* Status Bar – 5 metrics */}
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
          reasoning="Die Werte basieren auf deinem aktuellen Brand-Profil, Finanzdaten und Lieferantenstatus. Mock-Daten werden verwendet, bis echte Daten vorliegen."
          dataUsed={["Brand-Profil", "Financial Model", "Supplier Risk Score", "Compliance Score"]}
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
      </div>
    </DashboardLayout>
  );
}
