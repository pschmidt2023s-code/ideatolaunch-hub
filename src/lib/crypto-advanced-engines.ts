// ─── Advanced Crypto Trading Engines ──────────────────────
// Engines for: Risk-Adjusted Returns, Streaks, Time Analysis,
// Fee Impact, Stress Test, Drawdown Recovery, Sentiment, Pattern Recognition

// ── 1. Risk-Adjusted Returns ──
export interface RiskAdjustedReturns {
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  annualizedReturn: number;
  volatility: number;
  grade: "A" | "B" | "C" | "D" | "F";
}

export function calculateRiskAdjustedReturns(
  monthlyReturns: number[], // array of monthly % returns
  riskFreeRate: number = 4  // annual %
): RiskAdjustedReturns {
  if (monthlyReturns.length === 0) {
    return { sharpeRatio: 0, sortinoRatio: 0, calmarRatio: 0, maxDrawdown: 0, annualizedReturn: 0, volatility: 0, grade: "F" };
  }

  const avgMonthly = monthlyReturns.reduce((s, r) => s + r, 0) / monthlyReturns.length;
  const annualizedReturn = Math.round(avgMonthly * 12 * 100) / 100;
  const rfMonthly = riskFreeRate / 12;

  // Volatility (std dev)
  const variance = monthlyReturns.reduce((s, r) => s + Math.pow(r - avgMonthly, 2), 0) / monthlyReturns.length;
  const stdDev = Math.sqrt(variance);
  const volatility = Math.round(stdDev * Math.sqrt(12) * 100) / 100;

  // Sharpe
  const sharpeRatio = stdDev > 0 ? Math.round((avgMonthly - rfMonthly) / stdDev * Math.sqrt(12) * 100) / 100 : 0;

  // Sortino (downside deviation)
  const downsideReturns = monthlyReturns.filter(r => r < rfMonthly);
  const downsideVariance = downsideReturns.length > 0
    ? downsideReturns.reduce((s, r) => s + Math.pow(r - rfMonthly, 2), 0) / downsideReturns.length
    : 0;
  const downsideDev = Math.sqrt(downsideVariance);
  const sortinoRatio = downsideDev > 0 ? Math.round((avgMonthly - rfMonthly) / downsideDev * Math.sqrt(12) * 100) / 100 : 0;

  // Max Drawdown
  let peak = 100;
  let maxDD = 0;
  let bal = 100;
  for (const r of monthlyReturns) {
    bal *= (1 + r / 100);
    peak = Math.max(peak, bal);
    const dd = (peak - bal) / peak * 100;
    maxDD = Math.max(maxDD, dd);
  }
  const maxDrawdown = Math.round(maxDD * 10) / 10;

  // Calmar
  const calmarRatio = maxDrawdown > 0 ? Math.round(annualizedReturn / maxDrawdown * 100) / 100 : 0;

  const grade: RiskAdjustedReturns["grade"] =
    sharpeRatio > 2 ? "A" : sharpeRatio > 1 ? "B" : sharpeRatio > 0.5 ? "C" : sharpeRatio > 0 ? "D" : "F";

  return { sharpeRatio, sortinoRatio, calmarRatio, maxDrawdown, annualizedReturn, volatility, grade };
}

// ── 2. Win/Loss Streak Analyzer ──
export interface StreakAnalysis {
  currentStreak: number;
  currentStreakType: "win" | "loss" | "none";
  longestWinStreak: number;
  longestLossStreak: number;
  avgWinStreak: number;
  avgLossStreak: number;
  tiltRisk: "low" | "medium" | "high";
  pattern: string;
}

export function analyzeStreaks(results: ("win" | "loss")[]): StreakAnalysis {
  if (results.length === 0) {
    return { currentStreak: 0, currentStreakType: "none", longestWinStreak: 0, longestLossStreak: 0, avgWinStreak: 0, avgLossStreak: 0, tiltRisk: "low", pattern: "Keine Daten" };
  }

  let maxWin = 0, maxLoss = 0, curStreak = 1;
  const winStreaks: number[] = [], lossStreaks: number[] = [];
  let curType = results[0];

  for (let i = 1; i < results.length; i++) {
    if (results[i] === results[i - 1]) {
      curStreak++;
    } else {
      (curType === "win" ? winStreaks : lossStreaks).push(curStreak);
      if (curType === "win") maxWin = Math.max(maxWin, curStreak);
      else maxLoss = Math.max(maxLoss, curStreak);
      curType = results[i];
      curStreak = 1;
    }
  }
  (curType === "win" ? winStreaks : lossStreaks).push(curStreak);
  if (curType === "win") maxWin = Math.max(maxWin, curStreak);
  else maxLoss = Math.max(maxLoss, curStreak);

  const avgWin = winStreaks.length > 0 ? Math.round(winStreaks.reduce((s, v) => s + v, 0) / winStreaks.length * 10) / 10 : 0;
  const avgLoss = lossStreaks.length > 0 ? Math.round(lossStreaks.reduce((s, v) => s + v, 0) / lossStreaks.length * 10) / 10 : 0;

  const lastType = results[results.length - 1];
  let lastStreak = 1;
  for (let i = results.length - 2; i >= 0; i--) {
    if (results[i] === lastType) lastStreak++;
    else break;
  }

  const tiltRisk: StreakAnalysis["tiltRisk"] =
    lastType === "loss" && lastStreak >= 5 ? "high" :
    lastType === "loss" && lastStreak >= 3 ? "medium" : "low";

  const pattern = maxLoss > 5
    ? "Häufige Verlustserien – Risikomanagement prüfen"
    : maxWin > maxLoss
    ? "Positive Streak-Tendenz – Edge vorhanden"
    : "Gemischtes Muster – Konsistenz verbessern";

  return {
    currentStreak: lastStreak,
    currentStreakType: lastType,
    longestWinStreak: maxWin,
    longestLossStreak: maxLoss,
    avgWinStreak: avgWin,
    avgLossStreak: avgLoss,
    tiltRisk,
    pattern,
  };
}

// ── 3. Time-of-Day Performance ──
export interface TimePerformance {
  hour: number;
  trades: number;
  winrate: number;
  avgPnl: number;
  color: string;
}

export function analyzeTimePerformance(
  trades: Array<{ hour: number; pnl: number; win: boolean }>
): TimePerformance[] {
  const buckets: Record<number, { trades: number; wins: number; totalPnl: number }> = {};
  for (let h = 0; h < 24; h++) buckets[h] = { trades: 0, wins: 0, totalPnl: 0 };

  for (const t of trades) {
    const b = buckets[t.hour];
    b.trades++;
    if (t.win) b.wins++;
    b.totalPnl += t.pnl;
  }

  return Object.entries(buckets).map(([h, b]) => ({
    hour: Number(h),
    trades: b.trades,
    winrate: b.trades > 0 ? Math.round(b.wins / b.trades * 100) : 0,
    avgPnl: b.trades > 0 ? Math.round(b.totalPnl / b.trades) : 0,
    color: b.trades === 0 ? "hsl(var(--muted))" :
      b.totalPnl > 0 ? `hsl(142 76% ${Math.min(60, 30 + b.totalPnl / 10)}%)` :
      `hsl(0 84% ${Math.min(60, 30 + Math.abs(b.totalPnl) / 10)}%)`,
  }));
}

// ── 4. Fee Impact Calculator ──
export interface FeeImpact {
  monthlyFees: number;
  yearlyFees: number;
  feeAsPercentOfProfit: number;
  feeAsPercentOfAccount: number;
  breakEvenTradesLost: number;
  recommendation: string;
}

export function calculateFeeImpact(
  tradesPerMonth: number,
  avgCommission: number,
  avgSlippage: number,
  accountSize: number,
  monthlyProfit: number
): FeeImpact {
  const monthlyFees = Math.round(tradesPerMonth * (avgCommission + avgSlippage));
  const yearlyFees = monthlyFees * 12;
  const feeAsPercentOfProfit = monthlyProfit > 0 ? Math.round(monthlyFees / monthlyProfit * 100) : 100;
  const feeAsPercentOfAccount = Math.round(monthlyFees / accountSize * 10000) / 100;
  const avgFeePerTrade = avgCommission + avgSlippage;
  const breakEvenTradesLost = avgFeePerTrade > 0 ? Math.round(monthlyProfit / avgFeePerTrade) : 0;

  let recommendation = "Gebühren im normalen Bereich";
  if (feeAsPercentOfProfit > 30) recommendation = "Gebühren fressen >30% des Profits – Broker/Exchange wechseln oder weniger traden";
  else if (feeAsPercentOfProfit > 15) recommendation = "Gebühren moderat – Maker-Orders bevorzugen";

  return { monthlyFees, yearlyFees, feeAsPercentOfProfit, feeAsPercentOfAccount, breakEvenTradesLost, recommendation };
}

// ── 5. Portfolio Stress Test ──
export interface StressTestResult {
  scenario: string;
  icon: string;
  portfolioImpact: number;
  newBalance: number;
  liquidationTriggered: boolean;
  marginCallTriggered: boolean;
}

export function runPortfolioStressTest(
  positions: Array<{ symbol: string; size: number; leverage: number; isLong: boolean }>,
  accountBalance: number
): StressTestResult[] {
  const scenarios = [
    { name: "BTC -30% Flash Crash", icon: "💥", btcMove: -30, ethMove: -35, altMove: -45 },
    { name: "ETH -40% Collapse", icon: "🔥", btcMove: -15, ethMove: -40, altMove: -50 },
    { name: "Market +50% Bull Run", icon: "🚀", btcMove: 50, ethMove: 60, altMove: 80 },
    { name: "Stablecoin Depeg", icon: "⚠️", btcMove: -20, ethMove: -25, altMove: -30 },
    { name: "Black Swan -50%", icon: "🦢", btcMove: -50, ethMove: -60, altMove: -70 },
    { name: "Seitwärtsbewegung ±5%", icon: "↔️", btcMove: -5, ethMove: 3, altMove: -8 },
  ];

  return scenarios.map(sc => {
    let totalImpact = 0;
    let liqTriggered = false;

    for (const pos of positions) {
      const isBtc = pos.symbol.includes("BTC");
      const isEth = pos.symbol.includes("ETH");
      const move = isBtc ? sc.btcMove : isEth ? sc.ethMove : sc.altMove;
      const effectiveMove = pos.isLong ? move : -move;
      const impact = pos.size * (effectiveMove / 100) * pos.leverage;
      totalImpact += impact;

      if (Math.abs(effectiveMove) * pos.leverage > 90) liqTriggered = true;
    }

    const newBalance = Math.max(0, accountBalance + totalImpact);
    const portfolioImpact = Math.round(totalImpact / accountBalance * 10000) / 100;

    return {
      scenario: sc.name,
      icon: sc.icon,
      portfolioImpact,
      newBalance: Math.round(newBalance),
      liquidationTriggered: liqTriggered,
      marginCallTriggered: newBalance < accountBalance * 0.3,
    };
  });
}

// ── 6. Drawdown Recovery Calculator ──
export interface DrawdownRecovery {
  currentDrawdown: number;
  requiredGain: number;
  tradesNeeded: number;
  estimatedDays: number;
  difficulty: "easy" | "moderate" | "hard" | "extreme";
}

export function calculateDrawdownRecovery(
  currentDrawdownPct: number,
  avgWinPct: number,
  winrate: number,
  tradesPerDay: number
): DrawdownRecovery {
  const requiredGain = Math.round((currentDrawdownPct / (100 - currentDrawdownPct)) * 10000) / 100;
  const expectedGainPerTrade = avgWinPct * (winrate / 100) - avgWinPct * 0.5 * (1 - winrate / 100);
  const tradesNeeded = expectedGainPerTrade > 0 ? Math.ceil(requiredGain / expectedGainPerTrade) : 999;
  const estimatedDays = tradesPerDay > 0 ? Math.ceil(tradesNeeded / tradesPerDay) : 999;

  const difficulty: DrawdownRecovery["difficulty"] =
    requiredGain < 15 ? "easy" : requiredGain < 35 ? "moderate" : requiredGain < 60 ? "hard" : "extreme";

  return { currentDrawdown: currentDrawdownPct, requiredGain, tradesNeeded, estimatedDays, difficulty };
}

// ── 7. Sentiment Engine ──
export interface SentimentData {
  fearGreedIndex: number;
  label: string;
  icon: string;
  color: string;
  suggestion: string;
}

export function calculateSentiment(
  volatility: number,     // 1-10
  trendDirection: number, // -10 to 10
  volume: number,         // 1-10
  fundingRate: number     // e.g. 0.01
): SentimentData {
  // Composite fear/greed
  const trendScore = (trendDirection + 10) / 20 * 40; // 0-40
  const volScore = (10 - volatility) / 10 * 25;       // 0-25 (low vol = greed)
  const volumeScore = volume / 10 * 20;                // 0-20
  const fundingScore = Math.min(15, Math.max(0, fundingRate * 100 + 7.5)); // 0-15

  const fearGreedIndex = Math.round(Math.min(100, Math.max(0, trendScore + volScore + volumeScore + fundingScore)));

  const label = fearGreedIndex >= 80 ? "Extreme Greed" : fearGreedIndex >= 60 ? "Greed" : fearGreedIndex >= 40 ? "Neutral" : fearGreedIndex >= 20 ? "Fear" : "Extreme Fear";
  const icon = fearGreedIndex >= 60 ? "🟢" : fearGreedIndex >= 40 ? "🟡" : "🔴";
  const color = fearGreedIndex >= 60 ? "text-green-500" : fearGreedIndex >= 40 ? "text-yellow-500" : "text-red-500";

  const suggestion = fearGreedIndex >= 80 ? "Markt überhitzt – Gewinne sichern, Positionen reduzieren"
    : fearGreedIndex >= 60 ? "Bullish Sentiment – Trailing Stops setzen"
    : fearGreedIndex >= 40 ? "Neutrale Phase – Auf klare Signale warten"
    : fearGreedIndex >= 20 ? "Angst im Markt – Contrarian Kaufgelegenheiten prüfen"
    : "Extreme Panik – Historisch gute Kaufzone, aber Vorsicht";

  return { fearGreedIndex, label, icon, color, suggestion };
}

// ── 8. Pattern Recognition (trade patterns) ──
export interface TradePattern {
  pattern: string;
  icon: string;
  severity: "info" | "warning" | "critical";
  description: string;
  frequency: number; // how often detected in %
}

export function detectTradePatterns(
  trades: Array<{ win: boolean; size: number; holdTime: number; dayOfWeek: number; hour: number }>
): TradePattern[] {
  const patterns: TradePattern[] = [];
  if (trades.length < 10) return [{ pattern: "Zu wenig Daten", icon: "📊", severity: "info", description: "Mindestens 10 Trades nötig", frequency: 0 }];

  const wins = trades.filter(t => t.win);
  const losses = trades.filter(t => !t.win);

  // 1. Revenge trading: bigger size after loss
  let revengeCount = 0;
  for (let i = 1; i < trades.length; i++) {
    if (!trades[i - 1].win && trades[i].size > trades[i - 1].size * 1.3) revengeCount++;
  }
  const revengePct = Math.round(revengeCount / trades.length * 100);
  if (revengePct > 15) {
    patterns.push({ pattern: "Revenge Trading", icon: "😤", severity: "critical", description: `${revengePct}% der Trades sind größer nach einem Verlust`, frequency: revengePct });
  }

  // 2. Overtrading on certain days
  const dayBuckets: Record<number, number> = {};
  for (const t of trades) { dayBuckets[t.dayOfWeek] = (dayBuckets[t.dayOfWeek] || 0) + 1; }
  const avgPerDay = trades.length / 7;
  for (const [day, count] of Object.entries(dayBuckets)) {
    if (count > avgPerDay * 2.5) {
      const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
      patterns.push({ pattern: `Overtrading ${dayNames[Number(day)]}`, icon: "📅", severity: "warning", description: `${count} Trades am ${dayNames[Number(day)]} vs. Ø ${Math.round(avgPerDay)}`, frequency: Math.round(count / trades.length * 100) });
    }
  }

  // 3. Early exits on winners
  const avgWinHold = wins.length > 0 ? wins.reduce((s, t) => s + t.holdTime, 0) / wins.length : 0;
  const avgLossHold = losses.length > 0 ? losses.reduce((s, t) => s + t.holdTime, 0) / losses.length : 0;
  if (avgWinHold > 0 && avgLossHold > 0 && avgWinHold < avgLossHold * 0.6) {
    patterns.push({ pattern: "Gewinner zu früh schließen", icon: "✂️", severity: "warning", description: `Avg Win Hold: ${Math.round(avgWinHold)}min vs Loss: ${Math.round(avgLossHold)}min`, frequency: Math.round(wins.length / trades.length * 100) });
  }

  // 4. Loss concentration in specific hours
  const lossHours: Record<number, number> = {};
  for (const t of losses) { lossHours[t.hour] = (lossHours[t.hour] || 0) + 1; }
  const maxLossHour = Object.entries(lossHours).sort(([, a], [, b]) => b - a)[0];
  if (maxLossHour && Number(maxLossHour[1]) > losses.length * 0.3) {
    patterns.push({ pattern: `Verluste um ${maxLossHour[0]}:00`, icon: "🕐", severity: "warning", description: `${maxLossHour[1]} von ${losses.length} Verlusten in dieser Stunde`, frequency: Math.round(Number(maxLossHour[1]) / losses.length * 100) });
  }

  // 5. Position size consistency
  const sizes = trades.map(t => t.size);
  const avgSize = sizes.reduce((s, v) => s + v, 0) / sizes.length;
  const sizeVariance = sizes.reduce((s, v) => s + Math.pow(v - avgSize, 2), 0) / sizes.length;
  const sizeCV = Math.sqrt(sizeVariance) / avgSize;
  if (sizeCV > 0.5) {
    patterns.push({ pattern: "Inkonsistente Positionsgrößen", icon: "📐", severity: "warning", description: `Hohe Varianz (CV: ${Math.round(sizeCV * 100)}%) – feste Sizing-Regeln verwenden`, frequency: 100 });
  }

  return patterns.length > 0 ? patterns : [{ pattern: "Keine kritischen Muster", icon: "✅", severity: "info", description: "Diszipliniertes Trading – weiter so!", frequency: 0 }];
}

// ── 9. Daily Loss Limit Guardian ──
export interface LossLimitStatus {
  currentDailyLoss: number;
  dailyLimit: number;
  percentUsed: number;
  status: "safe" | "approaching" | "reached" | "exceeded";
  icon: string;
  message: string;
  remainingBudget: number;
}

export function checkDailyLossLimit(
  currentDailyLoss: number,
  dailyLimitPct: number,
  accountBalance: number
): LossLimitStatus {
  const dailyLimit = accountBalance * dailyLimitPct / 100;
  const percentUsed = dailyLimit > 0 ? Math.round(Math.abs(currentDailyLoss) / dailyLimit * 100) : 0;
  const remainingBudget = Math.max(0, dailyLimit - Math.abs(currentDailyLoss));

  const status: LossLimitStatus["status"] =
    percentUsed >= 100 ? "exceeded" : percentUsed >= 80 ? "reached" : percentUsed >= 50 ? "approaching" : "safe";

  const icon = status === "safe" ? "🟢" : status === "approaching" ? "🟡" : status === "reached" ? "🟠" : "🔴";
  const message = status === "safe" ? "Trading erlaubt – Limit nicht erreicht"
    : status === "approaching" ? "Vorsicht – 50% des Tageslimits erreicht"
    : status === "reached" ? "⚠️ 80% erreicht – letzte Warnung!"
    : "🛑 STOP TRADING – Tageslimit überschritten!";

  return { currentDailyLoss: Math.abs(currentDailyLoss), dailyLimit: Math.round(dailyLimit), percentUsed, status, icon, message, remainingBudget: Math.round(remainingBudget) };
}

// ── 10. Margin Health Monitor ──
export interface MarginHealth {
  totalMarginUsed: number;
  availableMargin: number;
  marginLevel: number;
  status: "healthy" | "warning" | "critical";
  icon: string;
}

export function checkMarginHealth(
  positions: Array<{ size: number; leverage: number; entryPrice: number }>,
  accountBalance: number
): MarginHealth {
  const totalMarginUsed = positions.reduce((s, p) => s + (p.size * p.entryPrice) / p.leverage, 0);
  const availableMargin = Math.max(0, accountBalance - totalMarginUsed);
  const marginLevel = totalMarginUsed > 0 ? Math.round(accountBalance / totalMarginUsed * 100) : 999;

  const status: MarginHealth["status"] =
    marginLevel > 200 ? "healthy" : marginLevel > 120 ? "warning" : "critical";
  const icon = status === "healthy" ? "🟢" : status === "warning" ? "🟡" : "🔴";

  return { totalMarginUsed: Math.round(totalMarginUsed), availableMargin: Math.round(availableMargin), marginLevel, status, icon };
}

