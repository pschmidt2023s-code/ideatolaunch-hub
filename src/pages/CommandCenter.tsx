import { useState } from "react";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
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
import { ExecutionLeakDetector } from "@/components/dashboard/ExecutionLeakDetector";
import { WorkingCapitalEngine } from "@/components/dashboard/WorkingCapitalEngine";
import { DecisionEngineCard } from "@/components/dashboard/DecisionEngineCard";
import { ExecutionPressureBanner } from "@/components/dashboard/ExecutionPressureBanner";
import { CEOSection } from "@/components/dashboard/CEOSection";
import { SEO } from "@/components/SEO";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import type { ScenarioMode } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Database, Activity } from "lucide-react";

const MODES: { value: ScenarioMode; label: string; desc: string }[] = [
  { value: "optimistic", label: "Optimistisch", desc: "Best case" },
  { value: "realistic", label: "Realistisch", desc: "Basis" },
  { value: "worst-case", label: "Worst Case", desc: "Stress test" },
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
          badge="CEO"
          badgeVariant="warning"
        />

        {/* No brand or insufficient data */}
        {(!data.ready || !data.sufficient) && (
          <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-5">
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
            {/* CEO Dark Section – KPIs + Cards */}
            <CEOSection>
              {/* Live data indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Live – berechnet aus deinen Daten</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                </div>
              </div>

              <ExecutionPressureBanner runwayMonths={data.status.runwayMonths} />
              <StatusBar status={data.status} />

              {/* Reality Mode Toggle */}
              <div className="flex items-center gap-4">
                <span className="section-label">Reality Mode</span>
                <div className="inline-flex rounded-2xl bg-muted p-1">
                  {MODES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setMode(value)}
                      className={cn(
                        "rounded-xl px-5 py-2 text-xs font-medium transition-all",
                        mode === value
                          ? "bg-accent text-accent-foreground shadow-sm"
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
                <AnimatedCard index={0}><MoneyCard data={data.money} /></AnimatedCard>
                <AnimatedCard index={1}><RiskCard risks={data.risks} /></AnimatedCard>
                <AnimatedCard index={2}><ExecutionCard actions={data.actions} /></AnimatedCard>
              </div>
            </CEOSection>

            {/* Capital Intelligence */}
            <div className="grid gap-5 sm:grid-cols-2">
              <WorkingCapitalEngine />
              <ExecutionLeakDetector />
            </div>

            {/* Decision Engine */}
            <DecisionEngineCard />

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
            <section className="space-y-4">
              <h2 className="section-label">Founder Journey</h2>
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
