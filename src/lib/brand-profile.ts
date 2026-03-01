// ─── Brand Intelligence Profile ─────────────────────────────────
// Global profile object aggregated from onboarding, financial, and supplier data.

import type { Tables } from "@/integrations/supabase/types";

export interface BrandProfile {
  categoryId: string | null;
  priceSegment: "budget" | "mid" | "premium" | "luxury" | null;
  budget: number | null;
  launchQuantity: number | null;
  targetRegion: "DE" | "EU" | "US" | "global" | null;
  businessModel: "own_brand" | "dropshipping" | "white_label" | "digital" | null;
  monthlyRevenue: number | null;
  monthlyCosts: number | null;
  cashRunwayMonths: number | null;
  riskTolerance: "low" | "medium" | "high" | null;
  growthGoal: "stability" | "scaling" | "exit" | null;
  productionStage: "idea" | "prototype" | "sampling" | "production" | "scaling" | null;
  legalStructure: "einzelunternehmen" | "gmbh" | "ug" | "gbr" | null;
  fulfillmentModel: "self" | "3pl" | "fba" | "dropship" | null;
  productType: string | null;
  differentiation: string | null;
  margin: number | null;
}

/**
 * Build a BrandProfile from existing DB records.
 * Gracefully handles missing data with nulls.
 */
export function buildBrandProfile(
  brandProfile: Tables<"brand_profiles"> | null,
  financialModel: Tables<"financial_models"> | null,
  launchPlan: Tables<"launch_plans"> | null,
  profile: Tables<"profiles"> | null,
): BrandProfile {
  const budgetStr = brandProfile?.budget;
  const budgetNum = budgetStr ? parseFloat(budgetStr.replace(/[^\d.]/g, "")) : null;

  const priceLevel = brandProfile?.price_level;
  const priceSegment: BrandProfile["priceSegment"] =
    priceLevel === "budget" ? "budget" :
    priceLevel === "mid" || priceLevel === "mittel" ? "mid" :
    priceLevel === "premium" ? "premium" :
    priceLevel === "luxury" || priceLevel === "luxus" ? "luxury" :
    null;

  const country = brandProfile?.country?.toLowerCase();
  const targetRegion: BrandProfile["targetRegion"] =
    country === "de" || country === "deutschland" ? "DE" :
    country === "eu" || country === "europa" ? "EU" :
    country === "us" || country === "usa" ? "US" :
    country ? "global" : null;

  const riskTol = profile?.risk_tolerance;
  const riskTolerance: BrandProfile["riskTolerance"] =
    riskTol === "low" || riskTol === "conservative" ? "low" :
    riskTol === "high" || riskTol === "aggressive" ? "high" :
    riskTol === "medium" ? "medium" : null;

  const margin = financialModel?.margin ? Number(financialModel.margin) : null;
  const monthlyRevenue = financialModel?.recommended_price && launchPlan?.launch_quantity
    ? Number(financialModel.recommended_price) * (launchPlan.launch_quantity / 12)
    : null;
  const monthlyCosts = financialModel
    ? (Number(financialModel.production_cost || 0) + Number(financialModel.packaging_cost || 0) +
       Number(financialModel.shipping_cost || 0) + Number(financialModel.marketing_budget || 0)) / 12
    : null;
  const cashRunwayMonths = monthlyRevenue && monthlyCosts && monthlyCosts > 0 && budgetNum
    ? budgetNum / Math.max(monthlyCosts - (monthlyRevenue || 0), 1)
    : null;

  return {
    categoryId: brandProfile?.product_category || null,
    priceSegment,
    budget: budgetNum,
    launchQuantity: launchPlan?.launch_quantity || null,
    targetRegion,
    businessModel: null, // not yet captured in onboarding
    monthlyRevenue,
    monthlyCosts,
    cashRunwayMonths: cashRunwayMonths ? Math.round(cashRunwayMonths * 10) / 10 : null,
    riskTolerance,
    growthGoal: null,
    productionStage: null,
    legalStructure: null,
    fulfillmentModel: launchPlan?.fulfillment_model as BrandProfile["fulfillmentModel"] || null,
    productType: brandProfile?.product_type || null,
    differentiation: brandProfile?.differentiation || null,
    margin,
  };
}
