import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LockedOverlay } from "@/components/LockedOverlay";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  simulateScenario,
  applyPreset,
  SCENARIO_PRESETS,
  type ScenarioOutput,
} from "@/lib/scenario-simulator";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Activity,
  BarChart3,
  Lock,
} from "lucide-react";

export function ScenarioSimulatorCard() {
  const { i18n } = useTranslation();
  const { isPro, isBuilder, isFree } = useSubscription();
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;
  const isDE = i18n.language === "de";

  const { data: financial } = useQuery({
    queryKey: ["financial_model", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("financial_models").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("budget").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const [quantity, setQuantity] = useState(200);
  const [activePreset, setActivePreset] = useState<string>("realistic");

  const unitCost = useMemo(() => {
    if (!financial) return 0;
    return (financial.production_cost ?? 0) + (financial.packaging_cost ?? 0) + (financial.shipping_cost ?? 0);
  }, [financial]);

  const budgetNumeric: Record<string, number> = { "<1k": 800, "1k-5k": 3000, "5k-15k": 10000, "15k+": 20000 };
  const budgetValue = budgetNumeric[profile?.budget ?? "1k-5k"] ?? 3000;

  const baseResult = useMemo<ScenarioOutput | null>(() => {
    if (unitCost <= 0 || !financial?.recommended_price) return null;
    return simulateScenario({
      unitCost,
      price: financial.recommended_price,
      budget: budgetValue,
      moq: financial.break_even_units ?? 50,
      marketingBudget: financial.marketing_budget ?? 0,
      quantity,
    });
  }, [unitCost, financial, budgetValue, quantity]);

  const presetResults = useMemo(() => {
    if (unitCost <= 0 || !financial?.recommended_price) return [];
    return SCENARIO_PRESETS.map((preset) => {
      const input = applyPreset(
        {
          unitCost,
          price: financial.recommended_price!,
          budget: budgetValue,
          moq: financial.break_even_units ?? 50,
          baseQuantity: quantity,
          baseMarketing: financial.marketing_budget ?? 0,
        },
        preset
      );
      return { preset, result: simulateScenario(input), input };
    });
  }, [unitCost, financial, budgetValue, quantity]);

  if (!financial || unitCost <= 0) return null;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  // FREE: teaser only
  if (isFree) {
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
            {isDE
              ? "Simuliere verschiedene Szenarien und finde die optimale Startmenge für dein Budget."
              : "Simulate different scenarios and find the optimal starting quantity for your budget."}
          </p>
          <Button
            size="sm"
            className="mt-2 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => window.location.href = "/dashboard/pricing"}
          >
            {isDE ? "Upgrade auf PRO" : "Upgrade to PRO"}
          </Button>
        </div>
      </div>
    );
  }

  // BUILDER: blurred preview
  if (isBuilder && !isPro) {
    return (
      <LockedOverlay message={isDE ? "Szenario-Simulator – nur für PRO" : "Scenario Simulator – PRO only"}>
        <SimulatorContent
          isDE={isDE}
          quantity={quantity}
          setQuantity={setQuantity}
          activePreset={activePreset}
          setActivePreset={setActivePreset}
          baseResult={baseResult}
          presetResults={presetResults}
          formatCurrency={formatCurrency}
        />
      </LockedOverlay>
    );
  }

  // PRO: full access
  return (
    <SimulatorContent
      isDE={isDE}
      quantity={quantity}
      setQuantity={setQuantity}
      activePreset={activePreset}
      setActivePreset={setActivePreset}
      baseResult={baseResult}
      presetResults={presetResults}
      formatCurrency={formatCurrency}
    />
  );
}

interface SimulatorContentProps {
  isDE: boolean;
  quantity: number;
  setQuantity: (q: number) => void;
  activePreset: string;
  setActivePreset: (p: string) => void;
  baseResult: ScenarioOutput | null;
  presetResults: { preset: (typeof SCENARIO_PRESETS)[number]; result: ScenarioOutput; input: any }[];
  formatCurrency: (n: number) => string;
}

function SimulatorContent({
  isDE,
  quantity,
  setQuantity,
  activePreset,
  setActivePreset,
  baseResult,
  presetResults,
  formatCurrency,
}: SimulatorContentProps) {
  const riskColor = (index: number) =>
    index >= 60 ? "text-destructive" : index >= 30 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400";

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          {isDE ? "Szenario-Simulator" : "Scenario Simulator"}
        </h2>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">PRO</span>
      </div>

      {/* Quantity slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{isDE ? "Stückzahl" : "Quantity"}</span>
          <span className="font-bold">{quantity}</span>
        </div>
        <Slider
          value={[quantity]}
          onValueChange={([v]) => setQuantity(v)}
          min={50}
          max={2000}
          step={10}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>50</span>
          <span>2.000</span>
        </div>
      </div>

      {/* Current scenario KPIs */}
      {baseResult && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={baseResult.projectedProfit >= 0 ? TrendingUp : TrendingDown}
            label={isDE ? "Projektion" : "Projected Profit"}
            value={formatCurrency(baseResult.projectedProfit)}
            color={baseResult.projectedProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}
          />
          <KpiCard
            icon={BarChart3}
            label="Break-Even"
            value={`${baseResult.breakEvenQuantity} ${isDE ? "Stk." : "pcs"}`}
            color="text-foreground"
          />
          <KpiCard
            icon={DollarSign}
            label={isDE ? "Kapitalbindung" : "Capital Locked"}
            value={formatCurrency(baseResult.capitalLocked)}
            color="text-foreground"
          />
          <KpiCard
            icon={Shield}
            label={isDE ? "Risiko-Index" : "Risk Index"}
            value={`${baseResult.riskIndex}/100`}
            color={riskColor(baseResult.riskIndex)}
          />
        </div>
      )}

      {/* Presets */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {isDE ? "Szenarien vergleichen" : "Compare Scenarios"}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {presetResults.map(({ preset, result }) => {
            const isActive = activePreset === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => {
                  setActivePreset(preset.key);
                  setQuantity(result.breakEvenQuantity > 50 ? Math.min(result.breakEvenQuantity * 2, 2000) : quantity);
                }}
                className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                  isActive ? "border-accent bg-accent/5 ring-1 ring-accent/20" : ""
                }`}
              >
                <p className="text-sm font-medium mb-2">
                  {isDE ? preset.label.de : preset.label.en}
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isDE ? "Gewinn" : "Profit"}</span>
                    <span className={result.projectedProfit >= 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-destructive font-medium"}>
                      {formatCurrency(result.projectedProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isDE ? "Risiko" : "Risk"}</span>
                    <span className={`font-medium ${riskColor(result.riskIndex)}`}>{result.riskIndex}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI</span>
                    <span className="font-medium">{Math.round(result.roi)}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
