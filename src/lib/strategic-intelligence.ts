// ─── Pro Plan: Strategic Intelligence Engine ────────────────────────
// Capital burn, supplier risk, launch probability, execution score

export interface CapitalBurnInput {
  productionCost: number;
  packagingCost: number;
  shippingCost: number;
  marketingBudget: number;
  fixedCosts: number; // rent, tools, subscriptions
  unitsPerMonth: number;
  totalCapital: number;
}

export interface CapitalBurnResult {
  monthlyBurn: number;
  monthlyRevenuNeeded: number;
  cashRunwayMonths: number;
  burnRate: "safe" | "moderate" | "critical";
  forecast: { month: number; balance: number; cumRevenue: number; cumCost: number }[];
}

export function computeCapitalBurn(input: CapitalBurnInput, pricePerUnit: number): CapitalBurnResult {
  const unitCost = input.productionCost + input.packagingCost + input.shippingCost;
  const monthlyVariableCost = unitCost * input.unitsPerMonth;
  const monthlyBurn = monthlyVariableCost + input.marketingBudget + input.fixedCosts;
  const monthlyRevenue = pricePerUnit * input.unitsPerMonth;
  const netMonthly = monthlyRevenue - monthlyBurn;

  const cashRunwayMonths = netMonthly >= 0
    ? 99 // profitable
    : Math.max(0, Math.round(input.totalCapital / Math.abs(netMonthly)));

  const forecast: CapitalBurnResult["forecast"] = [];
  let balance = input.totalCapital;
  let cumRevenue = 0;
  let cumCost = 0;
  for (let m = 1; m <= 12; m++) {
    cumCost += monthlyBurn;
    cumRevenue += monthlyRevenue;
    balance = input.totalCapital + cumRevenue - cumCost;
    forecast.push({ month: m, balance: Math.round(balance), cumRevenue: Math.round(cumRevenue), cumCost: Math.round(cumCost) });
  }

  const burnRate: CapitalBurnResult["burnRate"] =
    cashRunwayMonths >= 12 ? "safe" : cashRunwayMonths >= 6 ? "moderate" : "critical";

  return {
    monthlyBurn: Math.round(monthlyBurn),
    monthlyRevenuNeeded: Math.round(monthlyBurn),
    cashRunwayMonths,
    burnRate,
    forecast,
  };
}

// ─── Supplier Risk Score ────────────────────────────────────────────

export interface SupplierRiskInput {
  moqAmount: number;
  budget: number;
  region: string;
  leadTimeWeeks: number;
  singleSupplier: boolean;
}

export interface SupplierRiskResult {
  overallScore: number; // 0-100, higher = more risk
  moqRisk: number;
  countryRisk: number;
  leadTimeRisk: number;
  dependencyRisk: number;
  level: "low" | "medium" | "high" | "critical";
  warnings: string[];
}

const COUNTRY_RISK_MAP: Record<string, number> = {
  deutschland: 10, germany: 10, de: 10,
  eu: 15, europa: 15,
  china: 50, cn: 50,
  indien: 45, india: 45, in: 45,
  türkei: 35, turkey: 35, tr: 35,
  usa: 20, us: 20,
};

export function computeSupplierRisk(input: SupplierRiskInput): SupplierRiskResult {
  const warnings: string[] = [];

  // MOQ risk (0-100)
  const moqRatio = input.moqAmount / Math.max(input.budget, 1);
  const moqRisk = Math.min(100, Math.round(moqRatio * 100));
  if (moqRisk > 60) warnings.push("MOQ verbraucht über 60% des Budgets");

  // Country risk
  const countryRisk = COUNTRY_RISK_MAP[input.region.toLowerCase()] ?? 30;
  if (countryRisk >= 40) warnings.push(`Hohes Länderrisiko: ${input.region}`);

  // Lead time risk
  const leadTimeRisk = Math.min(100, Math.round((input.leadTimeWeeks / 16) * 100));
  if (input.leadTimeWeeks > 12) warnings.push("Lieferzeit über 12 Wochen");

  // Dependency risk
  const dependencyRisk = input.singleSupplier ? 80 : 30;
  if (input.singleSupplier) warnings.push("Einzelner Lieferant – hohes Abhängigkeitsrisiko");

  const overallScore = Math.round(
    moqRisk * 0.3 + countryRisk * 0.25 + leadTimeRisk * 0.2 + dependencyRisk * 0.25
  );

  const level: SupplierRiskResult["level"] =
    overallScore > 70 ? "critical" : overallScore > 50 ? "high" : overallScore > 30 ? "medium" : "low";

  return { overallScore, moqRisk, countryRisk, leadTimeRisk, dependencyRisk, level, warnings };
}

// ─── Launch Probability Score ───────────────────────────────────────

export interface LaunchProbabilityInput {
  margin: number;
  capitalSafetyMonths: number;
  supplierRiskScore: number;
  complianceScore: number;
  hasProduct: boolean;
  hasDistribution: boolean;
}

export function computeLaunchProbability(input: LaunchProbabilityInput): {
  score: number;
  level: "high" | "medium" | "low";
  factors: { label: string; value: number; max: number }[];
} {
  const factors: { label: string; value: number; max: number }[] = [];

  // Margin contribution (max 25)
  const marginScore = Math.min(25, Math.round((input.margin / 50) * 25));
  factors.push({ label: "Marge", value: marginScore, max: 25 });

  // Capital safety (max 20)
  const capitalScore = Math.min(20, Math.round((input.capitalSafetyMonths / 12) * 20));
  factors.push({ label: "Kapitalreserve", value: capitalScore, max: 20 });

  // Supplier risk (inverse, max 20)
  const supplierScore = Math.round(((100 - input.supplierRiskScore) / 100) * 20);
  factors.push({ label: "Lieferanten-Sicherheit", value: supplierScore, max: 20 });

  // Compliance (max 20)
  const complianceScore = Math.round((input.complianceScore / 100) * 20);
  factors.push({ label: "Compliance", value: complianceScore, max: 20 });

  // Readiness (max 15)
  let readiness = 0;
  if (input.hasProduct) readiness += 8;
  if (input.hasDistribution) readiness += 7;
  factors.push({ label: "Bereitschaft", value: readiness, max: 15 });

  const score = factors.reduce((sum, f) => sum + f.value, 0);
  const level: "high" | "medium" | "low" =
    score >= 70 ? "high" : score >= 45 ? "medium" : "low";

  return { score, level, factors };
}

// ─── Execution Score ────────────────────────────────────────────────

export interface ExecutionInput {
  stepsCompleted: number;
  totalSteps: number;
  daysActive: number;
  financialModelComplete: boolean;
  supplierSelected: boolean;
  complianceScore: number;
}

export function computeExecutionScore(input: ExecutionInput): {
  score: number;
  level: "excellent" | "good" | "needs_work" | "behind";
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 0;

  // Step progress (max 40)
  const stepProgress = input.totalSteps > 0 ? input.stepsCompleted / input.totalSteps : 0;
  score += Math.round(stepProgress * 40);
  if (stepProgress < 0.5) suggestions.push("Mehr Workflow-Schritte abschließen");

  // Velocity (max 20) - steps per week
  const weeks = Math.max(1, input.daysActive / 7);
  const velocity = input.stepsCompleted / weeks;
  if (velocity >= 1) {
    score += 20;
  } else if (velocity >= 0.5) {
    score += 12;
  } else {
    score += 5;
    suggestions.push("Regelmäßiger am Projekt arbeiten");
  }

  // Financial model (max 15)
  if (input.financialModelComplete) {
    score += 15;
  } else {
    suggestions.push("Finanzmodell vervollständigen");
  }

  // Supplier (max 10)
  if (input.supplierSelected) {
    score += 10;
  } else {
    suggestions.push("Lieferanten auswählen und bestätigen");
  }

  // Compliance (max 15)
  score += Math.round((input.complianceScore / 100) * 15);
  if (input.complianceScore < 50) suggestions.push("Compliance-Checkliste durcharbeiten");

  const level: "excellent" | "good" | "needs_work" | "behind" =
    score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "needs_work" : "behind";

  return { score, level, suggestions };
}
