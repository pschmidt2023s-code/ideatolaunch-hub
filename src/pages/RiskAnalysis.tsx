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
import { FinancialDisclaimer } from "@/components/dashboard/FinancialDisclaimer";
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

const LEVEL_COLORS = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
} as const;

const LEVEL_BG = {
  low: "bg-success/10 border-success/20",
  medium: "bg-warning/10 border-warning/20",
  high: "bg-destructive/10 border-destructive/20",
} as const;

export default function RiskAnalysis() {
  const [input, setInput] = useState<RoRInput>({
    accountSize: 10000,
    riskPerTrade: 2,
    winrate: 55,
    rrr: 2,
    tradingFees: 2,
    slippage: 1,
  });

  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  const metrics = useMemo(() => calculateRoRMetrics(input), [input]);
  const level = getRoRLevel(metrics.riskOfRuin);

  const update = (field: keyof RoRInput, value: number) => {
    setInput((prev) => ({ ...prev, [field]: value }));
    setMcResult(null); // reset sim on param change
  };

  const runSimulation = () => {
    setSimRunning(true);
    // Defer to next frame to show loading state
    requestAnimationFrame(() => {
      const result = runMonteCarloSimulation(input, 500);
      setMcResult(result);
      setSimRunning(false);
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        <PageHeader
          title="Risk of Ruin Analysis"
          subtitle="Capital & Risk Intelligence for Traders"
        />

        {/* ── Status Badge ── */}
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn("text-sm px-3 py-1 font-semibold border", LEVEL_BG[level], LEVEL_COLORS[level])}
          >
            {getRoRLabel(level)}
          </Badge>
        </div>

        {/* ── Input Section ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strategy Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Account Size ($)</Label>
                <Input
                  type="number"
                  value={input.accountSize}
                  onChange={(e) => update("accountSize", Number(e.target.value))}
                  min={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Risk per Trade: {input.riskPerTrade}%</Label>
                <Slider
                  value={[input.riskPerTrade]}
                  onValueChange={([v]) => update("riskPerTrade", v)}
                  min={0.5}
                  max={20}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>Winrate: {input.winrate}%</Label>
                <Slider
                  value={[input.winrate]}
                  onValueChange={([v]) => update("winrate", v)}
                  min={10}
                  max={90}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Risk Reward Ratio: {input.rrr}</Label>
                <Slider
                  value={[input.rrr]}
                  onValueChange={([v]) => update("rrr", v)}
                  min={0.5}
                  max={10}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Trading Fees ($)</Label>
                <Input
                  type="number"
                  value={input.tradingFees}
                  onChange={(e) => update("tradingFees", Number(e.target.value))}
                  min={0}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>Slippage ($)</Label>
                <Input
                  type="number"
                  value={input.slippage}
                  onChange={(e) => update("slippage", Number(e.target.value))}
                  min={0}
                  step={0.5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Core Metrics ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Risk of Ruin"
            value={`${metrics.riskOfRuin}%`}
            sub="Probability of total account loss"
            level={level}
            progress={metrics.riskOfRuin}
          >
            <Skull className={cn("mt-3 h-5 w-5", LEVEL_COLORS[level])} />
          </MetricCard>

          <MetricCard
            label="Account Survival"
            value={`${metrics.survivalProbability}%`}
            sub="Probability of staying solvent"
            level={metrics.survivalProbability > 80 ? "low" : metrics.survivalProbability > 50 ? "medium" : "high"}
            progress={metrics.survivalProbability}
          >
            <Shield className={cn("mt-3 h-5 w-5", metrics.survivalProbability > 80 ? "text-success" : metrics.survivalProbability > 50 ? "text-warning" : "text-destructive")} />
          </MetricCard>

          <MetricCard
            label="Expected Drawdown"
            value={`${metrics.expectedDrawdown}%`}
            sub="Max consecutive loss impact"
            level={metrics.expectedDrawdown < 20 ? "low" : metrics.expectedDrawdown < 50 ? "medium" : "high"}
            progress={metrics.expectedDrawdown}
          >
            <Activity className={cn("mt-3 h-5 w-5", metrics.expectedDrawdown < 20 ? "text-success" : "text-warning")} />
          </MetricCard>

          <MetricCard
            label="Trade Expectancy"
            value={`$${metrics.tradeExpectancy}`}
            sub="Expected profit per trade"
            level={metrics.tradeExpectancy > 0 ? "low" : "high"}
          >
            <TrendingUp className={cn("mt-3 h-5 w-5", metrics.tradeExpectancy > 0 ? "text-success" : "text-destructive")} />
          </MetricCard>
        </div>

        {/* ── Capital Growth ── */}
        <MetricCard
          label="Capital Growth Potential (100 Trades)"
          value={`${metrics.capitalGrowthPotential > 0 ? "+" : ""}${metrics.capitalGrowthPotential}%`}
          sub="Projected portfolio growth based on current edge"
          level={metrics.capitalGrowthPotential > 10 ? "low" : metrics.capitalGrowthPotential > 0 ? "medium" : "high"}
          className="max-w-md"
        />

        {/* ── Monte Carlo Section ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              Monte Carlo Simulation
            </CardTitle>
            <Button onClick={runSimulation} disabled={simRunning} size="sm">
              {simRunning ? "Simulating…" : "Run Simulation"}
            </Button>
          </CardHeader>
          <CardContent>
            {!mcResult ? (
              <p className="text-sm text-muted-foreground">
                Click "Run Simulation" to generate 500 randomized trading scenarios across 100, 500, and 1000 trades.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {mcResult.scenarios.map((sc) => {
                  const survLevel = sc.accountSurvival > 80 ? "low" as const : sc.accountSurvival > 50 ? "medium" as const : "high" as const;
                  return (
                    <Card key={sc.trades} className={cn("border", LEVEL_BG[survLevel])}>
                      <CardContent className="pt-5 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {sc.trades} Trades
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Survival</span>
                            <span className={cn("font-bold", LEVEL_COLORS[survLevel])}>{sc.accountSurvival}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Median Profit</span>
                            <span className={cn("font-bold", sc.medianProfit >= 0 ? "text-success" : "text-destructive")}>
                              ${sc.medianProfit.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Worst Drawdown</span>
                            <span className="font-bold text-destructive">{sc.worstCaseDrawdown}%</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>5th percentile</span>
                            <span>${sc.percentile5.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>95th percentile</span>
                            <span>${sc.percentile95.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <FinancialDisclaimer />
      </div>
    </DashboardLayout>
  );
}
