import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

interface BenchmarkItem {
  label: string;
  yours: number;
  market: number;
  unit: string;
  higherIsBetter: boolean;
}

const MOCK_BENCHMARKS: BenchmarkItem[] = [
  { label: "Verkaufspreis", yours: 29.90, market: 34.50, unit: "€", higherIsBetter: true },
  { label: "Marge", yours: 34, market: 42, unit: "%", higherIsBetter: true },
  { label: "Retourenquote", yours: 8, market: 5.2, unit: "%", higherIsBetter: false },
  { label: "Conversion Rate", yours: 2.8, market: 3.5, unit: "%", higherIsBetter: true },
  { label: "Lieferzeit", yours: 21, market: 14, unit: "Tage", higherIsBetter: false },
  { label: "MOQ", yours: 500, market: 300, unit: "Stk.", higherIsBetter: false },
];

export default function MarketBenchmark() {
  return (
    <DashboardLayout>
      <SEO title="Market Benchmark – BrandOS" description="Vergleiche dein Produkt mit dem Markt." path="/dashboard/benchmark" />
      <div className="animate-fade-in space-y-10">
        <PageHeader title="Market Benchmark" description="Dein Produkt vs. Marktdurchschnitt — erkenne Stärken und Schwächen." />

        <div className="rounded-2xl border bg-card p-8 shadow-card space-y-8">
          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-accent" /> Dein Wert
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-muted-foreground/30" /> Marktdurchschnitt
            </span>
          </div>

          {MOCK_BENCHMARKS.map((item) => {
            const maxVal = Math.max(item.yours, item.market) * 1.3;
            const yoursPercent = (item.yours / maxVal) * 100;
            const marketPercent = (item.market / maxVal) * 100;

            const isBetter = item.higherIsBetter
              ? item.yours >= item.market
              : item.yours <= item.market;

            return (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="flex items-center gap-3 text-sm tabular-nums">
                    <span className={cn("font-bold", isBetter ? "text-success" : "text-destructive")}>
                      {item.yours} {item.unit}
                    </span>
                    <span className="text-muted-foreground">
                      vs. {item.market} {item.unit}
                    </span>
                  </div>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  {/* Market bar (background) */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/20 transition-all duration-700"
                    style={{ width: `${marketPercent}%` }}
                  />
                  {/* Your bar (foreground) */}
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                      isBetter ? "bg-success" : "bg-warning"
                    )}
                    style={{ width: `${yoursPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold mb-4">Strategische Einschätzung</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>→ Dein Preis liegt <strong>13% unter dem Markt</strong> — Marge-Potenzial vorhanden.</p>
            <p>→ Retourenquote <strong>54% über Durchschnitt</strong> — Produktbeschreibung optimieren.</p>
            <p>→ Lieferzeit <strong>50% über Benchmark</strong> — Backup-Lieferant evaluieren.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
