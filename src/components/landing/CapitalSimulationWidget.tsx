import { useState } from "react";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { simulateDecision } from "@/lib/command-center-types";

const SCENARIOS = [
  { id: "price_plus_10", labelDE: "Preis +10 %", labelEN: "Price +10%" },
  { id: "ads_plus_20", labelDE: "Ads +20 %", labelEN: "Ads +20%" },
  { id: "delay_30_days", labelDE: "Lieferzeit +30 Tage", labelEN: "Delivery +30 days" },
  { id: "returns_8_pct", labelDE: "Retouren 8 %", labelEN: "Returns 8%" },
];

export function CapitalSimulationWidget() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const result = activeScenario ? simulateDecision(activeScenario) : null;

  const riskColorMap = {
    low: "text-success",
    medium: "text-warning",
    high: "text-destructive",
  };

  return (
    <section className="px-4 py-24 md:py-32" aria-label="Capital Simulation">
      <div className="mx-auto max-w-2xl text-center">
        {/* Section Header */}
        <span className="section-label mb-4 block">
          {isDE ? "Entscheidungs-Simulation" : "Decision Simulation"}
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
          {isDE
            ? "Was passiert, wenn…?"
            : "What happens if…?"}
        </h2>
        <p className="text-muted-foreground text-lg mb-12 max-w-lg mx-auto">
          {isDE
            ? "Teste Szenarien und sieh sofort die Auswirkung auf dein Kapital."
            : "Test scenarios and instantly see the impact on your capital."}
        </p>

        {/* Scenario Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(activeScenario === s.id ? null : s.id)}
              className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeScenario === s.id
                  ? "bg-accent text-accent-foreground border-accent shadow-md"
                  : "bg-card text-foreground border-border hover:border-accent/50 hover:shadow-sm"
              }`}
            >
              {isDE ? s.labelDE : s.labelEN}
            </button>
          ))}
        </div>

        {/* Results Card */}
        <div
          className={`mx-auto max-w-md rounded-2xl border bg-card/90 backdrop-blur-sm p-8 shadow-card transition-all duration-500 ${
            result ? "opacity-100 translate-y-0" : "opacity-40 translate-y-2"
          }`}
        >
          {result ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Runway Delta */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Runway
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  {result.runwayDelta > 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : result.runwayDelta < 0 ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-2xl font-bold tabular-nums">
                    {result.runwayDelta > 0 ? "+" : ""}
                    {result.runwayDelta} {isDE ? "Mo." : "mo."}
                  </span>
                </div>
              </div>

              {/* Break-even Shift */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Break-even
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  {result.breakEvenShift < 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : result.breakEvenShift > 0 ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-2xl font-bold tabular-nums">
                    {result.breakEvenShift > 0 ? "+" : ""}
                    {result.breakEvenShift} {isDE ? "Tage" : "days"}
                  </span>
                </div>
              </div>

              {/* Profit Delta */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  {isDE ? "Gewinn" : "Profit"}
                </p>
                <span className={`text-2xl font-bold tabular-nums ${
                  result.profitDelta >= 0 ? "text-success" : "text-destructive"
                }`}>
                  {result.profitDelta > 0 ? "+" : ""}
                  {result.profitDelta.toLocaleString("de-DE")} €
                </span>
              </div>

              {/* Risk Level */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  {isDE ? "Risiko" : "Risk"}
                </p>
                <span className={`text-2xl font-bold capitalize ${riskColorMap[result.riskLevelChange]}`}>
                  {result.riskLevelChange === "low"
                    ? isDE ? "Niedrig" : "Low"
                    : result.riskLevelChange === "medium"
                      ? isDE ? "Mittel" : "Medium"
                      : isDE ? "Hoch" : "High"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4">
              {isDE
                ? "Wähle ein Szenario, um die Simulation zu starten."
                : "Select a scenario to start the simulation."}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Button
            size="lg"
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md px-8"
            onClick={() => navigate("/auth?tab=signup")}
          >
            {isDE ? "Eigene Szenarien testen" : "Test your own scenarios"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
