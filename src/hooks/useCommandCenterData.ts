// ─── Hook: Fetch real brand data and compute Command Center metrics ────────
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/hooks/useBrand";
import type { IntelligenceInput } from "@/lib/intelligenceEngine";
import {
  buildLiveStatus,
  buildLiveMoney,
  buildLiveRisks,
  buildLiveActions,
  hasMinimumData,
} from "@/lib/intelligenceEngine";
import type { ScenarioMode } from "@/lib/command-center-types";

export function useCommandCenterData(mode: ScenarioMode) {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;

  // ── Parallel data fetches ─────────────────────────────────────────────

  const { data: financialModel } = useQuery({
    queryKey: ["cc_financial", brandId],
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

  const { data: brandProfile } = useQuery({
    queryKey: ["cc_brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: productionPlan } = useQuery({
    queryKey: ["cc_production", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("production_plans")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: complianceScore } = useQuery({
    queryKey: ["cc_compliance", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("compliance_scores")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: compliancePlan } = useQuery({
    queryKey: ["cc_compliance_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("compliance_plans")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: launchPlan } = useQuery({
    queryKey: ["cc_launch", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("launch_plans")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: brandIdentity } = useQuery({
    queryKey: ["cc_identity", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_identities")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  // ── Build intelligence input ──────────────────────────────────────────

  const input: IntelligenceInput | null = useMemo(() => {
    if (!brandId) return null;

    // Parse budget from brand profile
    const budgetStr = brandProfile?.budget;
    const budget = budgetStr ? parseFloat(budgetStr.replace(/[^\d.]/g, "")) : null;

    // Count open compliance blockers
    const compFields = complianceScore
      ? [
          complianceScore.ce_marking_checked,
          complianceScore.product_labeling_done,
          complianceScore.verpackg_registered,
          complianceScore.gewerbeanmeldung,
          complianceScore.impressum_ready,
          complianceScore.agb_ready,
          complianceScore.datenschutz_ready,
          complianceScore.widerruf_ready,
          complianceScore.dsgvo_assessment,
        ]
      : [];
    const openBlockers = compFields.filter((v) => v === false).length;

    // Count supplier risk warnings
    const riskWarnings = Array.isArray(productionPlan?.risk_warnings)
      ? (productionPlan.risk_warnings as unknown[]).length
      : 0;

    return {
      margin: financialModel?.margin ? Number(financialModel.margin) : null,
      productionCost: financialModel?.production_cost ? Number(financialModel.production_cost) : null,
      packagingCost: financialModel?.packaging_cost ? Number(financialModel.packaging_cost) : null,
      shippingCost: financialModel?.shipping_cost ? Number(financialModel.shipping_cost) : null,
      marketingBudget: financialModel?.marketing_budget ? Number(financialModel.marketing_budget) : null,
      recommendedPrice: financialModel?.recommended_price ? Number(financialModel.recommended_price) : null,
      breakEvenUnits: financialModel?.break_even_units ?? null,
      budget,
      moqExpectation: productionPlan?.moq_expectation ?? null,
      productionRegion: productionPlan?.production_region ?? null,
      supplierRiskWarnings: riskWarnings,
      complianceScore: complianceScore?.overall_score ?? null,
      openComplianceBlockers: openBlockers,
      returnRate: null, // not yet captured in schema – will show as missing
      launchQuantity: launchPlan?.launch_quantity ?? null,
      launchReadinessScore: launchPlan?.launch_readiness_score ?? null,
      fulfillmentModel: launchPlan?.fulfillment_model ?? null,
      hasFinancialModel: !!financialModel,
      hasBrandProfile: !!brandProfile,
      hasProductionPlan: !!productionPlan,
      hasCompliancePlan: !!compliancePlan,
      hasLaunchPlan: !!launchPlan,
      hasBrandIdentity: !!brandIdentity,
    };
  }, [brandId, financialModel, brandProfile, productionPlan, complianceScore, compliancePlan, launchPlan, brandIdentity]);

  // ── Compute live metrics ──────────────────────────────────────────────

  const result = useMemo(() => {
    if (!input) {
      return { ready: false as const, hasBrand: !!brandId };
    }

    const sufficient = hasMinimumData(input);

    return {
      ready: true as const,
      sufficient,
      status: buildLiveStatus(input, mode),
      money: buildLiveMoney(input, mode),
      risks: buildLiveRisks(input, mode),
      actions: buildLiveActions(input),
      input,
    };
  }, [input, mode, brandId]);

  return result;
}
