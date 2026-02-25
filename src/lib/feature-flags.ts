// ─── Plan Tiers & Feature Flags ─────────────────────────────────
// "pro" is not yet a purchasable plan but exists internally
// for feature-flag gating. All pro features are hidden behind
// ENABLE_PRO_FEATURES until the pricing tier goes live.

export type Tier = "free" | "builder" | "pro";

export const ENABLE_PRO_FEATURES = false; // flip when Pro tier launches

// ─── Capability Map ─────────────────────────────────────────────

export interface CapabilityFlags {
  guidedEducation: boolean;   // "Explain this step" + terminology help
  guidedExecution: boolean;   // Proactive guided founder moments
  supplierInsights: boolean;  // Supplier intelligence engine
  pdfExport: boolean;
  smartRoadmap: boolean;
  fullInsights: boolean;
}

export function getCapabilities(plan: string): CapabilityFlags {
  const isBuilder = plan === "builder";
  // Pro not purchasable yet — only activates via ENABLE_PRO_FEATURES
  const isPro = false && ENABLE_PRO_FEATURES;

  return {
    guidedEducation: isBuilder || isPro,
    guidedExecution: isPro,
    supplierInsights: isPro,
    pdfExport: isBuilder || isPro,
    smartRoadmap: isBuilder || isPro,
    fullInsights: isBuilder || isPro,
  };
}
