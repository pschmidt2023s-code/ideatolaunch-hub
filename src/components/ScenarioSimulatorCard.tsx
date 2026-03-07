import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LockedOverlay } from "@/components/LockedOverlay";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  simulateScenario,
  applyPreset,
  SCENARIO_PRESETS,
  type ScenarioOutput,
} from "@/lib/scenario-simulator";
import {
  runStressTest,
  STRESS_DEFAULTS,
  WORST_CASE,
  type StressInputs,
  type StressTestResult,
  type BaseFinancials,
} from "@/lib/stress-test-engine";
import {
  TrendingUp, TrendingDown, DollarSign, Shield, Activity,
  BarChart3, Lock, AlertTriangle, Flame, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCapabilities } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";

export function ScenarioSimulatorCard() {
  const { i18n } = useTranslation();
  const { plan } = useSubscription();
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;
  const isDE = i18n.language === "de";
  const caps = getCapabilities(plan);
  const isExecution = plan === "execution" || plan === "trading";
  const shouldFetch = plan !== "free";

  const { data: financial } = useQuery({
    queryKey: ["financial_model", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("financial_models").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId && shouldFetch,
  });

  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("budget").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId && shouldFetch,
  });

  const [quantity, setQuantity] = useState(200);
  const [activePreset, setActivePreset] = useState<string>("realistic");
  const [showSurvival, setShowSurvival] = useState(false);
  const [stressInputs, setStressInputs] = useState<StressInputs>(STRESS_DEFAULTS);

  const unitCost = useMemo(() => {
    if (!financial) return 0;
    return (financial.production_cost ?? 0) + (financial.packaging_cost ?? 0) + (financial.shipping_cost ?? 0);
  }, [financial]);

  const budgetNumeric: Record<string, number> = { "<1k": 800, "1k-5k": 3000, "5k-15k": 10000, "15k+": 20000 };
  const budgetValue = budgetNumeric[profile?.budget ?? "1k-5k"] ?? 3000;

  const baseResult = useMemo<ScenarioOutput | null>(() => {
    if (!caps.canUseScenarioSimulator) return null;
    if (unitCost <= 0 || !financial?.recommended_price) return null;
    return simulateScenario({
      unitCost, price: financial.recommended_price, budget: budgetValue,
      moq: financial.break_even_units ?? 50, marketingBudget: financial.marketing_budget ?? 0, quantity,
    });
  }, [unitCost, financial, budgetValue, quantity, caps.canUseScenarioSimulator]);

  const presetResults = useMemo(() => {
    if (!caps.canUseScenarioSimulator) return [];
    if (unitCost <= 0 || !financial?.recommended_price) return [];
    return SCENARIO_PRESETS.map((preset) => {
      const input = applyPreset({
        unitCost, price: financial.recommended_price!, budget: budgetValue,
        moq: financial.break_even_units ?? 50, baseQuantity: quantity, baseMarketing: financial.marketing_budget ?? 0,
      }, preset);
      return { preset, result: simulateScenario(input), input };
    });
  }, [unitCost, financial, budgetValue, quantity, caps.canUseScenarioSimulator]);

  // Stress test result
  const stressResult = useMemo<StressTestResult | null>(() => {
    if (!caps.canUseScenarioSimulator || unitCost <= 0 || !financial?.recommended_price) return null;
    const effectiveStress = showSurvival ? WORST_CASE : stressInputs;
    const base: BaseFinancials = {
      unitCost, price: financial.recommended_price, quantity,
      marketingBudget: financial.marketing_budget ?? 0, fixedCosts: 500,
      totalCapital: budgetValue, returnRate: 8, monthlyRevenue: financial.recommended_price * quantity / 12,
    };
    return runStressTest(base, effectiveStress);
  }, [unitCost, financial, budgetValue, quantity, stressInputs, showSurvival, caps.canUseScenarioSimulator]);

  if (!shouldFetch) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            {isDE ? "Szenario-Simulator" : "Scenario Simulator"}
          </h2>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">PRO</span>
        </div>
        <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
          <Lock className="h-8 w-8" />
          <p className="text-sm max-w-xs">
            {isDE ? "Die meisten Gründer simulieren Szenarien, bevor sie Kapital binden." : "Most founders use Scenario Simulation before committing capital."}
          </p>
          <Button size="sm" className="mt-2 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => { trackEvent("clicked_upgrade", { source: "scenario_teaser", feature: "scenarioSimulator" }); window.location.href = "/dashboard/pricing"; }}>
            {isDE ? "Upgrade auf PRO" : "Upgrade to PRO"}
          </Button>
        </div>
      </div>
    );
  }

  if (!financial || unitCost <= 0) return null;

  const formatCurrency = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
  const riskColor = (index: number) => index >= 60 ? "text-destructive" : index >= 30 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400";

  if (!caps.canUseScenarioSimulator) {
    return (
      <LockedOverlay feature="scenarioSimulator" requiredPlan="pro">
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Activity className="h-5 w-5 text-accent" />{isDE ? "Szenario-Simulator" : "Scenario Simulator"}</h2>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">PRO</span>
          </div>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {["Projektion", "Break-Even", "Kapitalbindung", "Risiko-Index"].map((l) => (
              <div key={l} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground mb-1">{l}</p><p className="text-sm font-bold">—</p></div>
            ))}
          </div>
        </div>
      </LockedOverlay>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          {isDE ? "Stress-Test Simulator" : "Stress Test Simulator"}
        </h2>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">PRO</span>
      </div>

      {/* Quantity slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{isDE ? "Stückzahl" : "Quantity"}</span>
          <span className="font-bold">{quantity}</span>
        </div>
        <Slider value={[quantity]} onValueChange={([v]) => setQuantity(v)} min={50} max={2000} step={10} />
      </div>

      {/* Base KPIs */}
      {baseResult && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={baseResult.projectedProfit >= 0 ? TrendingUp : TrendingDown} label={isDE ? "Projektion" : "Projected Profit"} value={formatCurrency(baseResult.projectedProfit)} color={baseResult.projectedProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"} />
          <KpiCard icon={BarChart3} label="Break-Even" value={`${baseResult.breakEvenQuantity} ${isDE ? "Stk." : "pcs"}`} color="text-foreground" />
          <KpiCard icon={DollarSign} label={isDE ? "Kapitalbindung" : "Capital Locked"} value={formatCurrency(baseResult.capitalLocked)} color="text-foreground" />
          <KpiCard icon={Shield} label={isDE ? "Risiko-Index" : "Risk Index"} value={`${baseResult.riskIndex}/100`} color={riskColor(baseResult.riskIndex)} />
        </div>
      )}

      {/* Preset scenarios */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{isDE ? "Szenarien vergleichen" : "Compare Scenarios"}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {presetResults.map(({ preset, result }) => (
            <button key={preset.key} onClick={() => { setActivePreset(preset.key); }}
              className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${activePreset === preset.key ? "border-accent bg-accent/5 ring-1 ring-accent/20" : ""}`}>
              <p className="text-sm font-medium mb-2">{isDE ? preset.label.de : preset.label.en}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">{isDE ? "Gewinn" : "Profit"}</span><span className={result.projectedProfit >= 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-destructive font-medium"}>{formatCurrency(result.projectedProfit)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isDE ? "Risiko" : "Risk"}</span><span className={`font-medium ${riskColor(result.riskIndex)}`}>{result.riskIndex}/100</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ROI</span><span className="font-medium">{Math.round(result.roi)}%</span></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ STRESS TEST LAYER ═══ */}
      <div className="border-t pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-destructive" />
            {isDE ? "Multi-Stress-Simulation" : "Multi-Stress Simulation"}
          </h3>
          <div className="flex items-center gap-2">
            <Label htmlFor="survival" className="text-xs text-muted-foreground">{isDE ? "Worst-Case" : "Survival Mode"}</Label>
            <Switch id="survival" checked={showSurvival} onCheckedChange={(v) => { setShowSurvival(v); if (v) setStressInputs(WORST_CASE); else setStressInputs(STRESS_DEFAULTS); }} />
          </div>
        </div>

        {/* Stress sliders */}
        {!showSurvival && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([
              { key: "priceDropPct" as const, label: isDE ? "Preis" : "Price", suffix: "%", max: 30, color: "text-destructive" },
              { key: "returnIncreasePct" as const, label: isDE ? "Retouren" : "Returns", suffix: "%", max: 20, color: "text-yellow-600" },
              { key: "adsIncreasePct" as const, label: isDE ? "Ad-Kosten" : "Ad Costs", suffix: "%", max: 50, color: "text-orange-500" },
              { key: "delayDays" as const, label: isDE ? "Verzögerung" : "Delay", suffix: isDE ? " Tage" : " days", max: 60, color: "text-destructive" },
            ]).map(({ key, label, suffix, max, color }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-bold ${stressInputs[key] > 0 ? color : ""}`}>
                    {key === "priceDropPct" ? "-" : "+"}{stressInputs[key]}{suffix}
                  </span>
                </div>
                <Slider value={[stressInputs[key]]} onValueChange={([v]) => setStressInputs(s => ({ ...s, [key]: v }))} min={0} max={max} step={1} />
              </div>
            ))}
          </div>
        )}

        {/* Stress results */}
        {stressResult && (stressInputs.priceDropPct > 0 || stressInputs.returnIncreasePct > 0 || stressInputs.adsIncreasePct > 0 || stressInputs.delayDays > 0 || showSurvival) && (
          <div className="space-y-4">
            {/* Delta KPIs */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <KpiCard icon={TrendingDown} label={isDE ? "Profit-Delta" : "Profit Delta"} value={formatCurrency(stressResult.profitDelta)} color="text-destructive" />
              <KpiCard icon={Activity} label={isDE ? "Runway" : "Runway"} value={`${stressResult.runwayMonths} Mo.`} color={stressResult.runwayMonths < 3 ? "text-destructive" : "text-foreground"} />
              <KpiCard icon={Flame} label={isDE ? "Burn-Anstieg" : "Burn Increase"} value={`+${stressResult.burnAcceleration}%`} color={stressResult.burnAcceleration > 15 ? "text-destructive" : "text-yellow-600 dark:text-yellow-400"} />
              {stressResult.collapseMonth && (
                <KpiCard icon={AlertTriangle} label={isDE ? "Kollaps-Monat" : "Collapse Month"} value={`Monat ${stressResult.collapseMonth}`} color="text-destructive" />
              )}
            </div>

            {/* 12-Month Cashflow Mini-Graph */}
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{isDE ? "12-Monats Cashflow unter Stress" : "12-Month Stressed Cashflow"}</p>
              <div className="flex items-end gap-1 h-24">
                {stressResult.timeline.map((m) => {
                  const maxAbs = Math.max(...stressResult.timeline.map(t => Math.abs(t.cumulative)), 1);
                  const heightPct = Math.abs(m.cumulative) / maxAbs * 100;
                  const isNeg = m.cumulative < 0;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className={`w-full rounded-t-sm ${isNeg ? "bg-destructive/60" : "bg-green-500/60"}`}
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                        title={`M${m.month}: ${formatCurrency(m.cumulative)}`}
                      />
                      <span className="text-[8px] text-muted-foreground mt-1">{m.month}</span>
                    </div>
                  );
                })}
              </div>
              {stressResult.collapseMonth && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {isDE ? `Kapital erschöpft in Monat ${stressResult.collapseMonth}` : `Capital exhausted in month ${stressResult.collapseMonth}`}
                </p>
              )}
            </div>

            {/* Execution: Survival recommendations */}
            {isExecution && stressResult.survivalRecommendations.length > 0 && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1.5 text-amber-600">
                  <Zap className="h-3.5 w-3.5" />
                  {isDE ? "Automatische Empfehlungen" : "Automated Recommendations"}
                </p>
                {stressResult.survivalRecommendations.map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground">→ {isDE ? r.de : r.en}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><Icon className="h-3.5 w-3.5" />{label}</div>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
