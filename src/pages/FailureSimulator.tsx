import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SEO } from "@/components/SEO";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Shield, TrendingDown, Lightbulb, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";

interface SimInputs {
  adsCost: number;
  returnRate: number;
  deliveryDelay: number;
  conversionRate: number;
}

function calcSurvival(inputs: SimInputs): {
  probability: number;
  risks: { text: string; impact: number }[];
  recommendations: { text: string; priority: "high" | "medium" }[];
} {
  let score = 100;
  const risks: { text: string; impact: number }[] = [];
  const recommendations: { text: string; priority: "high" | "medium" }[] = [];

  if (inputs.adsCost > 2000) {
    const impact = Math.min(25, (inputs.adsCost - 2000) / 100);
    score -= impact;
    risks.push({ text: `Hohe Werbekosten: ${inputs.adsCost.toLocaleString("de-DE")} €/Monat`, impact: Math.round(impact) });
    recommendations.push({ text: "Ads-Budget auf ROAS > 3 optimieren", priority: "high" });
  }
  if (inputs.returnRate > 5) {
    const impact = (inputs.returnRate - 5) * 4;
    score -= impact;
    risks.push({ text: `Retourenquote ${inputs.returnRate}% frisst Marge`, impact: Math.round(impact) });
    recommendations.push({ text: "Produktfotos und Beschreibungen verbessern", priority: inputs.returnRate > 12 ? "high" : "medium" });
  }
  if (inputs.deliveryDelay > 14) {
    const impact = Math.min(20, (inputs.deliveryDelay - 14) * 1.5);
    score -= impact;
    risks.push({ text: `${inputs.deliveryDelay} Tage Lieferzeit erhöht Stornos`, impact: Math.round(impact) });
    recommendations.push({ text: "Backup-Lieferant mit kürzerer Lieferzeit finden", priority: "medium" });
  }
  if (inputs.conversionRate < 3) {
    const impact = (3 - inputs.conversionRate) * 12;
    score -= impact;
    risks.push({ text: `Conversion ${inputs.conversionRate}% unter Branchenschnitt`, impact: Math.round(impact) });
    recommendations.push({ text: "Listing-Optimierung und A/B-Tests starten", priority: "high" });
  }
  if (recommendations.length === 0) {
    recommendations.push({ text: "Keine kritischen Handlungsfelder identifiziert", priority: "medium" });
  }

  return {
    probability: Math.max(0, Math.min(100, Math.round(score))),
    risks: risks.sort((a, b) => b.impact - a.impact),
    recommendations,
  };
}

export default function FailureSimulator() {
  const [inputs, setInputs] = useState<SimInputs>({
    adsCost: 1500,
    returnRate: 5,
    deliveryDelay: 14,
    conversionRate: 3,
  });

  const result = calcSurvival(inputs);

  const probColor = result.probability >= 70 ? "text-success" : result.probability >= 40 ? "text-warning" : "text-destructive";
  const probBg = result.probability >= 70 ? "bg-success" : result.probability >= 40 ? "bg-warning" : "bg-destructive";
  const probLabel = result.probability >= 70 ? "Stabil" : result.probability >= 40 ? "Gefährdet" : "Kritisch";

  return (
    <DashboardLayout>
      <SEO title="Failure Simulator – BrandOS" description="Simuliere Worst-Case-Szenarien und prüfe deine Überlebenswahrscheinlichkeit." path="/dashboard/failure-simulator" />
      <div className="animate-fade-in space-y-6">
        <PageHeader title="Failure Simulator" description="Simuliere Worst-Case-Szenarien und erkenne Risiken, bevor sie eintreten." badge="SIMULATOR" badgeVariant="destructive" />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <AnimatedCard index={0}>
            <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </div>
                <h3 className="text-sm font-semibold">Szenarien anpassen</h3>
              </div>

              <SliderInput label="Werbekosten / Monat" value={inputs.adsCost} min={0} max={8000} step={100}
                format={(v) => `${v.toLocaleString("de-DE")} €`}
                onChange={(v) => setInputs((p) => ({ ...p, adsCost: v }))}
                danger={inputs.adsCost > 3000}
              />
              <SliderInput label="Retourenquote" value={inputs.returnRate} min={0} max={25} step={0.5}
                format={(v) => `${v} %`}
                onChange={(v) => setInputs((p) => ({ ...p, returnRate: v }))}
                danger={inputs.returnRate > 12}
              />
              <SliderInput label="Lieferzeit" value={inputs.deliveryDelay} min={3} max={90} step={1}
                format={(v) => `${v} Tage`}
                onChange={(v) => setInputs((p) => ({ ...p, deliveryDelay: v }))}
                danger={inputs.deliveryDelay > 30}
              />
              <SliderInput label="Conversion Rate" value={inputs.conversionRate} min={0.5} max={10} step={0.1}
                format={(v) => `${v.toFixed(1)} %`}
                onChange={(v) => setInputs((p) => ({ ...p, conversionRate: v }))}
                danger={inputs.conversionRate < 2}
              />
            </div>
          </AnimatedCard>

          {/* Results */}
          <div className="space-y-4">
            {/* Survival Score */}
            <AnimatedCard index={1}>
              <div className="rounded-2xl border bg-card p-6 shadow-card text-center relative overflow-hidden">
                <div className={cn("absolute inset-0 opacity-[0.03] bg-gradient-to-br", result.probability >= 70 ? "from-success to-transparent" : result.probability >= 40 ? "from-warning to-transparent" : "from-destructive to-transparent")} />
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 relative">Überlebenswahrscheinlichkeit</p>
                <div className="relative">
                  <span className={cn("text-6xl font-bold tabular-nums tracking-tight", probColor)}>
                    {result.probability}%
                  </span>
                  <span className={cn("ml-2 text-xs font-semibold px-2.5 py-1 rounded-full inline-block",
                    result.probability >= 70 ? "bg-success/10 text-success" : result.probability >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                  )}>
                    {probLabel}
                  </span>
                </div>
                <div className="mt-5 h-3 w-full rounded-full bg-muted overflow-hidden relative">
                  <div className={cn("h-full rounded-full transition-all duration-700 ease-out", probBg)} style={{ width: `${result.probability}%` }} />
                </div>
              </div>
            </AnimatedCard>

            {/* Risk Impact */}
            {result.risks.length > 0 && (
              <AnimatedCard index={2}>
                <div className="rounded-2xl border bg-card p-5 shadow-card space-y-3">
                  <h4 className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    Risiko-Impact
                  </h4>
                  {result.risks.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                        <span className="text-xs font-bold text-destructive">-{r.impact}</span>
                      </div>
                      <span className="text-sm text-muted-foreground flex-1">{r.text}</span>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            )}

            {/* Recommendations */}
            <AnimatedCard index={3}>
              <div className="rounded-2xl border bg-card p-5 shadow-card space-y-3">
                <h4 className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5 text-accent" />
                  Empfehlungen
                </h4>
                {result.recommendations.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border p-3">
                    <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                      r.priority === "high" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    )}>
                      {r.priority === "high" ? <Zap className="h-3 w-3" /> : "→"}
                    </div>
                    <span className="text-sm">{r.text}</span>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SliderInput({ label, value, min, max, step, format, onChange, danger }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void; danger?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-bold tabular-nums", danger ? "text-destructive" : "")}>{format(value)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
