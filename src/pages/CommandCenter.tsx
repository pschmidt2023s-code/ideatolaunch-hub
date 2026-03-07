import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardCard, MetricDisplay, RiskIndicator, ActionCard, SimulationPanel } from "@/components/dashboard/PremiumComponents";
import { SEO } from "@/components/SEO";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import { useMode } from "@/hooks/useMode";
import { useNavigate } from "react-router-dom";
import type { ScenarioMode } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Activity, ArrowRight, Crosshair, TrendingUp, PieChart, Brain } from "lucide-react";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { Button } from "@/components/ui/button";

import { getTradingDefaults, buildTradingStatus, buildTradingMoney, buildTradingRisks, buildTradingActions, calculateProfitFactor, calculateExpectancy, calculateAccountSurvival } from "@/lib/trading-engine";
import { getInvestorDefaults, buildInvestorStatus, buildInvestorMoney, buildInvestorRisks, buildInvestorActions, calculatePortfolioRisk } from "@/lib/investor-engine";
import { getStrategyDefaults, buildStrategyStatus, buildStrategyMoney, buildStrategyRisks, buildStrategyActions, calculateDecisionRisk } from "@/lib/strategy-engine";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistic" },
  { value: "realistic", label: "Realistic" },
  { value: "worst-case", label: "Worst Case" },
];

const MODE_META = {
  founder: { label: "Founder", icon: Crosshair, dashboardLink: null, color: "text-accent" },
  trading: { label: "Trading", icon: TrendingUp, dashboardLink: "/dashboard/trading", color: "text-blue-500" },
  investor: { label: "Investor", icon: PieChart, dashboardLink: "/dashboard/investor", color: "text-emerald-500" },
  strategy: { label: "Strategy", icon: Brain, dashboardLink: "/dashboard/strategy", color: "text-violet-500" },
} as const;

export default function CommandCenter() {
  const [scenario, setScenario] = useState<ScenarioMode>("realistic");
  const { mode } = useMode();
  const navigate = useNavigate();

  const founderData = useCommandCenterData(scenario);
  const tradingInput = getTradingDefaults();
  const investorInput = getInvestorDefaults();
  const strategyInput = getStrategyDefaults();

  const meta = MODE_META[mode] || MODE_META.founder;
  const ModeIcon = meta.icon;

  const getMetrics = () => {
    switch (mode) {
      case "trading": {
        const status = buildTradingStatus(tradingInput, scenario);
        const money = buildTradingMoney(tradingInput, scenario);
        const pf = calculateProfitFactor(tradingInput);
        const exp = calculateExpectancy(tradingInput);
        const surv = calculateAccountSurvival(tradingInput);
        return {
          status, money,
          risks: buildTradingRisks(tradingInput),
          actions: buildTradingActions(tradingInput),
          hero: { label: "Trading Risk Score", value: status.founderRiskIndex, max: 100, level: status.riskLevel },
          cards: [
            { label: "Profit Factor", value: pf.toFixed(2), level: pf >= 1.5 ? "low" as const : pf >= 1 ? "medium" as const : "high" as const, progress: Math.min(100, pf * 33) },
            { label: "Account Survival", value: `${surv}%`, level: surv > 80 ? "low" as const : surv > 50 ? "medium" as const : "high" as const, progress: surv },
            { label: "Expectancy", value: `${exp > 0 ? "+" : ""}${exp} €`, level: exp > 0 ? "low" as const : "high" as const },
          ],
          ready: true, sufficient: true,
        };
      }
      case "investor": {
        const status = buildInvestorStatus(investorInput, scenario);
        const money = buildInvestorMoney(investorInput, scenario);
        const pr = calculatePortfolioRisk(investorInput);
        return {
          status, money,
          risks: buildInvestorRisks(investorInput),
          actions: buildInvestorActions(investorInput),
          hero: { label: "Portfolio Risk", value: pr, max: 100, level: pr > 70 ? "low" as const : pr > 40 ? "medium" as const : "high" as const },
          cards: [
            { label: "Capital Health", value: `${100 - status.capitalPressure}`, sub: "/ 100", level: status.capitalPressure <= 30 ? "low" as const : status.capitalPressure <= 60 ? "medium" as const : "high" as const, progress: 100 - status.capitalPressure },
            { label: "Annual Return", value: `${investorInput.annualReturn}%`, level: investorInput.annualReturn > 5 ? "low" as const : investorInput.annualReturn > 0 ? "medium" as const : "high" as const, progress: Math.min(100, investorInput.annualReturn * 5) },
            { label: "Drawdown", value: `${investorInput.portfolioDrawdown}%`, level: investorInput.portfolioDrawdown < 10 ? "low" as const : "high" as const, progress: investorInput.portfolioDrawdown * 2 },
          ],
          ready: true, sufficient: true,
        };
      }
      case "strategy": {
        const status = buildStrategyStatus(strategyInput, scenario);
        const money = buildStrategyMoney(strategyInput, scenario);
        const dr = calculateDecisionRisk(strategyInput);
        return {
          status, money,
          risks: buildStrategyRisks(strategyInput),
          actions: buildStrategyActions(strategyInput),
          hero: { label: "Decision Score", value: dr, max: 100, level: dr > 70 ? "low" as const : dr > 40 ? "medium" as const : "high" as const },
          cards: [
            { label: "Success Rate", value: `${strategyInput.successRate}%`, level: strategyInput.successRate > 65 ? "low" as const : strategyInput.successRate > 50 ? "medium" as const : "high" as const, progress: strategyInput.successRate },
            { label: "Risk Exposure", value: `${Math.round(strategyInput.riskExposure / 1000)}k €`, level: strategyInput.riskExposure / strategyInput.capitalAtStake > 0.4 ? "high" as const : "medium" as const, progress: Math.min(100, (strategyInput.riskExposure / strategyInput.capitalAtStake) * 100) },
            { label: "Open Decisions", value: `${strategyInput.openDecisions}`, level: strategyInput.openDecisions > 5 ? "high" as const : strategyInput.openDecisions > 3 ? "medium" as const : "low" as const },
          ],
          ready: true, sufficient: true,
        };
      }
      default: {
        const s = founderData.status;
        return {
          status: s, money: founderData.money,
          risks: founderData.risks,
          actions: founderData.actions,
          hero: { label: "Founder Risk Index", value: s.founderRiskIndex, max: 100, level: s.founderRiskIndex <= 30 ? "high" as const : s.founderRiskIndex <= 60 ? "medium" as const : "low" as const },
          cards: [
            { label: "Capital Health", value: `${100 - s.capitalPressure}`, sub: "/ 100", level: s.capitalPressure <= 30 ? "low" as const : s.capitalPressure <= 60 ? "medium" as const : "high" as const, progress: 100 - s.capitalPressure },
            { label: "Runway", value: `${s.runwayMonths}`, sub: "Monate", level: s.runwayMonths >= 10 ? "low" as const : s.runwayMonths >= 5 ? "medium" as const : "high" as const, progress: Math.min(100, (s.runwayMonths / 18) * 100) },
            { label: "Break-even", value: s.breakEvenDate, size: "sm" as const },
          ],
          ready: founderData.ready,
          sufficient: founderData.sufficient,
        };
      }
    }
  };

  const metrics = getMetrics();
  const heroLevel = metrics.hero.level;
  const heroColor = heroLevel === "low" ? "text-success" : heroLevel === "medium" ? "text-warning" : "text-destructive";

  return (
    <DashboardLayout>
      <SEO title="Command Center – BrandOS" description="Dein strategisches Cockpit." path="/dashboard/command" />
      <div className="animate-fade-in space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-muted", meta.color)}>
              <ModeIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Command Center</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">{meta.label} Mode · Live</span>
              </div>
            </div>
          </div>

          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
            {MODES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setScenario(value)}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-xs font-medium transition-all",
                  scenario === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Insufficient data ── */}
        {(!metrics.ready || !metrics.sufficient) && (
          <AnimatedCard index={0}>
            <div className="rounded-xl border border-warning/20 bg-warning/5 p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Nicht genügend Daten</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mode === "founder"
                    ? "Fülle mindestens die Finanzkalkulation oder dein Markenprofil in der Founder Journey aus, um dein Cockpit zu aktivieren."
                    : `Gehe zum ${meta.label} Dashboard, um deine Parameter einzustellen.`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5 text-xs"
                  onClick={() => navigate(meta.dashboardLink || "/dashboard")}
                >
                  {mode === "founder" ? "Zur Founder Journey" : `Zum ${meta.label} Dashboard`}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </AnimatedCard>
        )}

        {metrics.ready && metrics.sufficient && (
          <>
            {/* ── Hero Score + Secondary Metrics ── */}
            <div className="grid gap-4 lg:grid-cols-4">
              {/* Hero score - larger card */}
              <AnimatedCard index={0}>
                <DashboardCard className="lg:row-span-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metrics.hero.label}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className={cn("text-4xl font-bold tabular-nums", heroColor)}>
                        {metrics.hero.value}
                      </span>
                      <span className="text-sm text-muted-foreground">/ {metrics.hero.max}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000",
                          heroLevel === "low" ? "bg-success" : heroLevel === "medium" ? "bg-warning" : "bg-destructive"
                        )}
                        style={{ width: `${Math.min(100, Math.max(0, (metrics.hero.value / metrics.hero.max) * 100))}%` }}
                      />
                    </div>
                    <RiskIndicator level={heroLevel} />
                  </div>
                </DashboardCard>
              </AnimatedCard>

              {/* Secondary metrics */}
              {metrics.cards.map((card, i) => (
                <AnimatedCard key={card.label} index={i + 1}>
                  <DashboardCard>
                    <MetricDisplay
                      label={card.label}
                      value={card.value}
                      sub={card.sub}
                      level={card.level}
                      progress={card.progress}
                      size={card.size}
                    />
                  </DashboardCard>
                </AnimatedCard>
              ))}
            </div>

            {/* ── Next Action Banner ── */}
            {metrics.actions.length > 0 && (
              <AnimatedCard index={4}>
                <button
                  onClick={() => {
                    if (mode === "founder") navigate("/dashboard");
                    else if (meta.dashboardLink) navigate(meta.dashboardLink);
                  }}
                  className="w-full flex items-center gap-4 rounded-xl border-2 border-accent/30 bg-accent/5 p-4 text-left hover:border-accent/50 transition-all"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-0.5">Nächste Aktion</p>
                    <p className="text-sm font-semibold truncate">{metrics.actions[0].label}</p>
                    {metrics.actions[0].blocker && (
                      <p className="text-[11px] text-destructive/80 mt-0.5">⚠ {metrics.actions[0].blocker}</p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent shrink-0" />
                </button>
              </AnimatedCard>
            )}

            {/* ── Details Grid ── */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Financials */}
              <AnimatedCard index={5}>
                <SimulationPanel title={mode === "trading" ? "P&L" : mode === "investor" ? "Returns" : mode === "strategy" ? "Impact" : "Cashflow"}>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {mode === "trading" ? "Profit Factor" : mode === "investor" ? "Rendite" : mode === "strategy" ? "Erfolgsrate" : "Marge"}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className={cn("text-2xl font-bold tabular-nums", metrics.money.margin >= 30 ? "text-success" : metrics.money.margin >= 15 ? "text-warning" : "text-destructive")}>
                          {metrics.money.margin}{mode === "trading" ? "" : "%"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {metrics.money.margin >= 30 ? "Gesund" : metrics.money.margin >= 15 ? "Okay" : "Kritisch"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {mode === "trading" ? "Monthly P&L" : mode === "investor" ? "Monthly Return" : "Cashflow / Monat"}
                      </p>
                      <span className={cn("text-lg font-semibold tabular-nums", metrics.money.cashflowMonthly >= 0 ? "text-success" : "text-destructive")}>
                        {metrics.money.cashflowMonthly >= 0 ? "+" : ""}{metrics.money.cashflowMonthly.toLocaleString("de-DE")} €
                      </span>
                    </div>

                    <div className="border-t border-border pt-3 space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{mode === "trading" ? "Drawdown" : mode === "investor" ? "Investiert" : "Kapital verwendet"}</span>
                        <span className="font-medium tabular-nums">{metrics.money.totalCapital > 0 ? Math.round((metrics.money.capitalUsed / metrics.money.totalCapital) * 100) : 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700",
                            metrics.money.totalCapital > 0 && metrics.money.capitalUsed / metrics.money.totalCapital > 0.8 ? "bg-destructive" :
                            metrics.money.totalCapital > 0 && metrics.money.capitalUsed / metrics.money.totalCapital > 0.5 ? "bg-warning" : "bg-success"
                          )}
                          style={{ width: `${metrics.money.totalCapital > 0 ? Math.round((metrics.money.capitalUsed / metrics.money.totalCapital) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </SimulationPanel>
              </AnimatedCard>

              {/* Risks */}
              <AnimatedCard index={6}>
                <SimulationPanel title="Top Risiken">
                  <div className="space-y-3">
                    {metrics.risks.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success/10 mb-2">
                          <Activity className="h-5 w-5 text-success" />
                        </div>
                        <p className="text-sm font-medium text-success">Keine Risiken erkannt</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Alle Bereiche im grünen Bereich.</p>
                      </div>
                    ) : (
                      metrics.risks.map((r) => (
                        <div key={r.id} className="rounded-lg border p-3 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <RiskIndicator level={r.level} size="sm" label="" />
                              <span className="text-sm font-medium truncate">{r.title}</span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums text-destructive shrink-0">
                              -{r.impact.toLocaleString("de-DE")} €
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground pl-4">
                            {r.level === "high" ? "Sofort handeln" : r.level === "medium" ? "Beobachten" : "Unter Kontrolle"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </SimulationPanel>
              </AnimatedCard>

              {/* Actions */}
              <AnimatedCard index={7}>
                <SimulationPanel title="Offene Aktionen">
                  <div className="space-y-2">
                    {metrics.actions.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm font-medium text-success">Alle Aufgaben erledigt ✓</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Weiter so!</p>
                      </div>
                    ) : (
                      metrics.actions.map((a) => (
                        <ActionCard key={a.id} label={a.label} priority={a.priority} blocker={a.blocker} />
                      ))
                    )}
                  </div>
                </SimulationPanel>
              </AnimatedCard>
            </div>

            {/* ── Data Sources (founder only) ── */}
            {mode === "founder" && (
              <AnimatedCard index={8}>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Datenquellen</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { ok: founderData.input.hasFinancialModel, label: "Finanzen", step: 2 },
                      { ok: founderData.input.hasBrandProfile, label: "Profil", step: 1 },
                      { ok: founderData.input.hasProductionPlan, label: "Produktion", step: 3 },
                      { ok: founderData.input.hasCompliancePlan, label: "Compliance", step: 4 },
                      { ok: founderData.input.hasLaunchPlan, label: "Launch", step: 5 },
                      { ok: founderData.input.hasBrandIdentity, label: "Marke", step: 1 },
                    ].map((d) => (
                      <button
                        key={d.label}
                        onClick={() => navigate(`/dashboard/step/${d.step}`)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/50",
                          d.ok ? "border-success/30 text-success" : "border-border text-muted-foreground"
                        )}
                      >
                        {d.ok ? "✓" : "○"} {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* ── Mode Dashboard Link ── */}
            {meta.dashboardLink && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => navigate(meta.dashboardLink!)}
                >
                  Zum {meta.label} Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
