// ─── Trading Mode Engine ──────────────────────────────────
// Deterministic calculations for trader risk/performance metrics.

import type { RiskLevel, StatusMetrics, MoneySummary, RiskItem, ExecutionAction, ScenarioMode } from "./command-center-types";

export interface TradingInput {
  accountBalance: number;
  riskPerTrade: number; // percentage
  winrate: number; // percentage
  avgWin: number;
  avgLoss: number;
  tradesPerMonth: number;
  maxDrawdown: number; // percentage experienced
  currentDrawdown: number; // percentage current
}

const DEFAULT_TRADING: TradingInput = {
  accountBalance: 10000,
  riskPerTrade: 2,
  winrate: 55,
  avgWin: 150,
  avgLoss: 100,
  tradesPerMonth: 20,
  maxDrawdown: 15,
  currentDrawdown: 5,
};

export function getTradingDefaults(): TradingInput {
  return { ...DEFAULT_TRADING };
}

export function calculateProfitFactor(input: TradingInput): number {
  const { winrate, avgWin, avgLoss } = input;
  const wr = winrate / 100;
  const grossProfit = wr * avgWin;
  const grossLoss = (1 - wr) * avgLoss;
  return grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : 0;
}

export function calculateExpectancy(input: TradingInput): number {
  const wr = input.winrate / 100;
  return Math.round(wr * input.avgWin - (1 - wr) * input.avgLoss);
}

export function calculateAccountSurvival(input: TradingInput): number {
  // Simplified: probability of NOT blowing up in next 100 trades
  const wr = input.winrate / 100;
  const riskPct = input.riskPerTrade / 100;
  // Consecutive losses to blow up
  const maxConsLosses = Math.floor(1 / riskPct);
  // Probability of maxConsLosses consecutive losses
  const blowUpProb = Math.pow(1 - wr, maxConsLosses);
  // Survival over 100 trades
  const survival = Math.round((1 - blowUpProb) * 100);
  return Math.max(0, Math.min(100, survival));
}

export function calculateTradingRiskScore(input: TradingInput): number {
  let score = 100;
  // Risk per trade penalty
  if (input.riskPerTrade > 5) score -= 30;
  else if (input.riskPerTrade > 3) score -= 15;
  else if (input.riskPerTrade > 2) score -= 5;

  // Winrate penalty
  if (input.winrate < 40) score -= 25;
  else if (input.winrate < 50) score -= 10;

  // Drawdown penalty
  if (input.currentDrawdown > 20) score -= 25;
  else if (input.currentDrawdown > 10) score -= 10;

  // Profit factor
  const pf = calculateProfitFactor(input);
  if (pf < 1) score -= 20;
  else if (pf < 1.5) score -= 5;

  return Math.max(0, Math.min(100, score));
}

export function buildTradingStatus(input: TradingInput, mode: ScenarioMode): StatusMetrics {
  const mods: Record<ScenarioMode, number> = { optimistic: 1.15, realistic: 1, "worst-case": 0.8 };
  const mult = mods[mode];
  
  const riskScore = calculateTradingRiskScore({ ...input, winrate: input.winrate * mult });
  const survival = calculateAccountSurvival(input);
  const expectancy = calculateExpectancy(input);
  const monthlyPnL = expectancy * input.tradesPerMonth * mult;
  const runway = monthlyPnL > 0 ? 24 : Math.max(1, Math.round(input.accountBalance / Math.abs(monthlyPnL || 1)));

  return {
    founderRiskIndex: riskScore,
    confidenceScore: survival,
    riskLevel: riskScore > 70 ? "low" : riskScore >= 40 ? "medium" : "high",
    runwayMonths: runway,
    breakEvenDate: monthlyPnL > 0 ? "Profitabel" : `~${runway} Monate`,
    capitalPressure: Math.round(input.currentDrawdown * 3),
    lastUpdated: "Live",
  };
}

export function buildTradingMoney(input: TradingInput, mode: ScenarioMode): MoneySummary {
  const mods: Record<ScenarioMode, number> = { optimistic: 1.15, realistic: 1, "worst-case": 0.8 };
  const expectancy = calculateExpectancy(input) * mods[mode];
  const monthly = Math.round(expectancy * input.tradesPerMonth);

  return {
    margin: Math.round(calculateProfitFactor(input) * 10),
    breakEvenUnits: input.winrate < 50 ? 999 : Math.ceil(input.avgLoss / (input.avgWin * (input.winrate / 100) - input.avgLoss * (1 - input.winrate / 100) || 1)),
    cashflowMonthly: monthly,
    totalCapital: input.accountBalance,
    capitalUsed: Math.round(input.accountBalance * input.currentDrawdown / 100),
    capitalDelta: monthly,
  };
}

export function buildTradingRisks(input: TradingInput): RiskItem[] {
  const risks: RiskItem[] = [];
  
  if (input.riskPerTrade > 3) {
    risks.push({ id: "risk_size", title: `Risk/Trade ${input.riskPerTrade}% – zu hoch`, impact: Math.round(input.accountBalance * input.riskPerTrade / 100), level: "high" });
  }
  if (input.currentDrawdown > 10) {
    risks.push({ id: "drawdown", title: `Drawdown ${input.currentDrawdown}%`, impact: Math.round(input.accountBalance * input.currentDrawdown / 100), level: input.currentDrawdown > 20 ? "high" : "medium" });
  }
  if (input.winrate < 50) {
    risks.push({ id: "winrate", title: `Winrate nur ${input.winrate}%`, impact: Math.round(input.avgLoss * input.tradesPerMonth * (1 - input.winrate / 100)), level: "high" });
  }
  if (calculateProfitFactor(input) < 1.2) {
    risks.push({ id: "pf", title: `Profit Factor ${calculateProfitFactor(input)}`, impact: Math.round(input.avgLoss * 10), level: "medium" });
  }

  return risks.sort((a, b) => b.impact - a.impact).slice(0, 3);
}

export function buildTradingActions(input: TradingInput): ExecutionAction[] {
  const actions: ExecutionAction[] = [];
  
  if (input.riskPerTrade > 3) actions.push({ id: "reduce_risk", label: "Risk/Trade auf ≤2% senken", priority: "critical", blocker: "Überhöhtes Risiko" });
  if (input.currentDrawdown > 15) actions.push({ id: "pause", label: "Trading pausieren & Journal reviewen", priority: "critical" });
  if (input.winrate < 50) actions.push({ id: "backtest", label: "Strategie backtesten", priority: "high" });
  if (calculateProfitFactor(input) < 1.5) actions.push({ id: "rrr", label: "Risk-Reward Ratio verbessern", priority: "high" });
  
  return actions.slice(0, 3);
}
