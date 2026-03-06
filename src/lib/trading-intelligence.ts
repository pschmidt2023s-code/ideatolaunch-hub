// ─── Trading Intelligence Module ──────────────────────────
// Advanced engines for Account Survival, Drawdown Prediction,
// Liquidation Risk, Market Regime, Discipline Monitoring, etc.

import type { TradingInput } from "./trading-engine";

// ── 1. Account Survival Engine (Monte Carlo) ──
export interface SurvivalResult {
  survivalProbability: number;
  expectedLifetimeTrades: number;
  ruinProbability: number;
  maxConsecutiveLosses: number;
  confidenceInterval: { low: number; high: number };
}

export function runAccountSurvival(
  winrate: number,
  riskPerTrade: number,
  rrr: number,
  accountSize: number,
  simulations = 1000,
  maxTrades = 500
): SurvivalResult {
  const wr = winrate / 100;
  const riskAmt = accountSize * (riskPerTrade / 100);
  const rewardAmt = riskAmt * rrr;
  let survived = 0;
  let totalLifetime = 0;
  let worstConsLosses = 0;
  const finalBalances: number[] = [];

  for (let s = 0; s < simulations; s++) {
    let bal = accountSize;
    let consLosses = 0;
    let maxCons = 0;
    let trades = 0;

    for (let t = 0; t < maxTrades; t++) {
      if (bal <= 0) break;
      trades++;
      const win = Math.random() < wr;
      bal += win ? rewardAmt : -riskAmt;
      consLosses = win ? 0 : consLosses + 1;
      maxCons = Math.max(maxCons, consLosses);
    }

    if (bal > 0) survived++;
    totalLifetime += trades;
    worstConsLosses = Math.max(worstConsLosses, maxCons);
    finalBalances.push(bal);
  }

  finalBalances.sort((a, b) => a - b);
  const p10 = finalBalances[Math.floor(simulations * 0.1)] ?? 0;
  const p90 = finalBalances[Math.floor(simulations * 0.9)] ?? 0;

  return {
    survivalProbability: Math.round((survived / simulations) * 100),
    expectedLifetimeTrades: Math.round(totalLifetime / simulations),
    ruinProbability: Math.round(((simulations - survived) / simulations) * 100),
    maxConsecutiveLosses: worstConsLosses,
    confidenceInterval: {
      low: Math.round(p10),
      high: Math.round(p90),
    },
  };
}

// ── 2. Strategy Edge Analyzer ──
export interface StrategyEdge {
  expectancy: number;
  edge: number; // percentage
  profitFactor: number;
  kellyPercent: number;
  edgeQuality: "strong" | "moderate" | "weak" | "negative";
}

export function analyzeStrategyEdge(
  winrate: number,
  avgWin: number,
  avgLoss: number,
  commission: number = 0
): StrategyEdge {
  const wr = winrate / 100;
  const netWin = avgWin - commission;
  const netLoss = avgLoss + commission;
  const expectancy = wr * netWin - (1 - wr) * netLoss;
  const edge = netLoss > 0 ? (expectancy / netLoss) * 100 : 0;
  const profitFactor = (1 - wr) * netLoss > 0
    ? (wr * netWin) / ((1 - wr) * netLoss)
    : 0;
  const kellyPercent = netWin > 0
    ? Math.max(0, (wr - (1 - wr) / (netWin / netLoss)) * 100)
    : 0;

  const edgeQuality: StrategyEdge["edgeQuality"] =
    edge > 20 ? "strong" : edge > 10 ? "moderate" : edge > 0 ? "weak" : "negative";

  return {
    expectancy: Math.round(expectancy * 100) / 100,
    edge: Math.round(edge * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    kellyPercent: Math.round(kellyPercent * 100) / 100,
    edgeQuality,
  };
}

// ── 3. Drawdown Predictor ──
export interface DrawdownPrediction {
  worstCaseDrawdown: number;
  expectedMaxDrawdown: number;
  drawdownDuration: number; // trades to recover
  recoveryTrades: number;
}

export function predictDrawdown(
  winrate: number,
  riskPerTrade: number,
  rrr: number,
  simulations = 500,
  tradeCount = 200
): DrawdownPrediction {
  const wr = winrate / 100;
  let worstDD = 0;
  let totalMaxDD = 0;
  let totalRecovery = 0;

  for (let s = 0; s < simulations; s++) {
    let peak = 100;
    let bal = 100;
    let maxDD = 0;
    let ddStart = 0;
    let longestRecovery = 0;

    for (let t = 0; t < tradeCount; t++) {
      const win = Math.random() < wr;
      bal += win ? riskPerTrade * rrr : -riskPerTrade;
      if (bal > peak) {
        longestRecovery = Math.max(longestRecovery, t - ddStart);
        peak = bal;
        ddStart = t;
      }
      const dd = ((peak - bal) / peak) * 100;
      maxDD = Math.max(maxDD, dd);
    }

    worstDD = Math.max(worstDD, maxDD);
    totalMaxDD += maxDD;
    totalRecovery += longestRecovery;
  }

  return {
    worstCaseDrawdown: Math.round(worstDD * 10) / 10,
    expectedMaxDrawdown: Math.round((totalMaxDD / simulations) * 10) / 10,
    drawdownDuration: Math.round(totalRecovery / simulations),
    recoveryTrades: Math.round(totalRecovery / simulations),
  };
}

// ── 4. Risk Per Trade Calculator ──
export interface PositionSize {
  positionSize: number;
  riskAmount: number;
  lotSize: number;
  unitsSize: number;
  maxLoss: number;
}

export function calculatePositionSize(
  accountSize: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number,
  pipValue: number = 10
): PositionSize {
  const riskAmount = accountSize * (riskPercent / 100);
  const slDistance = Math.abs(entryPrice - stopLoss);
  const positionSize = slDistance > 0 ? riskAmount / slDistance : 0;
  const lotSize = pipValue > 0 ? positionSize / pipValue : 0;

  return {
    positionSize: Math.round(positionSize * 100) / 100,
    riskAmount: Math.round(riskAmount * 100) / 100,
    lotSize: Math.round(lotSize * 100) / 100,
    unitsSize: Math.round(positionSize),
    maxLoss: Math.round(riskAmount * 100) / 100,
  };
}

// ── 5. Liquidation Risk Scanner ──
export interface LiquidationRisk {
  liquidationPrice: number;
  liquidationDistance: number; // percentage
  marginUsed: number;
  marginLevel: number; // percentage
  riskLevel: "safe" | "warning" | "danger" | "critical";
  safetyBuffer: number; // percentage until liquidation
}

export function scanLiquidationRisk(
  entryPrice: number,
  leverage: number,
  isLong: boolean,
  accountBalance: number,
  positionSize: number,
  maintenanceMarginRate: number = 0.5 // 0.5%
): LiquidationRisk {
  const marginUsed = (positionSize * entryPrice) / leverage;
  const marginLevel = (accountBalance / marginUsed) * 100;

  // Simplified liquidation price
  const liqMove = (1 / leverage) * 100; // percentage move to liquidation
  const liquidationPrice = isLong
    ? entryPrice * (1 - 1 / leverage + maintenanceMarginRate / 100)
    : entryPrice * (1 + 1 / leverage - maintenanceMarginRate / 100);

  const liquidationDistance = Math.abs((liquidationPrice - entryPrice) / entryPrice * 100);
  const safetyBuffer = liquidationDistance;

  const riskLevel: LiquidationRisk["riskLevel"] =
    safetyBuffer > 20 ? "safe" :
    safetyBuffer > 10 ? "warning" :
    safetyBuffer > 5 ? "danger" : "critical";

  return {
    liquidationPrice: Math.round(liquidationPrice * 100) / 100,
    liquidationDistance: Math.round(liquidationDistance * 100) / 100,
    marginUsed: Math.round(marginUsed * 100) / 100,
    marginLevel: Math.round(marginLevel * 100) / 100,
    riskLevel,
    safetyBuffer: Math.round(safetyBuffer * 100) / 100,
  };
}

// ── 6. Portfolio Exposure ──
export interface AssetExposure {
  asset: string;
  allocation: number;
  risk: "low" | "medium" | "high";
  correlation: number; // -1 to 1 simplified
}

export function calculatePortfolioExposure(
  pairs: Array<{ name: string; market: string; allocation: number }>
): {
  exposures: AssetExposure[];
  concentrationRisk: number;
  diversificationScore: number;
} {
  const marketRisk: Record<string, "low" | "medium" | "high"> = {
    forex: "medium",
    stocks: "medium",
    crypto: "high",
    futures: "high",
    options: "high",
  };

  const exposures: AssetExposure[] = pairs.map((p) => ({
    asset: p.name,
    allocation: p.allocation,
    risk: marketRisk[p.market] ?? "medium",
    correlation: p.market === "crypto" ? 0.8 : p.market === "forex" ? 0.4 : 0.5,
  }));

  const maxAlloc = Math.max(...pairs.map((p) => p.allocation), 0);
  const concentrationRisk = maxAlloc; // higher = more concentrated
  const uniqueMarkets = new Set(pairs.map((p) => p.market)).size;
  const diversificationScore = Math.min(100, uniqueMarkets * 25 + (100 - maxAlloc));

  return { exposures, concentrationRisk, diversificationScore };
}

// ── 7. Market Regime Detector ──
export type MarketRegime = "trending" | "sideways" | "high_volatility";

export interface RegimeResult {
  regime: MarketRegime;
  confidence: number;
  suggestion: string;
  icon: string;
}

export function detectMarketRegime(
  // Simplified: based on user inputs
  volatilityLevel: number, // 1-10
  trendStrength: number,  // 1-10
  avgRange: number        // daily range percentage
): RegimeResult {
  if (volatilityLevel > 7) {
    return {
      regime: "high_volatility",
      confidence: Math.min(95, volatilityLevel * 10),
      suggestion: "Positionsgrößen reduzieren, weite Stops nutzen, weniger Trades",
      icon: "⚡",
    };
  }
  if (trendStrength > 6) {
    return {
      regime: "trending",
      confidence: Math.min(95, trendStrength * 12),
      suggestion: "Trend folgen, Breakouts traden, Trailing Stops nutzen",
      icon: "📈",
    };
  }
  return {
    regime: "sideways",
    confidence: Math.min(85, (10 - trendStrength) * 10),
    suggestion: "Range traden, Mean-Reversion, enge Targets",
    icon: "↔️",
  };
}

// ── 8. Discipline Monitor ──
export interface DisciplineReport {
  overtrading: boolean;
  overtradingScore: number;
  riskViolations: number;
  tiltScore: number;
  disciplineGrade: "A" | "B" | "C" | "D" | "F";
  warnings: string[];
}

export function monitorDiscipline(
  tradesPlanned: number,
  tradesExecuted: number,
  riskPerTrade: number,
  maxRiskAllowed: number,
  consecutiveLosses: number,
  tradedAfterLoss: boolean,
  dailyLossReached: boolean,
  tradedAfterDailyLimit: boolean
): DisciplineReport {
  const warnings: string[] = [];
  let score = 100;

  // Overtrading
  const overtradingRatio = tradesPlanned > 0 ? tradesExecuted / tradesPlanned : 1;
  const overtrading = overtradingRatio > 1.5;
  const overtradingScore = Math.round(overtradingRatio * 100);
  if (overtrading) {
    warnings.push(`${Math.round((overtradingRatio - 1) * 100)}% mehr Trades als geplant`);
    score -= 20;
  }

  // Risk violations
  let riskViolations = 0;
  if (riskPerTrade > maxRiskAllowed) {
    riskViolations++;
    warnings.push(`Risk/Trade ${riskPerTrade}% > Limit ${maxRiskAllowed}%`);
    score -= 25;
  }

  // Tilt detection
  let tiltScore = 0;
  if (consecutiveLosses >= 3) {
    tiltScore += 30;
    if (tradedAfterLoss) {
      tiltScore += 30;
      warnings.push("Revenge Trading erkannt: Trades nach Verlustserie");
      score -= 25;
    }
  }
  if (dailyLossReached && tradedAfterDailyLimit) {
    tiltScore += 40;
    warnings.push("Daily Loss Limit überschritten und weiter getradet");
    score -= 30;
  }

  const disciplineGrade: DisciplineReport["disciplineGrade"] =
    score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

  return {
    overtrading,
    overtradingScore,
    riskViolations,
    tiltScore: Math.min(100, tiltScore),
    disciplineGrade,
    warnings,
  };
}

// ── 9. Trade Simulation Lab ──
export interface SimulationResult {
  finalBalance: number;
  totalTrades: number;
  wins: number;
  losses: number;
  maxDrawdown: number;
  profitProbability: number;
  avgReturn: number;
  equityCurve: number[];
}

export function simulateTrades(
  winrate: number,
  rrr: number,
  riskPercent: number,
  startBalance: number,
  tradeCount: number,
  simulations: number = 100
): SimulationResult {
  const wr = winrate / 100;
  let totalFinal = 0;
  let profitable = 0;
  let worstDD = 0;
  let totalWins = 0;
  let totalLosses = 0;
  const avgCurve: number[] = new Array(tradeCount + 1).fill(0);

  for (let s = 0; s < simulations; s++) {
    let bal = startBalance;
    let peak = bal;
    let maxDD = 0;
    let wins = 0;
    let losses = 0;
    avgCurve[0] += bal;

    for (let t = 0; t < tradeCount; t++) {
      const risk = bal * (riskPercent / 100);
      if (Math.random() < wr) {
        bal += risk * rrr;
        wins++;
      } else {
        bal -= risk;
        losses++;
      }
      bal = Math.max(0, bal);
      peak = Math.max(peak, bal);
      const dd = peak > 0 ? ((peak - bal) / peak) * 100 : 0;
      maxDD = Math.max(maxDD, dd);
      avgCurve[t + 1] += bal;
    }

    totalFinal += bal;
    if (bal > startBalance) profitable++;
    worstDD = Math.max(worstDD, maxDD);
    totalWins += wins;
    totalLosses += losses;
  }

  return {
    finalBalance: Math.round(totalFinal / simulations),
    totalTrades: tradeCount,
    wins: Math.round(totalWins / simulations),
    losses: Math.round(totalLosses / simulations),
    maxDrawdown: Math.round(worstDD * 10) / 10,
    profitProbability: Math.round((profitable / simulations) * 100),
    avgReturn: Math.round(((totalFinal / simulations - startBalance) / startBalance) * 10000) / 100,
    equityCurve: avgCurve.map((v) => Math.round(v / simulations)),
  };
}
