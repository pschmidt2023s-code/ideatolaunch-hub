// ─── Real Stress Test Engine ─────────────────────────────────────
// Multi-variable stress simulation with cashflow projection.

export interface StressInputs {
  unitCost: number;
  price: number;
  quantity: number;
  marketingBudget: number;
  fixedCosts: number;
  totalCapital: number;
  returnRate: number; // base %
  // Stress adjustments
  priceChange: number;   // e.g. -10
  returnChange: number;  // e.g. +8
  adsChange: number;     // e.g. +20
  delayDays: number;     // e.g. 30
}

export interface StressResult {
  baseProfit: number;
  stressedProfit: number;
  profitDelta: number;
  baseRunwayMonths: number;
  stressedRunwayMonths: number;
  collapseMonth: number | null; // month where cash hits 0
  burnAcceleration: number; // % increase in burn
  cashflow: { month: number; base: number; stressed: number }[];
  survivalRecommendations: { de: string; en: string }[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

export function runStressTest(input: StressInputs): StressResult {
  const {
    unitCost, price, quantity, marketingBudget, fixedCosts,
    totalCapital, returnRate, priceChange, returnChange, adsChange, delayDays,
  } = input;

  // Base scenario (monthly)
  const monthlyUnits = Math.round(quantity / 12);
  const baseRevenue = price * monthlyUnits;
  const baseCOGS = unitCost * monthlyUnits;
  const baseReturns = baseRevenue * (returnRate / 100);
  const baseMonthlyCost = baseCOGS + marketingBudget + fixedCosts + baseReturns;
  const baseNetMonthly = baseRevenue - baseMonthlyCost;
  const baseProfit = baseNetMonthly * 12;

  // Stressed scenario
  const stressedPrice = price * (1 + priceChange / 100);
  const stressedReturnRate = returnRate + returnChange;
  const stressedMarketing = marketingBudget * (1 + adsChange / 100);
  const delayMonths = delayDays / 30;

  const stressedRevenue = stressedPrice * monthlyUnits;
  const stressedReturns = stressedRevenue * (stressedReturnRate / 100);
  const stressedMonthlyCost = baseCOGS + stressedMarketing + fixedCosts + stressedReturns;
  const stressedNetMonthly = stressedRevenue - stressedMonthlyCost;
  const stressedProfit = stressedNetMonthly * (12 - delayMonths);

  // Runway
  const baseRunway = baseNetMonthly >= 0 ? 99 : Math.max(0, Math.round(totalCapital / Math.abs(baseNetMonthly)));
  const stressedRunway = stressedNetMonthly >= 0 ? 99 : Math.max(0, Math.round(totalCapital / Math.abs(stressedNetMonthly)));

  // Burn acceleration
  const baseBurn = Math.max(0, -baseNetMonthly);
  const stressedBurn = Math.max(0, -stressedNetMonthly);
  const burnAcceleration = baseBurn > 0 ? Math.round(((stressedBurn - baseBurn) / baseBurn) * 100) : (stressedBurn > 0 ? 100 : 0);

  // 12-month cashflow
  const cashflow: StressResult["cashflow"] = [];
  let baseBalance = totalCapital;
  let stressedBalance = totalCapital;
  let collapseMonth: number | null = null;

  for (let m = 1; m <= 12; m++) {
    if (m <= delayMonths) {
      // During delay: no revenue, still burning costs
      stressedBalance -= (baseCOGS + stressedMarketing + fixedCosts);
    } else {
      stressedBalance += stressedNetMonthly;
    }
    baseBalance += baseNetMonthly;

    cashflow.push({
      month: m,
      base: Math.round(baseBalance),
      stressed: Math.round(stressedBalance),
    });

    if (stressedBalance <= 0 && collapseMonth === null) {
      collapseMonth = m;
    }
  }

  // Risk level
  const riskLevel: StressResult["riskLevel"] =
    collapseMonth !== null && collapseMonth <= 3 ? "critical"
    : collapseMonth !== null && collapseMonth <= 6 ? "high"
    : stressedRunway < 6 ? "medium"
    : "low";

  // Survival recommendations (Execution tier)
  const survivalRecommendations: StressResult["survivalRecommendations"] = [];
  if (stressedProfit < 0) {
    const inventoryReduction = Math.min(30, Math.round(Math.abs(stressedProfit) / (unitCost * monthlyUnits) * 100));
    const priceIncrease = Math.min(20, Math.round(Math.abs(stressedProfit) / (stressedRevenue || 1) * 100));
    survivalRecommendations.push({
      de: `Um dieses Szenario zu überleben, reduziere Lagerbestand um ${inventoryReduction}% oder erhöhe den Preis um ${priceIncrease}%.`,
      en: `To survive this scenario, reduce inventory by ${inventoryReduction}% or increase price by ${priceIncrease}%.`,
    });
  }
  if (burnAcceleration > 30) {
    survivalRecommendations.push({
      de: `Dein Burn steigt um ${burnAcceleration}%. Reduziere Marketingausgaben als erste Maßnahme.`,
      en: `Your burn increases by ${burnAcceleration}%. Reduce marketing spend as first measure.`,
    });
  }
  if (collapseMonth !== null) {
    survivalRecommendations.push({
      de: `Kapital-Kollaps in Monat ${collapseMonth}. Sofortige Maßnahmen erforderlich.`,
      en: `Capital collapse in month ${collapseMonth}. Immediate action required.`,
    });
  }

  return {
    baseProfit: Math.round(baseProfit),
    stressedProfit: Math.round(stressedProfit),
    profitDelta: Math.round(stressedProfit - baseProfit),
    baseRunwayMonths: baseRunway,
    stressedRunwayMonths: stressedRunway,
    collapseMonth,
    burnAcceleration,
    cashflow,
    survivalRecommendations,
    riskLevel,
  };
}
