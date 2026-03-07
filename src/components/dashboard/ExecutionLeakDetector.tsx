import { TrendingDown } from "lucide-react";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";

interface LeakItem {
  category: string;
  currentCost: number;
  benchmarkCost: number;
  savingPotential: number;
}

// Industry benchmarks per unit (€)
const BENCHMARKS: Record<string, number> = {
  "Packaging": 3.80,
  "Marketing / CPA": 8.20,
  "Versand": 3.50,
  "Produktion": 4.00,
};

export function ExecutionLeakDetector() {
  const ccData = useCommandCenterData("realistic");

  const leaks: LeakItem[] = [];

  if (ccData.ready && ccData.sufficient && ccData.input) {
    const { packagingCost, shippingCost, productionCost, marketingBudget, recommendedPrice } = ccData.input;

    if (packagingCost != null && packagingCost > BENCHMARKS["Packaging"]) {
      leaks.push({ category: "Packaging", currentCost: packagingCost, benchmarkCost: BENCHMARKS["Packaging"], savingPotential: +(packagingCost - BENCHMARKS["Packaging"]).toFixed(2) });
    }
    if (shippingCost != null && shippingCost > BENCHMARKS["Versand"]) {
      leaks.push({ category: "Versand", currentCost: shippingCost, benchmarkCost: BENCHMARKS["Versand"], savingPotential: +(shippingCost - BENCHMARKS["Versand"]).toFixed(2) });
    }
    if (productionCost != null && productionCost > BENCHMARKS["Produktion"]) {
      leaks.push({ category: "Produktion", currentCost: productionCost, benchmarkCost: BENCHMARKS["Produktion"], savingPotential: +(productionCost - BENCHMARKS["Produktion"]).toFixed(2) });
    }
    // Estimate CPA from marketing budget / break-even units
    if (marketingBudget != null && recommendedPrice != null && recommendedPrice > 0) {
      const estimatedCPA = marketingBudget / Math.max(ccData.money.breakEvenUnits || 50, 1);
      if (estimatedCPA > BENCHMARKS["Marketing / CPA"]) {
        leaks.push({ category: "Marketing / CPA", currentCost: +estimatedCPA.toFixed(2), benchmarkCost: BENCHMARKS["Marketing / CPA"], savingPotential: +(estimatedCPA - BENCHMARKS["Marketing / CPA"]).toFixed(2) });
      }
    }
  }

  if (leaks.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
          Execution Leak Detector
        </h3>
        <p className="text-xs text-muted-foreground">Keine Kostenlecks erkannt – deine Werte liegen im Branchendurchschnitt oder darunter. 🎯</p>
      </div>
    );
  }

  const totalSaving = leaks.reduce((s, l) => s + l.savingPotential, 0);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-destructive" />
          Execution Leak Detector
        </h3>
        <span className="text-xs font-medium text-success bg-success/10 rounded-full px-3 py-1">
          Saving: {totalSaving.toFixed(2)} € / Stück
        </span>
      </div>

      <div className="space-y-4">
        {leaks.map((leak) => (
          <div key={leak.category} className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">{leak.category}</p>
              <p className="text-xs text-muted-foreground">
                {leak.currentCost.toFixed(2)} € → {leak.benchmarkCost.toFixed(2)} €
              </p>
            </div>
            <span className="text-sm font-bold text-success tabular-nums">
              -{leak.savingPotential.toFixed(2)} €
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
