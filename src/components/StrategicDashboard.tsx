import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, Zap, Brain, Loader2,
} from "lucide-react";
import {
  computeCapitalBurn,
  computeSupplierRisk,
  computeLaunchProbability,
  computeExecutionScore,
  type CapitalBurnInput,
  type SupplierRiskInput,
} from "@/lib/strategic-intelligence";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RISK_LEVEL_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function StrategicDashboard() {
  // Capital Burn inputs
  const [productionCost, setProductionCost] = useState(5);
  const [packagingCost, setPackagingCost] = useState(2);
  const [shippingCost, setShippingCost] = useState(3);
  const [marketingBudget, setMarketingBudget] = useState(500);
  const [fixedCosts, setFixedCosts] = useState(200);
  const [unitsPerMonth, setUnitsPerMonth] = useState(100);
  const [pricePerUnit, setPricePerUnit] = useState(25);
  const [totalCapital, setTotalCapital] = useState(10000);

  // Supplier Risk inputs
  const [moqAmount, setMoqAmount] = useState(500);
  const [budget, setBudget] = useState(10000);
  const [region, setRegion] = useState("China");
  const [leadTimeWeeks, setLeadTimeWeeks] = useState(8);
  const [singleSupplier, setSingleSupplier] = useState(true);

  // AI Recommendations
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Array<{
    category: string;
    title: string;
    description: string;
    impact: string;
    savings_potential: number;
  }>>([]);

  // Compute results
  const burnInput: CapitalBurnInput = {
    productionCost, packagingCost, shippingCost, marketingBudget, fixedCosts, unitsPerMonth, totalCapital,
  };
  const capitalBurn = computeCapitalBurn(burnInput, pricePerUnit);

  const supplierInput: SupplierRiskInput = { moqAmount, budget, region, leadTimeWeeks, singleSupplier };
  const supplierRisk = computeSupplierRisk(supplierInput);

  const margin = pricePerUnit > 0
    ? Math.round(((pricePerUnit - productionCost - packagingCost - shippingCost) / pricePerUnit) * 100)
    : 0;

  const launchProb = computeLaunchProbability({
    margin,
    capitalSafetyMonths: capitalBurn.cashRunwayMonths,
    supplierRiskScore: supplierRisk.overallScore,
    complianceScore: 50,
    hasProduct: true,
    hasDistribution: false,
  });

  const execution = computeExecutionScore({
    stepsCompleted: 3,
    totalSteps: 7,
    daysActive: 14,
    financialModelComplete: true,
    supplierSelected: false,
    complianceScore: 50,
  });

  const getAiRecommendations = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-strategy", {
        body: {
          margin,
          moq: moqAmount,
          budget,
          monthlyUnits: unitsPerMonth,
          pricePerUnit,
          productionCost,
          marketingBudget,
          region,
          productCategory: "Konsumgüter",
        },
      });

      if (error) throw error;
      setAiRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
      toast.error("KI-Empfehlungen konnten nicht geladen werden");
    } finally {
      setAiLoading(false);
    }
  };

  const IMPACT_COLORS: Record<string, string> = {
    high: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-muted text-muted-foreground",
  };

  const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    pricing: <DollarSign className="h-4 w-4" />,
    moq: <Target className="h-4 w-4" />,
    budget: <TrendingUp className="h-4 w-4" />,
    timing: <Zap className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Score Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Launch-Wahrscheinlichkeit</p>
            <p className="text-3xl font-bold">{launchProb.score}%</p>
            <Badge className={launchProb.level === "high" ? "bg-green-100 text-green-800" : launchProb.level === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
              {launchProb.level === "high" ? "Hoch" : launchProb.level === "medium" ? "Mittel" : "Niedrig"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Execution Score</p>
            <p className="text-3xl font-bold">{execution.score}</p>
            <Badge className={execution.level === "excellent" || execution.level === "good" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {execution.level === "excellent" ? "Exzellent" : execution.level === "good" ? "Gut" : execution.level === "needs_work" ? "Ausbaufähig" : "Aufholen"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Lieferanten-Risiko</p>
            <p className="text-3xl font-bold">{supplierRisk.overallScore}</p>
            <Badge className={RISK_LEVEL_COLORS[supplierRisk.level]}>
              {supplierRisk.level === "low" ? "Niedrig" : supplierRisk.level === "medium" ? "Mittel" : supplierRisk.level === "high" ? "Hoch" : "Kritisch"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Cash Runway</p>
            <p className="text-3xl font-bold">
              {capitalBurn.cashRunwayMonths >= 99 ? "∞" : `${capitalBurn.cashRunwayMonths}M`}
            </p>
            <Badge className={capitalBurn.burnRate === "safe" ? "bg-green-100 text-green-800" : capitalBurn.burnRate === "moderate" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
              {capitalBurn.burnRate === "safe" ? "Sicher" : capitalBurn.burnRate === "moderate" ? "Moderat" : "Kritisch"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Capital Burn Predictor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Capital Burn Predictor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <Label className="text-xs">Produktionskosten/Stk (€)</Label>
              <Input type="number" value={productionCost} onChange={(e) => setProductionCost(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Verpackung/Stk (€)</Label>
              <Input type="number" value={packagingCost} onChange={(e) => setPackagingCost(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Versand/Stk (€)</Label>
              <Input type="number" value={shippingCost} onChange={(e) => setShippingCost(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Verkaufspreis (€)</Label>
              <Input type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Marketing/Monat (€)</Label>
              <Input type="number" value={marketingBudget} onChange={(e) => setMarketingBudget(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Fixkosten/Monat (€)</Label>
              <Input type="number" value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Stück/Monat</Label>
              <Input type="number" value={unitsPerMonth} onChange={(e) => setUnitsPerMonth(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Startkapital (€)</Label>
              <Input type="number" value={totalCapital} onChange={(e) => setTotalCapital(Number(e.target.value))} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Monatl. Burn</p>
              <p className="text-lg font-bold">{capitalBurn.monthlyBurn.toLocaleString("de-DE")} €</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Marge</p>
              <p className="text-lg font-bold">{margin}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cash Runway</p>
              <p className="text-lg font-bold">
                {capitalBurn.cashRunwayMonths >= 99 ? "Profitabel ✓" : `${capitalBurn.cashRunwayMonths} Monate`}
              </p>
            </div>
          </div>

          {/* 12-month forecast */}
          <div className="space-y-1">
            <p className="text-sm font-medium">12-Monats-Prognose</p>
            <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
              {capitalBurn.forecast.filter((_, i) => i % 2 === 1).map((f) => (
                <div key={f.month} className={`rounded p-1.5 ${f.balance > 0 ? "bg-green-50" : "bg-red-50"}`}>
                  <p className="text-muted-foreground">M{f.month}</p>
                  <p className={`font-medium ${f.balance > 0 ? "text-green-700" : "text-red-700"}`}>
                    {(f.balance / 1000).toFixed(1)}k€
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Risk Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Supplier Risk Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <Label className="text-xs">MOQ-Kosten (€)</Label>
              <Input type="number" value={moqAmount} onChange={(e) => setMoqAmount(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Budget (€)</Label>
              <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Region</Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Lieferzeit (Wochen): {leadTimeWeeks}</Label>
              <Slider value={[leadTimeWeeks]} onValueChange={([v]) => setLeadTimeWeeks(v)} min={1} max={24} step={1} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={singleSupplier}
                onChange={(e) => setSingleSupplier(e.target.checked)}
                className="rounded"
              />
              <Label className="text-xs">Einzelner Lieferant</Label>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "MOQ-Risiko", value: supplierRisk.moqRisk },
              { label: "Länder-Risiko", value: supplierRisk.countryRisk },
              { label: "Lieferzeit-Risiko", value: supplierRisk.leadTimeRisk },
              { label: "Abhängigkeit", value: supplierRisk.dependencyRisk },
            ].map((r) => (
              <div key={r.label} className="text-center rounded-lg border p-2">
                <p className="text-[10px] text-muted-foreground">{r.label}</p>
                <p className={`text-lg font-bold ${r.value > 60 ? "text-destructive" : r.value > 30 ? "text-yellow-600" : "text-green-600"}`}>
                  {r.value}
                </p>
              </div>
            ))}
          </div>

          {supplierRisk.warnings.length > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-1">
              {supplierRisk.warnings.map((w, i) => (
                <p key={i} className="text-xs text-orange-800">⚠️ {w}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Strategy Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            KI-Strategie-Empfehlungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={getAiRecommendations} disabled={aiLoading} className="w-full">
            {aiLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analysiere deine Daten…
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                KI-Empfehlungen generieren
              </>
            )}
          </Button>

          {aiRecommendations.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {aiRecommendations.map((rec, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {CATEGORY_ICONS[rec.category] || <Zap className="h-4 w-4" />}
                      <span className="text-sm font-medium">{rec.title}</span>
                    </div>
                    <Badge className={IMPACT_COLORS[rec.impact] || ""}>
                      {rec.impact === "high" ? "Hoch" : rec.impact === "medium" ? "Mittel" : "Niedrig"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                  {rec.savings_potential > 0 && (
                    <p className="text-xs font-medium text-green-700">
                      💰 Einsparpotenzial: ~{rec.savings_potential.toLocaleString("de-DE")} €
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Execution suggestions */}
          {execution.suggestions.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Verbesserungsvorschläge</p>
                <div className="space-y-1">
                  {execution.suggestions.map((s, i) => (
                    <p key={i} className="text-xs text-muted-foreground">💡 {s}</p>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
