import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { Rocket, AlertTriangle, TrendingUp } from "lucide-react";

interface TriggerContext {
  warningCount: number;
  breakEvenHigh: boolean;
  moqPressure: boolean;
  lowMargin: boolean;
  lowRunway: boolean;
}

function getUpgradeCopy(ctx: TriggerContext, isDE: boolean): { title: string; desc: string } | null {
  if (ctx.lowMargin) {
    return {
      title: isDE ? "Marge unter 35% — Kapitalrisiko" : "Margin below 35% — capital at risk",
      desc: isDE
        ? "Execution OS schützt dein Kapital mit Echtzeit-Margen-Überwachung und strategischen Alerts."
        : "Execution OS protects your capital with real-time margin monitoring and strategic alerts.",
    };
  }
  if (ctx.lowRunway) {
    return {
      title: isDE ? "Cash Runway unter 3 Monaten" : "Cash runway under 3 months",
      desc: isDE
        ? "Execution OS erkennt Liquiditätsrisiken und gibt dir Kapitalschutz-Alerts, bevor es kritisch wird."
        : "Execution OS detects liquidity risks and gives you capital protection alerts before it's critical.",
    };
  }
  if (ctx.moqPressure) {
    return {
      title: isDE ? "Dein MOQ frisst dein Budget" : "Your MOQ is eating your budget",
      desc: isDE
        ? "Wisse genau, wie du dein Budget auf Produktion, Marketing und Reserve verteilst."
        : "Know exactly how to allocate your budget across production, marketing, and reserves.",
    };
  }
  if (ctx.breakEvenHigh) {
    return {
      title: isDE ? "Langer Weg bis zum Break-Even" : "Long road to break-even",
      desc: isDE
        ? "Simuliere Szenarien, bevor du Kapital bindest. Finde die optimale Menge und Preisstrategie."
        : "Simulate scenarios before committing capital. Find the optimal quantity and pricing strategy.",
    };
  }
  if (ctx.warningCount >= 2) {
    return {
      title: isDE ? "Mehrere Risiken erkannt" : "Multiple risks detected",
      desc: isDE
        ? "Erkenne alle Risiken und erhalte konkrete Lösungsvorschläge — Kapitalschutz für deinen Launch."
        : "Identify all risks and get concrete fix suggestions — capital protection for your launch.",
    };
  }
  return null;
}

export function SmartUpgradePrompt() {
  const { i18n } = useTranslation();
  const { isFree } = useSubscription();
  const { activeBrand } = useBrand();
  const navigate = useNavigate();
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

  const trigger = useMemo<TriggerContext | null>(() => {
    if (!financial || !isFree) return null;

    const unitCost = (financial.production_cost ?? 0) + (financial.packaging_cost ?? 0) + (financial.shipping_cost ?? 0);
    if (unitCost <= 0) return null;

    const margin = financial.margin ?? 0;
    const breakEvenUnits = financial.break_even_units ?? 0;
    const budgetNumeric: Record<string, number> = { "<1k": 800, "1k-5k": 3000, "5k-15k": 10000, "15k+": 20000 };
    const budgetValue = budgetNumeric[profile?.budget ?? "1k-5k"] ?? 3000;
    const moqCost = unitCost * Math.max(breakEvenUnits, 50);
    const moqRatio = moqCost / (budgetValue || 1);

    let warningCount = 0;
    const lowMargin = margin < 35;
    if (lowMargin) warningCount++;
    if (breakEvenUnits > 300) warningCount++;
    if (moqRatio > 0.5) warningCount++;
    if ((financial.marketing_budget ?? 0) <= 0) warningCount++;

    const shouldShow = warningCount >= 2 || breakEvenUnits > 300 || moqRatio > 0.6 || lowMargin;
    if (!shouldShow) return null;

    return {
      warningCount,
      breakEvenHigh: breakEvenUnits > 300,
      moqPressure: moqRatio > 0.6,
      lowMargin,
      lowRunway: false,
    };
  }, [financial, profile, isFree]);

  if (!trigger) return null;

  const copy = getUpgradeCopy(trigger, isDE);
  if (!copy) return null;

  const icon = trigger.moqPressure
    ? AlertTriangle
    : trigger.breakEvenHigh
    ? TrendingUp
    : Rocket;
  const Icon = icon;

  const triggerType = trigger.lowMargin ? "low_margin" : trigger.lowRunway ? "low_runway" : trigger.moqPressure ? "moq" : trigger.breakEvenHigh ? "breakeven" : "warnings";

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{copy.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{copy.desc}</p>
          <Button
            size="sm"
            className="mt-3 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              trackEvent("clicked_smart_upgrade", {
                source: "reality_check",
                trigger: triggerType,
              });
              navigate("/dashboard/pricing");
            }}
          >
            {isDE ? "Plan upgraden" : "Upgrade Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
