import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Target, BarChart3, AlertTriangle, Save, Loader2, Check } from "lucide-react";
import { ExplainThis } from "@/components/ExplainThis";
import { RealityCheckCard } from "@/components/RealityCheckCard";
import { useBrand } from "@/hooks/useBrand";
import { suggestPriceRange, calculateSensitivity } from "@/lib/brand-health-engine";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { trackEvent, withPerfTracking, logError } from "@/lib/analytics";

export function StepBusinessCalculator() {
  const { activeBrand } = useBrand();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("price_level").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: savedFinancial } = useQuery({
    queryKey: ["financial_model", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("financial_models").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const [costs, setCosts] = useState({
    production: 0,
    packaging: 0,
    shipping: 0,
    marketing: 0,
  });
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirty = useRef(false);

  // Hydrate from saved data
  useEffect(() => {
    if (savedFinancial) {
      setCosts({
        production: savedFinancial.production_cost ?? 0,
        packaging: savedFinancial.packaging_cost ?? 0,
        shipping: savedFinancial.shipping_cost ?? 0,
        marketing: savedFinancial.marketing_budget ?? 0,
      });
    }
  }, [savedFinancial]);

  const update = (key: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num < 0) return;
    isDirty.current = true;
    setCosts((p) => ({ ...p, [key]: num || 0 }));
  };

  const total = costs.production + costs.packaging + costs.shipping;

  const priceRange = useMemo(
    () => suggestPriceRange(total, profile?.price_level),
    [total, profile?.price_level]
  );

  const margin = useMemo(
    () => (priceRange.sweet > 0 ? Math.round(((priceRange.sweet - total) / priceRange.sweet) * 100) : 0),
    [priceRange.sweet, total]
  );

  const breakEven = useMemo(
    () => (priceRange.sweet - total > 0 ? Math.ceil(costs.marketing / (priceRange.sweet - total)) : 0),
    [costs.marketing, priceRange.sweet, total]
  );

  const sensitivity = useMemo(
    () => calculateSensitivity(total, costs.marketing),
    [total, costs.marketing]
  );

  const marginWarning = margin > 0 && margin < 30;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const maxUnits = Math.max(breakEven * 2, 100);
  const breakEvenPoints = useMemo(() => {
    if (total <= 0 || priceRange.sweet <= total) return [];
    const profitPerUnit = priceRange.sweet - total;
    return Array.from({ length: 6 }, (_, i) => {
      const units = Math.round((maxUnits / 5) * i);
      return {
        units,
        revenue: units * priceRange.sweet,
        cost: units * total + costs.marketing,
        profit: units * profitPerUnit - costs.marketing,
      };
    });
  }, [total, priceRange.sweet, costs.marketing, maxUnits]);

  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    if (costs.production < 0 || costs.packaging < 0 || costs.shipping < 0 || costs.marketing < 0) {
      if (showToast) toast.error("Kosten dürfen nicht negativ sein.");
      return;
    }

    setSaving(true);
    const payload = {
      brand_id: brandId,
      production_cost: costs.production,
      packaging_cost: costs.packaging,
      shipping_cost: costs.shipping,
      marketing_budget: costs.marketing,
      recommended_price: priceRange.sweet,
      margin,
      break_even_units: breakEven,
    };

    try {
      await withPerfTracking("save_financial_model", async () => {
        const { data: existing } = await supabase
          .from("financial_models")
          .select("id")
          .eq("brand_id", brandId)
          .maybeSingle();

        const { error } = existing
          ? await supabase.from("financial_models").update(payload).eq("id", existing.id)
          : await supabase.from("financial_models").insert(payload);

        if (error) throw error;
      });

      if (showToast) {
        toast.success(t("steps.saved"));
        trackEvent("calculated_price", { margin, breakEven, sweetSpot: priceRange.sweet });
      } else {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
      queryClient.invalidateQueries({ queryKey: ["financial_model", brandId] });
    } catch (err: any) {
      if (showToast) toast.error(t("steps.saveError"));
      logError(err.message || "Financial model save failed", {
        errorType: "api",
        metadata: { brandId },
      });
    } finally {
      setSaving(false);
    }
  }, [brandId, costs, priceRange.sweet, margin, breakEven, queryClient, t]);

  // Auto-save on changes (debounced 2s) — only after user interaction
  useEffect(() => {
    if (!isDirty.current || !brandId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveToDb(false);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [costs, brandId]);

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{t("step3.inputTitle")}</h2>
          <div className="flex items-center gap-2">
            {autoSaved && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground animate-fade-in">
                <Check className="h-3 w-3" /> Auto-gespeichert
              </span>
            )}
            <Button onClick={() => saveToDb(true)} disabled={saving || total === 0} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("steps.save")}
            </Button>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { key: "production", label: t("step3.production") },
            { key: "packaging", label: t("step3.packaging") },
            { key: "shipping", label: t("step3.shipping") },
            { key: "marketing", label: t("step3.marketing") },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-7"
                  value={costs[key as keyof typeof costs] || ""}
                  onChange={(e) => update(key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Margin Warning */}
      {marginWarning && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">{t("step3.marginWarning")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("step3.marginWarningDesc")}</p>
          </div>
        </div>
      )}

      {/* KPIs with price range */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 text-accent" />
            {t("step3.priceRange")}
          </div>
          <p className="mt-2 text-xl font-bold">
            {formatCurrency(priceRange.min)} – {formatCurrency(priceRange.max)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sweet Spot: <span className="font-semibold text-accent">{formatCurrency(priceRange.sweet)}</span>
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className={`h-4 w-4 ${marginWarning ? "text-destructive" : "text-green-600 dark:text-green-400"}`} />
            {t("step3.margin")} <ExplainThis term="Margin" />
          </div>
          <p className={`mt-2 text-2xl font-bold ${marginWarning ? "text-destructive" : ""}`}>{margin}%</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4 text-blue-500" />
            {t("step3.breakEven")} <ExplainThis term="Break-even" />
          </div>
          <p className="mt-2 text-2xl font-bold">{breakEven} {t("step3.pieces")}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            {t("step3.unitCost")}
          </div>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Break-Even Visualization */}
      {breakEvenPoints.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">{t("step3.breakEvenViz")}</h2>
          <div className="space-y-3">
            {breakEvenPoints.map(({ units, revenue, cost, profit }) => {
              const maxVal = Math.max(...breakEvenPoints.map((p) => Math.max(p.revenue, p.cost)));
              const revenueWidth = maxVal > 0 ? (revenue / maxVal) * 100 : 0;
              const costWidth = maxVal > 0 ? (cost / maxVal) * 100 : 0;
              const isProfitable = profit >= 0;
              const isBreakEvenZone = Math.abs(units - breakEven) < maxUnits * 0.15;

              return (
                <div key={units} className={`rounded-lg border p-3 ${isBreakEvenZone ? "border-accent/40 bg-accent/5" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{units} {t("step3.pieces")}</span>
                    <span className={`text-sm font-semibold ${isProfitable ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                      {formatCurrency(profit)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-xs text-muted-foreground">{t("step3.revenue")}</span>
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-green-500/60" style={{ width: `${revenueWidth}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-xs text-muted-foreground">{t("step3.costs")}</span>
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-destructive/60" style={{ width: `${costWidth}%` }} />
                      </div>
                    </div>
                  </div>
                  {isBreakEvenZone && (
                    <p className="mt-1 text-xs font-medium text-accent">← Break-Even Zone</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Profit Sensitivity */}
      {sensitivity.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">{t("step3.sensitivity")}</h2>
          <p className="mb-4 text-sm text-muted-foreground">{t("step3.sensitivityDesc")}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">{t("step3.price")}</th>
                  <th className="py-2 text-right font-medium">{t("step3.margin")}</th>
                  <th className="py-2 text-right font-medium">@ 100</th>
                  <th className="py-2 text-right font-medium">@ 500</th>
                  <th className="py-2 text-right font-medium">BE</th>
                </tr>
              </thead>
              <tbody>
                {sensitivity.map((row) => {
                  const isSweetSpot = Math.abs(row.price - priceRange.sweet) < 0.5;
                  return (
                    <tr
                      key={row.price}
                      className={`border-b last:border-0 ${isSweetSpot ? "bg-accent/10 font-medium" : ""}`}
                    >
                      <td className="py-2">{formatCurrency(row.price)}{isSweetSpot && " ★"}</td>
                      <td className={`py-2 text-right ${row.margin < 30 ? "text-destructive" : ""}`}>{row.margin}%</td>
                      <td className={`py-2 text-right ${row.profitAt100 < 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                        {formatCurrency(row.profitAt100)}
                      </td>
                      <td className={`py-2 text-right ${row.profitAt500 < 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                        {formatCurrency(row.profitAt500)}
                      </td>
                      <td className="py-2 text-right">{row.breakEven}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Reality Check */}
      {total > 0 && <RealityCheckCard />}
    </div>
  );
}
