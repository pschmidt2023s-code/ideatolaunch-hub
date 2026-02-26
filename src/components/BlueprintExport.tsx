import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Loader2, Lock } from "lucide-react";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { generateBlueprint, type BlueprintData } from "@/lib/pdf-export";
import { computeComplianceScore, COMPLIANCE_ITEMS, type ComplianceState } from "@/lib/compliance-engine";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function BlueprintExport() {
  const { activeBrand } = useBrand();
  const { user } = useAuth();
  const { isFree, isBuilder } = useSubscription();
  const { health } = useBrandHealth();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const brandId = activeBrand?.id;

  // Fetch all brand data in parallel
  const { data: profile } = useQuery({
    queryKey: ["brand_profile_bp", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: financial } = useQuery({
    queryKey: ["financial_model_bp", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("financial_models").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: production } = useQuery({
    queryKey: ["production_plan_bp", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("production_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: compliance } = useQuery({
    queryKey: ["compliance_score_bp", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("compliance_scores").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: launch } = useQuery({
    queryKey: ["launch_plan_bp", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("launch_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const handleGenerate = async () => {
    if (isFree) {
      toast.error("Blueprint-Export ist ab dem Builder-Plan verfügbar.");
      navigate("/dashboard/pricing");
      return;
    }

    setGenerating(true);

    try {
      // Build compliance items from compliance_scores
      let complianceItems: BlueprintData["complianceItems"] = [];
      let complianceScore: number | undefined;

      if (compliance) {
        const state: ComplianceState = {};
        for (const item of COMPLIANCE_ITEMS) {
          state[item.key] = (compliance as Record<string, unknown>)[item.key] === true;
        }
        const result = computeComplianceScore(state);
        complianceScore = result.score;
        complianceItems = COMPLIANCE_ITEMS.map(i => ({
          label: i.label,
          done: state[i.key] || false,
        }));
      }

      // Capital safety level
      let capitalSafetyLevel: string | undefined;
      if (financial && financial.margin != null) {
        capitalSafetyLevel = (financial.margin ?? 0) >= 40 ? "Gut" : (financial.margin ?? 0) >= 25 ? "Moderat" : "Niedrig";
      }

      const blueprintData: BlueprintData = {
        brandName: activeBrand?.name || "Meine Marke",
        positioning: profile?.positioning_statement || undefined,
        values: profile?.brand_values || undefined,
        marketAngle: profile?.market_angle || undefined,
        differentiation: profile?.differentiation || undefined,
        targetAudience: profile?.target_audience || undefined,
        productDescription: profile?.product_description || undefined,
        country: profile?.country || undefined,
        productionCost: financial?.production_cost ? Number(financial.production_cost) : undefined,
        packagingCost: financial?.packaging_cost ? Number(financial.packaging_cost) : undefined,
        shippingCost: financial?.shipping_cost ? Number(financial.shipping_cost) : undefined,
        marketingBudget: financial?.marketing_budget ? Number(financial.marketing_budget) : undefined,
        recommendedPrice: financial?.recommended_price ? Number(financial.recommended_price) : undefined,
        margin: financial?.margin ? Number(financial.margin) : undefined,
        breakEvenUnits: financial?.break_even_units || undefined,
        productionRegion: production?.production_region || undefined,
        moqExpectation: production?.moq_expectation || undefined,
        productCategory: production?.product_category || undefined,
        complianceItems,
        complianceScore,
        salesChannel: launch?.sales_channel || undefined,
        fulfillment: launch?.fulfillment_model || undefined,
        launchQuantity: launch?.launch_quantity || undefined,
        capitalSafetyLevel,
        riskScore: health?.score != null ? 100 - health.score : undefined,
      };

      generateBlueprint(blueprintData);

      // Track download event
      await trackEvent("blueprint_downloaded", {
        brandId,
        brandName: activeBrand?.name,
        complianceScore,
        margin: financial?.margin,
      });

      // Store blueprint generation in documents table
      if (brandId) {
        await supabase.from("documents").insert({
          brand_id: brandId,
          file_name: `${activeBrand?.name || "Brand"}_Blueprint_2026.pdf`,
          document_type: "blueprint",
          file_type: "application/pdf",
        });
      }

      toast.success("Blueprint PDF wurde generiert!");
    } catch (err) {
      console.error("Blueprint generation error:", err);
      toast.error("Fehler beim Erstellen des Blueprints");
    } finally {
      setGenerating(false);
    }
  };

  const dataPoints = [
    { label: "Markenpositionierung", ready: !!profile?.positioning_statement },
    { label: "Finanzmodell", ready: !!financial?.production_cost },
    { label: "Produktionsplan", ready: !!production?.production_region },
    { label: "Compliance-Status", ready: !!compliance },
    { label: "Launch-Plan", ready: !!launch?.sales_channel },
  ];

  const readyCount = dataPoints.filter(d => d.ready).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-[hsl(var(--accent))]" />
          Eigenmarke Starter Blueprint 2026
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Dein personalisierter Strategie-Blueprint — 7 Kapitel mit allen Daten aus deinem Dashboard als professionelles PDF.
        </p>

        {/* Data readiness */}
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Daten-Vollständigkeit: {readyCount}/{dataPoints.length}
          </p>
          <div className="space-y-1">
            {dataPoints.map(dp => (
              <div key={dp.label} className="flex items-center gap-2 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${dp.ready ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                <span className={dp.ready ? "text-foreground" : "text-muted-foreground"}>{dp.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !brandId}
          className="w-full gap-2"
          variant={isFree ? "outline" : "default"}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Wird generiert…
            </>
          ) : isFree ? (
            <>
              <Lock className="h-4 w-4" />
              Builder-Plan erforderlich
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Blueprint PDF herunterladen
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
