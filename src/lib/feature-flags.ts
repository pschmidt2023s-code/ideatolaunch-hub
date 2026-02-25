// ─── Plan Tiers & Feature Flags ─────────────────────────────────

export type Tier = "free" | "builder" | "pro";

export const ENABLE_PRO_FEATURES = true; // Pro tier is now live

// ─── Capability Map ─────────────────────────────────────────────

export interface CapabilityFlags {
  // Education & Guidance
  guidedEducation: boolean;       // "Explain this step" + terminology help
  guidedExecution: boolean;       // Proactive guided founder moments (advanced)

  // Analysis & Intelligence
  supplierInsights: boolean;      // Supplier intelligence engine
  executionReadiness: boolean;    // Execution readiness score
  riskPrioritization: boolean;    // Risk priority dashboard

  // Tools & Export
  pdfExport: boolean;
  budgetPlanner: boolean;         // Launch budget planner
  scenarioSimulator: boolean;     // Scenario simulator

  // Reality Check
  fullRealityCheck: boolean;      // Full reality check breakdown (all risks)

  // Roadmap
  smartRoadmap: boolean;          // 30-day launch roadmap
  advancedRoadmap: boolean;       // Advanced adaptive launch roadmap

  // Insights
  fullInsights: boolean;

  // Computed booleans
  canSeeFullRisks: boolean;
  canUseBudgetPlanner: boolean;
  canUseScenarioSimulator: boolean;
  canUseSupplierInsights: boolean;
  canSeeRiskRanking: boolean;
}

export function getCapabilities(plan: string): CapabilityFlags {
  const isBuilder = plan === "builder" || plan === "pro";
  const isPro = plan === "pro";

  return {
    // Education & Guidance
    guidedEducation: isBuilder,
    guidedExecution: isPro,

    // Analysis & Intelligence
    supplierInsights: isPro,
    executionReadiness: isPro,
    riskPrioritization: isPro,

    // Tools & Export
    pdfExport: isBuilder,
    budgetPlanner: isBuilder,
    scenarioSimulator: isPro,

    // Reality Check
    fullRealityCheck: isBuilder,

    // Roadmap
    smartRoadmap: isBuilder,
    advancedRoadmap: isPro,

    // Insights
    fullInsights: isBuilder,

    // Hard gating booleans
    canSeeFullRisks: isBuilder,
    canUseBudgetPlanner: isBuilder,
    canUseScenarioSimulator: isPro,
    canUseSupplierInsights: isPro,
    canSeeRiskRanking: isPro,
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
      de: "Erhalte Einblicke in Lieferantenbewertung, MOQ-Vergleiche und Kostenoptimierung.",
      en: "Get insights on supplier evaluation, MOQ comparisons, and cost optimization.",
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
