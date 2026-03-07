// ─── Crypto Intelligence Engine ──────────────────────────
// Advanced Risk, Strategy & Capital Intelligence for Crypto/Futures/Quant

// ═══════════════════════════════════════════════════════════
// FEATURE 1: Strategy Survival Engine
// ═══════════════════════════════════════════════════════════

export interface SurvivalInput {
  winrate: number;       // %
  riskPerTrade: number;  // %
  rrr: number;
  fees: number;          // $ per trade
  slippage: number;      // $ per trade
  accountSize: number;
}

export interface SurvivalResult {
  survivalScore: number;          // 0-100
  riskOfRuin: number;             // 0-100%
  survivalProbability: number;    // 0-100%
  maxConsecutiveLosses: number;
  expectedLifetimeTrades: number;
  grade: "A" | "B" | "C" | "D" | "F";
}

export function calculateStrategySurvival(input: SurvivalInput, sims = 500, maxTrades = 500): SurvivalResult {
  const { winrate, riskPerTrade, rrr, fees, slippage, accountSize } = input;
  const wr = winrate / 100;
  const riskAmt = accountSize * (riskPerTrade / 100);
  const netWin = riskAmt * rrr - fees - slippage;
  const netLoss = riskAmt + fees + slippage;

  let survived = 0;
  let totalLifetime = 0;
  let worstCons = 0;

  for (let s = 0; s < sims; s++) {
    let bal = accountSize;
    let cons = 0;
    let maxCons = 0;
    let trades = 0;
    for (let t = 0; t < maxTrades; t++) {
      if (bal <= 0) break;
      trades++;
      const win = Math.random() < wr;
      bal += win ? netWin : -netLoss;
      cons = win ? 0 : cons + 1;
      maxCons = Math.max(maxCons, cons);
    }
    if (bal > 0) survived++;
    totalLifetime += trades;
    worstCons = Math.max(worstCons, maxCons);
  }

  const survivalProbability = Math.round((survived / sims) * 100);
  const riskOfRuin = 100 - survivalProbability;
  const expectedLifetimeTrades = Math.round(totalLifetime / sims);

  // Composite score
  const survivalScore = Math.round(
    survivalProbability * 0.5 +
    Math.max(0, 100 - worstCons * 5) * 0.3 +
    Math.min(100, expectedLifetimeTrades / 5) * 0.2
  );

  const grade: SurvivalResult["grade"] =
    survivalScore >= 85 ? "A" : survivalScore >= 70 ? "B" : survivalScore >= 50 ? "C" : survivalScore >= 30 ? "D" : "F";

  return { survivalScore, riskOfRuin, survivalProbability, maxConsecutiveLosses: worstCons, expectedLifetimeTrades, grade };
}

// ═══════════════════════════════════════════════════════════
// FEATURE 2: AI Edge Detector (analytical, no external API)
// ═══════════════════════════════════════════════════════════

export interface EdgeInput {
  winrate: number;
  avgWin: number;
  avgLoss: number;
  recentWinrate: number;  // last 20 trades winrate %
  entryAccuracy: number;  // % of entries within planned zone
  fees: number;
}

export interface EdgeResult {
  edgeScore: number;           // 0-100
  edgeStrength: "strong" | "moderate" | "weak" | "none";
  edgeDecline: boolean;
  entryQuality: "excellent" | "good" | "poor";
  expectancy: number;
  profitFactor: number;
}

export function detectEdge(input: EdgeInput): EdgeResult {
  const { winrate, avgWin, avgLoss, recentWinrate, entryAccuracy, fees } = input;
  const wr = winrate / 100;
  const netWin = avgWin - fees;
  const netLoss = avgLoss + fees;

  const expectancy = wr * netWin - (1 - wr) * netLoss;
  const profitFactor = (1 - wr) * netLoss > 0 ? (wr * netWin) / ((1 - wr) * netLoss) : 0;

  const edgeDecline = recentWinrate < winrate - 5;
  const entryQuality: EdgeResult["entryQuality"] =
    entryAccuracy >= 80 ? "excellent" : entryAccuracy >= 60 ? "good" : "poor";

  // Composite edge score
  const expectancyScore = Math.min(40, Math.max(0, expectancy / netLoss * 40));
  const pfScore = Math.min(30, profitFactor * 10);
  const entryScore = entryAccuracy * 0.3;
  const edgeScore = Math.round(Math.min(100, expectancyScore + pfScore + entryScore));

  const edgeStrength: EdgeResult["edgeStrength"] =
    edgeScore >= 75 ? "strong" : edgeScore >= 50 ? "moderate" : edgeScore >= 25 ? "weak" : "none";

  return {
    edgeScore,
    edgeStrength,
    edgeDecline,
    entryQuality,
    expectancy: Math.round(expectancy * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
  };
}

// ═══════════════════════════════════════════════════════════
// FEATURE 3: Market Regime AI
// ═══════════════════════════════════════════════════════════

export type MarketRegime = "trending" | "sideways" | "high_volatility" | "bear_market" | "bull_market";

export interface RegimeInput {
  volatility: number;      // 1-10
  trendStrength: number;   // 1-10
  trendDirection: number;  // -10 (bear) to +10 (bull)
  volume: number;          // 1-10
}

export interface RegimeResult {
  regime: MarketRegime;
  confidence: number;
  icon: string;
  strategy: string;
  warnings: string[];
}

export function detectRegime(input: RegimeInput): RegimeResult {
  const { volatility, trendStrength, trendDirection, volume } = input;
  const warnings: string[] = [];

  if (volatility > 7) {
    if (trendDirection < -3) {
      if (volume > 7) warnings.push("Panic selling detected — reduce exposure");
      return {
        regime: "bear_market",
        confidence: Math.min(95, volatility * 8 + Math.abs(trendDirection) * 3),
        icon: "🐻",
        strategy: "Hedge positions, reduce leverage, consider short strategies",
        warnings,
      };
    }
    warnings.push("Extreme volatility — tighten risk management");
    return {
      regime: "high_volatility",
      confidence: Math.min(95, volatility * 10),
      icon: "⚡",
      strategy: "Reduce position sizes, widen stops, limit trade frequency",
      warnings,
    };
  }

  if (trendDirection > 5 && trendStrength > 5) {
    return {
      regime: "bull_market",
      confidence: Math.min(95, trendStrength * 8 + trendDirection * 3),
      icon: "🚀",
      strategy: "Trend-following, breakout entries, scale into winners",
      warnings,
    };
  }

  if (trendStrength > 5) {
    return {
      regime: "trending",
      confidence: Math.min(95, trendStrength * 12),
      icon: "📈",
      strategy: "Follow the trend, trailing stops, momentum entries",
      warnings,
    };
  }

  if (volume < 4) warnings.push("Low volume — watch for fake breakouts");
  return {
    regime: "sideways",
    confidence: Math.min(85, (10 - trendStrength) * 10),
    icon: "↔️",
    strategy: "Range trading, mean reversion, tight targets",
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════
// FEATURE 4: Capital Survival Timeline
// ═══════════════════════════════════════════════════════════

export interface TimelineScenario {
  trades: number;
  survivalRate: number;
  medianBalance: number;
  worstBalance: number;
  bestBalance: number;
}

export function simulateCapitalTimeline(
  input: SurvivalInput,
  sims = 300
): TimelineScenario[] {
  const tradeCounts = [100, 250, 500];
  const { winrate, riskPerTrade, rrr, fees, slippage, accountSize } = input;
  const wr = winrate / 100;

  return tradeCounts.map((tradeCount) => {
    let survived = 0;
    const finals: number[] = [];

    for (let s = 0; s < sims; s++) {
      let bal = accountSize;
      for (let t = 0; t < tradeCount; t++) {
        const risk = bal * (riskPerTrade / 100);
        const win = Math.random() < wr;
        bal += win ? risk * rrr - fees - slippage : -(risk + fees + slippage);
        bal = Math.max(0, bal);
        if (bal <= 0) break;
      }
      if (bal > 0) survived++;
      finals.push(bal);
    }

    finals.sort((a, b) => a - b);
    return {
      trades: tradeCount,
      survivalRate: Math.round((survived / sims) * 100),
      medianBalance: Math.round(finals[Math.floor(sims / 2)]),
      worstBalance: Math.round(finals[Math.floor(sims * 0.05)]),
      bestBalance: Math.round(finals[Math.floor(sims * 0.95)]),
    };
  });
}

// ═══════════════════════════════════════════════════════════
// FEATURE 5: Emotional Trading Detector
// ═══════════════════════════════════════════════════════════

export interface EmotionInput {
  tradesPlanned: number;
  tradesExecuted: number;
  riskPerTrade: number;
  maxRiskAllowed: number;
  consecutiveLosses: number;
  tradedAfterLoss: boolean;
  dailyLossReached: boolean;
  tradedAfterDailyLimit: boolean;
  avgHoldTime: number;      // minutes
  plannedHoldTime: number;  // minutes
}

export interface EmotionResult {
  emotionScore: number;  // 0-100 (100 = fully disciplined)
  overtrading: boolean;
  riskViolation: boolean;
  tiltDetected: boolean;
  earlyExits: boolean;
  grade: "A" | "B" | "C" | "D" | "F";
  warnings: string[];
}

export function detectEmotionalTrading(input: EmotionInput): EmotionResult {
  const warnings: string[] = [];
  let score = 100;

  // Overtrading
  const otRatio = input.tradesPlanned > 0 ? input.tradesExecuted / input.tradesPlanned : 1;
  const overtrading = otRatio > 1.3;
  if (overtrading) {
    score -= 20;
    warnings.push(`${Math.round((otRatio - 1) * 100)}% more trades than planned`);
  }

  // Risk violations
  const riskViolation = input.riskPerTrade > input.maxRiskAllowed;
  if (riskViolation) {
    score -= 25;
    warnings.push(`Risk ${input.riskPerTrade}% exceeds limit ${input.maxRiskAllowed}%`);
  }

  // Tilt
  let tiltDetected = false;
  if (input.consecutiveLosses >= 3 && input.tradedAfterLoss) {
    tiltDetected = true;
    score -= 25;
    warnings.push("Revenge trading detected after loss streak");
  }
  if (input.dailyLossReached && input.tradedAfterDailyLimit) {
    tiltDetected = true;
    score -= 30;
    warnings.push("Traded past daily loss limit");
  }

  // Early exits
  const earlyExits = input.avgHoldTime < input.plannedHoldTime * 0.5;
  if (earlyExits) {
    score -= 10;
    warnings.push("Exiting positions too early — fear-based behavior");
  }

  score = Math.max(0, score);
  const grade: EmotionResult["grade"] =
    score >= 90 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : score >= 30 ? "D" : "F";

  return { emotionScore: score, overtrading, riskViolation, tiltDetected, earlyExits, grade, warnings };
}

// ═══════════════════════════════════════════════════════════
// DEEP CRYPTO TOOLS
// ═══════════════════════════════════════════════════════════

// ── Liquidation Distance Scanner ──
export interface LiquidationScan {
  liquidationPrice: number;
  distancePercent: number;
  riskLevel: "safe" | "warning" | "danger" | "critical";
  safetyBuffer: number;
}

export function scanLiquidationDistance(
  entryPrice: number,
  leverage: number,
  isLong: boolean,
  maintenanceMargin: number = 0.5
): LiquidationScan {
  const liqPrice = isLong
    ? entryPrice * (1 - 1 / leverage + maintenanceMargin / 100)
    : entryPrice * (1 + 1 / leverage - maintenanceMargin / 100);

  const distancePercent = Math.abs((liqPrice - entryPrice) / entryPrice * 100);
  const riskLevel: LiquidationScan["riskLevel"] =
    distancePercent > 20 ? "safe" : distancePercent > 10 ? "warning" : distancePercent > 5 ? "danger" : "critical";

  return {
    liquidationPrice: Math.round(liqPrice * 100) / 100,
    distancePercent: Math.round(distancePercent * 100) / 100,
    riskLevel,
    safetyBuffer: Math.round(distancePercent * 100) / 100,
  };
}

// ── Funding Rate Analyzer ──
export interface FundingAnalysis {
  annualizedRate: number;
  sentiment: "bullish" | "bearish" | "neutral";
  costPer24h: number;
  recommendation: string;
}

export function analyzeFundingRate(
  fundingRate: number,  // e.g. 0.01 = 1%
  positionSize: number,
  intervalsPerDay: number = 3
): FundingAnalysis {
  const annualizedRate = Math.round(fundingRate * intervalsPerDay * 365 * 10000) / 100;
  const costPer24h = Math.round(positionSize * fundingRate * intervalsPerDay * 100) / 100;

  const sentiment: FundingAnalysis["sentiment"] =
    fundingRate > 0.03 ? "bullish" : fundingRate < -0.03 ? "bearish" : "neutral";

  let recommendation = "Normal funding — no action needed";
  if (fundingRate > 0.1) recommendation = "Extremely high funding — consider closing longs or opening shorts";
  else if (fundingRate > 0.05) recommendation = "Elevated funding — monitor for reversal signals";
  else if (fundingRate < -0.05) recommendation = "Negative funding — shorts paying longs, consider long bias";

  return { annualizedRate, sentiment, costPer24h, recommendation };
}

// ── Whale Activity Monitor ──
export interface WhaleAlert {
  impactScore: number;    // 0-100
  direction: "accumulation" | "distribution" | "neutral";
  pressure: string;
}

export function analyzeWhaleActivity(
  largeOrderRatio: number,  // % of volume from large orders
  netFlow: number           // positive = inflow, negative = outflow (in $)
): WhaleAlert {
  const impactScore = Math.min(100, Math.round(largeOrderRatio * 1.5));
  const direction: WhaleAlert["direction"] =
    netFlow > 0 ? "accumulation" : netFlow < 0 ? "distribution" : "neutral";

  let pressure = "No significant whale activity";
  if (largeOrderRatio > 50 && netFlow > 0) pressure = "Strong accumulation — bullish signal";
  else if (largeOrderRatio > 50 && netFlow < 0) pressure = "Heavy distribution — bearish signal";
  else if (largeOrderRatio > 30) pressure = "Moderate whale presence — stay alert";

  return { impactScore, direction, pressure };
}

// ── Orderbook Imbalance Analyzer ──
export interface OrderbookImbalance {
  imbalanceRatio: number;  // >1 = bid heavy, <1 = ask heavy
  pressure: "buy" | "sell" | "balanced";
  strength: number;        // 0-100
  signal: string;
}

export function analyzeOrderbook(
  bidVolume: number,
  askVolume: number
): OrderbookImbalance {
  const total = bidVolume + askVolume;
  const imbalanceRatio = askVolume > 0 ? Math.round((bidVolume / askVolume) * 100) / 100 : 0;
  const strength = total > 0 ? Math.round(Math.abs(bidVolume - askVolume) / total * 100) : 0;

  const pressure: OrderbookImbalance["pressure"] =
    imbalanceRatio > 1.2 ? "buy" : imbalanceRatio < 0.8 ? "sell" : "balanced";

  let signal = "Balanced orderbook — no clear direction";
  if (imbalanceRatio > 2) signal = "Strong buy wall — support likely to hold";
  else if (imbalanceRatio > 1.5) signal = "Moderate bid pressure — slight bullish bias";
  else if (imbalanceRatio < 0.5) signal = "Strong sell wall — resistance overhead";
  else if (imbalanceRatio < 0.7) signal = "Ask-heavy book — slight bearish bias";

  return { imbalanceRatio, pressure, strength, signal };
}

// ── Portfolio Correlation Map ──
export interface CorrelationEntry {
  asset: string;
  allocation: number;
  correlationGroup: "high" | "medium" | "low";
}

export interface PortfolioCorrelation {
  entries: CorrelationEntry[];
  concentrationRisk: number;   // 0-100
  diversificationScore: number; // 0-100
  recommendation: string;
}

export function analyzePortfolioCorrelation(
  assets: Array<{ name: string; allocation: number; type: "btc_correlated" | "eth_correlated" | "defi" | "stablecoin" | "alt" }>
): PortfolioCorrelation {
  const groupCorrelation: Record<string, "high" | "medium" | "low"> = {
    btc_correlated: "high",
    eth_correlated: "high",
    defi: "medium",
    alt: "medium",
    stablecoin: "low",
  };

  const entries: CorrelationEntry[] = assets.map(a => ({
    asset: a.name,
    allocation: a.allocation,
    correlationGroup: groupCorrelation[a.type] ?? "medium",
  }));

  const highCorr = assets.filter(a => groupCorrelation[a.type] === "high").reduce((s, a) => s + a.allocation, 0);
  const uniqueTypes = new Set(assets.map(a => a.type)).size;
  const maxAlloc = Math.max(...assets.map(a => a.allocation), 0);

  const concentrationRisk = Math.round(Math.min(100, highCorr * 0.7 + maxAlloc * 0.3));
  const diversificationScore = Math.round(Math.min(100, uniqueTypes * 20 + (100 - maxAlloc) * 0.5));

  let recommendation = "Portfolio is well diversified";
  if (concentrationRisk > 70) recommendation = "High concentration in correlated assets — diversify into uncorrelated pairs";
  else if (concentrationRisk > 40) recommendation = "Moderate correlation exposure — consider adding hedges";

  return { entries, concentrationRisk, diversificationScore, recommendation };
}
