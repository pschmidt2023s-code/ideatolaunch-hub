import { Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface DecisionSuggestion {
  action: string;
  impact: string;
  route?: string;
}

function generateDecisions(
  financialModel: any,
  brandProfile: any,
  complianceScore: any
): DecisionSuggestion[] {
  const decisions: DecisionSuggestion[] = [];

  if (financialModel) {
    const margin = financialModel.margin ?? 0;
    if (margin < 30) {
      decisions.push({
        action: "Verkaufspreis anpassen",
        impact: `Aktuelle Marge bei ${margin}% – Ziel: mindestens 30%`,
        route: "/dashboard/step/2",
      });
    }
  }

  if (complianceScore) {
    const score = complianceScore.overall_score ?? 0;
    if (score < 80) {
      decisions.push({
        action: "Compliance vervollständigen",
        impact: `Compliance Score bei ${score}% – offene Pflichten prüfen`,
        route: "/dashboard/step/5",
      });
    }
  }

  if (brandProfile) {
    if (!brandProfile.target_audience) {
      decisions.push({
        action: "Zielgruppe definieren",
        impact: "Fehlende Zielgruppe schwächt Positionierung",
        route: "/dashboard/step/1",
      });
    }
    if (!brandProfile.differentiation) {
      decisions.push({
        action: "Differenzierung ausarbeiten",
        impact: "Ohne USP ist Marktdurchdringung schwieriger",
        route: "/dashboard/step/1",
      });
    }
  }

  return decisions;
}

export function DecisionEngineCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeBrand: brand } = useBrand();

  const { data } = useQuery({
    queryKey: ["decision-engine", brand?.id],
    enabled: !!brand?.id && !!user,
    queryFn: async () => {
      const [fm, bp, cs] = await Promise.all([
        supabase.from("financial_models").select("*").eq("brand_id", brand!.id).maybeSingle(),
        supabase.from("brand_profiles").select("*").eq("brand_id", brand!.id).maybeSingle(),
        supabase.from("compliance_scores").select("*").eq("brand_id", brand!.id).maybeSingle(),
      ]);
      return {
        financialModel: fm.data,
        brandProfile: bp.data,
        complianceScore: cs.data,
      };
    },
  });

  const decisions = data
    ? generateDecisions(data.financialModel, data.brandProfile, data.complianceScore)
    : [];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-6">
        <Lightbulb className="h-4 w-4 text-accent" />
        Decision Engine
      </h3>

      {decisions.length === 0 ? (
        <div className="text-center py-8">
          <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            Keine offenen Entscheidungen.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Vervollständige dein Brand-Profil, um personalisierte Empfehlungen zu erhalten.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-muted/50 p-4 hover:bg-muted/80 transition-colors cursor-pointer"
              onClick={() => d.route && navigate(d.route)}
            >
              <div>
                <p className="text-sm font-medium">{d.action}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.impact}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
