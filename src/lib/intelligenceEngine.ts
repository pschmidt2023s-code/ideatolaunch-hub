// ─── Intelligence Engine: Live KPI calculations from real brand data ────────
import type { RiskLevel, StatusMetrics, MoneySummary, RiskItem, ExecutionAction, ScenarioMode } from "./command-center-types";

// ── Input shape aggregated from DB ──────────────────────────────────────────

export interface IntelligenceInput {
  // Financial
  margin: number | null;
  productionCost: number | null;
  packagingCost: number | null;
  shippingCost: number | null;
  marketingBudget: number | null;
  recommendedPrice: number | null;
  breakEvenUnits: number | null;

  // Brand profile
  budget: number | null;           // total capital
  
  // Production / sourcing
  moqExpectation: string | null;   // e.g. "500"
  productionRegion: string | null;
  supplierRiskWarnings: number;    // count of risk_warnings

  // Compliance
  complianceScore: number | null;  // 0–100
  openComplianceBlockers: number;

  // Launch
  returnRate: number | null;       // percentage
  launchQuantity: number | null;
  launchReadinessScore: number | null;
  fulfillmentModel: string | null;

  // Module completion flags
  hasFinancialModel: boolean;
  hasBrandProfile: boolean;
  hasProductionPlan: boolean;
  hasCompliancePlan: boolean;
  hasLaunchPlan: boolean;
  hasBrandIdentity: boolean;
}

// ── Scenario modifiers ──────────────────────────────────────────────────────

const SCENARIO_MODIFIERS: Record<ScenarioMode, { conversionMult: number; returnRateDelta: number; adsMult: number }> = {
  optimistic:  { conversionMult: 1.15, returnRateDelta: -2, adsMult: 1.0 },
  realistic:   { conversionMult: 1.0,  returnRateDelta: 0,  adsMult: 1.0 },
  "worst-case": { conversionMult: 0.8,  returnRateDelta: 3,  adsMult: 1.15 },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function estimateLeadTimeDays(region: string | null): number {
  if (!region) return 30;
  const r = region.toLowerCase();
  if (r.includes("china") || r.includes("asien") || r.includes("asia")) return 60;
  if (r.includes("eu") || r.includes("europa") || r.includes("europe")) return 20;
  if (r.includes("de") || r.includes("deutschland") || r.includes("germany")) return 14;
  return 35;
}

// ── 1. Founder Risk Index (0–100) ───────────────────────────────────────────

export function calculateFounderRisk(input: IntelligenceInput, mode: ScenarioMode = "realistic"): number {
  const mod = SCENARIO_MODIFIERS[mode];
  let score = 100;

  // Runway penalty
  const runway = calculateRunway(input, mode);
  if (runway !== null) {
    if (runway < 6) score -= 25;
    else if (runway < 12) score -= 10;
  }

  // Margin penalty
  const margin = input.margin;
  if (margin !== null && margin < 25) score -= 20;

  // Return rate penalty
  const returnRate = (input.returnRate ?? 0) + mod.returnRateDelta;
  if (returnRate > 5) score -= 15;

  // Lead time penalty
  const leadTime = estimateLeadTimeDays(input.productionRegion);
  if (leadTime > 45) score -= 10;

  // Compliance penalty
  if (input.openComplianceBlockers > 0) score -= 10;

  // Capital pressure penalty
  const cp = calculateCapitalPressure(input, mode);
  if (cp !== null && cp > 70) score -= 10;

  return clamp(score, 0, 100);
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score > 70) return "low";
  if (score >= 40) return "medium";
  return "high";
}

// ── 2. Confidence Score ─────────────────────────────────────────────────────

export function calculateConfidence(input: IntelligenceInput): number {
  // Data completeness (40% weight)
  const modules = [
    input.hasFinancialModel,
    input.hasBrandProfile,
    input.hasProductionPlan,
    input.hasCompliancePlan,
    input.hasLaunchPlan,
    input.hasBrandIdentity,
  ];
  const completedCount = modules.filter(Boolean).length;
  const completeness = (completedCount / modules.length) * 100;

  // Break-even clarity (20% weight)
  const breakEvenClarity = input.breakEvenUnits !== null && input.margin !== null ? 100 : 0;

  // Supplier validated (20% weight)
  const supplierValidated = input.hasProductionPlan && input.supplierRiskWarnings <= 1 ? 100 : input.hasProductionPlan ? 50 : 0;

  // Compliance validated (20% weight)
  const complianceValidated = input.complianceScore ?? 0;

  const confidence = Math.round(
    completeness * 0.4 +
    breakEvenClarity * 0.2 +
    supplierValidated * 0.2 +
    complianceValidated * 0.2
  );

  return clamp(confidence, 0, 100);
}

// ── 3. Runway (months) ──────────────────────────────────────────────────────

export function calculateRunway(input: IntelligenceInput, mode: ScenarioMode = "realistic"): number | null {
  const mod = SCENARIO_MODIFIERS[mode];
  const capital = input.budget;
  if (capital === null || capital <= 0) return null;

  const monthlyCosts =
    ((input.productionCost ?? 0) +
     (input.packagingCost ?? 0) +
     (input.shippingCost ?? 0) +
     (input.marketingBudget ?? 0) * mod.adsMult) / 12;

  if (monthlyCosts <= 0) return null;

  const price = input.recommendedPrice ?? 0;
  const units = (input.launchQuantity ?? 0) / 12;
  const effectiveReturnRate = clamp((input.returnRate ?? 0) + mod.returnRateDelta, 0, 100);
  const monthlyRevenue = price * units * mod.conversionMult * (1 - effectiveReturnRate / 100);

  const netBurn = monthlyCosts - monthlyRevenue;
  if (netBurn <= 0) return 24; // profitable → 24+ months

  const runway = capital / netBurn;
  return Math.round(runway * 10) / 10;
}

// ── 4. Capital Pressure (0–100) ─────────────────────────────────────────────

export function calculateCapitalPressure(input: IntelligenceInput, mode: ScenarioMode = "realistic"): number | null {
  const mod = SCENARIO_MODIFIERS[mode];
  const capital = input.budget;
  if (capital === null || capital <= 0) return null;

  let pressure = 0;

  // Capital usage ratio
  const totalCosts = (input.productionCost ?? 0) + (input.packagingCost ?? 0) +
    (input.shippingCost ?? 0) + (input.marketingBudget ?? 0) * mod.adsMult;
  const usageRatio = totalCosts / capital;
  pressure += clamp(usageRatio * 60, 0, 60); // max 60 points from usage

  // Break-even distance
  const beUnits = input.breakEvenUnits ?? 0;
  const launchQty = input.launchQuantity ?? 0;
  if (launchQty > 0 && beUnits > launchQty) {
    pressure += 20; // can't break even in first batch
  }

  // Ads spend proportion
  const adsBudget = (input.marketingBudget ?? 0) * mod.adsMult;
  if (totalCosts > 0 && adsBudget / totalCosts > 0.4) {
    pressure += 10;
  }

  // Fixed cost indicator (production + packaging as proxy)
  const fixedCosts = (input.productionCost ?? 0) + (input.packagingCost ?? 0);
  if (totalCosts > 0 && fixedCosts / totalCosts > 0.7) {
    pressure += 10;
  }

  return clamp(Math.round(pressure), 0, 100);
}

// ── 5. Break-even date estimate ─────────────────────────────────────────────

export function estimateBreakEvenDate(input: IntelligenceInput, mode: ScenarioMode = "realistic"): string {
  const mod = SCENARIO_MODIFIERS[mode];
  const price = input.recommendedPrice;
  const beUnits = input.breakEvenUnits;
  if (!price || !beUnits || price <= 0) return "–";

  const monthlyUnits = ((input.launchQuantity ?? 0) / 12) * mod.conversionMult;
  if (monthlyUnits <= 0) return "–";

  const effectiveReturnRate = clamp((input.returnRate ?? 0) + mod.returnRateDelta, 0, 100);
  const netMonthlyUnits = monthlyUnits * (1 - effectiveReturnRate / 100);
  if (netMonthlyUnits <= 0) return "–";

  const monthsToBreakEven = Math.ceil(beUnits / netMonthlyUnits);
  const date = new Date();
  date.setMonth(date.getMonth() + monthsToBreakEven);

  const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// ── 6. Aggregate: Build full status metrics ─────────────────────────────────

export function buildLiveStatus(input: IntelligenceInput, mode: ScenarioMode): StatusMetrics {
  const founderRiskIndex = calculateFounderRisk(input, mode);
  const confidenceScore = calculateConfidence(input);
  const runwayMonths = calculateRunway(input, mode) ?? 0;
  const capitalPressure = calculateCapitalPressure(input, mode) ?? 0;
  const breakEvenDate = estimateBreakEvenDate(input, mode);

  return {
    founderRiskIndex,
    confidenceScore,
    riskLevel: riskLevelFromScore(founderRiskIndex),
    runwayMonths,
    breakEvenDate,
    capitalPressure,
    lastUpdated: "Live",
  };
}

// ── 7. Build live money summary ─────────────────────────────────────────────

export function buildLiveMoney(input: IntelligenceInput, mode: ScenarioMode): MoneySummary {
  const mod = SCENARIO_MODIFIERS[mode];
  const margin = input.margin ?? 0;
  const breakEvenUnits = input.breakEvenUnits ?? 0;

  const price = input.recommendedPrice ?? 0;
  const monthlyUnits = ((input.launchQuantity ?? 0) / 12) * mod.conversionMult;
  const effectiveReturnRate = clamp((input.returnRate ?? 0) + mod.returnRateDelta, 0, 100);
  const monthlyRevenue = price * monthlyUnits * (1 - effectiveReturnRate / 100);

  const monthlyCosts =
    ((input.productionCost ?? 0) + (input.packagingCost ?? 0) +
     (input.shippingCost ?? 0) + (input.marketingBudget ?? 0) * mod.adsMult) / 12;

  const cashflowMonthly = Math.round(monthlyRevenue - monthlyCosts);
  const totalCapital = input.budget ?? 0;
  const capitalUsed = Math.round(
    (input.productionCost ?? 0) + (input.packagingCost ?? 0) +
    (input.shippingCost ?? 0) + (input.marketingBudget ?? 0) * mod.adsMult
  );

  return {
    margin: Math.round(margin),
    breakEvenUnits,
    cashflowMonthly,
    totalCapital,
    capitalUsed: Math.min(capitalUsed, totalCapital),
    capitalDelta: cashflowMonthly,
  };
}

// ── 8. Build live risks ─────────────────────────────────────────────────────

export function buildLiveRisks(input: IntelligenceInput, mode: ScenarioMode): RiskItem[] {
  const mod = SCENARIO_MODIFIERS[mode];
  const risks: RiskItem[] = [];

  const effectiveReturnRate = (input.returnRate ?? 0) + mod.returnRateDelta;
  const leadTime = estimateLeadTimeDays(input.productionRegion);
  const price = input.recommendedPrice ?? 0;
  const monthlyUnits = ((input.launchQuantity ?? 0) / 12) * mod.conversionMult;

  // Compliance risk
  if (input.openComplianceBlockers > 0) {
    risks.push({
      id: "compliance",
      title: `${input.openComplianceBlockers} Compliance-Blocker offen`,
      impact: input.openComplianceBlockers * 2500,
      level: input.openComplianceBlockers >= 3 ? "high" : "medium",
    });
  }

  // Return rate risk
  if (effectiveReturnRate > 5) {
    const impact = Math.round(price * monthlyUnits * (effectiveReturnRate / 100) * 12);
    risks.push({
      id: "returns",
      title: `Retourenquote ${effectiveReturnRate.toFixed(0)}%`,
      impact: impact || 1600,
      level: effectiveReturnRate > 10 ? "high" : "medium",
    });
  }

  // Supplier lead time risk
  if (leadTime > 30) {
    risks.push({
      id: "leadtime",
      title: `Lieferzeit ~${leadTime} Tage`,
      impact: Math.round(leadTime * 50),
      level: leadTime > 45 ? "high" : "medium",
    });
  }

  // Low margin risk
  if (input.margin !== null && input.margin < 25) {
    risks.push({
      id: "margin",
      title: `Marge nur ${Math.round(input.margin)}%`,
      impact: Math.round((25 - input.margin) * monthlyUnits * price / 100 * 12) || 2000,
      level: input.margin < 15 ? "high" : "medium",
    });
  }

  // Supplier risk warnings
  if (input.supplierRiskWarnings > 0) {
    risks.push({
      id: "supplier",
      title: `${input.supplierRiskWarnings} Lieferanten-Warnungen`,
      impact: input.supplierRiskWarnings * 1500,
      level: input.supplierRiskWarnings >= 3 ? "high" : "medium",
    });
  }

  // Sort by impact desc, take top 3
  risks.sort((a, b) => b.impact - a.impact);
  return risks.slice(0, 3);
}

// ── 9. Build live actions ───────────────────────────────────────────────────

export function buildLiveActions(input: IntelligenceInput): ExecutionAction[] {
  const actions: ExecutionAction[] = [];

  if (!input.hasFinancialModel) {
    actions.push({ id: "fin", label: "Finanzkalkulation abschließen", priority: "critical", blocker: "Keine Margen-Daten" });
  }
  if (input.openComplianceBlockers > 0) {
    actions.push({ id: "compl", label: "Compliance-Blocker lösen", priority: "critical", blocker: `${input.openComplianceBlockers} offene Punkte` });
  }
  if (!input.hasProductionPlan) {
    actions.push({ id: "prod", label: "Produktion planen", priority: "high" });
  }
  if (!input.hasLaunchPlan) {
    actions.push({ id: "launch", label: "Launch-Plan erstellen", priority: "high" });
  }
  if (!input.hasBrandIdentity) {
    actions.push({ id: "brand", label: "Markenidentität definieren", priority: "medium" });
  }
  if (input.margin !== null && input.margin < 20) {
    actions.push({ id: "price", label: "Preiskalkulation überprüfen", priority: "high" });
  }

  return actions.slice(0, 3);
}

// ── 10. Data sufficiency check ──────────────────────────────────────────────

export function hasMinimumData(input: IntelligenceInput): boolean {
  return input.hasFinancialModel || input.hasBrandProfile;
}

// ── 11. Metric explanations ─────────────────────────────────────────────────

export const METRIC_EXPLANATIONS: Record<string, { title: string; description: string; factors: string[] }> = {
  founderRiskIndex: {
    title: "Founder Risk Index",
    description: "Dein Gesamtrisiko als Gründer, basierend auf finanziellen und operativen Faktoren.",
    factors: ["Runway-Länge", "Marge", "Retourenquote", "Lieferzeit", "Compliance-Status", "Kapitaldruck"],
  },
  confidenceScore: {
    title: "Confidence Score",
    description: "Wie vollständig und validiert dein Business-Setup ist.",
    factors: ["Datenvollständigkeit der Module", "Break-even Klarheit", "Lieferanten-Validierung", "Compliance-Score"],
  },
  runway: {
    title: "Runway",
    description: "Wie lange dein Kapital bei aktuellem Burn Rate reicht.",
    factors: ["Gesamtkapital", "Monatliche Kosten", "Geschätzter monatlicher Umsatz", "Retourenquote"],
  },
  capitalPressure: {
    title: "Capital Pressure",
    description: "Wie stark dein Kapital unter Druck steht.",
    factors: ["Kapitalnutzungsquote", "Break-even Distanz", "Ads-Anteil an Gesamtkosten", "Fixkostenquote"],
  },
  riskStatus: {
    title: "Risk Status",
    description: "Abgeleitet vom Founder Risk Index: >70 Low, 40–70 Medium, <40 High.",
    factors: ["Founder Risk Index"],
  },
  breakEven: {
    title: "Break-even Datum",
    description: "Geschätzter Zeitpunkt bis zur Gewinnschwelle basierend auf Absatzprognose.",
    factors: ["Break-even Units", "Monatlicher Absatz", "Retourenquote", "Conversion-Annahme"],
  },
};
