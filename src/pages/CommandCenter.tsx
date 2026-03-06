import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardCard, MetricDisplay, RiskIndicator, ActionCard, SimulationPanel } from "@/components/dashboard/PremiumComponents";
import { SEO } from "@/components/SEO";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import { useMode } from "@/hooks/useMode";
import type { ScenarioMode } from "@/lib/command-center-types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Activity } from "lucide-react";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";

// Trading engine
import { getTradingDefaults, buildTradingStatus, buildTradingMoney, buildTradingRisks, buildTradingActions, calculateProfitFactor, calculateExpectancy, calculateAccountSurvival } from "@/lib/trading-engine";
// Investor engine
import { getInvestorDefaults, buildInvestorStatus, buildInvestorMoney, buildInvestorRisks, buildInvestorActions, calculatePortfolioRisk } from "@/lib/investor-engine";
// Strategy engine
import { getStrategyDefaults, buildStrategyStatus, buildStrategyMoney, buildStrategyRisks, buildStrategyActions, calculateDecisionRisk } from "@/lib/strategy-engine";

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "optimistic", label: "Optimistic" },
  { value: "realistic", label: "Realistic" },
  { value: "worst-case", label: "Worst Case" },
];

export default function CommandCenter() {
  const [scenario, setScenario] = useState<ScenarioMode>("realistic");
  const { mode } = useMode();

  // Founder data (from DB)
  const founderData = useCommandCenterData(scenario);

  // Trading data (local simulation)
  const tradingInput = getTradingDefaults();
  const tradingStatus = buildTradingStatus(tradingInput, scenario);
  const tradingMoney = buildTradingMoney(tradingInput, scenario);
  const tradingRisks = buildTradingRisks(tradingInput);
  const tradingActions = buildTradingActions(tradingInput);

  // Investor data
  const investorInput = getInvestorDefaults();
  const investorStatus = buildInvestorStatus(investorInput, scenario);
  const investorMoney = buildInvestorMoney(investorInput, scenario);
  const investorRisks = buildInvestorRisks(investorInput);
  const investorActions = buildInvestorActions(investorInput);

  // Strategy data
  const strategyInput = getStrategyDefaults();
  const strategyStatus = buildStrategyStatus(strategyInput, scenario);
  const strategyMoney = buildStrategyMoney(strategyInput, scenario);
  const strategyRisks = buildStrategyRisks(strategyInput);
  const strategyActions = buildStrategyActions(strategyInput);

  // Select data based on mode
  const modeLabel = mode === "founder" ? "Founder" : mode === "trading" ? "Trading" : mode === "investor" ? "Investor" : "Strategy";
  const modeLink = mode === "trading" ? "/dashboard/trading" : mode === "investor" ? "/dashboard/investor" : mode === "strategy" ? "/dashboard/strategy" : null;

  // Get current mode's metrics
  const getMetrics = () => {
    switch (mode) {
      case "trading": {
        const pf = calculateProfitFactor(tradingInput);
        const exp = calculateExpectancy(tradingInput);
        const surv = calculateAccountSurvival(tradingInput);
        return {
          status: tradingStatus,
          money: tradingMoney,
          risks: tradingRisks,
          actions: tradingActions,
          cards: [
            { label: "Trading Risk Score", value: tradingStatus.founderRiskIndex, sub: "/ 100", level: tradingStatus.riskLevel, progress: tradingStatus.founderRiskIndex },
            { label: "Profit Factor", value: pf.toFixed(2), level: pf >= 1.5 ? "low" as const : pf >= 1 ? "medium" as const : "high" as const, progress: Math.min(100, pf * 33) },
            { label: "Account Survival", value: `${surv}%`, level: surv > 80 ? "low" as const : surv > 50 ? "medium" as const : "high" as const, progress: surv },
            { label: "Expectancy", value: `${exp > 0 ? "+" : ""}${exp} €`, level: exp > 0 ? "low" as const : "high" as const },
          ],
          ready: true,
          sufficient: true,
        };
      }
      case "investor": {
        const pr = calculatePortfolioRisk(investorInput);
        return {
          status: investorStatus,
          money: investorMoney,
          risks: investorRisks,
          actions: investorActions,
          cards: [
            { label: "Portfolio Risk", value: `${pr}`, sub: "/ 100", level: pr > 70 ? "low" as const : pr > 40 ? "medium" as const : "high" as const, progress: pr },
            { label: "Capital Health", value: `${100 - investorStatus.capitalPressure}`, sub: "/ 100", level: investorStatus.capitalPressure <= 30 ? "low" as const : investorStatus.capitalPressure <= 60 ? "medium" as const : "high" as const, progress: 100 - investorStatus.capitalPressure },
            { label: "Annual Return", value: `${investorInput.annualReturn}%`, level: investorInput.annualReturn > 5 ? "low" as const : investorInput.annualReturn > 0 ? "medium" as const : "high" as const, progress: Math.min(100, investorInput.annualReturn * 5) },
            { label: "Drawdown", value: `${investorInput.portfolioDrawdown}%`, level: investorInput.portfolioDrawdown < 10 ? "low" as const : "high" as const, progress: investorInput.portfolioDrawdown * 2 },
          ],
          ready: true,
          sufficient: true,
        };
      }
      case "strategy": {
        const dr = calculateDecisionRisk(strategyInput);
        return {
          status: strategyStatus,
          money: strategyMoney,
          risks: strategyRisks,
          actions: strategyActions,
          cards: [
            { label: "Decision Score", value: `${dr}`, sub: "/ 100", level: dr > 70 ? "low" as const : dr > 40 ? "medium" as const : "high" as const, progress: dr },
            { label: "Success Rate", value: `${strategyInput.successRate}%`, level: strategyInput.successRate > 65 ? "low" as const : strategyInput.successRate > 50 ? "medium" as const : "high" as const, progress: strategyInput.successRate },
            { label: "Risk Exposure", value: `${Math.round(strategyInput.riskExposure / 1000)}k €`, level: strategyInput.riskExposure / strategyInput.capitalAtStake > 0.4 ? "high" as const : "medium" as const, progress: Math.min(100, (strategyInput.riskExposure / strategyInput.capitalAtStake) * 100) },
            { label: "Open Decisions", value: `${strategyInput.openDecisions}`, level: strategyInput.openDecisions > 5 ? "high" as const : strategyInput.openDecisions > 3 ? "medium" as const : "low" as const },
          ],
          ready: true,
          sufficient: true,
        };
      }
      default: {
        // Founder mode – uses DB data
        return {
          status: founderData.status,
          money: founderData.money,
          risks: founderData.risks,
          actions: founderData.actions,
          cards: [
            { label: "Risk Score", value: founderData.status.founderRiskIndex, sub: "/ 100", level: founderData.status.founderRiskIndex <= 30 ? "high" as const : founderData.status.founderRiskIndex <= 60 ? "medium" as const : "low" as const, progress: founderData.status.founderRiskIndex },
            { label: "Capital Health", value: `${100 - founderData.status.capitalPressure}`, sub: "/ 100", level: founderData.status.capitalPressure <= 30 ? "low" as const : founderData.status.capitalPressure <= 60 ? "medium" as const : "high" as const, progress: 100 - founderData.status.capitalPressure },
            { label: "Runway", value: `${founderData.status.runwayMonths}`, sub: "Monate", level: founderData.status.runwayMonths >= 10 ? "low" as const : founderData.status.runwayMonths >= 5 ? "medium" as const : "high" as const, progress: Math.min(100, (founderData.status.runwayMonths / 18) * 100) },
            { label: "Break-even", value: founderData.status.breakEvenDate, size: "sm" as const },
          ],
          ready: founderData.ready,
          sufficient: founderData.sufficient,
        };
      }
    }
  };

  const metrics = getMetrics();

  return (
    <DashboardLayout>
      <SEO title="Command Center – BrandOS" description="Dein strategisches Cockpit." path="/dashboard/command" />
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
            <p className="text-sm text-muted-foreground mt-1">{modeLabel} · Capital & Risk Intelligence</p>
          </div>

          {/* Reality Mode Toggle */}
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
            {MODES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setScenario(value)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-xs font-medium transition-all",
                  scenario === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Insufficient data state (founder only) */}
        {(!metrics.ready || !metrics.sufficient) && (
          <DashboardCard className="flex items-center gap-3 border-warning/20 bg-warning/5">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium">Nicht genügend Daten</p>
              <p className="text-xs text-muted-foreground">
                {mode === "founder"
                  ? "Fülle mindestens die Finanzkalkulation oder dein Markenprofil aus."
                  : "Gehe zum Mode-Dashboard um deine Parameter einzustellen."}
              </p>
              {modeLink && (
                <a href={`#${modeLink}`} className="text-xs text-accent hover:underline mt-1 inline-block">
                  → Zum {modeLabel} Dashboard
                </a>
              )}
            </div>
          </DashboardCard>
        )}

        {metrics.ready && metrics.sufficient && (
          <>
            {/* Live indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <Activity className="h-3 w-3" />
              <span>Live – {modeLabel} Mode</span>
            </div>

            {/* Primary Metrics */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {metrics.cards.map((card, i) => (
                <AnimatedCard key={card.label} index={i}>
                  <DashboardCard>
                    <MetricDisplay
                      label={card.label}
                      value={card.value}
                      sub={card.sub}
                      level={card.level}
                      progress={card.progress}
                      size={card.size}
                    />
                    {card.label === "Break-even" && mode === "founder" && (
                      <div className="mt-3">
                        <RiskIndicator level={founderData.status.riskLevel} />
                      </div>
                    )}
                  </DashboardCard>
                </AnimatedCard>
              ))}
            </div>

            {/* Secondary: Money + Risks + Actions */}
            <div className="grid gap-4 lg:grid-cols-3">
              <AnimatedCard index={4}>
                <SimulationPanel title={mode === "trading" ? "P&L" : mode === "investor" ? "Returns" : mode === "strategy" ? "Impact" : "Cashflow"}>
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">
                        {mode === "trading" ? "Profit Factor" : mode === "investor" ? "Rendite" : mode === "strategy" ? "Erfolgsrate" : "Marge"}
                      </span>
                      <span className={cn("text-xl font-bold tabular-nums", metrics.money.margin >= 30 ? "text-success" : metrics.money.margin >= 15 ? "text-warning" : "text-destructive")}>
                        {metrics.money.margin}{mode === "investor" ? "%" : mode === "trading" ? "" : "%"}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">
                        {mode === "trading" ? "Monthly P&L" : mode === "investor" ? "Monthly Return" : "Cashflow / Mo."}
                      </span>
                      <span className={cn("text-lg font-semibold tabular-nums", metrics.money.cashflowMonthly >= 0 ? "text-success" : "text-destructive")}>
                        {metrics.money.cashflowMonthly >= 0 ? "+" : ""}{metrics.money.cashflowMonthly.toLocaleString("de-DE")} €
                      </span>
                    </div>
                    {/* Capital bar */}
                    <div className="pt-3 border-t border-border space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{mode === "trading" ? "Drawdown" : mode === "investor" ? "Investiert" : "Kapital verwendet"}</span>
                        <span className="font-medium tabular-nums">{metrics.money.totalCapital > 0 ? Math.round((metrics.money.capitalUsed / metrics.money.totalCapital) * 100) : 0}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
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

              <AnimatedCard index={5}>
                <SimulationPanel title="Top Risks">
                  <div className="space-y-3">
                    {metrics.risks.map((r) => (
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
                    {metrics.risks.length === 0 && (
                      <p className="text-sm text-muted-foreground">Keine Risiken erkannt</p>
                    )}
                  </div>
                </SimulationPanel>
              </AnimatedCard>

              <AnimatedCard index={6}>
                <SimulationPanel title="Next Actions">
                  <div className="space-y-2">
                    {metrics.actions.map((a) => (
                      <ActionCard key={a.id} label={a.label} priority={a.priority} blocker={a.blocker} />
                    ))}
                    {metrics.actions.length === 0 && (
                      <p className="text-sm text-muted-foreground">Alle Aufgaben erledigt ✓</p>
                    )}
                  </div>
                </SimulationPanel>
              </AnimatedCard>
            </div>

            {/* Mode-specific link */}
            {modeLink && (
              <div className="flex justify-center">
                <a
                  href={`#${modeLink}`}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  → Zum {modeLabel} Dashboard (alle Parameter einstellen)
                </a>
              </div>
            )}

            {/* Data sources – founder only */}
            {mode === "founder" && (
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                {[
                  { ok: founderData.input.hasFinancialModel, label: "Finanzen" },
                  { ok: founderData.input.hasBrandProfile, label: "Profil" },
                  { ok: founderData.input.hasProductionPlan, label: "Produktion" },
                  { ok: founderData.input.hasCompliancePlan, label: "Compliance" },
                  { ok: founderData.input.hasLaunchPlan, label: "Launch" },
                  { ok: founderData.input.hasBrandIdentity, label: "Marke" },
                ].map((d) => (
                  <span key={d.label} className={cn("rounded-full border px-2.5 py-1", d.ok ? "border-success/30 text-success" : "border-border text-muted-foreground")}>
                    {d.ok ? "✓" : "✗"} {d.label}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
