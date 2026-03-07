// ─── Strategy Mode Engine ──────────────────────────────────
import type { RiskLevel, StatusMetrics, MoneySummary, RiskItem, ExecutionAction, ScenarioMode } from "./command-center-types";

export interface StrategyInput {
  decisionCount: number;
  openDecisions: number;
  avgDecisionImpact: number; // €
  riskExposure: number; // total € at risk
  capitalAtStake: number;
  successRate: number; // percentage of past decisions that worked
  timeToDecision: number; // avg days
  reversibilityScore: number; // 0-100 how reversible decisions are
}

const DEFAULT_STRATEGY: StrategyInput = {
  decisionCount: 0,
  openDecisions: 0,
  avgDecisionImpact: 0,
  riskExposure: 0,
  capitalAtStake: 0,
  successRate: 0,
  timeToDecision: 0,
  reversibilityScore: 0,
};

export function getStrategyDefaults(): StrategyInput {
  return { ...DEFAULT_STRATEGY };
}

export function calculateDecisionRisk(input: StrategyInput): number {
  let score = 100;

  // Open decisions overload
  if (input.openDecisions > 5) score -= 20;
  else if (input.openDecisions > 3) score -= 10;

  // Low success rate
  if (input.successRate < 50) score -= 25;
  else if (input.successRate < 65) score -= 10;

  // High risk exposure relative to capital
  const riskRatio = input.riskExposure / (input.capitalAtStake || 1);
  if (riskRatio > 0.5) score -= 20;
  else if (riskRatio > 0.3) score -= 10;

  // Slow decisions
  if (input.timeToDecision > 10) score -= 15;
  else if (input.timeToDecision > 7) score -= 5;

  // Irreversibility
  if (input.reversibilityScore < 30) score -= 15;
  else if (input.reversibilityScore < 50) score -= 5;

  return Math.max(0, Math.min(100, score));
}

export function buildStrategyStatus(input: StrategyInput, mode: ScenarioMode): StatusMetrics {
  const mods: Record<ScenarioMode, number> = { optimistic: 1.15, realistic: 1, "worst-case": 0.75 };
  const riskScore = calculateDecisionRisk(input);
  const effectiveSuccess = Math.min(100, input.successRate * mods[mode]);
  const monthlyImpact = Math.round(input.avgDecisionImpact * (input.decisionCount / 12) * (effectiveSuccess / 100 - 0.5) * 2);

  return {
    founderRiskIndex: riskScore,
    confidenceScore: Math.round(effectiveSuccess),
    riskLevel: riskScore > 70 ? "low" : riskScore >= 40 ? "medium" : "high",
    runwayMonths: monthlyImpact > 0 ? 24 : Math.max(1, Math.round(input.capitalAtStake / Math.abs(monthlyImpact || 1))),
    breakEvenDate: monthlyImpact > 0 ? "Positiv" : "–",
    capitalPressure: Math.round((input.riskExposure / (input.capitalAtStake || 1)) * 100),
    lastUpdated: "Live",
  };
}

export function buildStrategyMoney(input: StrategyInput, mode: ScenarioMode): MoneySummary {
  const mods: Record<ScenarioMode, number> = { optimistic: 1.15, realistic: 1, "worst-case": 0.75 };
  const effectiveSuccess = input.successRate * mods[mode];
  const netImpact = Math.round(input.avgDecisionImpact * (effectiveSuccess / 100 - (1 - effectiveSuccess / 100)));

  return {
    margin: Math.round(effectiveSuccess),
    breakEvenUnits: Math.ceil(input.riskExposure / (input.avgDecisionImpact || 1)),
    cashflowMonthly: Math.round(netImpact * input.decisionCount / 12),
    totalCapital: input.capitalAtStake,
    capitalUsed: input.riskExposure,
    capitalDelta: netImpact,
  };
}

export function buildStrategyRisks(input: StrategyInput): RiskItem[] {
  const risks: RiskItem[] = [];

  if (input.openDecisions > 3) {
    risks.push({ id: "overload", title: `${input.openDecisions} offene Entscheidungen`, impact: input.openDecisions * 2000, level: input.openDecisions > 5 ? "high" : "medium" });
  }
  if (input.riskExposure > input.capitalAtStake * 0.3) {
    risks.push({ id: "exposure", title: `Risk Exposure ${Math.round(input.riskExposure / input.capitalAtStake * 100)}%`, impact: input.riskExposure, level: "high" });
  }
  if (input.successRate < 60) {
    risks.push({ id: "success", title: `Erfolgsrate nur ${input.successRate}%`, impact: Math.round(input.avgDecisionImpact * (1 - input.successRate / 100) * 5), level: "medium" });
  }
  if (input.reversibilityScore < 40) {
    risks.push({ id: "irreversible", title: "Entscheidungen schwer umkehrbar", impact: Math.round(input.avgDecisionImpact * 0.5), level: "medium" });
  }

  return risks.sort((a, b) => b.impact - a.impact).slice(0, 3);
}

export function buildStrategyActions(input: StrategyInput): ExecutionAction[] {
  const actions: ExecutionAction[] = [];

  if (input.openDecisions > 3) actions.push({ id: "clear", label: "Offene Entscheidungen priorisieren", priority: "critical", blocker: "Decision Overload" });
  if (input.successRate < 55) actions.push({ id: "review", label: "Decision Review durchführen", priority: "critical" });
  if (input.riskExposure > input.capitalAtStake * 0.4) actions.push({ id: "reduce", label: "Risk Exposure reduzieren", priority: "high" });
  if (input.timeToDecision > 7) actions.push({ id: "speed", label: "Entscheidungszeit verkürzen", priority: "medium" });

  return actions.slice(0, 3);
}
