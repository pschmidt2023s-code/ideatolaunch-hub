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
import { Activity, PieChart, Wallet, TrendingUp, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScenarioMode } from "@/lib/command-center-types";
import {
  getInvestorDefaults,
  buildInvestorStatus,
  buildInvestorMoney,
  buildInvestorRisks,
  buildInvestorActions,
  calculatePortfolioRisk,
  type InvestorInput,
} from "@/lib/investor-engine";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistisch" },
  { value: "realistic", label: "Realistisch" },
  { value: "worst-case", label: "Worst Case" },
];

export default function InvestorDashboard() {
  const [mode, setMode] = useState<ScenarioMode>("realistic");
  const [input, setInput] = useState<InvestorInput>(getInvestorDefaults());

  const update = (key: keyof InvestorInput, value: number) => setInput((p) => ({ ...p, [key]: value }));

  const status = buildInvestorStatus(input, mode);
  const money = buildInvestorMoney(input, mode);
  const risks = buildInvestorRisks(input);
  const actions = buildInvestorActions(input);
  const portfolioRisk = calculatePortfolioRisk(input);

  // Allocation breakdown
  const allocations = [
    { label: "Aktien", pct: input.equityExposure, color: "bg-chart-1" },
    { label: "Anleihen", pct: input.bondExposure, color: "bg-chart-2" },
    { label: "Crypto", pct: input.cryptoExposure, color: "bg-chart-3" },
    { label: "Immobilien", pct: input.realEstateExposure, color: "bg-chart-4" },
    { label: "Cash", pct: input.cashPosition, color: "bg-muted-foreground" },
  ];

  return (
    <DashboardLayout>
      <SEO title="Investor Mode – BrandOS" description="Portfolio Risk Score, Asset Allocation, Capital Growth." path="/dashboard/investor" />
      <div className="animate-fade-in space-y-8">
        <PageHeader title="Investor Mode" description="Portfolio Risk, Allocation & Capital Growth im Überblick." badge="INVESTOR" badgeVariant="warning" />

        <CEOSection>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            <span>Simulation – passe dein Portfolio an</span>
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

          {/* Asset Allocation Bar */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-accent" /> Asset Allocation
            </h3>
            <div className="flex h-6 rounded-full overflow-hidden">
              {allocations.filter(a => a.pct > 0).map((a) => (
                <div key={a.label} className={cn("transition-all", a.color)} style={{ width: `${a.pct}%` }} title={`${a.label}: ${a.pct}%`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {allocations.map((a) => (
                <div key={a.label} className="flex items-center gap-1.5">
                  <div className={cn("h-2.5 w-2.5 rounded-full", a.color)} />
                  <span className="text-muted-foreground">{a.label}</span>
                  <span className="font-medium">{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Portfolio Risk", value: `${portfolioRisk}/100`, icon: ShieldAlert, color: portfolioRisk > 70 ? "text-success" : portfolioRisk > 40 ? "text-warning" : "text-destructive" },
              { label: "Rendite p.a.", value: `${input.annualReturn}%`, icon: TrendingUp, color: input.annualReturn > 5 ? "text-success" : input.annualReturn > 0 ? "text-warning" : "text-destructive" },
              { label: "Dividende p.a.", value: `${input.dividendYield}%`, icon: Wallet, color: "text-chart-2" },
              { label: "Drawdown", value: `${input.portfolioDrawdown}%`, icon: ShieldAlert, color: input.portfolioDrawdown < 10 ? "text-success" : "text-destructive" },
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
          <h3 className="text-sm font-semibold">Portfolio-Parameter anpassen</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "totalPortfolio" as const, label: "Gesamtportfolio (€)", min: 5000, max: 1000000, step: 5000 },
              { key: "equityExposure" as const, label: "Aktien (%)", min: 0, max: 100, step: 5 },
              { key: "bondExposure" as const, label: "Anleihen (%)", min: 0, max: 100, step: 5 },
              { key: "cryptoExposure" as const, label: "Crypto (%)", min: 0, max: 100, step: 5 },
              { key: "cashPosition" as const, label: "Cash (%)", min: 0, max: 100, step: 5 },
              { key: "annualReturn" as const, label: "Rendite p.a. (%)", min: -20, max: 50, step: 1 },
              { key: "portfolioDrawdown" as const, label: "Drawdown (%)", min: 0, max: 50, step: 1 },
              { key: "concentrationRisk" as const, label: "Konzentration (0-100)", min: 0, max: 100, step: 5 },
              { key: "dividendYield" as const, label: "Dividendenrendite (%)", min: 0, max: 15, step: 0.5 },
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
