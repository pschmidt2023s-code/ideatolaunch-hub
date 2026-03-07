import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/hooks/useBrand";
import { generateBenchmarkAnalysis, type BenchmarkKPIs } from "@/lib/benchmark-story-engine";
import { useCommandCenterData } from "@/hooks/useCommandCenterData";
import { cn } from "@/lib/utils";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, Lightbulb, Target,
  BarChart3, AlertTriangle, ArrowUpRight,
} from "lucide-react";

const HEATMAP_COLORS: Record<string, { bg: string; text: string }> = {
  top: { bg: "bg-success/10", text: "text-success" },
  mid: { bg: "bg-warning/10", text: "text-warning" },
  bottom: { bg: "bg-destructive/10", text: "text-destructive" },
};

const STORY_ICONS: Record<string, React.ElementType> = {
  strength: TrendingUp,
  weakness: TrendingDown,
  opportunity: Lightbulb,
};

const STORY_COLORS: Record<string, string> = {
  strength: "border-success/20 bg-success/5",
  weakness: "border-destructive/20 bg-destructive/5",
  opportunity: "border-accent/20 bg-accent/5",
};

export function MarketBenchmarkPanel() {
  const ccData = useCommandCenterData("realistic");
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;

  const { data: production } = useQuery({
    queryKey: ["bench_prod", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("production_plans").select("moq_expectation").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const analysis = useMemo(() => {
    if (!ccData.ready || !ccData.sufficient) return null;
    const { status, money } = ccData;

    const kpis: BenchmarkKPIs = {
      margin: money.margin,
      cashRunwayMonths: status.runwayMonths,
      conversionRate: 2.8, // placeholder until tracked
      returnRate: 5, // placeholder
      healthScore: status.founderRiskIndex,
    };

    return generateBenchmarkAnalysis(kpis);
  }, [ccData]);

  const radarData = useMemo(() => {
    if (!analysis) return [];
    return analysis.heatmap.map((h) => ({
      kpi: h.kpi,
      percentile: h.percentile,
      fullMark: 100,
    }));
  }, [analysis]);

  if (!ccData.ready || !ccData.sufficient) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Benchmark nicht verfügbar</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mb-4">
          Fülle dein Finanzmodell aus, um dich mit dem Markt zu vergleichen.
        </p>
        <a
          href="/dashboard/step/2"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
        >
          Finanzmodell starten <BarChart3 className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Peer Radar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Target className="h-4 w-4" /> Peer-Vergleich Radar
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="kpi" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Radar
                dataKey="percentile" stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))" fillOpacity={0.2} strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Percentile-Heatmap
          </h3>
          <div className="space-y-3">
            {analysis.heatmap.map((h) => {
              const colors = HEATMAP_COLORS[h.level];
              return (
                <div key={h.kpi} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-medium text-muted-foreground">{h.kpi}</span>
                  <div className="flex-1 h-6 rounded-lg bg-muted overflow-hidden relative">
                    <div
                      className={cn("h-full rounded-lg transition-all duration-700", colors.bg)}
                      style={{ width: `${h.percentile}%`, background: h.level === "top" ? "hsl(var(--success) / 0.3)" : h.level === "mid" ? "hsl(var(--warning) / 0.3)" : "hsl(var(--destructive) / 0.3)" }}
                    />
                    <span className={cn("absolute right-2 top-0.5 text-[10px] font-bold", colors.text)}>
                      P{h.percentile}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Benchmarks basieren auf deutschen D2C / Private-Label Durchschnittswerten.
          </p>
        </div>
      </div>

      {/* Strategic Insight */}
      <div className="rounded-2xl border-2 border-accent/20 bg-accent/5 p-6">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-accent mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold mb-1">Strategische Einschätzung</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.strategicInsight}</p>
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {analysis.stories.map((story, i) => {
          const Icon = STORY_ICONS[story.type] || Minus;
          return (
            <div key={i} className={cn("rounded-xl border p-4 space-y-2", STORY_COLORS[story.type])}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {story.type === "strength" ? "Stärke" : story.type === "weakness" ? "Schwäche" : "Chance"}
                </span>
              </div>
              <p className="text-xs leading-relaxed">{story.narrative}</p>
            </div>
          );
        })}
      </div>

      {/* Improvement projections */}
      {analysis.projections.length > 0 && (
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" /> Verbesserungspotenzial
          </h3>
          <div className="space-y-4">
            {analysis.projections.map((p, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border p-4">
                <div className="shrink-0">
                  <div className="text-xs text-muted-foreground mb-0.5">{p.kpi}</div>
                  <div className="flex items-center gap-2 text-sm font-bold tabular-nums">
                    <span className="text-destructive">{p.currentValue}</span>
                    <ArrowUpRight className="h-3 w-3 text-success" />
                    <span className="text-success">{p.targetValue}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.action}</p>
                  <p className="text-[10px] text-success font-bold mt-1">
                    Health Score Impact: +{p.healthScoreImpact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
