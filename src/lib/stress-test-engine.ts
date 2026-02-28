// ─── Real Stress Test Engine ────────────────────────────────────
// Multi-dimensional stress simulation with cashflow projection.

export interface StressInputs {
  priceDropPct: number;       // e.g. 10 = -10%
  returnIncreasePct: number;  // e.g. 8 = +8% return rate
  adsIncreasePct: number;     // e.g. 20 = +20% ad spend
  delayDays: number;          // e.g. 30
}

export interface BaseFinancials {
  unitCost: number;
  price: number;
  quantity: number;
  marketingBudget: number;
  fixedCosts: number;
  totalCapital: number;
  returnRate: number;
  monthlyRevenue: number;
}

export interface StressMonth {
  month: number;
  revenue: number;
  costs: number;
  balance: number;
  cumulative: number;
}

export interface StressTestResult {
  timeline: StressMonth[];
  runwayMonths: number;
  collapseMonth: number | null;  // month where cumulative goes negative
  burnAcceleration: number;      // % increase in burn rate
  originalProfit: number;
  stressedProfit: number;
  profitDelta: number;
  survivalRecommendations: { de: string; en: string }[];
}

export const STRESS_DEFAULTS: StressInputs = {
  priceDropPct: 0,
  returnIncreasePct: 0,
  adsIncreasePct: 0,
  delayDays: 0,
};

export const WORST_CASE: StressInputs = {
  priceDropPct: 10,
  returnIncreasePct: 8,
  adsIncreasePct: 20,
  delayDays: 30,
};

export function runStressTest(base: BaseFinancials, stress: StressInputs): StressTestResult {
  const stressedPrice = base.price * (1 - stress.priceDropPct / 100);
  const stressedReturnRate = Math.min(50, base.returnRate + stress.returnIncreasePct);
  const stressedMarketing = base.marketingBudget * (1 + stress.adsIncreasePct / 100);
  const delayMonths = stress.delayDays / 30;

  // Original monthly P&L
  const origMonthlyRevenue = base.monthlyRevenue;
  const origMonthlyCosts = base.unitCost * base.quantity / 12 + base.marketingBudget + base.fixedCosts;
  const origMonthlyProfit = origMonthlyRevenue * (1 - base.returnRate / 100) - origMonthlyCosts;

  // Stressed monthly P&L
  const stressedRevenue = origMonthlyRevenue * (stressedPrice / base.price);
  const effectiveRevenue = stressedRevenue * (1 - stressedReturnRate / 100);
  const stressedCosts = base.unitCost * base.quantity / 12 + stressedMarketing + base.fixedCosts;

  const timeline: StressMonth[] = [];
  let cumulative = base.totalCapital;
  let collapseMonth: number | null = null;

  for (let m = 1; m <= 12; m++) {
    const rampFactor = m <= delayMonths ? 0.3 : Math.min(1, 0.3 + (m - delayMonths) * 0.15);
    const revenue = effectiveRevenue * rampFactor;
    const costs = stressedCosts;
    const balance = revenue - costs;
    cumulative += balance;

    timeline.push({ month: m, revenue, costs, balance, cumulative });

    if (cumulative < 0 && collapseMonth === null) {
      collapseMonth = m;
    }
  }

  const originalProfit = origMonthlyProfit * 12;
  const stressedProfit = timeline.reduce((s, m) => s + m.balance, 0);
  const origBurn = origMonthlyCosts;
  const stressBurn = stressedCosts;
  const burnAcceleration = origBurn > 0 ? ((stressBurn - origBurn) / origBurn) * 100 : 0;
  const runwayMonths = stressBurn > 0 ? Math.max(0, base.totalCapital / stressBurn) : 12;

  // Survival recommendations
  const recs: { de: string; en: string }[] = [];

  if (stress.priceDropPct > 0) {
    const needed = Math.ceil(stress.priceDropPct * 0.6);
    recs.push({
      de: `Preisreduktion ausgleichen: Lagerbestand um ${needed}% reduzieren oder Preis um ${needed}% erhöhen.`,
      en: `Offset price drop: reduce inventory by ${needed}% or increase price by ${needed}%.`,
    });
  }
  if (stress.returnIncreasePct > 5) {
    recs.push({
      de: "Retourenquote senken: Produktbeschreibungen präzisieren und QC verschärfen.",
      en: "Reduce return rate: improve product descriptions and tighten QC.",
    });
  }
  if (stress.adsIncreasePct > 15) {
    recs.push({
      de: "Ad-Budget-Anstieg absichern: ROAS-Ziel definieren und Stop-Loss setzen.",
      en: "Secure ad budget increase: define ROAS target and set stop-loss.",
    });
  }
  if (stress.delayDays > 14) {
    recs.push({
      de: `Bei ${stress.delayDays} Tagen Verzögerung: Notfall-Lieferant identifizieren oder Vorproduktion starten.`,
      en: `With ${stress.delayDays}-day delay: identify backup supplier or start pre-production.`,
    });
  }
  if (collapseMonth !== null) {
    recs.push({
      de: `Überlebensszenario: Kapital reicht nur bis Monat ${collapseMonth}. Sofortige Kostenreduktion nötig.`,
      en: `Survival scenario: capital lasts only until month ${collapseMonth}. Immediate cost reduction required.`,
    });
  }

  return {
    timeline,
    runwayMonths: parseFloat(runwayMonths.toFixed(1)),
    collapseMonth,
    burnAcceleration: parseFloat(burnAcceleration.toFixed(1)),
    originalProfit: Math.round(originalProfit),
    stressedProfit: Math.round(stressedProfit),
    profitDelta: Math.round(stressedProfit - originalProfit),
    survivalRecommendations: recs,
  };
}
