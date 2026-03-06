import { useMemo } from "react";
import { Shield, AlertTriangle, ArrowRight, Scale, TrendingDown, Package, Globe, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { buildBrandProfile } from "@/lib/brand-profile";
import { evaluateRisks, type RiskCategory, type WeightedRisk, type RiskEngineResult } from "@/lib/risk-engine-v2";
import { LockedOverlay } from "@/components/LockedOverlay";
import { cn } from "@/lib/utils";

const categoryIcons: Record<RiskCategory, React.ComponentType<{ className?: string }>> = {
  financial: DollarSign,
  regulatory: Scale,
  operational: Package,
  market: TrendingDown,
  supplier: Globe,
};

const categoryLabels: Record<RiskCategory, string> = {
  financial: "Finanziell",
  regulatory: "Regulatorisch",
  operational: "Operativ",
  market: "Markt",
  supplier: "Lieferkette",
};

const severityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-green-500/10 text-green-600 border-green-500/20",
};

const riskLevelColors: Record<string, string> = {
  critical: "text-destructive",
  high: "text-orange-500",
  medium: "text-amber-500",
  low: "text-green-500",
};

function fmt(n: number): string {
  return n.toLocaleString("de-DE") + " €";
}

export function RiskDashboard() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { activeBrand } = useBrand();
  const { plan } = useSubscription();
  const brandId = activeBrand?.id;
  const isPro = plan === "pro" || plan === "execution";

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
      const { data } = await supabase.from("brand_profiles").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: production } = useQuery({
    queryKey: ["production_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("production_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: compliance } = useQuery({
    queryKey: ["compliance_score", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("compliance_scores").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: launch } = useQuery({
    queryKey: ["launch_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("launch_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: profileData } = useQuery({
    queryKey: ["profile", activeBrand?.user_id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", activeBrand!.user_id).maybeSingle();
      return data;
    },
    enabled: !!activeBrand?.user_id,
  });

  const result: RiskEngineResult | null = useMemo(() => {
    if (!brandId) return null;
    const bp = buildBrandProfile(profile ?? null, financial ?? null, launch ?? null, profileData ?? null);
    const riskWarnings = Array.isArray(production?.risk_warnings) ? production!.risk_warnings.length : 0;

    return evaluateRisks({
      profile: bp,
      margin: financial?.margin ? Number(financial.margin) : null,
      recommendedPrice: financial?.recommended_price ? Number(financial.recommended_price) : null,
      productionCost: financial?.production_cost ? Number(financial.production_cost) : null,
      packagingCost: financial?.packaging_cost ? Number(financial.packaging_cost) : null,
      shippingCost: financial?.shipping_cost ? Number(financial.shipping_cost) : null,
      marketingBudget: financial?.marketing_budget ? Number(financial.marketing_budget) : null,
      breakEvenUnits: financial?.break_even_units ?? null,
      launchQuantity: launch?.launch_quantity ?? null,
      complianceScore: compliance?.overall_score ?? null,
      openComplianceBlockers: compliance ? Object.entries(compliance).filter(([k, v]) => k !== "id" && k !== "brand_id" && k !== "created_at" && k !== "updated_at" && k !== "overall_score" && k !== "recommendations" && k !== "risk_flags" && v === false).length : 0,
      supplierRiskWarnings: riskWarnings,
      returnRate: null,
      hasSupplierContract: !!production,
      hasSampleApproval: !!production?.checklist && Array.isArray(production.checklist) && production.checklist.length > 0,
      plan,
    });
  }, [brandId, financial, profile, production, compliance, launch, profileData, plan]);

  const content = result ? (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
          <p className={cn("text-3xl font-bold tabular-nums font-display", riskLevelColors[result.riskLevel])}>
            {result.overallRiskScore}
          </p>
          <Badge variant="outline" className={cn("mt-1 text-[10px]", severityColors[result.riskLevel])}>
            {result.riskLevel === "critical" ? "Kritisch" : result.riskLevel === "high" ? "Hoch" : result.riskLevel === "medium" ? "Mittel" : "Niedrig"}
          </Badge>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Gesamt-Exposure</p>
          <p className="text-2xl font-bold tabular-nums font-display">{fmt(result.totalExposure)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Maximales Risiko</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Gewichtet</p>
          <p className="text-2xl font-bold tabular-nums font-display text-amber-500">{fmt(result.weightedExposure)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Wahrscheinlichkeits-bereinigt</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Risiken</p>
          <p className="text-3xl font-bold tabular-nums font-display">{result.risks.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{result.risks.filter(r => r.severity === "critical").length} kritisch</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-accent" />
          Risiko nach Kategorie
        </h3>
        <div className="space-y-3">
          {(Object.entries(result.riskByCategory) as [RiskCategory, number][])
            .filter(([, val]) => val > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, val]) => {
              const Icon = categoryIcons[cat];
              const maxVal = Math.max(...Object.values(result.riskByCategory));
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {categoryLabels[cat]}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{fmt(val)}</span>
                  </div>
                  <Progress value={(val / maxVal) * 100} className="h-1.5" />
                </div>
              );
            })}
        </div>
      </div>

      {/* Risk List */}
      <div className="space-y-3">
        {result.risks.map(risk => (
          <RiskRow key={risk.id} risk={risk} onNavigate={(step) => navigate(`/dashboard/step/${step}`)} />
        ))}
      </div>
    </div>
  ) : (
    <div className="text-center py-12 text-muted-foreground text-sm">
      Erstelle zuerst eine Marke, um die Risikoanalyse zu sehen.
    </div>
  );

  if (!isPro) {
    return (
      <LockedOverlay feature="riskDashboard" requiredPlan="pro">
        {content}
      </LockedOverlay>
    );
  }

  return content;
}

function RiskRow({ risk, onNavigate }: { risk: WeightedRisk; onNavigate: (step: number) => void }) {
  const Icon = categoryIcons[risk.category];
  return (
    <div className="rounded-xl border bg-card p-4 card-interactive">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", severityColors[risk.severity])}>
            {risk.severity === "critical" ? <AlertTriangle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{risk.title}</p>
              {risk.regulatoryFlag && (
                <Badge variant="outline" className="text-[9px] bg-destructive/5 text-destructive border-destructive/20">
                  Regulatorisch
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{risk.description}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px]">
              <span className="font-mono text-muted-foreground">€ {risk.euroImpact.toLocaleString("de-DE")}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{risk.probability}% Wahrscheinlichkeit</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{risk.timeToFix}</span>
            </div>
            <p className="text-xs text-accent mt-2">💡 {risk.fix}</p>
          </div>
        </div>
        {risk.stepLink && (
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => onNavigate(risk.stepLink!)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
