// ─── Plan Tiers & Feature Flags ─────────────────────────────────

export type Tier = "free" | "builder" | "pro" | "execution";

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
  | "unboxingScore"
  | "capitalBurnPredictor"
  | "aiStrategyRecommendations"
  | "marketReality"
  | "cashflowEngine"
  | "founderCopilot"
  | "executionOS"
  | "survivalMonitoring"
  | "benchmarkEngine"
  | "executionPlanner"
  | "investorMode"
  | "advancedCopilot"
  | "brandNameIntelligence"
  | "roadmap"
  | "legalMap"
  | "recoveryMode";

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
  // Builder-level intelligence features
  canUseBasicMarketDemand: boolean;
  canUseBasicCompetitorOverview: boolean;
  canUseCashflowTimeline: boolean;
  canUseSupplierRiskBase: boolean;
  canUseLaunchReadiness: boolean;
  canUseLimitedAiSuggestions: boolean;
  // Execution OS features
  canUseExecutionOS: boolean;
  canUseSurvivalMonitoring: boolean;
  canUseBenchmarkEngine: boolean;
  canUseExecutionPlanner: boolean;
  canUseInvestorMode: boolean;
  canUseAdvancedCopilot: boolean;
  canUseBrandNameIntelligence: boolean;
  canUseRoadmap: boolean;
  canUseLegalMap: boolean;
  canUseRecoveryMode: boolean;
}

export function getCapabilities(plan: string): CapabilityFlags {
  const isTrading = plan === "trading";
  const isBuilder = plan === "builder" || plan === "pro" || plan === "execution" || isTrading;
  const isPro = plan === "pro" || plan === "execution" || isTrading;
  const isExecution = plan === "execution" || isTrading;

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
    // Builder gets basic versions of intelligence features
    canUseBasicMarketDemand: isBuilder,
    canUseBasicCompetitorOverview: isBuilder,
    canUseCashflowTimeline: isBuilder,
    canUseSupplierRiskBase: isBuilder,
    canUseLaunchReadiness: isBuilder,
    canUseLimitedAiSuggestions: isBuilder,
    // Execution OS exclusives
    canUseExecutionOS: isExecution,
    canUseSurvivalMonitoring: isExecution,
    canUseBenchmarkEngine: isExecution,
    canUseExecutionPlanner: isExecution,
    canUseInvestorMode: isExecution,
    canUseAdvancedCopilot: isExecution,
    canUseBrandNameIntelligence: isPro,
    canUseRoadmap: isPro,
    canUseLegalMap: isPro,
    canUseRecoveryMode: isPro,
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
    capitalBurnPredictor: "canUseScenarioSimulator",
    aiStrategyRecommendations: "canUseScenarioSimulator",
    marketReality: "canUseScenarioSimulator",
    cashflowEngine: "canUseScenarioSimulator",
    founderCopilot: "canUseScenarioSimulator",
    executionOS: "canUseExecutionOS",
    survivalMonitoring: "canUseSurvivalMonitoring",
    benchmarkEngine: "canUseBenchmarkEngine",
    executionPlanner: "canUseExecutionPlanner",
    investorMode: "canUseInvestorMode",
    advancedCopilot: "canUseAdvancedCopilot",
    brandNameIntelligence: "canUseBrandNameIntelligence",
    roadmap: "canUseRoadmap",
    legalMap: "canUseLegalMap",
    recoveryMode: "canUseRecoveryMode",
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
export function getRequiredPlan(feature: FeatureKey): "builder" | "pro" | "execution" {
  const executionOnly: FeatureKey[] = [
    "executionOS",
    "survivalMonitoring",
    "benchmarkEngine",
    "executionPlanner",
    "investorMode",
    "advancedCopilot",
  ];
  if (executionOnly.includes(feature)) return "execution";

  const proOnly: FeatureKey[] = [
    "scenarioSimulator",
    "supplierMatching",
    "supplierInsights",
    "guidedFounderMode",
    "adaptiveRoadmap",
    "executionReadiness",
    "riskDashboard",
    "unboxingScore",
    "capitalBurnPredictor",
    "aiStrategyRecommendations",
    "marketReality",
    "cashflowEngine",
    "founderCopilot",
    "brandNameIntelligence",
    "roadmap",
    "legalMap",
    "recoveryMode",
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
    title: { de: "Insights freischalten", en: "Unlock Insights" },
    desc: { de: "Erhalte KI-gestützte Risikoanalysen und strategische Empfehlungen für deine Marke.", en: "Get AI-powered risk analysis and strategic recommendations for your brand." },
  },
  pdfExport: {
    title: { de: "PDF-Export freischalten", en: "Unlock PDF Export" },
    desc: { de: "Exportiere deinen kompletten Brand Report als professionelles PDF.", en: "Export your complete brand report as a professional PDF." },
  },
  budgetPlanner: {
    title: { de: "Budget-Planer freischalten", en: "Unlock Budget Planner" },
    desc: { de: "Wisse genau, wie du dein Budget auf Produktion, Marketing und Reserve verteilst.", en: "Know exactly how to allocate your budget across production, marketing, and reserves." },
  },
  scenarioSimulator: {
    title: { de: "Szenario-Simulation freischalten", en: "Unlock Scenario Simulation" },
    desc: { de: "Die meisten Gründer simulieren Szenarien, bevor sie Kapital binden.", en: "Most founders use Scenario Simulation before committing capital." },
  },
  supplierMatching: {
    title: { de: "Supplier Matching freischalten", en: "Unlock Supplier Matching" },
    desc: { de: "Supplier Matching hilft dir, Überbestände zu vermeiden und den richtigen Partner zu finden.", en: "Supplier Matching helps you avoid overcommitting inventory and find the right partner." },
  },
  supplierInsights: {
    title: { de: "Supplier Intelligence freischalten", en: "Unlock Supplier Intelligence" },
    desc: { de: "Erhalte konkrete Lieferanten-Matches, MOQ-Vergleiche und Kostenoptimierung.", en: "Get concrete supplier matches, MOQ comparisons, and cost optimization." },
  },
  guidedFounderMode: {
    title: { de: "Guided Founder Mode freischalten", en: "Unlock Guided Founder Mode" },
    desc: { de: "Erhalte proaktive Hilfe und Erklärungen bei jedem Schritt deines Markenaufbaus.", en: "Get proactive help and explanations at every step of building your brand." },
  },
  adaptiveRoadmap: {
    title: { de: "Adaptive Launch-Roadmap freischalten", en: "Unlock Adaptive Launch Roadmap" },
    desc: { de: "Deine Roadmap passt sich dynamisch an deine Brand-Health-Daten an.", en: "Your roadmap adapts dynamically based on your brand health data." },
  },
  executionReadiness: {
    title: { de: "Execution Readiness Score freischalten", en: "Unlock Execution Readiness Score" },
    desc: { de: "Erfahre genau, wie launch-bereit deine Marke wirklich ist.", en: "Find out exactly how launch-ready your brand really is." },
  },
  riskDashboard: {
    title: { de: "Risk Priority Dashboard freischalten", en: "Unlock Risk Priority Dashboard" },
    desc: { de: "Priorisiere Risiken nach Impact und erhalte datenbasierte Handlungsempfehlungen.", en: "Prioritize risks by impact and get data-driven action recommendations." },
  },
  fullRealityCheck: {
    title: { de: "Volle Risikoanalyse freischalten", en: "Unlock Full Risk Analysis" },
    desc: { de: "Erkenne alle Risiken und erhalte konkrete Lösungsvorschläge für jedes Problem.", en: "Identify all risks and get concrete fix suggestions for each issue." },
  },
  unboxingScore: {
    title: { de: "Unboxing Score freischalten", en: "Unlock Unboxing Score" },
    desc: { de: "Optimiere dein Unboxing-Erlebnis mit konkreten Empfehlungen und einem Score von 0–100.", en: "Optimize your unboxing experience with actionable recommendations and a 0–100 score." },
  },
  capitalBurnPredictor: {
    title: { de: "Capital Burn Predictor freischalten", en: "Unlock Capital Burn Predictor" },
    desc: { de: "12-Monats-Kostenprognose und Cash Runway für dein Unternehmen.", en: "12-month cost forecast and cash runway for your business." },
  },
  aiStrategyRecommendations: {
    title: { de: "KI-Strategieempfehlungen freischalten", en: "Unlock AI Strategy Recommendations" },
    desc: { de: "Erhalte datenbasierte Empfehlungen zu Preis, MOQ und Budget.", en: "Get data-driven recommendations on price, MOQ, and budget." },
  },
  marketReality: {
    title: { de: "Market Reality Engine freischalten", en: "Unlock Market Reality Engine" },
    desc: { de: "Marktvalidierung mit Demand Index, Price Benchmarking und Launch-Wahrscheinlichkeit.", en: "Market validation with demand index, price benchmarking, and launch probability." },
  },
  cashflowEngine: {
    title: { de: "Cashflow Survival Engine freischalten", en: "Unlock Cashflow Survival Engine" },
    desc: { de: "12-Monats Cashflow-Prognose mit Stress-Test und Liquiditäts-Alerts.", en: "12-month cashflow forecast with stress testing and liquidity alerts." },
  },
  founderCopilot: {
    title: { de: "Founder Copilot freischalten", en: "Unlock Founder Copilot" },
    desc: { de: "KI-gestützter Strategieberater mit kontextbezogenen Empfehlungen.", en: "AI-powered strategy advisor with context-aware recommendations." },
  },
  executionOS: {
    title: { de: "Execution OS freischalten", en: "Unlock Execution OS" },
    desc: { de: "Dein Business Operating System – CEO Dashboard, Live-Monitoring & Benchmark Engine.", en: "Your business operating system – CEO dashboard, live monitoring & benchmark engine." },
  },
  survivalMonitoring: {
    title: { de: "Survival Monitoring freischalten", en: "Unlock Survival Monitoring" },
    desc: { de: "Echtzeit-Alerts bei Cash Runway-, Margen- und Conversion-Drops.", en: "Real-time alerts on cash runway, margin, and conversion drops." },
  },
  benchmarkEngine: {
    title: { de: "Benchmark Engine freischalten", en: "Unlock Benchmark Engine" },
    desc: { de: "Anonymer Vergleich deiner KPIs mit anderen Gründern.", en: "Anonymous comparison of your KPIs with other founders." },
  },
  executionPlanner: {
    title: { de: "Execution Planner freischalten", en: "Unlock Execution Planner" },
    desc: { de: "Wöchentliche Aufgabenplanung, Meilensteine und Accountability Score.", en: "Weekly task planning, milestones, and accountability score." },
  },
  investorMode: {
    title: { de: "Investor Mode freischalten", en: "Unlock Investor Mode" },
    desc: { de: "Investor-Ready Summary, Financial Overview und Business Health Report.", en: "Investor-ready summary, financial overview, and business health report." },
  },
  advancedCopilot: {
    title: { de: "Advanced AI Copilot freischalten", en: "Unlock Advanced AI Copilot" },
    desc: { de: "CEO-Level Empfehlungen, strategische Priorisierung und Next-Best-Action.", en: "CEO-level recommendations, strategic prioritization, and next-best-action." },
  },
  brandNameIntelligence: {
    title: { de: "Brand Name Intelligence freischalten", en: "Unlock Brand Name Intelligence" },
    desc: { de: "Domain-Check, Social-Handle-Verfügbarkeit, Markenrecht-Risiko und SEO-Analyse für deinen Markennamen.", en: "Domain check, social handle availability, trademark risk, and SEO analysis for your brand name." },
  },
  roadmap: {
    title: { de: "Personalisierte Roadmap freischalten", en: "Unlock Personalized Roadmap" },
    desc: { de: "Deine Launch-Roadmap wird dynamisch an dein Profil, Budget und Risiken angepasst.", en: "Your launch roadmap adapts dynamically to your profile, budget, and risks." },
  },
  legalMap: {
    title: { de: "Personalisierte Legal Map freischalten", en: "Unlock Personalized Legal Map" },
    desc: { de: "Compliance-Anforderungen basierend auf deinem Produkt, Markt und Geschäftsmodell.", en: "Compliance requirements based on your product, market, and business model." },
  },
  recoveryMode: {
    title: { de: "Recovery Mode freischalten", en: "Unlock Recovery Mode" },
    desc: { de: "Krisenfrüherkennung, Recovery-Pläne und Überlebensstrategien für dein Business.", en: "Crisis detection, recovery plans, and survival strategies for your business." },
  },
};

export function getUpgradeMessage(feature: string): UpgradeMessage {
  return upgradeMessages[feature as FeatureKey] ?? {
    title: { de: "Premium-Feature freischalten", en: "Unlock Premium Feature" },
    desc: { de: "Upgrade deinen Plan für Zugang zu erweiterten Tools und Analysen.", en: "Upgrade your plan for access to advanced tools and analytics." },
  };
}
