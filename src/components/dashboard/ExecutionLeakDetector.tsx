import { DollarSign, TrendingDown, Zap } from "lucide-react";

interface LeakItem {
  category: string;
  currentCost: number;
  benchmarkCost: number;
  savingPotential: number;
}

const MOCK_LEAKS: LeakItem[] = [
  { category: "Packaging", currentCost: 6.40, benchmarkCost: 3.80, savingPotential: 2.60 },
  { category: "Marketing / CPA", currentCost: 12.50, benchmarkCost: 8.20, savingPotential: 4.30 },
  { category: "Versand", currentCost: 4.90, benchmarkCost: 3.50, savingPotential: 1.40 },
  { category: "Retouren-Handling", currentCost: 3.10, benchmarkCost: 1.80, savingPotential: 1.30 },
];

export function ExecutionLeakDetector() {
  const totalSaving = MOCK_LEAKS.reduce((s, l) => s + l.savingPotential, 0);

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
        {MOCK_LEAKS.map((leak) => (
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
