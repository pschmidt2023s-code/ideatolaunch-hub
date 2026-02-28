import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrand } from "@/hooks/useBrand";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { Shield, AlertTriangle, TrendingDown } from "lucide-react";

interface TriggerContext {
  type: "low_margin" | "low_runway" | "capital_exposure" | "annual_push" | "multi_risk";
  severity: "warning" | "critical";
}

function getUpgradeCopy(ctx: TriggerContext, isDE: boolean) {
  const copies: Record<string, { risk: { de: string; en: string }; framing: { de: string; en: string }; benefit: { de: string; en: string }; cta: { de: string; en: string } }> = {
    low_margin: {
      risk: {
        de: "Niedrige Marge erkannt.",
        en: "Low margin detected.",
      },
      framing: {
        de: "Gründer in dieser Marge verlieren oft 3.000–12.000 € durch fehlerhafte Skalierungsentscheidungen.",
        en: "Founders in this margin range often lose €3,000–€12,000 from miscalculated scaling decisions.",
      },
      benefit: {
        de: "Execution OS fügt Echtzeit-Kapitalschutz-Alerts hinzu.",
        en: "Execution OS adds real-time capital protection alerts.",
      },
      cta: {
        de: "Kapital schützen",
        en: "Protect capital",
      },
    },
    low_runway: {
      risk: {
        de: "Kritischer Cash-Runway erkannt.",
        en: "Critical cash runway detected.",
      },
      framing: {
        de: "Bei deinem Runway kann eine einzige Fehlentscheidung 5.000–15.000 € kosten.",
        en: "At your runway, a single wrong decision can cost €5,000–€15,000.",
      },
      benefit: {
        de: "Execution OS erkennt Liquiditätsrisiken, bevor sie kritisch werden.",
        en: "Execution OS detects liquidity risks before they become critical.",
      },
      cta: {
        de: "Runway sichern",
        en: "Secure runway",
      },
    },
    capital_exposure: {
      risk: {
        de: "Hohe Kapitalexposition erkannt.",
        en: "High capital exposure detected.",
      },
      framing: {
        de: "Dein Inventar-Risiko übersteigt sichere Schwellenwerte. Eine Produktions-Fehlkalkulation in diesem Bereich kostet 8.000–20.000 €.",
        en: "Your inventory risk exceeds safe thresholds. A production miscalculation in this range costs €8,000–€20,000.",
      },
      benefit: {
        de: "Execution OS schützt Kapitalexposition mit automatisierten Warnsystemen.",
        en: "Execution OS protects capital exposure with automated warning systems.",
      },
      cta: {
        de: "Kapital schützen",
        en: "Protect capital",
      },
    },
    annual_push: {
      risk: {
        de: "Du bist seit 30+ Tagen auf einem Monatsplan.",
        en: "You've been on a monthly plan for 30+ days.",
      },
      framing: {
        de: "Wechsle auf Jahresplan und spare 15%. Ernsthafte Gründer planen langfristig.",
        en: "Switch to annual and save 15%. Serious founders plan long-term.",
      },
      benefit: {
        de: "Stabilere Planung, niedrigere Kosten.",
        en: "More stable planning, lower costs.",
      },
      cta: {
        de: "Auf Jahresplan wechseln",
        en: "Switch to annual",
      },
    },
    multi_risk: {
      risk: {
        de: "Mehrere Risikofaktoren gleichzeitig erkannt.",
        en: "Multiple risk factors detected simultaneously.",
      },
      framing: {
        de: "Gründer mit kombinierten Risiken verlieren ohne Monitoring-System im Durchschnitt 6.000–18.000 €.",
        en: "Founders with combined risks lose an average of €6,000–€18,000 without a monitoring system.",
      },
      benefit: {
        de: "Execution OS überwacht alle Risiken und gibt dir strategische Handlungsempfehlungen.",
        en: "Execution OS monitors all risks and provides strategic action recommendations.",
      },
      cta: {
        de: "Risiken monitoren",
        en: "Monitor risks",
      },
    },
  };

  return copies[ctx.type] || copies.multi_risk;
}

export function SmartUpgradePrompt() {
  const { i18n } = useTranslation();
  const { isFree, plan } = useSubscription();
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
    if (!financial || plan === "execution") return null;

    const unitCost = (financial.production_cost ?? 0) + (financial.packaging_cost ?? 0) + (financial.shipping_cost ?? 0);
    if (unitCost <= 0) return null;

    const margin = financial.margin ?? 0;
    const budgetNumeric: Record<string, number> = { "<1k": 800, "1k-5k": 3000, "5k-15k": 10000, "15k+": 20000 };
    const budgetValue = budgetNumeric[profile?.budget ?? "1k-5k"] ?? 3000;
    const moqCost = unitCost * Math.max(financial.break_even_units ?? 50, 50);
    const moqRatio = moqCost / (budgetValue || 1);

    const lowMargin = margin < 35;
    const highCapitalExposure = moqRatio > 0.6;

    let riskCount = 0;
    if (lowMargin) riskCount++;
    if (highCapitalExposure) riskCount++;
    if ((financial.marketing_budget ?? 0) <= 0) riskCount++;

    if (riskCount >= 3) return { type: "multi_risk", severity: "critical" };
    if (lowMargin && margin < 25) return { type: "low_margin", severity: "critical" };
    if (lowMargin) return { type: "low_margin", severity: "warning" };
    if (highCapitalExposure) return { type: "capital_exposure", severity: "warning" };

    // Only show for free/builder users with some data
    if (isFree && riskCount >= 1) return { type: "multi_risk", severity: "warning" };

    return null;
  }, [financial, profile, isFree, plan]);

  if (!trigger) return null;

  const copy = getUpgradeCopy(trigger, isDE);
  const Icon = trigger.severity === "critical" ? AlertTriangle : trigger.type === "low_runway" ? TrendingDown : Shield;

  return (
    <div className={`rounded-xl border p-5 ${
      trigger.severity === "critical"
        ? "border-destructive/30 bg-destructive/5"
        : "border-accent/30 bg-accent/5"
    }`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          trigger.severity === "critical" ? "bg-destructive/10" : "bg-accent/10"
        }`}>
          <Icon className={`h-5 w-5 ${trigger.severity === "critical" ? "text-destructive" : "text-accent"}`} />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* 1) Risk Statement */}
          <p className={`text-sm font-semibold ${trigger.severity === "critical" ? "text-destructive" : ""}`}>
            {isDE ? copy.risk.de : copy.risk.en}
          </p>
          {/* 2) Financial Framing */}
          <p className="text-xs text-muted-foreground">
            {isDE ? copy.framing.de : copy.framing.en}
          </p>
          {/* 3) Benefit Framing */}
          <p className="text-xs text-foreground font-medium">
            {isDE ? copy.benefit.de : copy.benefit.en}
          </p>
          {/* 4) Clear CTA */}
          <Button
            size="sm"
            className={`mt-2 gap-2 ${
              trigger.severity === "critical"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            }`}
            onClick={() => {
              trackEvent("clicked_smart_upgrade", { source: "psychological_prompt", trigger: trigger.type, severity: trigger.severity });
              navigate("/dashboard/pricing");
            }}
          >
            <Shield className="h-3.5 w-3.5" />
            {isDE ? copy.cta.de : copy.cta.en}
          </Button>
        </div>
      </div>
    </div>
  );
}
