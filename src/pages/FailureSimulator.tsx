import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Shield, TrendingDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimInputs {
  adsCost: number;
  returnRate: number;
  deliveryDelay: number;
  conversionRate: number;
}

function calcSurvival(inputs: SimInputs): {
  probability: number;
  risks: string[];
  recommendations: string[];
} {
  let score = 100;
  const risks: string[] = [];
  const recommendations: string[] = [];

  // Ads impact
  if (inputs.adsCost > 2000) {
    score -= Math.min(25, (inputs.adsCost - 2000) / 100);
    risks.push(`Hohe Werbekosten: ${inputs.adsCost.toLocaleString("de-DE")} €/Monat`);
    recommendations.push("Ads-Budget auf ROAS > 3 optimieren");
  }

  // Return rate
  if (inputs.returnRate > 5) {
    score -= (inputs.returnRate - 5) * 4;
    risks.push(`Retourenquote ${inputs.returnRate}% frisst Marge`);
    recommendations.push("Produktfotos und Beschreibungen verbessern");
  }

  // Delivery delay
  if (inputs.deliveryDelay > 14) {
    score -= Math.min(20, (inputs.deliveryDelay - 14) * 1.5);
    risks.push(`${inputs.deliveryDelay} Tage Lieferzeit erhöht Stornos`);
    recommendations.push("Backup-Lieferant mit kürzerer Lieferzeit finden");
  }

  // Conversion rate
  if (inputs.conversionRate < 3) {
    score -= (3 - inputs.conversionRate) * 12;
    risks.push(`Conversion ${inputs.conversionRate}% ist unter Branchenschnitt`);
    recommendations.push("Listing-Optimierung und A/B-Tests starten");
  }

  if (recommendations.length === 0) {
    recommendations.push("Aktuell keine kritischen Handlungsfelder identifiziert");
  }

  return {
    probability: Math.max(0, Math.min(100, Math.round(score))),
    risks,
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

  const probColor =
    result.probability >= 70
      ? "text-success"
      : result.probability >= 40
        ? "text-warning"
        : "text-destructive";

  const probBg =
    result.probability >= 70
      ? "bg-success"
      : result.probability >= 40
        ? "bg-warning"
        : "bg-destructive";

  return (
    <DashboardLayout>
      <SEO title="Failure Simulator – BrandOS" description="Simuliere Worst-Case-Szenarien und prüfe deine Überlebenswahrscheinlichkeit." path="/dashboard/failure-simulator" />
      <div className="animate-fade-in space-y-10">
        <PageHeader title="Failure Simulator" description="Simuliere Worst-Case-Szenarien und erkenne Risiken, bevor sie eintreten." />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-8 rounded-2xl border bg-card p-8 shadow-card">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
              Szenarien anpassen
            </h3>

            <SliderInput
              label="Werbekosten / Monat"
              value={inputs.adsCost}
              min={0} max={8000} step={100}
              format={(v) => `${v.toLocaleString("de-DE")} €`}
              onChange={(v) => setInputs((p) => ({ ...p, adsCost: v }))}
            />
            <SliderInput
              label="Retourenquote"
              value={inputs.returnRate}
              min={0} max={25} step={0.5}
              format={(v) => `${v} %`}
              onChange={(v) => setInputs((p) => ({ ...p, returnRate: v }))}
            />
            <SliderInput
              label="Lieferzeit"
              value={inputs.deliveryDelay}
              min={3} max={90} step={1}
              format={(v) => `${v} Tage`}
              onChange={(v) => setInputs((p) => ({ ...p, deliveryDelay: v }))}
            />
            <SliderInput
              label="Conversion Rate"
              value={inputs.conversionRate}
              min={0.5} max={10} step={0.1}
              format={(v) => `${v.toFixed(1)} %`}
              onChange={(v) => setInputs((p) => ({ ...p, conversionRate: v }))}
            />
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Survival Score */}
            <div className="rounded-2xl border bg-card p-8 shadow-card text-center">
              <p className="section-label mb-4">Überlebenswahrscheinlichkeit</p>
              <span className={cn("text-7xl font-bold tabular-nums", probColor)}>
                {result.probability}%
              </span>
              <div className="mt-6 h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", probBg)}
                  style={{ width: `${result.probability}%` }}
                />
              </div>
            </div>

            {/* Risks */}
            {result.risks.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-card space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Identifizierte Risiken
                </h4>
                {result.risks.map((r, i) => (
                  <p key={i} className="text-sm text-muted-foreground pl-6">• {r}</p>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="rounded-2xl border bg-card p-6 shadow-card space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                Empfehlungen
              </h4>
              {result.recommendations.map((r, i) => (
                <p key={i} className="text-sm text-muted-foreground pl-6">→ {r}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SliderInput({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold tabular-nums">{format(value)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
