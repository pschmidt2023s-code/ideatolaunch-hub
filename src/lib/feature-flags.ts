// ─── Plan Tiers & Feature Flags ─────────────────────────────────

export type Tier = "free" | "builder" | "pro";

export type FeatureKey =
  | "insights"
  | "pdfExport"
  | "budgetPlanner"
  | "scenarioSimulator"
  | "supplierMatching"
  | "supplierInsights"
  | "guidedFounderMode"
  | "adaptiveRoadmap"
  | "executionReadiness"
  | "riskDashboard"
  | "fullRealityCheck"
  | "unboxingScore";

// ─── Capability Map ─────────────────────────────────────────────

export interface CapabilityFlags {
  canCreateUnlimitedBrands: boolean;
  canSeeInsights: boolean;
  canSeeFullRisks: boolean;
  canExportPDF: boolean;
  canUseBudgetPlanner: boolean;
  canUseScenarioSimulator: boolean;
  canUseSupplierMatching: boolean;
  canUseGuidedFounderMode: boolean;
  canUseAdaptiveRoadmap: boolean;
  canUseRiskDashboard: boolean;
  canUseExecutionReadiness: boolean;
  canUseUnboxingScore: boolean;
  smartRoadmap: boolean;
}

export function getCapabilities(plan: string): CapabilityFlags {
  const isBuilder = plan === "builder" || plan === "pro";
  const isPro = plan === "pro";

  return {
    canCreateUnlimitedBrands: isBuilder,
    canSeeInsights: isBuilder,
    canSeeFullRisks: isBuilder,
    canExportPDF: isBuilder,
    canUseBudgetPlanner: isBuilder,
    canUseScenarioSimulator: isPro,
    canUseSupplierMatching: isPro,
    canUseGuidedFounderMode: isPro,
    canUseAdaptiveRoadmap: isPro,
    canUseRiskDashboard: isPro,
    canUseExecutionReadiness: isPro,
    canUseUnboxingScore: isPro,
    smartRoadmap: isBuilder,
  };
}

// ─── Feature Access Helper ──────────────────────────────────────

export type FeatureAccess = "enabled" | "preview" | "locked";

/** Determines the access level for a feature given capabilities and plan */
export function getFeatureAccess(feature: FeatureKey, plan: string): FeatureAccess {
  const caps = getCapabilities(plan);

  const featureCapMap: Record<FeatureKey, keyof CapabilityFlags> = {
    insights: "canSeeInsights",
    pdfExport: "canExportPDF",
    budgetPlanner: "canUseBudgetPlanner",
    scenarioSimulator: "canUseScenarioSimulator",
    supplierMatching: "canUseSupplierMatching",
    supplierInsights: "canUseSupplierMatching",
    guidedFounderMode: "canUseGuidedFounderMode",
    adaptiveRoadmap: "canUseAdaptiveRoadmap",
    executionReadiness: "canUseExecutionReadiness",
    riskDashboard: "canUseRiskDashboard",
    fullRealityCheck: "canSeeFullRisks",
    unboxingScore: "canUseUnboxingScore",
  };

  const capKey = featureCapMap[feature];
  if (caps[capKey]) return "enabled";

  // Special rule: supplierMatching shows blurred preview for builder
  if (
    (feature === "supplierMatching" || feature === "supplierInsights" || feature === "unboxingScore") &&
    plan === "builder"
  ) {
    return "preview";
  }

  return "locked";
}

/** Returns the required plan for a feature */
export function getRequiredPlan(feature: FeatureKey): "builder" | "pro" {
  const proOnly: FeatureKey[] = [
    "scenarioSimulator",
    "supplierMatching",
    "supplierInsights",
    "guidedFounderMode",
    "adaptiveRoadmap",
    "executionReadiness",
    "riskDashboard",
    "unboxingScore",
  ];
  return proOnly.includes(feature) ? "pro" : "builder";
}

// ─── Contextual Upgrade Messages ────────────────────────────────

export interface UpgradeMessage {
  title: { de: string; en: string };
  desc: { de: string; en: string };
}

const upgradeMessages: Record<FeatureKey, UpgradeMessage> = {
  insights: {
    title: {
      de: "Insights freischalten",
      en: "Unlock Insights",
    },
    desc: {
      de: "Erhalte KI-gestützte Risikoanalysen und strategische Empfehlungen für deine Marke.",
      en: "Get AI-powered risk analysis and strategic recommendations for your brand.",
    },
  },
  pdfExport: {
    title: {
      de: "PDF-Export freischalten",
      en: "Unlock PDF Export",
    },
    desc: {
      de: "Exportiere deinen kompletten Brand Report als professionelles PDF.",
      en: "Export your complete brand report as a professional PDF.",
    },
  },
  budgetPlanner: {
    title: {
      de: "Budget-Planer freischalten",
      en: "Unlock Budget Planner",
    },
    desc: {
      de: "Wisse genau, wie du dein Budget auf Produktion, Marketing und Reserve verteilst.",
      en: "Know exactly how to allocate your budget across production, marketing, and reserves.",
    },
  },
  scenarioSimulator: {
    title: {
      de: "Szenario-Simulation freischalten",
      en: "Unlock Scenario Simulation",
    },
    desc: {
      de: "Die meisten Gründer simulieren Szenarien, bevor sie Kapital binden.",
      en: "Most founders use Scenario Simulation before committing capital.",
    },
  },
  supplierMatching: {
    title: {
      de: "Supplier Matching freischalten",
      en: "Unlock Supplier Matching",
    },
    desc: {
      de: "Supplier Matching hilft dir, Überbestände zu vermeiden und den richtigen Partner zu finden.",
      en: "Supplier Matching helps you avoid overcommitting inventory and find the right partner.",
    },
  },
  supplierInsights: {
    title: {
      de: "Supplier Intelligence freischalten",
      en: "Unlock Supplier Intelligence",
    },
    desc: {
      de: "Erhalte konkrete Lieferanten-Matches, MOQ-Vergleiche und Kostenoptimierung.",
      en: "Get concrete supplier matches, MOQ comparisons, and cost optimization.",
    },
  },
  guidedFounderMode: {
    title: {
      de: "Guided Founder Mode freischalten",
      en: "Unlock Guided Founder Mode",
    },
    desc: {
      de: "Erhalte proaktive Hilfe und Erklärungen bei jedem Schritt deines Markenaufbaus.",
      en: "Get proactive help and explanations at every step of building your brand.",
    },
  },
  adaptiveRoadmap: {
    title: {
      de: "Adaptive Launch-Roadmap freischalten",
      en: "Unlock Adaptive Launch Roadmap",
    },
    desc: {
      de: "Deine Roadmap passt sich dynamisch an deine Brand-Health-Daten an.",
      en: "Your roadmap adapts dynamically based on your brand health data.",
    },
  },
  executionReadiness: {
    title: {
      de: "Execution Readiness Score freischalten",
      en: "Unlock Execution Readiness Score",
    },
    desc: {
      de: "Erfahre genau, wie launch-bereit deine Marke wirklich ist.",
      en: "Find out exactly how launch-ready your brand really is.",
    },
  },
  riskDashboard: {
    title: {
      de: "Risk Priority Dashboard freischalten",
      en: "Unlock Risk Priority Dashboard",
    },
    desc: {
      de: "Priorisiere Risiken nach Impact und erhalte datenbasierte Handlungsempfehlungen.",
      en: "Prioritize risks by impact and get data-driven action recommendations.",
    },
  },
  fullRealityCheck: {
    title: {
      de: "Volle Risikoanalyse freischalten",
      en: "Unlock Full Risk Analysis",
    },
    desc: {
      de: "Erkenne alle Risiken und erhalte konkrete Lösungsvorschläge für jedes Problem.",
      en: "Identify all risks and get concrete fix suggestions for each issue.",
    },
  },
  unboxingScore: {
    title: {
      de: "Unboxing Score freischalten",
      en: "Unlock Unboxing Score",
    },
    desc: {
      de: "Optimiere dein Unboxing-Erlebnis mit konkreten Empfehlungen und einem Score von 0–100.",
      en: "Optimize your unboxing experience with actionable recommendations and a 0–100 score.",
    },
  },
};

export function getUpgradeMessage(feature: string): UpgradeMessage {
  return upgradeMessages[feature as FeatureKey] ?? {
    title: { de: "Premium-Feature freischalten", en: "Unlock Premium Feature" },
    desc: { de: "Upgrade deinen Plan für Zugang zu erweiterten Tools und Analysen.", en: "Upgrade your plan for access to advanced tools and analytics." },
  };
}
