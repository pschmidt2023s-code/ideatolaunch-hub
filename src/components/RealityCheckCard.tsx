import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { evaluateRealityCheck, type RealityCheckResult } from "@/lib/reality-check-engine";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LockedOverlay } from "@/components/LockedOverlay";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Wrench,
  Info,
  Lock,
  Zap,
} from "lucide-react";

const statusConfig = {
  safe: {
    icon: ShieldCheck,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    barColor: "bg-green-500",
    label: { de: "Sicher", en: "Safe" },
  },
  risky: {
    icon: ShieldAlert,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    barColor: "bg-yellow-500",
    label: { de: "Risikobehaftet", en: "Risky" },
  },
  critical: {
    icon: ShieldX,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
    barColor: "bg-destructive",
    label: { de: "Kritisch", en: "Critical" },
  },
};

const severityColors = {
  high: "text-destructive",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-muted-foreground",
};

export function RealityCheckCard() {
  const { i18n } = useTranslation();
  const { activeBrand } = useBrand();
  const { plan, isFree, isBuilder, isPro } = useSubscription();
  const brandId = activeBrand?.id;
  const isDE = i18n.language === "de";

  const { data: financial } = useQuery({
    queryKey: ["financial_model", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("financial_models")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_profiles")
        .select("budget")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const result: RealityCheckResult | null = useMemo(() => {
    if (!financial) return null;
    const unitCost =
      (financial.production_cost ?? 0) +
      (financial.packaging_cost ?? 0) +
      (financial.shipping_cost ?? 0);
    if (unitCost <= 0) return null;

    return evaluateRealityCheck({
      unitCost,
      recommendedPrice: financial.recommended_price ?? 0,
      margin: financial.margin ?? 0,
      marketingBudget: financial.marketing_budget ?? 0,
      breakEvenUnits: financial.break_even_units ?? 0,
      budget: profile?.budget ?? "1k-5k",
    });
  }, [financial, profile]);

  if (!result) return null;

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  // FREE: summary + 1 risk only
  const visibleRisks = isFree ? result.keyRisks.slice(0, 1) : result.keyRisks;
  const hiddenRiskCount = isFree ? Math.max(0, result.keyRisks.length - 1) : 0;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${config.color}`} />
          {isDE ? "Reality Check" : "Reality Check"}
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium border ${config.bg} ${config.color}`}
        >
          {isDE ? config.label.de : config.label.en}
        </span>
      </div>

      {/* Score bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {isDE ? "Machbarkeits-Score" : "Feasibility Score"}
          </span>
          <span className={`font-bold text-lg ${config.color}`}>
            {result.feasibilityScore}/100
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
            style={{ width: `${result.feasibilityScore}%` }}
          />
        </div>
      </div>

      {/* Top risk */}
      <div className="rounded-lg border p-4 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          {isDE ? "Größtes Risiko" : "Biggest Risk Right Now"}
        </p>
        <p className="text-sm font-medium">{result.topRisk}</p>
      </div>

      {/* Fix recommendation */}
      <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-accent flex items-center gap-1.5">
          <Wrench className="h-3.5 w-3.5" />
          {isDE ? "Das solltest du zuerst ändern" : "Fix This First"}
        </p>
        <p className="text-sm">{result.recommendedFix}</p>
      </div>

      {/* Why it matters */}
      <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>{result.whyItMatters}</p>
      </div>

      {/* Full risk breakdown — Builder+ */}
      {isBuilder && visibleRisks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isDE ? "Alle erkannten Risiken" : "All Identified Risks"}
          </p>
          <div className="space-y-2">
            {visibleRisks.map((risk) => (
              <div
                key={risk.id}
                className="flex items-start gap-2.5 rounded-lg border p-3"
              >
                <AlertTriangle
                  className={`h-4 w-4 shrink-0 mt-0.5 ${severityColors[risk.severity]}`}
                />
                <p className="text-sm">{risk.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free plan: locked hint */}
      {isFree && hiddenRiskCount > 0 && (
        <div className="relative rounded-lg border border-dashed p-4 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            <p className="text-sm">
              {isDE
                ? `+${hiddenRiskCount} weitere Risiken – sichtbar ab Builder-Plan`
                : `+${hiddenRiskCount} more risks – visible with Builder plan`}
            </p>
          </div>
        </div>
      )}

      {/* Pro: Scenario Simulation placeholder */}
      {isPro && (
        <Button variant="outline" disabled className="w-full gap-2 opacity-60">
          <Zap className="h-4 w-4" />
          {isDE ? "Szenario-Simulation (bald verfügbar)" : "Scenario Simulation (coming soon)"}
        </Button>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center italic">
        {isDE
          ? "Dies ist eine Orientierungshilfe, keine Finanzberatung. Passe die Werte an deine Situation an."
          : "This is guidance, not financial advice. Adjust values to fit your situation."}
      </p>
    </div>
  );
}
