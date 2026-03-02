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
import { Button } from "@/components/ui/button";
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
      <div className="animate-fade-in space-y-6">
        <PageHeader
          title="Command Center"
          description="Alle kritischen Kennzahlen auf einen Blick"
        />

        {/* Status Bar */}
        <StatusBar status={data.status} />

        {/* Reality Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reality Mode</span>
          <div className="inline-flex rounded-lg bg-muted p-1">
            {MODES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
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

        {/* Main Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MoneyCard data={data.money} />
          <RiskCard risks={data.risks} />
          <ExecutionCard actions={data.actions} />
        </div>

        <ExplainabilityPanel
          reasoning="Die Werte basieren auf deinem aktuellen Brand-Profil, Finanzdaten und Lieferantenstatus."
          dataUsed={["Brand-Profil", "Financial Model", "Supplier Risk Score", "Compliance Score"]}
          confidence={data.status.riskLevel}
        />

        {/* Phase Stepper */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Founder Journey
          </h2>
          <PhaseStepper />
        </div>

        {/* Decision Simulator */}
        <DecisionSimulator />

        {/* Failure Cost Cards */}
        <FailureCostCards />
      </div>
    </DashboardLayout>
  );
}
