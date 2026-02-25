// ─── Launch Budget Planner ───────────────────────────────────
// Deterministic budget allocation engine for Builder+ users.

export interface BudgetAllocation {
  production: number;
  marketing: number;
  logistics: number;
  reserve: number;
}

export interface BudgetPlanResult {
  allocation: BudgetAllocation;
  percentages: BudgetAllocation;
  reserveWarning: boolean;
  reservePercent: number;
  suggestions: string[];
}

export function planBudget(
  totalBudget: number,
  unitCost: number,
  quantity: number,
  marketingBudget: number
): BudgetPlanResult {
  const productionCost = unitCost * quantity;
  const logisticsCost = Math.round(quantity * 1.5 + 50); // rough estimate: €1.50/unit + base
  const usedBudget = productionCost + marketingBudget + logisticsCost;
  const reserve = Math.max(0, totalBudget - usedBudget);

  const allocation: BudgetAllocation = {
    production: productionCost,
    marketing: marketingBudget,
    logistics: logisticsCost,
    reserve,
  };

  const total = totalBudget || 1;
  const percentages: BudgetAllocation = {
    production: Math.round((productionCost / total) * 100),
    marketing: Math.round((marketingBudget / total) * 100),
    logistics: Math.round((logisticsCost / total) * 100),
    reserve: Math.round((reserve / total) * 100),
  };

  const reservePercent = percentages.reserve;
  const reserveWarning = reservePercent < 20;

  const suggestions: string[] = [];

  if (reservePercent < 10) {
    suggestions.push("Deine Reserve ist unter 10 % – ein einziger unerwarteter Kostenpunkt kann das Budget sprengen.");
  } else if (reservePercent < 20) {
    suggestions.push("Reserve unter 20 % – plane Puffer für Nachbestellungen, Retouren oder Verzögerungen ein.");
  }

  if (percentages.production > 60) {
    suggestions.push("Produktion nimmt über 60 % des Budgets ein – prüfe ob kleinere Stückzahlen sinnvoller wären.");
  }

  if (percentages.marketing < 10 && marketingBudget > 0) {
    suggestions.push("Unter 10 % für Marketing – ohne Sichtbarkeit wird es schwer, die Ware zu verkaufen.");
  }

  if (usedBudget > totalBudget) {
    suggestions.push("Deine geplanten Ausgaben übersteigen das Budget. Reduziere Menge oder Kosten.");
  }

  return { allocation, percentages, reserveWarning, reservePercent, suggestions };
}
