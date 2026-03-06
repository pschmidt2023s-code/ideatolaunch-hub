import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { SEO } from "@/components/SEO";
import { Slider } from "@/components/ui/slider";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { MoneyCard } from "@/components/dashboard/MoneyCard";
import { RiskCard } from "@/components/dashboard/RiskCard";
import { ExecutionCard } from "@/components/dashboard/ExecutionCard";
import { CEOSection } from "@/components/dashboard/CEOSection";
import { Activity, Brain, Crosshair, Clock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScenarioMode } from "@/lib/command-center-types";
import {
  getStrategyDefaults,
  buildStrategyStatus,
  buildStrategyMoney,
  buildStrategyRisks,
  buildStrategyActions,
  calculateDecisionRisk,
  type StrategyInput,
} from "@/lib/strategy-engine";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistisch" },
  { value: "realistic", label: "Realistisch" },
  { value: "worst-case", label: "Worst Case" },
];

export default function StrategyDashboard() {
  const [mode, setMode] = useState<ScenarioMode>("realistic");
  const [input, setInput] = useState<StrategyInput>(getStrategyDefaults());

  const update = (key: keyof StrategyInput, value: number) => setInput((p) => ({ ...p, [key]: value }));

  const status = buildStrategyStatus(input, mode);
  const money = buildStrategyMoney(input, mode);
  const risks = buildStrategyRisks(input);
  const actions = buildStrategyActions(input);
  const decisionRisk = calculateDecisionRisk(input);

  return (
    <DashboardLayout>
      <SEO title="Strategy Mode – BrandOS" description="Decision Impact, Risk Impact, Profit Impact." path="/dashboard/strategy" />
      <div className="animate-fade-in space-y-8">
        <PageHeader title="Strategy Mode" description="Entscheidungen analysieren, Risiken quantifizieren, Profit maximieren." badge="STRATEGIST" badgeVariant="warning" />

        <CEOSection>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            <span>Decision Intelligence – passe deine Parameter an</span>
          </div>

          <StatusBar status={status} />

          <div className="flex items-center gap-4">
            <span className="section-label">Reality Mode</span>
            <div className="inline-flex rounded-2xl bg-muted p-1">
              {MODES.map(({ value, label }) => (
                <button key={value} onClick={() => setMode(value)} className={cn("rounded-xl px-5 py-2 text-xs font-medium transition-all", mode === value ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Decision Risk", value: `${decisionRisk}/100`, icon: Brain, color: decisionRisk > 70 ? "text-success" : decisionRisk > 40 ? "text-warning" : "text-destructive" },
              { label: "Erfolgsrate", value: `${input.successRate}%`, icon: Crosshair, color: input.successRate > 65 ? "text-success" : input.successRate > 50 ? "text-warning" : "text-destructive" },
              { label: "Ø Entscheidungszeit", value: `${input.timeToDecision}d`, icon: Clock, color: input.timeToDecision < 5 ? "text-success" : input.timeToDecision < 10 ? "text-warning" : "text-destructive" },
              { label: "Reversibilität", value: `${input.reversibilityScore}%`, icon: RotateCcw, color: input.reversibilityScore > 60 ? "text-success" : "text-warning" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border bg-card p-4 text-center">
                <kpi.icon className={cn("h-5 w-5 mx-auto mb-2", kpi.color)} />
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className={cn("text-2xl font-bold tabular-nums", kpi.color)}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatedCard index={0}><MoneyCard data={money} /></AnimatedCard>
            <AnimatedCard index={1}><RiskCard risks={risks} /></AnimatedCard>
            <AnimatedCard index={2}><ExecutionCard actions={actions} /></AnimatedCard>
          </div>
        </CEOSection>

        {/* Input Controls */}
        <div className="rounded-2xl border bg-card p-6 shadow-card space-y-6">
          <h3 className="text-sm font-semibold">Strategie-Parameter anpassen</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "decisionCount" as const, label: "Entscheidungen gesamt", min: 1, max: 50, step: 1 },
              { key: "openDecisions" as const, label: "Offene Entscheidungen", min: 0, max: 20, step: 1 },
              { key: "avgDecisionImpact" as const, label: "Ø Impact pro Entscheidung (€)", min: 500, max: 100000, step: 500 },
              { key: "riskExposure" as const, label: "Risk Exposure (€)", min: 0, max: 200000, step: 1000 },
              { key: "capitalAtStake" as const, label: "Capital at Stake (€)", min: 5000, max: 500000, step: 5000 },
              { key: "successRate" as const, label: "Erfolgsrate (%)", min: 10, max: 95, step: 5 },
              { key: "timeToDecision" as const, label: "Entscheidungszeit (Tage)", min: 1, max: 30, step: 1 },
              { key: "reversibilityScore" as const, label: "Reversibilität (0-100)", min: 0, max: 100, step: 5 },
            ].map((s) => (
              <div key={s.key} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs text-muted-foreground">{s.label}</label>
                  <span className="text-xs font-medium tabular-nums">{input[s.key]}</span>
                </div>
                <Slider min={s.min} max={s.max} step={s.step} value={[input[s.key]]} onValueChange={([v]) => update(s.key, v)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
