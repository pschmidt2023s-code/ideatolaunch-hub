import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { useBrand } from "@/hooks/useBrand";
import { toast } from "sonner";
import { ScoreExplainer } from "@/components/dashboard/ScoreExplainer";
import { SkeletonCard } from "@/components/dashboard/SkeletonDashboard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";

export default function StrategicDashboard() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;

  const { data: financialModel, isLoading: l1 } = useQuery({
    queryKey: ["strat_financial", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("financial_models").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: brandProfile, isLoading: l2 } = useQuery({
    queryKey: ["strat_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("budget, product_category").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: productionPlan } = useQuery({
    queryKey: ["strat_production", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("production_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: complianceScore } = useQuery({
    queryKey: ["strat_compliance", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("compliance_scores").select("overall_score").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: launchPlan } = useQuery({
    queryKey: ["strat_launch", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("launch_plans").select("fulfillment_model, sales_channel").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: brand } = useQuery({
    queryKey: ["strat_brand", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brands").select("current_step, created_at").eq("id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  // ── Capital Burn inputs (pre-filled from DB) ──
  const [productionCost, setProductionCost] = useState(5);
  const [packagingCost, setPackagingCost] = useState(2);
  const [shippingCost, setShippingCost] = useState(3);
  const [marketingBudget, setMarketingBudget] = useState(500);
  const [fixedCosts, setFixedCosts] = useState(200);
  const [unitsPerMonth, setUnitsPerMonth] = useState(100);
  const [pricePerUnit, setPricePerUnit] = useState(25);
  const [totalCapital, setTotalCapital] = useState(10000);

  const [moqAmount, setMoqAmount] = useState(500);
  const [budget, setBudget] = useState(10000);
  const [region, setRegion] = useState("China");
  const [leadTimeWeeks, setLeadTimeWeeks] = useState(8);
  const [singleSupplier, setSingleSupplier] = useState(true);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (!financialModel && !brandProfile && !productionPlan) return;

    if (financialModel) {
      if (financialModel.production_cost != null) setProductionCost(Number(financialModel.production_cost));
      if (financialModel.packaging_cost != null) setPackagingCost(Number(financialModel.packaging_cost));
      if (financialModel.shipping_cost != null) setShippingCost(Number(financialModel.shipping_cost));
      if (financialModel.marketing_budget != null) setMarketingBudget(Number(financialModel.marketing_budget));
      if (financialModel.recommended_price != null) setPricePerUnit(Number(financialModel.recommended_price));
      if (financialModel.break_even_units != null) setUnitsPerMonth(financialModel.break_even_units);
    }

    if (brandProfile?.budget) {
      const budgetMap: Record<string, number> = { "<1k": 800, "1k-5k": 3000, "5k-15k": 10000, "15k+": 20000 };
      const parsed = parseFloat(brandProfile.budget.replace(/[^\d.]/g, ""));
      const val = isNaN(parsed) ? (budgetMap[brandProfile.budget] ?? 10000) : parsed;
      setTotalCapital(val);
      setBudget(val);
    }

    if (productionPlan) {
      if (productionPlan.moq_expectation) {
        const moq = parseInt(productionPlan.moq_expectation, 10);
        if (!isNaN(moq)) setMoqAmount(moq);
      }
      if (productionPlan.production_region) setRegion(productionPlan.production_region);
    }

    setInitialized(true);
  }, [financialModel, brandProfile, productionPlan, initialized]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Array<{
    category: string;
    title: string;
    description: string;
    impact: string;
    savings_potential: number;
  }>>([]);

  const burnInput: CapitalBurnInput = {
    productionCost, packagingCost, shippingCost, marketingBudget, fixedCosts, unitsPerMonth, totalCapital,
  };
  const capitalBurn = computeCapitalBurn(burnInput, pricePerUnit);

  const supplierInput: SupplierRiskInput = { moqAmount, budget, region, leadTimeWeeks, singleSupplier };
  const supplierRisk = computeSupplierRisk(supplierInput);

  const margin = pricePerUnit > 0
    ? Math.round(((pricePerUnit - productionCost - packagingCost - shippingCost) / pricePerUnit) * 100)
    : 0;

  const liveComplianceScore = complianceScore?.overall_score ?? 50;

  const launchProb = computeLaunchProbability({
    margin,
    capitalSafetyMonths: capitalBurn.cashRunwayMonths,
    supplierRiskScore: supplierRisk.overallScore,
    complianceScore: liveComplianceScore,
    hasProduct: !!productionPlan,
    hasDistribution: !!(launchPlan?.fulfillment_model || launchPlan?.sales_channel),
  });

  const currentStep = brand?.current_step ?? 1;
  const totalSteps = 7;
  const daysActive = brand?.created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(brand.created_at).getTime()) / 86400000))
    : 14;

  const execution = computeExecutionScore({
    stepsCompleted: Math.max(0, currentStep - 1),
    totalSteps,
    daysActive,
    financialModelComplete: !!financialModel,
    supplierSelected: !!productionPlan?.production_region,
    complianceScore: liveComplianceScore,
  });

  const getAiRecommendations = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-strategy", {
        body: {
          margin, moq: moqAmount, budget, monthlyUnits: unitsPerMonth, pricePerUnit, productionCost, marketingBudget,
          region, productCategory: brandProfile?.product_category ?? "Konsumgüter",
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
    high: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    low: "bg-muted text-muted-foreground",
  };

  const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    pricing: <DollarSign className="h-4 w-4" />,
    moq: <Target className="h-4 w-4" />,
    budget: <TrendingUp className="h-4 w-4" />,
    timing: <Zap className="h-4 w-4" />,
  };

  // Loading state
  if (l1 || l2) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonCard className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Overview with Explainers */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ScoreExplainer
          score={launchProb.score}
          label="Launch-Wahrscheinlichkeit"
          level={launchProb.level === "high" ? "Hoch" : launchProb.level === "medium" ? "Mittel" : "Niedrig"}
          levelColor={launchProb.level === "high" ? "bg-success/10 text-success" : launchProb.level === "medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}
          explanation="Basiert auf Marge, Kapitalreserve, Lieferanten-Risiko, Compliance und Vertriebskanal. Jeder Faktor wird gewichtet."
          factors={[
            { label: "Marge", impact: margin > 30 ? "positive" : margin > 15 ? "neutral" : "negative", detail: `${margin}%` },
            { label: "Cash Runway", impact: capitalBurn.cashRunwayMonths >= 6 ? "positive" : "negative", detail: `${capitalBurn.cashRunwayMonths} Monate` },
            { label: "Compliance", impact: liveComplianceScore >= 70 ? "positive" : "negative", detail: `${liveComplianceScore}%` },
          ]}
          nextStep={launchProb.level === "low" ? "Finanzmodell optimieren und Compliance abschließen" : undefined}
        />
        <ScoreExplainer
          score={execution.score}
          label="Execution Score"
          level={execution.level === "excellent" ? "Exzellent" : execution.level === "good" ? "Gut" : execution.level === "needs_work" ? "Ausbaufähig" : "Aufholen"}
          levelColor={execution.level === "excellent" || execution.level === "good" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
          explanation="Misst deinen Fortschritt: abgeschlossene Steps, Tage seit Start, Finanzmodell- und Lieferanten-Status."
          nextStep={execution.suggestions[0] || undefined}
        />
        <ScoreExplainer
          score={supplierRisk.overallScore}
          label="Lieferanten-Risiko"
          level={supplierRisk.level === "low" ? "Niedrig" : supplierRisk.level === "medium" ? "Mittel" : supplierRisk.level === "high" ? "Hoch" : "Kritisch"}
          levelColor={supplierRisk.level === "low" ? "bg-success/10 text-success" : supplierRisk.level === "medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}
          explanation="Gewichtet MOQ-Risiko, Länder-Risiko, Lieferzeit und Abhängigkeit von einem einzelnen Lieferanten."
          factors={[
            { label: "MOQ", impact: supplierRisk.moqRisk < 30 ? "positive" : "negative", detail: `Score ${supplierRisk.moqRisk}` },
            { label: "Lieferzeit", impact: supplierRisk.leadTimeRisk < 30 ? "positive" : "negative", detail: `${leadTimeWeeks} Wochen` },
          ]}
        />
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Cash Runway</p>
          <p className="text-3xl font-bold tabular-nums font-display">
            {capitalBurn.cashRunwayMonths >= 99 ? "∞" : `${capitalBurn.cashRunwayMonths}M`}
          </p>
          <Badge variant="outline" className={cn(
            "mt-1 text-[10px]",
            capitalBurn.burnRate === "safe" ? "bg-success/10 text-success" : capitalBurn.burnRate === "moderate" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
          )}>
            {capitalBurn.burnRate === "safe" ? "Sicher" : capitalBurn.burnRate === "moderate" ? "Moderat" : "Kritisch"}
          </Badge>
        </div>
      </div>

      {/* Capital Burn Predictor */}
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" />
          Capital Burn Predictor
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Produktion/Stk (€)", productionCost, setProductionCost],
            ["Verpackung/Stk (€)", packagingCost, setPackagingCost],
            ["Versand/Stk (€)", shippingCost, setShippingCost],
            ["Verkaufspreis (€)", pricePerUnit, setPricePerUnit],
            ["Marketing/Mo. (€)", marketingBudget, setMarketingBudget],
            ["Fixkosten/Mo. (€)", fixedCosts, setFixedCosts],
            ["Stück/Monat", unitsPerMonth, setUnitsPerMonth],
            ["Startkapital (€)", totalCapital, setTotalCapital],
          ].map(([label, val, setter]) => (
            <div key={label as string}>
              <Label className="text-[11px] text-muted-foreground">{label as string}</Label>
              <Input type="number" value={val as number} onChange={(e) => (setter as any)(Number(e.target.value))} className="h-9 text-sm" />
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Monatl. Burn</p>
            <p className="text-lg font-bold tabular-nums">{capitalBurn.monthlyBurn.toLocaleString("de-DE")} €</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Marge</p>
            <p className="text-lg font-bold tabular-nums">{margin}%</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Cash Runway</p>
            <p className="text-lg font-bold tabular-nums">
              {capitalBurn.cashRunwayMonths >= 99 ? "Profitabel ✓" : `${capitalBurn.cashRunwayMonths} Monate`}
            </p>
          </div>
        </div>

        {/* 12-month forecast */}
        <div className="mt-4">
          <p className="text-xs font-medium mb-2">12-Monats-Prognose</p>
          <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
            {capitalBurn.forecast.filter((_, i) => i % 2 === 1).map((f) => (
              <div key={f.month} className={cn("rounded-lg p-1.5", f.balance > 0 ? "bg-success/5" : "bg-destructive/5")}>
                <p className="text-muted-foreground">M{f.month}</p>
                <p className={cn("font-medium tabular-nums", f.balance > 0 ? "text-success" : "text-destructive")}>
                  {(f.balance / 1000).toFixed(1)}k€
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supplier Risk Score */}
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Supplier Risk Score
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div>
            <Label className="text-[11px] text-muted-foreground">MOQ-Kosten (€)</Label>
            <Input type="number" value={moqAmount} onChange={(e) => setMoqAmount(Number(e.target.value))} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Budget (€)</Label>
            <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Region</Label>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Lieferzeit: {leadTimeWeeks} Wochen</Label>
            <Slider value={[leadTimeWeeks]} onValueChange={([v]) => setLeadTimeWeeks(v)} min={1} max={24} step={1} className="mt-2" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={singleSupplier}
              onChange={(e) => setSingleSupplier(e.target.checked)}
              className="rounded"
            />
            <Label className="text-[11px] text-muted-foreground">Einzelner Lieferant</Label>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "MOQ-Risiko", value: supplierRisk.moqRisk },
            { label: "Länder-Risiko", value: supplierRisk.countryRisk },
            { label: "Lieferzeit", value: supplierRisk.leadTimeRisk },
            { label: "Abhängigkeit", value: supplierRisk.dependencyRisk },
          ].map((r) => (
            <div key={r.label} className="text-center rounded-lg border p-2">
              <p className="text-[10px] text-muted-foreground">{r.label}</p>
              <p className={cn("text-lg font-bold tabular-nums", r.value > 60 ? "text-destructive" : r.value > 30 ? "text-warning" : "text-success")}>
                {r.value}
              </p>
            </div>
          ))}
        </div>

        {supplierRisk.warnings.length > 0 && (
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 mt-3 space-y-1">
            {supplierRisk.warnings.map((w, i) => (
              <p key={i} className="text-xs text-warning">⚠️ {w}</p>
            ))}
          </div>
        )}
      </div>

      {/* AI Strategy Recommendations */}
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          KI-Strategie-Empfehlungen
        </h3>

        <Button onClick={getAiRecommendations} disabled={aiLoading} className="w-full mb-4">
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
              <div key={i} className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {CATEGORY_ICONS[rec.category] || <Zap className="h-4 w-4" />}
                    <span className="text-sm font-medium">{rec.title}</span>
                  </div>
                  <Badge variant="outline" className={IMPACT_COLORS[rec.impact] || ""}>
                    {rec.impact === "high" ? "Hoch" : rec.impact === "medium" ? "Mittel" : "Niedrig"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rec.description}</p>
                {rec.savings_potential > 0 && (
                  <p className="text-xs font-medium text-success">
                    💰 Einsparpotenzial: ~{rec.savings_potential.toLocaleString("de-DE")} €
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {execution.suggestions.length > 0 && (
          <>
            <Separator className="my-4" />
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
      </div>
    </div>
  );
}
