// Cashflow Survival Engine – monthly cashflow modeling with alerts

export interface CashflowInput {
  totalCapital: number;
  monthlyRevenue: number;
  productionCost: number;
  packagingCost: number;
  shippingCost: number;
  marketingBudget: number;
  fixedCosts: number; // rent, software, etc.
  inventoryCost: number;
  returnRate: number; // percentage
  paymentDelayDays: number; // days until customer payment arrives
  supplierPrepaymentPercent: number; // percentage prepayment required
}

export interface CashflowMonth {
  month: number;
  inflow: number;
  outflow: number;
  balance: number;
  cumulativeBalance: number;
}

export interface LiquidityAlert {
  type: "critical" | "warning" | "info";
  message: string;
}

export interface CashflowResult {
  timeline: CashflowMonth[];
  runwayMonths: number;
  workingCapitalGap: number;
  liquidityAlerts: LiquidityAlert[];
  monthlyBurnRate: number;
  breakEvenMonth: number | null; // month where cumulative turns positive
  healthScore: number; // 0–100
}

export function computeCashflow(input: CashflowInput): CashflowResult {
  const returnLoss = input.monthlyRevenue * (input.returnRate / 100);
  const effectiveRevenue = input.monthlyRevenue - returnLoss;

  // Payment delay reduces effective monthly inflow
  const paymentDelayFactor = Math.max(0, 1 - (input.paymentDelayDays / 90));
  const delayedRevenue = effectiveRevenue * paymentDelayFactor;

  const monthlyOutflow = input.productionCost + input.packagingCost +
    input.shippingCost + input.marketingBudget + input.fixedCosts;

  const monthlyBurnRate = monthlyOutflow - delayedRevenue;

  // Supplier prepayment impact on working capital
  const supplierPrepayment = (input.productionCost + input.packagingCost) * (input.supplierPrepaymentPercent / 100);
  const workingCapitalGap = supplierPrepayment + (input.paymentDelayDays / 30) * effectiveRevenue;

  // Build 12-month timeline
  const timeline: CashflowMonth[] = [];
  let cumulative = input.totalCapital - input.inventoryCost - supplierPrepayment;
  let breakEvenMonth: number | null = null;

  for (let m = 1; m <= 12; m++) {
    // Revenue ramps up in early months
    const rampFactor = Math.min(1, m / 3);
    const inflow = delayedRevenue * rampFactor;
    const outflow = monthlyOutflow;
    const balance = inflow - outflow;
    cumulative += balance;

    timeline.push({ month: m, inflow: Math.round(inflow), outflow: Math.round(outflow), balance: Math.round(balance), cumulativeBalance: Math.round(cumulative) });

    if (breakEvenMonth === null && balance >= 0 && m > 1) {
      breakEvenMonth = m;
    }
  }

  // Runway calculation
  const runwayMonths = monthlyBurnRate > 0
    ? Math.round((input.totalCapital / monthlyBurnRate) * 10) / 10
    : monthlyBurnRate <= 0 ? 99 : 0;

  // Liquidity alerts
  const alerts: LiquidityAlert[] = [];

  if (runwayMonths < 3) {
    alerts.push({ type: "critical", message: "Kapitalpuffer unter 3 Monaten – Liquiditätsrisiko!" });
  } else if (runwayMonths < 6) {
    alerts.push({ type: "warning", message: "Kapitalpuffer unter 6 Monaten – Vorsicht geboten" });
  }

  if (input.returnRate > 10) {
    alerts.push({ type: "warning", message: `Retourenquote ${input.returnRate}% – überdurchschnittlich hoch` });
  }

  if (input.paymentDelayDays > 30) {
    alerts.push({ type: "warning", message: `Zahlungsverzögerung ${input.paymentDelayDays} Tage – belastet Working Capital` });
  }

  if (workingCapitalGap > input.totalCapital * 0.5) {
    alerts.push({ type: "critical", message: "Working Capital Gap > 50% des Gesamtkapitals" });
  }

  if (input.supplierPrepaymentPercent > 50) {
    alerts.push({ type: "warning", message: "Hohe Lieferanten-Vorauszahlung bindet Kapital" });
  }

  if (input.marketingBudget > monthlyOutflow * 0.4) {
    alerts.push({ type: "info", message: "Marketing > 40% der Gesamtkosten – prüfe ROI" });
  }

  // Health score
  const runwayScore = Math.min(30, runwayMonths * 5);
  const returnScore = Math.max(0, 20 - input.returnRate * 2);
  const capitalScore = workingCapitalGap < input.totalCapital * 0.3 ? 25 : workingCapitalGap < input.totalCapital * 0.5 ? 15 : 5;
  const profitScore = monthlyBurnRate <= 0 ? 25 : Math.max(0, 25 - (monthlyBurnRate / input.totalCapital) * 100);
  const healthScore = Math.round(Math.min(100, runwayScore + returnScore + capitalScore + profitScore));

  return {
    timeline,
    runwayMonths: Math.min(runwayMonths, 99),
    workingCapitalGap: Math.round(workingCapitalGap),
    liquidityAlerts: alerts,
    monthlyBurnRate: Math.round(monthlyBurnRate),
    breakEvenMonth,
    healthScore,
  };
}

// Stress test: apply scenario modifications
export interface StressScenario {
  label: string;
  marketingChange: number; // percentage
  returnRateChange: number; // absolute addition
  deliveryDelayDays: number; // additional days
  priceChange: number; // percentage on revenue
  moqChange: number; // percentage on production cost
}

export const STRESS_PRESETS: StressScenario[] = [
  { label: "Moderate Belastung", marketingChange: 20, returnRateChange: 3, deliveryDelayDays: 15, priceChange: -5, moqChange: 10 },
  { label: "Starke Belastung", marketingChange: 40, returnRateChange: 8, deliveryDelayDays: 30, priceChange: -10, moqChange: 25 },
  { label: "Worst Case", marketingChange: 60, returnRateChange: 15, deliveryDelayDays: 45, priceChange: -15, moqChange: 50 },
];

export function applyStress(base: CashflowInput, scenario: StressScenario): CashflowInput {
  return {
    ...base,
    marketingBudget: Math.round(base.marketingBudget * (1 + scenario.marketingChange / 100)),
    returnRate: base.returnRate + scenario.returnRateChange,
    paymentDelayDays: base.paymentDelayDays + scenario.deliveryDelayDays,
    monthlyRevenue: Math.round(base.monthlyRevenue * (1 + scenario.priceChange / 100)),
    productionCost: Math.round(base.productionCost * (1 + scenario.moqChange / 100)),
  };
}
