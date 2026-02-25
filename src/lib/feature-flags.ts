// ─── Plan Tiers & Feature Flags ─────────────────────────────────

export type Tier = "free" | "builder" | "pro";

export const ENABLE_PRO_FEATURES = true; // Pro tier is now live

// ─── Capability Map ─────────────────────────────────────────────

export interface CapabilityFlags {
  guidedEducation: boolean;       // "Explain this step" + terminology help
  guidedExecution: boolean;       // Proactive guided founder moments
  supplierInsights: boolean;      // Supplier intelligence engine
  executionReadiness: boolean;    // Execution readiness score
  riskPrioritization: boolean;    // Risk priority dashboard
  pdfExport: boolean;
  smartRoadmap: boolean;
  advancedRoadmap: boolean;       // Advanced adaptive launch roadmap
  fullInsights: boolean;
  budgetPlanner: boolean;         // Launch budget planner
  scenarioSimulator: boolean;     // Scenario simulator
  fullRealityCheck: boolean;      // Full reality check breakdown
}

export function getCapabilities(plan: string): CapabilityFlags {
  const isBuilder = plan === "builder" || plan === "pro";
  const isPro = plan === "pro";

  return {
    guidedEducation: isBuilder,
    guidedExecution: isPro,
    supplierInsights: isPro,
    executionReadiness: isPro,
    riskPrioritization: isPro,
    pdfExport: isBuilder,
    smartRoadmap: isBuilder,
    advancedRoadmap: isPro,
    fullInsights: isBuilder,
    budgetPlanner: isBuilder,
    scenarioSimulator: isPro,
    fullRealityCheck: isBuilder,
  };
}
