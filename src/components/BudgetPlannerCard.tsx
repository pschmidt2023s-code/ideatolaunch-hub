import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { planBudget, type BudgetPlanResult } from "@/lib/budget-planner";
import { LockedOverlay } from "@/components/LockedOverlay";
import { AlertTriangle, PieChart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCapabilities } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";

const SEGMENTS = [
  { key: "production" as const, labelDe: "Produktion", labelEn: "Production", color: "bg-blue-500" },
  { key: "marketing" as const, labelDe: "Marketing", labelEn: "Marketing", color: "bg-accent" },
  { key: "logistics" as const, labelDe: "Logistik", labelEn: "Logistics", color: "bg-purple-500" },
  { key: "reserve" as const, labelDe: "Reserve", labelEn: "Reserve", color: "bg-green-500" },
];

export function BudgetPlannerCard() {
  const { i18n } = useTranslation();
  const { activeBrand } = useBrand();
  const { plan } = useSubscription();
  const brandId = activeBrand?.id;
  const isDE = i18n.language === "de";
  const caps = getCapabilities(plan);

  // HARD GATING: Don't fetch data for free users
  const shouldCompute = caps.canUseBudgetPlanner;

  const { data: financial } = useQuery({
    queryKey: ["financial_model", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("financial_models").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId && shouldCompute,
  });

  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("budget").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId && shouldCompute,
  });

  const budgetNumeric: Record<string, number> = { "<1k": 800, "1k-5k": 3000, "5k-15k": 10000, "15k+": 20000 };

  const result = useMemo<BudgetPlanResult | null>(() => {
    if (!shouldCompute || !financial) return null;
    const unitCost = (financial.production_cost ?? 0) + (financial.packaging_cost ?? 0) + (financial.shipping_cost ?? 0);
    if (unitCost <= 0) return null;
    const budgetValue = budgetNumeric[profile?.budget ?? "1k-5k"] ?? 3000;
    const quantity = financial.break_even_units ?? 100;
    return planBudget(budgetValue, unitCost, quantity, financial.marketing_budget ?? 0);
  }, [financial, profile, shouldCompute]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  // FREE: contextual teaser — no logic executed
  if (!shouldCompute) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5 text-accent" />
            {isDE ? "Budget-Planer" : "Budget Planner"}
          </h2>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">Builder+</span>
        </div>
        <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
          <Lock className="h-8 w-8" />
          <p className="text-sm max-w-xs">
            {isDE
              ? "Wisse genau, wie du dein Budget auf Produktion, Marketing und Reserve verteilst."
              : "Know exactly how to allocate your budget across production, marketing, and reserves."}
          </p>
          <Button
            size="sm"
            className="mt-2 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              trackEvent("clicked_upgrade", { source: "budget_teaser", feature: "budgetPlanner" });
              window.location.href = "/dashboard/pricing";
            }}
          >
            {isDE ? "Upgrade auf Builder" : "Upgrade to Builder"}
          </Button>
        </div>
      </div>
    );
  }

  if (!financial || !result) return null;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5 text-accent" />
          {isDE ? "Budget-Planer" : "Budget Planner"}
        </h2>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">Builder+</span>
      </div>

      <div className="space-y-3">
        <div className="flex h-4 w-full rounded-full overflow-hidden">
          {SEGMENTS.map((seg) => (
            <div
              key={seg.key}
              className={`${seg.color} transition-all duration-300`}
              style={{ width: `${Math.max(result.percentages[seg.key], 1)}%` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SEGMENTS.map((seg) => (
            <div key={seg.key} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${seg.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{isDE ? seg.labelDe : seg.labelEn}</p>
                <p className="text-sm font-medium">
                  {formatCurrency(result.allocation[seg.key])}{" "}
                  <span className="text-xs text-muted-foreground">({result.percentages[seg.key]}%)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.reserveWarning && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              {isDE ? `Reserve nur ${result.reservePercent}%` : `Reserve only ${result.reservePercent}%`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isDE
                ? "Empfohlen: mindestens 20 % als Puffer für Unvorhergesehenes."
                : "Recommended: at least 20% as buffer for unexpected costs."}
            </p>
          </div>
        </div>
      )}

      {result.suggestions.length > 0 && (
        <div className="space-y-2">
          {result.suggestions.map((s, i) => (
            <p key={i} className="text-xs text-muted-foreground">• {s}</p>
          ))}
        </div>
      )}
    </div>
  );
}
