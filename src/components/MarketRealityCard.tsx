import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, AlertTriangle, Zap } from "lucide-react";
import { analyzeMarket, type MarketInput, type MarketRealityResult } from "@/lib/market-reality-engine";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";

export function MarketRealityCard() {
  const { plan } = useSubscription();
  const [inputs, setInputs] = useState<MarketInput>({
    productCategory: "skincare",
    targetPrice: 24.90,
    competitorCount: 15,
    estimatedSearchVolume: 45000,
    averageMarketPrice: 22.00,
    topCompetitorPrices: [18.90, 21.50, 24.00, 27.90, 32.00],
    margin: 42,
    capitalSafetyMonths: 5,
  });

  const result = useMemo(() => analyzeMarket(inputs), [inputs]);

  const update = (key: keyof MarketInput, value: any) =>
    setInputs((p) => ({ ...p, [key]: value }));

  const TrendIcon = result.demand.trendDirection === "up" ? TrendingUp
    : result.demand.trendDirection === "down" ? TrendingDown : Minus;

  const trendColor = result.demand.trendDirection === "up" ? "text-green-500"
    : result.demand.trendDirection === "down" ? "text-destructive" : "text-muted-foreground";

  const riskColor = result.marketRisk === "high" ? "bg-destructive text-destructive-foreground"
    : result.marketRisk === "medium" ? "bg-yellow-500 text-white" : "bg-green-500 text-white";

  const probColor = result.launchProbabilityLevel === "high" ? "text-green-500"
    : result.launchProbabilityLevel === "medium" ? "text-yellow-500" : "text-destructive";

  const content = (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Target className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground">Demand Index</span>
          </div>
          <p className="text-2xl font-bold">{result.demand.demandIndex}/100</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className="text-xs text-muted-foreground">Trend</span>
          </div>
          <p className="text-2xl font-bold capitalize">{result.demand.trendDirection}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className={`h-4 w-4 ${probColor}`} />
            <span className="text-xs text-muted-foreground">Launch-Wahrscheinlichkeit</span>
          </div>
          <p className={`text-2xl font-bold ${probColor}`}>{result.launchProbability}%</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">Markt-Risiko</span>
          </div>
          <Badge className={riskColor}>{result.marketRisk.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label className="text-xs">Kategorie</Label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={inputs.productCategory}
            onChange={(e) => update("productCategory", e.target.value)}
          >
            {["skincare","supplements","food","fashion","home","pet","tech","beauty","fitness"].map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Dein Zielpreis (€)</Label>
          <Input type="number" value={inputs.targetPrice} onChange={(e) => update("targetPrice", +e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Ø Marktpreis (€)</Label>
          <Input type="number" value={inputs.averageMarketPrice} onChange={(e) => update("averageMarketPrice", +e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Anzahl Wettbewerber</Label>
          <Input type="number" value={inputs.competitorCount} onChange={(e) => update("competitorCount", +e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Marge (%)</Label>
          <Input type="number" value={inputs.margin} onChange={(e) => update("margin", +e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Kapitalsicherheit (Monate)</Label>
          <Input type="number" value={inputs.capitalSafetyMonths} onChange={(e) => update("capitalSafetyMonths", +e.target.value)} />
        </div>
      </div>

      {/* Price Benchmark */}
      <div className="rounded-xl border p-5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" /> Price Benchmarking
        </h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Ø Marktpreis</p>
            <p className="text-lg font-bold">€{result.priceBenchmark.averageMarketPrice.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Preisspanne</p>
            <p className="text-lg font-bold">€{result.priceBenchmark.priceRange.min.toFixed(2)} – €{result.priceBenchmark.priceRange.max.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Deine Abweichung</p>
            <p className={`text-lg font-bold ${result.priceBenchmark.priceDeviation > 15 ? "text-yellow-500" : result.priceBenchmark.priceDeviation < -15 ? "text-green-500" : "text-accent"}`}>
              {result.priceBenchmark.priceDeviation > 0 ? "+" : ""}{result.priceBenchmark.priceDeviation}%
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">{result.priceBenchmark.deviationLabel}</p>
      </div>

      {/* Launch Probability Factors */}
      <div className="rounded-xl border p-5">
        <h4 className="font-semibold mb-3">Launch-Wahrscheinlichkeit: {result.launchProbability}%</h4>
        <div className="space-y-3">
          {result.factors.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-xs mb-1">
                <span>{f.label}</span>
                <span className="text-muted-foreground">{f.score}/{f.max}</span>
              </div>
              <Progress value={(f.score / f.max) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {result.insights.length > 0 && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
          <h4 className="font-semibold mb-2">📊 Market Insights</h4>
          <ul className="space-y-1.5">
            {result.insights.map((i, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-accent mt-0.5">→</span> {i}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          Market Reality Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        {plan === "pro" ? content : (
          <LockedOverlay feature="scenarioSimulator" requiredPlan="pro">
            {content}
          </LockedOverlay>
        )}
      </CardContent>
    </Card>
  );
}
