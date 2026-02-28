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
import { Button } from "@/components/ui/button";
import {
  Activity, TrendingUp, TrendingDown, DollarSign, Shield, BarChart3, Lock,
  AlertTriangle, Flame,
} from "lucide-react";
import { getCapabilities } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";
import { runStressTest, type StressInputs, type StressResult } from "@/lib/stress-test-engine";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";

export function ScenarioSimulatorCard() {
  const { i18n } = useTranslation();
  const { plan } = useSubscription();
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;
  const isDE = i18n.language === "de";
  const caps = getCapabilities(plan);
  const isExecution = plan === "execution";
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

  // Stress inputs
  const [priceChange, setPriceChange] = useState(-10);
  const [returnChange, setReturnChange] = useState(8);
  const [adsChange, setAdsChange] = useState(20);
  const [delayDays, setDelayDays] = useState(0);
  const [survivalMode, setSurvivalMode] = useState(false);

  const unitCost = useMemo(() => {
    if (!financial) return 0;
    return (financial.production_cost ?? 0) + (financial.packaging_cost ?? 0) + (financial.shipping_cost ?? 0);
  }, [financial]);

  const budgetNumeric: Record<string, number> = { "<1k": 800, "1k-5k": 3000, "5k-15k": 10000, "15k+": 20000 };
  const budgetValue = budgetNumeric[profile?.budget ?? "1k-5k"] ?? 3000;

  const stressResult = useMemo<StressResult | null>(() => {
    if (!caps.canUseScenarioSimulator || unitCost <= 0 || !financial?.recommended_price) return null;
    const inputs: StressInputs = {
      unitCost,
      price: financial.recommended_price,
      quantity: financial.break_even_units ? financial.break_even_units * 3 : 300,
      marketingBudget: financial.marketing_budget ?? 500,
      fixedCosts: 200,
      totalCapital: budgetValue,
      returnRate: 8,
      priceChange: survivalMode ? -15 : priceChange,
      returnChange: survivalMode ? 12 : returnChange,
      adsChange: survivalMode ? 30 : adsChange,
      delayDays: survivalMode ? 30 : delayDays,
    };
    return runStressTest(inputs);
  }, [unitCost, financial, budgetValue, priceChange, returnChange, adsChange, delayDays, survivalMode, caps.canUseScenarioSimulator]);

  // FREE: teaser
  if (!shouldFetch) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            {isDE ? "Stress-Test Simulator" : "Stress Test Simulator"}
          </h2>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">PRO</span>
        </div>
        <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
          <Lock className="h-8 w-8" />
          <p className="text-sm max-w-xs">
            {isDE
              ? "Simuliere gleichzeitige Stressfaktoren, bevor du Kapital bindest."
              : "Simulate simultaneous stress factors before committing capital."}
          </p>
          <Button
            size="sm"
            className="mt-2 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              trackEvent("clicked_upgrade", { source: "stress_test_teaser" });
              window.location.href = "/dashboard/pricing";
            }}
          >
            {isDE ? "Upgrade auf PRO" : "Upgrade to PRO"}
          </Button>
        </div>
      </div>
    );
  }

  if (!financial || unitCost <= 0) return null;

  if (!caps.canUseScenarioSimulator) {
    return (
      <LockedOverlay feature="scenarioSimulator" requiredPlan="pro">
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              {isDE ? "Stress-Test Simulator" : "Stress Test Simulator"}
            </h2>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">PRO</span>
          </div>
          <div className="h-40 bg-muted/30 rounded-lg" />
        </div>
      </LockedOverlay>
    );
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const riskColor = (level: string) =>
    level === "critical" ? "text-destructive" : level === "high" ? "text-orange-500" : level === "medium" ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400";

  const riskBg = (level: string) =>
    level === "critical" ? "bg-destructive/10 border-destructive/30" : level === "high" ? "bg-orange-500/10 border-orange-500/30" : level === "medium" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-green-500/10 border-green-500/30";

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          {isDE ? "Stress-Test Simulator" : "Stress Test Simulator"}
        </h2>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">PRO</span>
      </div>

      {/* Stress Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StressSlider
          label={isDE ? "Preisänderung" : "Price Change"}
          value={priceChange}
          onChange={setPriceChange}
          min={-30}
          max={10}
          suffix="%"
          disabled={survivalMode}
        />
        <StressSlider
          label={isDE ? "Retouren-Anstieg" : "Return Rate Increase"}
          value={returnChange}
          onChange={setReturnChange}
          min={0}
          max={20}
          suffix="%"
          disabled={survivalMode}
        />
        <StressSlider
          label={isDE ? "Marketing-Kosten" : "Ads Spend Change"}
          value={adsChange}
          onChange={setAdsChange}
          min={0}
          max={50}
          suffix="%"
          disabled={survivalMode}
        />
        <StressSlider
          label={isDE ? "Produktions-Delay" : "Production Delay"}
          value={delayDays}
          onChange={setDelayDays}
          min={0}
          max={60}
          suffix={isDE ? " Tage" : " days"}
          disabled={survivalMode}
        />
      </div>

      {/* Survival Mode Toggle */}
      <div className="flex items-center gap-3 rounded-lg border p-3">
        <Switch checked={survivalMode} onCheckedChange={setSurvivalMode} />
        <div>
          <Label className="text-sm font-medium cursor-pointer">
            {isDE ? "Überlebens-Szenario" : "Survival Scenario"}
          </Label>
          <p className="text-xs text-muted-foreground">
            {isDE ? "Worst-Case: -15% Preis, +12% Retouren, +30% Ads, 30 Tage Delay" : "Worst case: -15% price, +12% returns, +30% ads, 30-day delay"}
          </p>
        </div>
      </div>

      {stressResult && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={stressResult.stressedProfit >= 0 ? TrendingUp : TrendingDown}
              label={isDE ? "Gewinn (Stress)" : "Profit (Stressed)"}
              value={formatCurrency(stressResult.stressedProfit)}
              color={stressResult.stressedProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}
            />
            <KpiCard
              icon={DollarSign}
              label={isDE ? "Gewinn-Delta" : "Profit Delta"}
              value={formatCurrency(stressResult.profitDelta)}
              color={stressResult.profitDelta >= 0 ? "text-green-600" : "text-destructive"}
            />
            <KpiCard
              icon={Shield}
              label={isDE ? "Runway (Stress)" : "Runway (Stressed)"}
              value={stressResult.stressedRunwayMonths >= 99 ? "∞" : `${stressResult.stressedRunwayMonths}M`}
              color={riskColor(stressResult.riskLevel)}
            />
            <KpiCard
              icon={Flame}
              label={isDE ? "Burn-Beschleunigung" : "Burn Acceleration"}
              value={`+${stressResult.burnAcceleration}%`}
              color={stressResult.burnAcceleration > 30 ? "text-destructive" : "text-yellow-600"}
            />
          </div>

          {/* Collapse Warning */}
          {stressResult.collapseMonth !== null && (
            <div className={`rounded-lg border p-3 ${riskBg(stressResult.riskLevel)}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${riskColor(stressResult.riskLevel)}`} />
                <p className={`text-sm font-medium ${riskColor(stressResult.riskLevel)}`}>
                  {isDE
                    ? `Kapital-Kollaps in Monat ${stressResult.collapseMonth}`
                    : `Capital collapse in month ${stressResult.collapseMonth}`}
                </p>
              </div>
            </div>
          )}

          {/* 12-Month Cashflow Graph */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {isDE ? "12-Monats Cashflow" : "12-Month Cashflow"}
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stressResult.cashflow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="base" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name={isDE ? "Basis" : "Base"} />
                  <Line type="monotone" dataKey="stressed" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name={isDE ? "Stress" : "Stressed"} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Execution Tier: Survival Recommendations */}
          {isExecution && stressResult.survivalRecommendations.length > 0 && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                {isDE ? "Execution OS — Strategische Empfehlung" : "Execution OS — Strategic Recommendation"}
              </p>
              {stressResult.survivalRecommendations.map((rec, i) => (
                <p key={i} className="text-sm text-foreground">
                  {isDE ? rec.de : rec.en}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StressSlider({
  label, value, onChange, min, max, suffix, disabled,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; suffix: string; disabled?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">{value > 0 ? `+${value}` : value}{suffix}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={1}
        disabled={disabled}
      />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
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
