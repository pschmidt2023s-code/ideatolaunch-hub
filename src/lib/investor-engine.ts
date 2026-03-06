// ─── Investor Mode Engine ──────────────────────────────────
import type { RiskLevel, StatusMetrics, MoneySummary, RiskItem, ExecutionAction, ScenarioMode } from "./command-center-types";

export interface InvestorInput {
  totalPortfolio: number;
  cashPosition: number; // percentage
  equityExposure: number; // percentage
  bondExposure: number; // percentage
  cryptoExposure: number; // percentage
  realEstateExposure: number; // percentage
  annualReturn: number; // percentage
  portfolioDrawdown: number; // percentage current
  concentrationRisk: number; // 0-100 (100 = fully concentrated)
  dividendYield: number; // percentage
}

const DEFAULT_INVESTOR: InvestorInput = {
  totalPortfolio: 50000,
  cashPosition: 10,
  equityExposure: 50,
  bondExposure: 20,
  cryptoExposure: 10,
  realEstateExposure: 10,
  annualReturn: 8,
  portfolioDrawdown: 5,
  concentrationRisk: 30,
  dividendYield: 2.5,
};

export function getInvestorDefaults(): InvestorInput {
  return { ...DEFAULT_INVESTOR };
}

export function calculatePortfolioRisk(input: InvestorInput): number {
  let score = 100;
  
  // Concentration risk
  if (input.concentrationRisk > 60) score -= 25;
  else if (input.concentrationRisk > 40) score -= 10;

  // Crypto overexposure
  if (input.cryptoExposure > 30) score -= 20;
  else if (input.cryptoExposure > 15) score -= 8;

  // Low cash buffer
  if (input.cashPosition < 5) score -= 15;
  else if (input.cashPosition < 10) score -= 5;

  // Drawdown
  if (input.portfolioDrawdown > 20) score -= 20;
  else if (input.portfolioDrawdown > 10) score -= 10;

  // Negative returns
  if (input.annualReturn < 0) score -= 15;

  return Math.max(0, Math.min(100, score));
}

export function buildInvestorStatus(input: InvestorInput, mode: ScenarioMode): StatusMetrics {
  const mods: Record<ScenarioMode, number> = { optimistic: 1.2, realistic: 1, "worst-case": 0.7 };
  const riskScore = calculatePortfolioRisk(input);
  const effectiveReturn = input.annualReturn * mods[mode];
  const monthlyGrowth = (input.totalPortfolio * effectiveReturn / 100) / 12;
  
  return {
    founderRiskIndex: riskScore,
    confidenceScore: Math.round(100 - input.concentrationRisk * 0.6 - input.portfolioDrawdown),
    riskLevel: riskScore > 70 ? "low" : riskScore >= 40 ? "medium" : "high",
    runwayMonths: effectiveReturn > 0 ? 24 : Math.max(1, Math.round(input.totalPortfolio / Math.abs(monthlyGrowth || 1))),
    breakEvenDate: effectiveReturn > 0 ? "Wachsend" : "–",
    capitalPressure: Math.round(input.portfolioDrawdown * 2.5 + (100 - input.cashPosition)),
    lastUpdated: "Live",
  };
}

export function buildInvestorMoney(input: InvestorInput, mode: ScenarioMode): MoneySummary {
  const mods: Record<ScenarioMode, number> = { optimistic: 1.2, realistic: 1, "worst-case": 0.7 };
  const effectiveReturn = input.annualReturn * mods[mode];
  const monthlyReturn = Math.round((input.totalPortfolio * effectiveReturn / 100) / 12);
  const monthlyDividend = Math.round((input.totalPortfolio * input.dividendYield / 100) / 12);

  return {
    margin: Math.round(effectiveReturn * 10) / 10,
    breakEvenUnits: 0,
    cashflowMonthly: monthlyReturn + monthlyDividend,
    totalCapital: input.totalPortfolio,
    capitalUsed: Math.round(input.totalPortfolio * (1 - input.cashPosition / 100)),
    capitalDelta: monthlyReturn,
  };
}

export function buildInvestorRisks(input: InvestorInput): RiskItem[] {
  const risks: RiskItem[] = [];

  if (input.concentrationRisk > 40) {
    risks.push({ id: "concentration", title: `Klumpenrisiko ${input.concentrationRisk}%`, impact: Math.round(input.totalPortfolio * 0.15), level: input.concentrationRisk > 60 ? "high" : "medium" });
  }
  if (input.cryptoExposure > 20) {
    risks.push({ id: "crypto", title: `Crypto-Exposure ${input.cryptoExposure}%`, impact: Math.round(input.totalPortfolio * input.cryptoExposure / 100 * 0.5), level: "high" });
  }
  if (input.cashPosition < 10) {
    risks.push({ id: "cash", title: `Niedrige Cash-Reserve ${input.cashPosition}%`, impact: Math.round(input.totalPortfolio * 0.05), level: "medium" });
  }
  if (input.portfolioDrawdown > 10) {
    risks.push({ id: "drawdown", title: `Drawdown ${input.portfolioDrawdown}%`, impact: Math.round(input.totalPortfolio * input.portfolioDrawdown / 100), level: "high" });
  }

  return risks.sort((a, b) => b.impact - a.impact).slice(0, 3);
}

export function buildInvestorActions(input: InvestorInput): ExecutionAction[] {
  const actions: ExecutionAction[] = [];

  if (input.concentrationRisk > 50) actions.push({ id: "diversify", label: "Portfolio diversifizieren", priority: "critical", blocker: "Klumpenrisiko" });
  if (input.cashPosition < 5) actions.push({ id: "cash", label: "Cash-Reserve aufbauen", priority: "critical" });
  if (input.cryptoExposure > 25) actions.push({ id: "crypto", label: "Crypto-Position reduzieren", priority: "high" });
  if (input.dividendYield < 2) actions.push({ id: "yield", label: "Dividenden-Assets prüfen", priority: "medium" });

  return actions.slice(0, 3);
}
