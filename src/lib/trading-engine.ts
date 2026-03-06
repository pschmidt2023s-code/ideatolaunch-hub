// ─── Trading Mode Engine ──────────────────────────────────
import type { RiskLevel, StatusMetrics, MoneySummary, RiskItem, ExecutionAction, ScenarioMode } from "./command-center-types";

export type TradingStrategy = "scalping" | "daytrading" | "swing" | "position";
export type TradingMarket = "forex" | "stocks" | "crypto" | "futures" | "options";
export type TradingSession = "london" | "newyork" | "asia" | "all";

export interface TradingPair {
  id: string;
  name: string;
  market: TradingMarket;
  avgSpread: number; // in pips/points
  allocation: number; // percentage of account focus
}

export interface TradingInput {
  accountBalance: number;
  riskPerTrade: number;
  winrate: number;
  avgWin: number;
  avgLoss: number;
  tradesPerMonth: number;
  maxDrawdown: number;
  currentDrawdown: number;
  // New granular fields
  strategy: TradingStrategy;
  primaryMarket: TradingMarket;
  session: TradingSession;
  leverage: number;
  maxOpenPositions: number;
  dailyLossLimit: number; // percentage
  weeklyTarget: number; // in currency
  commissionPerTrade: number;
  slippageAvg: number; // in currency
  tradingPairs: TradingPair[];
}

const DEFAULT_PAIRS: TradingPair[] = [
  { id: "eurusd", name: "EUR/USD", market: "forex", avgSpread: 0.8, allocation: 40 },
  { id: "gbpusd", name: "GBP/USD", market: "forex", avgSpread: 1.2, allocation: 25 },
  { id: "btcusd", name: "BTC/USD", market: "crypto", avgSpread: 15, allocation: 20 },
  { id: "nas100", name: "NAS100", market: "futures", avgSpread: 1.5, allocation: 15 },
];

const DEFAULT_TRADING: TradingInput = {
  accountBalance: 10000,
  riskPerTrade: 2,
  winrate: 55,
  avgWin: 150,
  avgLoss: 100,
  tradesPerMonth: 20,
  maxDrawdown: 15,
  currentDrawdown: 5,
  strategy: "daytrading",
  primaryMarket: "forex",
  session: "london",
  leverage: 30,
  maxOpenPositions: 3,
  dailyLossLimit: 5,
  weeklyTarget: 500,
  commissionPerTrade: 3,
  slippageAvg: 1,
  tradingPairs: DEFAULT_PAIRS,
};

export function getTradingDefaults(): TradingInput {
  return JSON.parse(JSON.stringify(DEFAULT_TRADING));
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
  const netWin = input.avgWin - input.commissionPerTrade - input.slippageAvg;
  const netLoss = input.avgLoss + input.commissionPerTrade + input.slippageAvg;
  return Math.round(wr * netWin - (1 - wr) * netLoss);
}

export function calculateAccountSurvival(input: TradingInput): number {
  const wr = input.winrate / 100;
  const riskPct = input.riskPerTrade / 100;
  const maxConsLosses = Math.floor(1 / riskPct);
  const blowUpProb = Math.pow(1 - wr, maxConsLosses);
  const survival = Math.round((1 - blowUpProb) * 100);
  return Math.max(0, Math.min(100, survival));
}

export function calculateNetMonthlyPnL(input: TradingInput): number {
  const expectancy = calculateExpectancy(input);
  return Math.round(expectancy * input.tradesPerMonth);
}

export function calculateTradingRiskScore(input: TradingInput): number {
  let score = 100;

  // Risk per trade
  if (input.riskPerTrade > 5) score -= 30;
  else if (input.riskPerTrade > 3) score -= 15;
  else if (input.riskPerTrade > 2) score -= 5;

  // Winrate
  if (input.winrate < 40) score -= 25;
  else if (input.winrate < 50) score -= 10;

  // Drawdown
  if (input.currentDrawdown > 20) score -= 25;
  else if (input.currentDrawdown > 10) score -= 10;

  // Profit factor
  const pf = calculateProfitFactor(input);
  if (pf < 1) score -= 20;
  else if (pf < 1.5) score -= 5;

  // Leverage penalty
  if (input.leverage > 100) score -= 20;
  else if (input.leverage > 50) score -= 10;

  // Too many open positions
  if (input.maxOpenPositions > 5) score -= 10;

  // No daily loss limit
  if (input.dailyLossLimit > 10) score -= 10;

  // Crypto-heavy portfolio
  const cryptoAlloc = input.tradingPairs.filter(p => p.market === "crypto").reduce((s, p) => s + p.allocation, 0);
  if (cryptoAlloc > 50) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function buildTradingStatus(input: TradingInput, mode: ScenarioMode): StatusMetrics {
  const mods: Record<ScenarioMode, number> = { optimistic: 1.15, realistic: 1, "worst-case": 0.8 };
  const mult = mods[mode];

  const riskScore = calculateTradingRiskScore({ ...input, winrate: input.winrate * mult });
  const survival = calculateAccountSurvival(input);
  const monthlyPnL = calculateNetMonthlyPnL(input) * mult;
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
  const totalCosts = Math.round(input.tradesPerMonth * (input.commissionPerTrade + input.slippageAvg));

  return {
    margin: Math.round(calculateProfitFactor(input) * 10),
    breakEvenUnits: input.winrate < 50 ? 999 : Math.ceil(input.avgLoss / (input.avgWin * (input.winrate / 100) - input.avgLoss * (1 - input.winrate / 100) || 1)),
    cashflowMonthly: monthly,
    totalCapital: input.accountBalance,
    capitalUsed: Math.round(input.accountBalance * input.currentDrawdown / 100),
    capitalDelta: monthly - totalCosts,
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
  if (input.leverage > 50) {
    risks.push({ id: "leverage", title: `Leverage ${input.leverage}x – Liquidationsgefahr`, impact: Math.round(input.accountBalance * 0.2), level: input.leverage > 100 ? "high" : "medium" });
  }
  if (calculateProfitFactor(input) < 1.2) {
    risks.push({ id: "pf", title: `Profit Factor ${calculateProfitFactor(input)}`, impact: Math.round(input.avgLoss * 10), level: "medium" });
  }

  const monthlyCosts = input.tradesPerMonth * (input.commissionPerTrade + input.slippageAvg);
  if (monthlyCosts > input.accountBalance * 0.02) {
    risks.push({ id: "costs", title: `Handelskosten ${Math.round(monthlyCosts)}€/Mo`, impact: Math.round(monthlyCosts), level: "medium" });
  }

  return risks.sort((a, b) => b.impact - a.impact).slice(0, 4);
}

export function buildTradingActions(input: TradingInput): ExecutionAction[] {
  const actions: ExecutionAction[] = [];

  if (input.riskPerTrade > 3) actions.push({ id: "reduce_risk", label: "Risk/Trade auf ≤2% senken", priority: "critical", blocker: "Überhöhtes Risiko" });
  if (input.currentDrawdown > 15) actions.push({ id: "pause", label: "Trading pausieren & Journal reviewen", priority: "critical" });
  if (input.leverage > 50) actions.push({ id: "leverage", label: `Leverage von ${input.leverage}x reduzieren`, priority: "high" });
  if (input.winrate < 50) actions.push({ id: "backtest", label: "Strategie backtesten", priority: "high" });
  if (calculateProfitFactor(input) < 1.5) actions.push({ id: "rrr", label: "Risk-Reward Ratio verbessern", priority: "high" });
  if (input.dailyLossLimit > 5) actions.push({ id: "daily_limit", label: "Daily Loss Limit auf 3-5% setzen", priority: "medium" });

  return actions.slice(0, 4);
}
