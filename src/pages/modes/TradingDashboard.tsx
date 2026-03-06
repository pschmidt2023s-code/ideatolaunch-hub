import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { SEO } from "@/components/SEO";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { MoneyCard } from "@/components/dashboard/MoneyCard";
import { RiskCard } from "@/components/dashboard/RiskCard";
import { ExecutionCard } from "@/components/dashboard/ExecutionCard";
import { CEOSection } from "@/components/dashboard/CEOSection";
import { Activity, TrendingUp, Target, BarChart3, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScenarioMode } from "@/lib/command-center-types";
import {
  getTradingDefaults,
  buildTradingStatus,
  buildTradingMoney,
  buildTradingRisks,
  buildTradingActions,
  calculateProfitFactor,
  calculateExpectancy,
  calculateAccountSurvival,
  type TradingInput,
} from "@/lib/trading-engine";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistisch" },
  { value: "realistic", label: "Realistisch" },
  { value: "worst-case", label: "Worst Case" },
];

export default function TradingDashboard() {
  const [mode, setMode] = useState<ScenarioMode>("realistic");
  const [input, setInput] = useState<TradingInput>(getTradingDefaults());

  const update = (key: keyof TradingInput, value: number) => setInput((p) => ({ ...p, [key]: value }));

  const status = buildTradingStatus(input, mode);
  const money = buildTradingMoney(input, mode);
  const risks = buildTradingRisks(input);
  const actions = buildTradingActions(input);
  const pf = calculateProfitFactor(input);
  const expectancy = calculateExpectancy(input);
  const survival = calculateAccountSurvival(input);

  return (
    <DashboardLayout>
      <SEO title="Trading Mode – BrandOS" description="Trading Risk Score, Drawdown, Winrate, Profit Factor." path="/dashboard/trading" />
      <div className="animate-fade-in space-y-8">
        <PageHeader title="Trading Mode" description="Risk, Performance & Account Survival auf einen Blick." badge="TRADER" badgeVariant="warning" />

        <CEOSection>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              <span>Simulation – passe deine Werte an</span>
            </div>
          </div>

          <StatusBar status={status} />

          {/* Mode Toggle */}
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
              { label: "Profit Factor", value: pf.toFixed(2), icon: TrendingUp, color: pf >= 1.5 ? "text-success" : pf >= 1 ? "text-warning" : "text-destructive" },
              { label: "Expectancy", value: `${expectancy > 0 ? "+" : ""}${expectancy} €`, icon: Target, color: expectancy > 0 ? "text-success" : "text-destructive" },
              { label: "Account Survival", value: `${survival}%`, icon: Shield, color: survival > 80 ? "text-success" : survival > 50 ? "text-warning" : "text-destructive" },
              { label: "Drawdown", value: `${input.currentDrawdown}%`, icon: BarChart3, color: input.currentDrawdown < 10 ? "text-success" : input.currentDrawdown < 20 ? "text-warning" : "text-destructive" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border bg-card p-4 text-center">
                <kpi.icon className={cn("h-5 w-5 mx-auto mb-2", kpi.color)} />
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className={cn("text-2xl font-bold tabular-nums", kpi.color)}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Top 3 Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatedCard index={0}><MoneyCard data={money} /></AnimatedCard>
            <AnimatedCard index={1}><RiskCard risks={risks} /></AnimatedCard>
            <AnimatedCard index={2}><ExecutionCard actions={actions} /></AnimatedCard>
          </div>
        </CEOSection>

        {/* Input Controls */}
        <div className="rounded-2xl border bg-card p-6 shadow-card space-y-6">
          <h3 className="text-sm font-semibold">Trade-Parameter anpassen</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "accountBalance" as const, label: "Account Balance (€)", min: 1000, max: 500000, step: 1000 },
              { key: "riskPerTrade" as const, label: "Risk/Trade (%)", min: 0.5, max: 10, step: 0.5 },
              { key: "winrate" as const, label: "Winrate (%)", min: 20, max: 90, step: 1 },
              { key: "avgWin" as const, label: "Ø Win (€)", min: 10, max: 5000, step: 10 },
              { key: "avgLoss" as const, label: "Ø Loss (€)", min: 10, max: 5000, step: 10 },
              { key: "tradesPerMonth" as const, label: "Trades/Monat", min: 1, max: 200, step: 1 },
              { key: "currentDrawdown" as const, label: "Aktueller Drawdown (%)", min: 0, max: 50, step: 1 },
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
