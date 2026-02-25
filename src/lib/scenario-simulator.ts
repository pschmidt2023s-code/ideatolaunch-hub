// ─── Scenario Simulator ──────────────────────────────────────
// Deterministic projection engine for PRO users.
// Calculates profit, break-even, capital lock, and risk index.

export interface ScenarioInput {
  unitCost: number;
  price: number;
  budget: number;
  moq: number;
  marketingBudget: number;
  quantity: number;
}

export interface ScenarioOutput {
  projectedProfit: number;
  breakEvenQuantity: number;
  capitalLocked: number;
  riskIndex: number;
  roi: number;
}

export interface ScenarioPreset {
  key: "conservative" | "realistic" | "aggressive";
  label: { de: string; en: string };
  quantityMultiplier: number;
  marketingMultiplier: number;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    key: "conservative",
    label: { de: "Konservativ", en: "Conservative" },
    quantityMultiplier: 0.5,
    marketingMultiplier: 0.8,
  },
  {
    key: "realistic",
    label: { de: "Realistisch", en: "Realistic" },
    quantityMultiplier: 1.0,
    marketingMultiplier: 1.0,
  },
  {
    key: "aggressive",
    label: { de: "Aggressiv", en: "Aggressive" },
    quantityMultiplier: 1.8,
    marketingMultiplier: 1.5,
  },
];

export function simulateScenario(input: ScenarioInput): ScenarioOutput {
  const { unitCost, price, budget, moq, marketingBudget, quantity } = input;

  const profitPerUnit = price - unitCost;
  const totalRevenue = price * quantity;
  const totalCost = unitCost * quantity + marketingBudget;
  const projectedProfit = totalRevenue - totalCost;

  const breakEvenQuantity =
    profitPerUnit > 0 ? Math.ceil(marketingBudget / profitPerUnit) : 9999;

  const capitalLocked = unitCost * quantity + marketingBudget;

  // Risk index: 0 (safe) – 100 (very risky)
  let riskIndex = 0;

  // Capital vs budget ratio
  const capitalRatio = capitalLocked / (budget || 1);
  if (capitalRatio > 1.2) riskIndex += 35;
  else if (capitalRatio > 0.9) riskIndex += 20;
  else if (capitalRatio > 0.7) riskIndex += 10;

  // Margin risk
  const margin = price > 0 ? ((price - unitCost) / price) * 100 : 0;
  if (margin < 20) riskIndex += 30;
  else if (margin < 35) riskIndex += 15;

  // Overstock risk (quantity vs MOQ)
  if (quantity > moq * 3) riskIndex += 15;
  else if (quantity > moq * 2) riskIndex += 8;

  // Break-even distance
  if (breakEvenQuantity > quantity * 0.8) riskIndex += 20;
  else if (breakEvenQuantity > quantity * 0.5) riskIndex += 10;

  riskIndex = Math.max(0, Math.min(100, riskIndex));

  const roi = totalCost > 0 ? (projectedProfit / totalCost) * 100 : 0;

  return { projectedProfit, breakEvenQuantity, capitalLocked, riskIndex, roi };
}

export function applyPreset(
  base: Omit<ScenarioInput, "quantity" | "marketingBudget"> & { baseQuantity: number; baseMarketing: number },
  preset: ScenarioPreset
): ScenarioInput {
  return {
    unitCost: base.unitCost,
    price: base.price,
    budget: base.budget,
    moq: base.moq,
    quantity: Math.round(base.baseQuantity * preset.quantityMultiplier),
    marketingBudget: Math.round(base.baseMarketing * preset.marketingMultiplier),
  };
}
