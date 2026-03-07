import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardCard, MetricDisplay, RiskIndicator, ActionCard, SimulationPanel } from "@/components/dashboard/PremiumComponents";
import { SEO } from "@/components/SEO";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import { useMode } from "@/hooks/useMode";
import { useNavigate } from "react-router-dom";
import type { ScenarioMode } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Activity, ArrowRight, Crosshair, TrendingUp, PieChart, Brain, Zap, Shield, DollarSign, Clock } from "lucide-react";
import { AIPageInsights } from "@/components/AIPageInsights";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { getTradingDefaults, buildTradingStatus, buildTradingMoney, buildTradingRisks, buildTradingActions, calculateProfitFactor, calculateExpectancy, calculateAccountSurvival } from "@/lib/trading-engine";
import { getInvestorDefaults, buildInvestorStatus, buildInvestorMoney, buildInvestorRisks, buildInvestorActions, calculatePortfolioRisk } from "@/lib/investor-engine";
import { getStrategyDefaults, buildStrategyStatus, buildStrategyMoney, buildStrategyRisks, buildStrategyActions, calculateDecisionRisk } from "@/lib/strategy-engine";

const MODES: { value: ScenarioMode; label: string; desc: string }[] = [
  { value: "optimistic", label: "Optimistic", desc: "Best case" },
  { value: "realistic", label: "Realistic", desc: "Most likely" },
  { value: "worst-case", label: "Worst Case", desc: "Prepare" },
];

const MODE_META = {
  founder: { label: "Founder", icon: Crosshair, dashboardLink: null, color: "text-accent", gradient: "from-accent/20 to-accent/5" },
  trading: { label: "Trading", icon: TrendingUp, dashboardLink: "/dashboard/trading", color: "text-blue-500", gradient: "from-blue-500/20 to-blue-500/5" },
  investor: { label: "Investor", icon: PieChart, dashboardLink: "/dashboard/investor", color: "text-emerald-500", gradient: "from-emerald-500/20 to-emerald-500/5" },
  strategy: { label: "Strategy", icon: Brain, dashboardLink: "/dashboard/strategy", color: "text-violet-500", gradient: "from-violet-500/20 to-violet-500/5" },
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
            { label: "Profit Factor", value: pf.toFixed(2), level: pf >= 1.5 ? "low" as const : pf >= 1 ? "medium" as const : "high" as const, progress: Math.min(100, pf * 33), icon: DollarSign },
            { label: "Account Survival", value: `${surv}%`, level: surv > 80 ? "low" as const : surv > 50 ? "medium" as const : "high" as const, progress: surv, icon: Shield },
            { label: "Expectancy", value: `${exp > 0 ? "+" : ""}${exp} €`, level: exp > 0 ? "low" as const : "high" as const, icon: Zap },
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
            { label: "Capital Health", value: `${100 - status.capitalPressure}`, sub: "/ 100", level: status.capitalPressure <= 30 ? "low" as const : status.capitalPressure <= 60 ? "medium" as const : "high" as const, progress: 100 - status.capitalPressure, icon: Shield },
            { label: "Annual Return", value: `${investorInput.annualReturn}%`, level: investorInput.annualReturn > 5 ? "low" as const : investorInput.annualReturn > 0 ? "medium" as const : "high" as const, progress: Math.min(100, investorInput.annualReturn * 5), icon: TrendingUp },
            { label: "Drawdown", value: `${investorInput.portfolioDrawdown}%`, level: investorInput.portfolioDrawdown < 10 ? "low" as const : "high" as const, progress: investorInput.portfolioDrawdown * 2, icon: AlertTriangle },
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
            { label: "Success Rate", value: `${strategyInput.successRate}%`, level: strategyInput.successRate > 65 ? "low" as const : strategyInput.successRate > 50 ? "medium" as const : "high" as const, progress: strategyInput.successRate, icon: Crosshair },
            { label: "Risk Exposure", value: `${Math.round(strategyInput.riskExposure / 1000)}k €`, level: strategyInput.riskExposure / strategyInput.capitalAtStake > 0.4 ? "high" as const : "medium" as const, progress: Math.min(100, (strategyInput.riskExposure / strategyInput.capitalAtStake) * 100), icon: AlertTriangle },
            { label: "Open Decisions", value: `${strategyInput.openDecisions}`, level: strategyInput.openDecisions > 5 ? "high" as const : strategyInput.openDecisions > 3 ? "medium" as const : "low" as const, icon: Clock },
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
            { label: "Capital Health", value: `${100 - s.capitalPressure}`, sub: "/ 100", level: s.capitalPressure <= 30 ? "low" as const : s.capitalPressure <= 60 ? "medium" as const : "high" as const, progress: 100 - s.capitalPressure, icon: Shield },
            { label: "Runway", value: `${s.runwayMonths}`, sub: "Monate", level: s.runwayMonths >= 10 ? "low" as const : s.runwayMonths >= 5 ? "medium" as const : "high" as const, progress: Math.min(100, (s.runwayMonths / 18) * 100), icon: Clock },
            { label: "Break-even", value: s.breakEvenDate, size: "sm" as const, icon: DollarSign },
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
  const heroBarColor = heroLevel === "low" ? "bg-success" : heroLevel === "medium" ? "bg-warning" : "bg-destructive";

  return (
    <DashboardLayout>
      <SEO title="Command Center – BrandOS" description="Dein strategisches Cockpit." path="/dashboard/command" />
      <div className="animate-fade-in space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br", meta.gradient)}>
              <ModeIcon className={cn("h-5 w-5", meta.color)} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Command Center</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span className="text-xs text-muted-foreground">{meta.label} Mode · Live</span>
              </div>
            </div>
          </div>

          <div className="inline-flex rounded-2xl border border-border p-1 bg-muted/30 backdrop-blur-sm">
            {MODES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setScenario(value)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-medium transition-all",
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
            <div className="rounded-2xl border border-warning/20 bg-gradient-to-r from-warning/5 to-transparent p-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Nicht genügend Daten</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
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
              {/* Hero score */}
              <AnimatedCard index={0}>
                <DashboardCard className="lg:row-span-1 flex flex-col justify-between relative overflow-hidden">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.03] pointer-events-none", meta.gradient)} />
                  <div className="relative">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metrics.hero.label}</p>
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className={cn("text-5xl font-bold tabular-nums tracking-tight", heroColor)}>
                        {metrics.hero.value}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">/ {metrics.hero.max}</span>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2 relative">
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", heroBarColor)}
                        style={{ width: `${Math.min(100, Math.max(0, (metrics.hero.value / metrics.hero.max) * 100))}%` }}
                      />
                    </div>
                    <RiskIndicator level={heroLevel} />
                  </div>
                </DashboardCard>
              </AnimatedCard>

              {/* Secondary metrics with icons */}
              {metrics.cards.map((card, i) => {
                const CardIcon = (card as any).icon;
                return (
                  <AnimatedCard key={card.label} index={i + 1}>
                    <DashboardCard className="relative overflow-hidden">
                      {CardIcon && (
                        <div className="absolute top-4 right-4 opacity-[0.07]">
                          <CardIcon className="h-12 w-12" />
                        </div>
                      )}
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
                );
              })}
            </div>

            {/* ── Next Action Banner ── */}
            {metrics.actions.length > 0 && (
              <AnimatedCard index={4}>
                <button
                  onClick={() => {
                    if (mode === "founder") navigate("/dashboard");
                    else if (meta.dashboardLink) navigate(meta.dashboardLink);
                  }}
                  className="w-full flex items-center gap-4 rounded-2xl border-2 border-accent/30 bg-gradient-to-r from-accent/5 to-transparent p-5 text-left hover:border-accent/50 hover:from-accent/10 transition-all group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-sm group-hover:scale-105 transition-transform">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-0.5">Nächste Aktion</p>
                    <p className="text-sm font-semibold truncate">{metrics.actions[0].label}</p>
                    {metrics.actions[0].blocker && (
                      <p className="text-[11px] text-destructive/80 mt-0.5">⚠ {metrics.actions[0].blocker}</p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent shrink-0 group-hover:translate-x-1 transition-transform" />
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
                      <div className="flex items-baseline gap-2">
                        <span className={cn("text-3xl font-bold tabular-nums tracking-tight", metrics.money.margin >= 30 ? "text-success" : metrics.money.margin >= 15 ? "text-warning" : "text-destructive")}>
                          {metrics.money.margin}{mode === "trading" ? "" : "%"}
                        </span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                          metrics.money.margin >= 30 ? "bg-success/10 text-success" : metrics.money.margin >= 15 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                        )}>
                          {metrics.money.margin >= 30 ? "Gesund" : metrics.money.margin >= 15 ? "Okay" : "Kritisch"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {mode === "trading" ? "Monthly P&L" : mode === "investor" ? "Monthly Return" : "Cashflow / Monat"}
                      </p>
                      <span className={cn("text-xl font-bold tabular-nums", metrics.money.cashflowMonthly >= 0 ? "text-success" : "text-destructive")}>
                        {metrics.money.cashflowMonthly >= 0 ? "+" : ""}{metrics.money.cashflowMonthly.toLocaleString("de-DE")} €
                      </span>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">{mode === "trading" ? "Drawdown" : mode === "investor" ? "Investiert" : "Kapital verwendet"}</span>
                        <span className="font-semibold tabular-nums">{metrics.money.totalCapital > 0 ? Math.round((metrics.money.capitalUsed / metrics.money.totalCapital) * 100) : 0}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700",
                            metrics.money.totalCapital > 0 && metrics.money.capitalUsed / metrics.money.totalCapital > 0.8 ? "bg-destructive" :
                            metrics.money.totalCapital > 0 && metrics.money.capitalUsed / metrics.money.totalCapital > 0.5 ? "bg-warning" : "bg-success"
                          )}
                          style={{ width: `${metrics.money.totalCapital > 0 ? Math.round((metrics.money.capitalUsed / metrics.money.totalCapital) * 100) : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>0 €</span>
                        <span>{metrics.money.totalCapital.toLocaleString("de-DE")} €</span>
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
                      <div className="text-center py-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 mb-3">
                          <Shield className="h-6 w-6 text-success" />
                        </div>
                        <p className="text-sm font-semibold text-success">Keine Risiken erkannt</p>
                        <p className="text-xs text-muted-foreground mt-1">Alle Bereiche im grünen Bereich.</p>
                      </div>
                    ) : (
                      metrics.risks.map((r) => (
                        <div key={r.id} className="rounded-xl border p-3.5 space-y-1.5 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <RiskIndicator level={r.level} size="sm" label="" />
                              <span className="text-sm font-medium truncate">{r.title}</span>
                            </div>
                            <span className="text-sm font-bold tabular-nums text-destructive shrink-0">
                              -{r.impact.toLocaleString("de-DE")} €
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground pl-4">
                            {r.level === "high" ? "⚡ Sofort handeln" : r.level === "medium" ? "👀 Beobachten" : "✓ Unter Kontrolle"}
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
                      <div className="text-center py-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 mb-3">
                          <Activity className="h-6 w-6 text-success" />
                        </div>
                        <p className="text-sm font-semibold text-success">Alle Aufgaben erledigt ✓</p>
                        <p className="text-xs text-muted-foreground mt-1">Weiter so!</p>
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
                <div className="rounded-2xl border bg-card p-5">
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
                          "rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:shadow-sm",
                          d.ok ? "border-success/30 bg-success/5 text-success hover:bg-success/10" : "border-border text-muted-foreground hover:bg-muted/50"
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
                  className="gap-2 rounded-2xl"
                  onClick={() => navigate(meta.dashboardLink!)}
                >
                  Zum {meta.label} Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        <AIPageInsights
          pageContext="Command Center – Zentrale Übersicht mit KPIs, Risiken, Aktionen und Szenarien"
          title="AI Command Insights"
        />
      </div>
    </DashboardLayout>
  );
}
