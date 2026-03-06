import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { useBrand } from "@/hooks/useBrand";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface BenchmarkItem {
  label: string;
  yours: number;
  market: number;
  unit: string;
  higherIsBetter: boolean;
}

// Market averages for German D2C / Private Label (sensible defaults)
const MARKET_DEFAULTS = {
  price: 34.50,
  margin: 42,
  returnRate: 5.2,
  conversionRate: 3.5,
  leadTimeDays: 14,
  moq: 300,
};

export default function MarketBenchmark() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;

  const { data: financial } = useQuery({
    queryKey: ["bench_financial", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("financial_models").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: production } = useQuery({
    queryKey: ["bench_production", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("production_plans").select("moq_expectation").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const benchmarks = useMemo<BenchmarkItem[]>(() => {
    const price = financial?.recommended_price ? Number(financial.recommended_price) : 29.90;
    const margin = financial?.margin ? Number(financial.margin) : 34;
    const moq = production?.moq_expectation ? parseInt(production.moq_expectation, 10) || 500 : 500;

    return [
      { label: "Verkaufspreis", yours: price, market: MARKET_DEFAULTS.price, unit: "€", higherIsBetter: true },
      { label: "Marge", yours: margin, market: MARKET_DEFAULTS.margin, unit: "%", higherIsBetter: true },
      { label: "Retourenquote", yours: 8, market: MARKET_DEFAULTS.returnRate, unit: "%", higherIsBetter: false },
      { label: "Conversion Rate", yours: 2.8, market: MARKET_DEFAULTS.conversionRate, unit: "%", higherIsBetter: true },
      { label: "Lieferzeit", yours: 21, market: MARKET_DEFAULTS.leadTimeDays, unit: "Tage", higherIsBetter: false },
      { label: "MOQ", yours: moq, market: MARKET_DEFAULTS.moq, unit: "Stk.", higherIsBetter: false },
    ];
  }, [financial, production]);

  // Generate dynamic insights
  const insights = useMemo(() => {
    const lines: string[] = [];
    const priceDiff = ((benchmarks[0].yours - benchmarks[0].market) / benchmarks[0].market * 100).toFixed(0);
    if (benchmarks[0].yours < benchmarks[0].market) {
      lines.push(`→ Dein Preis liegt <strong>${Math.abs(Number(priceDiff))}% unter dem Markt</strong> — Marge-Potenzial vorhanden.`);
    } else {
      lines.push(`→ Dein Preis liegt <strong>${priceDiff}% über dem Markt</strong> — Premium-Positionierung.`);
    }

    const marginDiff = benchmarks[1].yours - benchmarks[1].market;
    if (marginDiff < 0) {
      lines.push(`→ Marge <strong>${Math.abs(marginDiff).toFixed(0)} Punkte unter Durchschnitt</strong> — Kostenstruktur prüfen.`);
    } else {
      lines.push(`→ Marge <strong>${marginDiff.toFixed(0)} Punkte über Durchschnitt</strong> — gute Kosteneffizienz.`);
    }

    const moqRatio = benchmarks[5].yours / benchmarks[5].market;
    if (moqRatio > 1.3) {
      lines.push(`→ MOQ <strong>${Math.round((moqRatio - 1) * 100)}% über Benchmark</strong> — Verhandlung oder Alternativ-Lieferant prüfen.`);
    }

    return lines;
  }, [benchmarks]);

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

          {benchmarks.map((item) => {
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
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/20 transition-all duration-700"
                    style={{ width: `${marketPercent}%` }}
                  />
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
            {insights.map((line, i) => (
              <p key={i}>{line.replace(/<\/?strong>/g, "")}</p>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
