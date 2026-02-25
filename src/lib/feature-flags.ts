// ─── Plan Tiers & Feature Flags ─────────────────────────────────

export type Tier = "free" | "builder" | "pro";

export const ENABLE_PRO_FEATURES = true; // Pro tier is now live

// ─── Capability Map ─────────────────────────────────────────────

export interface CapabilityFlags {
  // Brand limits
  canCreateUnlimitedBrands: boolean;

  // Insights
  canSeeInsights: boolean;

  // Analysis & Intelligence
  canSeeFullRisks: boolean;
  canUseBudgetPlanner: boolean;
  canUseScenarioSimulator: boolean;
  canUseSupplierMatching: boolean;
  canUseExecutionReadiness: boolean;
  canUseRiskDashboard: boolean;
  canUseAdaptiveRoadmap: boolean;

  // Guidance
  canUseGuidedFounderMode: boolean;

  // Export
  canExportPDF: boolean;

  // Roadmap
  smartRoadmap: boolean;

  // Legacy compat
  guidedEducation: boolean;
  guidedExecution: boolean;
  supplierInsights: boolean;
  executionReadiness: boolean;
  riskPrioritization: boolean;
  pdfExport: boolean;
  budgetPlanner: boolean;
  scenarioSimulator: boolean;
  fullRealityCheck: boolean;
  advancedRoadmap: boolean;
  fullInsights: boolean;
  canSeeRiskRanking: boolean;
  canUseSupplierInsights: boolean;
}

export function getCapabilities(plan: string): CapabilityFlags {
  const isBuilder = plan === "builder" || plan === "pro";
  const isPro = plan === "pro";

  return {
    // Brand limits
    canCreateUnlimitedBrands: isBuilder,

    // Insights
    canSeeInsights: isBuilder,

    // Analysis
    canSeeFullRisks: isBuilder,
    canUseBudgetPlanner: isBuilder,
    canUseScenarioSimulator: isPro,
    canUseSupplierMatching: isPro,
    canUseExecutionReadiness: isPro,
    canUseRiskDashboard: isPro,
    canUseAdaptiveRoadmap: isPro,

    // Guidance
    canUseGuidedFounderMode: isPro,

    // Export
    canExportPDF: isBuilder,

    // Roadmap
    smartRoadmap: isBuilder,

    // Legacy compat aliases
    guidedEducation: isBuilder,
    guidedExecution: isPro,
    supplierInsights: isPro,
    executionReadiness: isPro,
    riskPrioritization: isPro,
    pdfExport: isBuilder,
    budgetPlanner: isBuilder,
    scenarioSimulator: isPro,
    fullRealityCheck: isBuilder,
    advancedRoadmap: isPro,
    fullInsights: isBuilder,
    canSeeRiskRanking: isPro,
    canUseSupplierInsights: isPro,
  };
}

// ─── Contextual Upgrade Messages ────────────────────────────────

export interface UpgradeMessage {
  title: { de: string; en: string };
  desc: { de: string; en: string };
}

const upgradeMessages: Record<string, UpgradeMessage> = {
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
  riskRanking: {
    title: {
      de: "Risk Priority Dashboard freischalten",
      en: "Unlock Risk Priority Dashboard",
    },
    desc: {
      de: "Priorisiere Risiken nach Impact und erhalte datenbasierte Handlungsempfehlungen.",
      en: "Prioritize risks by impact and get data-driven action recommendations.",
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
  default: {
    title: {
      de: "Premium-Feature freischalten",
      en: "Unlock Premium Feature",
    },
    desc: {
      de: "Upgrade deinen Plan für Zugang zu erweiterten Tools und Analysen.",
      en: "Upgrade your plan for access to advanced tools and analytics.",
    },
  },
};

export function getUpgradeMessage(feature: string): UpgradeMessage {
  return upgradeMessages[feature] || upgradeMessages.default;
}
