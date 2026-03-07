import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AIPageInsights } from "@/components/AIPageInsights";
import { FinancialDisclaimer } from "@/components/dashboard/FinancialDisclaimer";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import {
  calculateRoRMetrics,
  runMonteCarloSimulation,
  getRoRLevel,
  getRoRLabel,
  type RoRInput,
  type MonteCarloResult,
} from "@/lib/risk-of-ruin-engine";
import { Shield, Skull, TrendingUp, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_COLORS = { low: "text-success", medium: "text-warning", high: "text-destructive" } as const;
const LEVEL_BG = { low: "bg-success/10 border-success/20", medium: "bg-warning/10 border-warning/20", high: "bg-destructive/10 border-destructive/20" } as const;

export default function RiskAnalysis() {
  const [input, setInput] = useState<RoRInput>({
    accountSize: 10000, riskPerTrade: 2, winrate: 55, rrr: 2, tradingFees: 2, slippage: 1,
  });
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  const metrics = useMemo(() => calculateRoRMetrics(input), [input]);
  const level = getRoRLevel(metrics.riskOfRuin);

  const update = (field: keyof RoRInput, value: number) => {
    setInput((prev) => ({ ...prev, [field]: value }));
    setMcResult(null);
  };

  const runSimulation = () => {
    setSimRunning(true);
    requestAnimationFrame(() => {
      const result = runMonteCarloSimulation(input, 500);
      setMcResult(result);
      setSimRunning(false);
    });
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6 pb-16">
        <PageHeader title="Risk of Ruin Analysis" description="Capital & Risk Intelligence for Traders" badge="RISK" badgeVariant="destructive" />

        {/* Status */}
        <AnimatedCard index={0}>
          <div className={cn("flex items-center gap-3 rounded-2xl border p-4", LEVEL_BG[level])}>
            <Shield className={cn("h-5 w-5", LEVEL_COLORS[level])} />
            <div>
              <p className={cn("text-sm font-semibold", LEVEL_COLORS[level])}>{getRoRLabel(level)}</p>
              <p className="text-[11px] text-muted-foreground">Risk of Ruin: {metrics.riskOfRuin}% · Survival: {metrics.survivalProbability}%</p>
            </div>
          </div>
        </AnimatedCard>

        {/* Input */}
        <AnimatedCard index={1}>
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold mb-4">Strategy Parameters</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Account Size ($)</Label>
                <Input type="number" value={input.accountSize} onChange={(e) => update("accountSize", Number(e.target.value))} min={100} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Risk per Trade: <span className="font-bold">{input.riskPerTrade}%</span></Label>
                <Slider value={[input.riskPerTrade]} onValueChange={([v]) => update("riskPerTrade", v)} min={0.5} max={20} step={0.5} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Winrate: <span className="font-bold">{input.winrate}%</span></Label>
                <Slider value={[input.winrate]} onValueChange={([v]) => update("winrate", v)} min={10} max={90} step={1} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Risk Reward Ratio: <span className="font-bold">{input.rrr}</span></Label>
                <Slider value={[input.rrr]} onValueChange={([v]) => update("rrr", v)} min={0.5} max={10} step={0.1} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Trading Fees ($)</Label>
                <Input type="number" value={input.tradingFees} onChange={(e) => update("tradingFees", Number(e.target.value))} min={0} step={0.5} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Slippage ($)</Label>
                <Input type="number" value={input.slippage} onChange={(e) => update("slippage", Number(e.target.value))} min={0} step={0.5} className="rounded-xl" />
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Core Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Risk of Ruin", value: `${metrics.riskOfRuin}%`, sub: "Probability of total account loss", level, progress: metrics.riskOfRuin, icon: Skull },
            { label: "Account Survival", value: `${metrics.survivalProbability}%`, sub: "Probability of staying solvent", level: (metrics.survivalProbability > 80 ? "low" : metrics.survivalProbability > 50 ? "medium" : "high") as "low"|"medium"|"high", progress: metrics.survivalProbability, icon: Shield },
            { label: "Expected Drawdown", value: `${metrics.expectedDrawdown}%`, sub: "Max consecutive loss impact", level: (metrics.expectedDrawdown < 20 ? "low" : metrics.expectedDrawdown < 50 ? "medium" : "high") as "low"|"medium"|"high", progress: metrics.expectedDrawdown, icon: Activity },
            { label: "Trade Expectancy", value: `$${metrics.tradeExpectancy}`, sub: "Expected profit per trade", level: (metrics.tradeExpectancy > 0 ? "low" : "high") as "low"|"high", icon: TrendingUp },
          ].map((m, i) => (
            <AnimatedCard key={m.label} index={i + 2}>
              <MetricCard label={m.label} value={m.value} sub={m.sub} level={m.level} progress={m.progress}>
                <m.icon className={cn("mt-3 h-5 w-5", LEVEL_COLORS[m.level])} />
              </MetricCard>
            </AnimatedCard>
          ))}
        </div>

        {/* Capital Growth */}
        <AnimatedCard index={6}>
          <MetricCard
            label="Capital Growth Potential (100 Trades)"
            value={`${metrics.capitalGrowthPotential > 0 ? "+" : ""}${metrics.capitalGrowthPotential}%`}
            sub="Projected portfolio growth based on current edge"
            level={metrics.capitalGrowthPotential > 10 ? "low" : metrics.capitalGrowthPotential > 0 ? "medium" : "high"}
            className="max-w-md"
          />
        </AnimatedCard>

        {/* Monte Carlo */}
        <AnimatedCard index={7}>
          <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-sm font-semibold">Monte Carlo Simulation</h3>
              </div>
              <Button onClick={runSimulation} disabled={simRunning} size="sm" className="rounded-xl gap-1.5">
                {simRunning ? "Simulating…" : "Run Simulation"}
              </Button>
            </div>
            <div className="p-5">
              {!mcResult ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Click "Run Simulation" to generate 500 randomized scenarios across 100, 500, and 1000 trades.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  {mcResult.scenarios.map((sc) => {
                    const survLevel = sc.accountSurvival > 80 ? "low" as const : sc.accountSurvival > 50 ? "medium" as const : "high" as const;
                    return (
                      <div key={sc.trades} className={cn("rounded-xl border p-4 space-y-3", LEVEL_BG[survLevel])}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sc.trades} Trades</p>
                        <div className="space-y-2">
                          {[
                            { label: "Survival", value: `${sc.accountSurvival}%`, color: LEVEL_COLORS[survLevel] },
                            { label: "Median Profit", value: `$${sc.medianProfit.toLocaleString()}`, color: sc.medianProfit >= 0 ? "text-success" : "text-destructive" },
                            { label: "Worst Drawdown", value: `${sc.worstCaseDrawdown}%`, color: "text-destructive" },
                          ].map((row) => (
                            <div key={row.label} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{row.label}</span>
                              <span className={cn("font-bold tabular-nums", row.color)}>{row.value}</span>
                            </div>
                          ))}
                          <div className="border-t border-border/50 pt-2 space-y-1">
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                              <span>5th %ile</span><span className="tabular-nums">${sc.percentile5.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                              <span>95th %ile</span><span className="tabular-nums">${sc.percentile95.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </AnimatedCard>

        <FinancialDisclaimer />
      </div>
    </DashboardLayout>
  );
}
