import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { AlertTriangle, Shield, TrendingDown, Zap } from "lucide-react";

interface TriggerContext {
  warningCount: number;
  breakEvenHigh: boolean;
  moqPressure: boolean;
  lowMargin: boolean;
  lowRunway: boolean;
  highCapitalExposure: boolean;
  triggerType: string;
}

function getUpgradeCopy(ctx: TriggerContext, isDE: boolean): { risk: string; framing: string; benefit: string; cta: string } | null {
  if (ctx.lowRunway) {
    return {
      risk: isDE ? "Niedriger Runway erkannt." : "Low runway detected.",
      framing: isDE
        ? "Gründer in dieser Situation verlieren durchschnittlich 3.000–12.000 € durch unkontrolliertes Scaling."
        : "Founders in this range often lose €3,000–€12,000 due to miscalculated scaling.",
      benefit: isDE
        ? "Execution OS liefert Echtzeit-Kapitalschutz-Alerts, bevor es kritisch wird."
        : "Execution OS provides real-time capital protection alerts before it's critical.",
      cta: isDE ? "Kapital schützen" : "Protect Capital",
    };
  }
  if (ctx.lowMargin) {
    return {
      risk: isDE ? "Marge unter 35% — Kapitalrisiko." : "Margin below 35% — capital at risk.",
      framing: isDE
        ? "Bei dieser Marge reicht ein Retourenanstieg von 5%, um Verluste auszulösen."
        : "At this margin, a 5% return rate increase can trigger losses.",
      benefit: isDE
        ? "Execution OS überwacht deine Marge und warnt bei kritischen Schwellenwerten."
        : "Execution OS monitors your margin and warns at critical thresholds.",
      cta: isDE ? "Marge absichern" : "Secure Margin",
    };
  }
  if (ctx.highCapitalExposure) {
    return {
      risk: isDE ? "Hohe Kapitalbindung erkannt." : "High capital exposure detected.",
      framing: isDE
        ? "Execution OS schützt dein Kapital vor Überproduktion und Lagerrisiken."
        : "Execution OS protects your capital from overproduction and inventory risk.",
      benefit: isDE
        ? "Kapitalschutz-Alerts + Runway-Überwachung in Echtzeit."
        : "Capital protection alerts + runway monitoring in real-time.",
      cta: isDE ? "Kapital schützen" : "Protect Capital",
    };
  }
  if (ctx.moqPressure) {
    return {
      risk: isDE ? "Dein MOQ bindet zu viel Kapital." : "Your MOQ locks too much capital.",
      framing: isDE
        ? "1 falscher MOQ-Entscheid kann 5.000–15.000 € kosten."
        : "1 wrong MOQ decision can cost €5,000–€15,000.",
      benefit: isDE
        ? "Optimiere dein Budget mit datenbasierter Kapitalplanung."
        : "Optimize your budget with data-driven capital planning.",
      cta: isDE ? "Budget optimieren" : "Optimize Budget",
    };
  }
  if (ctx.breakEvenHigh || ctx.warningCount >= 2) {
    return {
      risk: isDE ? "Mehrere Risiken erkannt." : "Multiple risks detected.",
      framing: isDE
        ? "Gründer mit ähnlichem Profil vermeiden 3.000–10.000 € Verlust durch Szenario-Simulation."
        : "Founders with similar profiles avoid €3,000–€10,000 in losses with scenario simulation.",
      benefit: isDE
        ? "Simuliere Szenarien, bevor du Kapital bindest."
        : "Simulate scenarios before committing capital.",
      cta: isDE ? "Plan upgraden" : "Upgrade Plan",
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

    const highCapitalExposure = moqRatio > 0.7;
    const shouldShow = warningCount >= 2 || breakEvenUnits > 300 || moqRatio > 0.6 || lowMargin || highCapitalExposure;
    if (!shouldShow) return null;

    const triggerType = lowMargin ? "low_margin" : highCapitalExposure ? "capital_exposure" : moqRatio > 0.6 ? "moq" : breakEvenUnits > 300 ? "breakeven" : "warnings";

    return { warningCount, breakEvenHigh: breakEvenUnits > 300, moqPressure: moqRatio > 0.6, lowMargin, lowRunway: false, highCapitalExposure, triggerType };
  }, [financial, profile, isFree]);

  if (!trigger) return null;

  const copy = getUpgradeCopy(trigger, isDE);
  if (!copy) return null;

  const Icon = trigger.lowRunway || trigger.lowMargin ? AlertTriangle : trigger.highCapitalExposure ? Shield : TrendingDown;

  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/[0.03] p-5 space-y-3">
      {/* 1. Risk Statement */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
          <Icon className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-destructive">{copy.risk}</p>
        </div>
      </div>

      {/* 2. Financial Framing */}
      <p className="text-xs text-muted-foreground pl-[52px]">{copy.framing}</p>

      {/* 3. Benefit */}
      <div className="flex items-center gap-2 pl-[52px]">
        <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
        <p className="text-xs font-medium">{copy.benefit}</p>
      </div>

      {/* 4. CTA */}
      <div className="pl-[52px]">
        <Button
          size="sm"
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => {
            trackEvent("clicked_smart_upgrade", { source: "psychological", trigger: trigger.triggerType });
            navigate("/dashboard/pricing");
          }}
        >
          <Shield className="h-3.5 w-3.5" />
          {copy.cta}
        </Button>
      </div>
    </div>
  );
}
