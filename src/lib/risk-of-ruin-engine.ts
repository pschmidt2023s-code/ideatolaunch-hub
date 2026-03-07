// ─── Risk of Ruin Engine ──────────────────────────────────
// Capital & Risk Intelligence for Crypto, Futures, and Quant Traders

export interface RoRInput {
  accountSize: number;
  riskPerTrade: number;   // percentage
  winrate: number;        // percentage
  rrr: number;            // risk-reward ratio
  tradingFees: number;    // per trade in currency
  slippage: number;       // per trade in currency
}

export interface RoRMetrics {
  riskOfRuin: number;           // 0-100%
  survivalProbability: number;  // 0-100%
  expectedDrawdown: number;     // percentage
  tradeExpectancy: number;      // currency per trade
  capitalGrowthPotential: number; // percentage over simulation
}

export interface MonteCarloScenario {
  trades: number;
  worstCaseDrawdown: number;
  medianProfit: number;
  accountSurvival: number; // percentage of sims that survived
  percentile5: number;
  percentile95: number;
}

export interface MonteCarloResult {
  scenarios: MonteCarloScenario[];
  equityCurves: {
    worst: number[];
    median: number[];
    best: number[];
  };
}

// ── Analytical Risk of Ruin (simplified Gambler's Ruin) ──
function analyticalRoR(winrate: number, rrr: number, riskPct: number): number {
  const wr = winrate / 100;
  const lr = 1 - wr;
  if (wr <= 0 || wr >= 1) return wr <= 0 ? 100 : 0;

  const avgWinUnit = rrr;
  const avgLossUnit = 1;
  const expectancy = wr * avgWinUnit - lr * avgLossUnit;

  if (expectancy <= 0) return 100; // negative edge = certain ruin

  // Approximate units until ruin based on risk fraction
  const unitsToRuin = Math.floor(100 / riskPct);
  if (unitsToRuin <= 0) return 100;

  // Probability of ruin via ratio method
  const q = lr / wr;
  if (Math.abs(q - 1) < 0.001) return Math.min(100, (1 / unitsToRuin) * 100);

  const ror = Math.pow(q, unitsToRuin);
  return Math.min(100, Math.max(0, ror * 100));
}

// ── Core Metrics Calculator ──
export function calculateRoRMetrics(input: RoRInput): RoRMetrics {
  const { accountSize, riskPerTrade, winrate, rrr, tradingFees, slippage } = input;
  const wr = winrate / 100;
  const riskAmt = accountSize * (riskPerTrade / 100);
  const rewardAmt = riskAmt * rrr;
  const netWin = rewardAmt - tradingFees - slippage;
  const netLoss = riskAmt + tradingFees + slippage;

  const tradeExpectancy = wr * netWin - (1 - wr) * netLoss;
  const riskOfRuin = analyticalRoR(winrate, rrr, riskPerTrade);
  const survivalProbability = 100 - riskOfRuin;

  // Expected max drawdown estimation (simplified)
  const maxConsLosses = Math.ceil(Math.log(0.01) / Math.log(1 - wr));
  const expectedDrawdown = Math.min(100, maxConsLosses * riskPerTrade);

  // Capital growth: project 100 trades with positive expectancy
  const growthPerTrade = tradeExpectancy / accountSize;
  const capitalGrowthPotential = Math.round(growthPerTrade * 100 * 10000) / 100;

  return {
    riskOfRuin: Math.round(riskOfRuin * 100) / 100,
    survivalProbability: Math.round(survivalProbability * 100) / 100,
    expectedDrawdown: Math.round(expectedDrawdown * 100) / 100,
    tradeExpectancy: Math.round(tradeExpectancy * 100) / 100,
    capitalGrowthPotential,
  };
}

// ── Monte Carlo Simulation ──
export function runMonteCarloSimulation(
  input: RoRInput,
  simulations: number = 500
): MonteCarloResult {
  const { accountSize, riskPerTrade, winrate, rrr, tradingFees, slippage } = input;
  const wr = winrate / 100;
  const tradeCounts = [100, 500, 1000];
  const scenarios: MonteCarloScenario[] = [];

  const longestRun = Math.max(...tradeCounts);
  const allCurves: number[][] = [];

  for (const tradeCount of tradeCounts) {
    let survived = 0;
    const finals: number[] = [];

    for (let s = 0; s < simulations; s++) {
      let bal = accountSize;
      let peak = bal;
      let maxDD = 0;
      const curve: number[] = [bal];

      for (let t = 0; t < tradeCount; t++) {
        const riskAmt = bal * (riskPerTrade / 100);
        const win = Math.random() < wr;
        if (win) {
          bal += riskAmt * rrr - tradingFees - slippage;
        } else {
          bal -= riskAmt + tradingFees + slippage;
        }
        bal = Math.max(0, bal);
        peak = Math.max(peak, bal);
        const dd = peak > 0 ? ((peak - bal) / peak) * 100 : 0;
        maxDD = Math.max(maxDD, dd);

        if (tradeCount === longestRun) {
          curve.push(bal);
        }
      }

      if (bal > 0) survived++;
      finals.push(bal);

      if (tradeCount === longestRun) {
        allCurves.push(curve);
      }
    }

    finals.sort((a, b) => a - b);
    const medianIdx = Math.floor(finals.length / 2);

    scenarios.push({
      trades: tradeCount,
      worstCaseDrawdown: Math.round(Math.max(...finals.map((_, i) => {
        // Recalc simplified: use final balance delta
        return ((accountSize - finals[i]) / accountSize) * 100;
      }).filter(d => d > 0)) * 10) / 10 || 0,
      medianProfit: Math.round((finals[medianIdx] - accountSize) * 100) / 100,
      accountSurvival: Math.round((survived / simulations) * 100),
      percentile5: Math.round(finals[Math.floor(simulations * 0.05)] * 100) / 100,
      percentile95: Math.round(finals[Math.floor(simulations * 0.95)] * 100) / 100,
    });
  }

  // Build equity curve bands from longest simulation
  const curveLen = longestRun + 1;
  const worst: number[] = [];
  const median: number[] = [];
  const best: number[] = [];

  for (let i = 0; i < curveLen; i += Math.max(1, Math.floor(curveLen / 50))) {
    const vals = allCurves.map(c => c[i] ?? 0).sort((a, b) => a - b);
    worst.push(Math.round(vals[Math.floor(vals.length * 0.05)] ?? 0));
    median.push(Math.round(vals[Math.floor(vals.length * 0.5)] ?? 0));
    best.push(Math.round(vals[Math.floor(vals.length * 0.95)] ?? 0));
  }

  return {
    scenarios,
    equityCurves: { worst, median, best },
  };
}

// ── Risk Level Helper ──
export function getRoRLevel(ror: number): "low" | "medium" | "high" {
  if (ror < 10) return "low";
  if (ror < 40) return "medium";
  return "high";
}

export function getRoRLabel(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "low": return "Healthy Strategy";
    case "medium": return "Risky Strategy";
    case "high": return "High Risk of Ruin";
  }
}
