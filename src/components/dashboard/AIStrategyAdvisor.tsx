import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import { useBrand } from "@/hooks/useBrand";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sparkles, DollarSign, Package, PiggyBank, Clock,
  ArrowRight, AlertTriangle, Loader2,
} from "lucide-react";

interface Recommendation {
  category: "pricing" | "moq" | "budget" | "timing";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  savings_potential: number;
}

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pricing: { icon: DollarSign, color: "bg-success/10 text-success", label: "Preis" },
  moq: { icon: Package, color: "bg-primary/10 text-primary", label: "MOQ" },
  budget: { icon: PiggyBank, color: "bg-warning/10 text-warning", label: "Budget" },
  timing: { icon: Clock, color: "bg-accent/10 text-accent", label: "Timing" },
};

const IMPACT_STYLE: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

export function AIStrategyAdvisor() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const ccData = useCommandCenterData("realistic");
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;

  const { data: profile } = useQuery({
    queryKey: ["strat_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("product_category, country").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: production } = useQuery({
    queryKey: ["strat_production", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("production_plans").select("moq_expectation, production_region").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const canRun = ccData.ready && ccData.sufficient;

  const runAnalysis = async () => {
    if (!canRun) return;
    setLoading(true);
    try {
      const { money, input } = ccData as any;
      const moq = production?.moq_expectation ? parseInt(production.moq_expectation, 10) || 500 : 500;

      const { data, error } = await supabase.functions.invoke("ai-strategy", {
        body: {
          margin: money.margin,
          moq,
          budget: input.budget ?? 5000,
          monthlyUnits: (input.launchQuantity ?? 0) / 12,
          pricePerUnit: input.recommendedPrice ?? 29.9,
          productionCost: input.productionCost ?? 10,
          marketingBudget: input.marketingBudget ?? 500,
          region: production?.production_region ?? profile?.country ?? "Deutschland",
          productCategory: profile?.product_category ?? "Consumer Goods",
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      console.error(err);
      toast.error("KI-Analyse fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  if (!ccData.ready || !ccData.sufficient) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-warning mb-4" />
        <h3 className="text-lg font-semibold">Daten benötigt</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Fülle zuerst dein Finanzmodell und Markenprofil aus, damit die KI fundierte Empfehlungen generieren kann.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header + CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> KI-Strategieberater
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Basierend auf deinen aktuellen Geschäftsdaten
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analysiere…" : recommendations.length ? "Neu analysieren" : "Analyse starten"}
        </Button>
      </div>

      {/* Results */}
      {recommendations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {recommendations.map((rec, i) => {
            const meta = CATEGORY_META[rec.category] || CATEGORY_META.pricing;
            const Icon = meta.icon;

            return (
              <div key={i} className="rounded-2xl border bg-card p-5 shadow-card hover:shadow-md transition-shadow space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", meta.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{meta.label}</span>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase", IMPACT_STYLE[rec.impact])}>
                    {rec.impact}
                  </span>
                </div>
                <h4 className="text-sm font-bold leading-tight">{rec.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                {rec.savings_potential > 0 && (
                  <div className="flex items-center gap-1.5 text-success text-xs font-bold">
                    <ArrowRight className="h-3 w-3" />
                    Einspar-/Umsatzpotenzial: €{rec.savings_potential.toLocaleString("de-DE")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {recommendations.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Klicke auf "Analyse starten", um KI-gestützte Empfehlungen zu erhalten.
          </p>
        </div>
      )}
    </div>
  );
}
