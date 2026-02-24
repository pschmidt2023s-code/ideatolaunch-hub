import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "0 €",
    period: "für immer",
    features: [
      "1 Marke erstellen",
      "Basis-Kalkulator",
      "Grundlegende Checklisten",
      "Community-Zugang",
    ],
    cta: "Kostenlos starten",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29 €",
    period: "/ Monat",
    features: [
      "Unbegrenzte Marken",
      "Volle KI-Unterstützung",
      "Erweiterte Kalkulation",
      "PDF-Exporte",
      "30-Tage Launch-Roadmap",
      "Compliance-Vorlagen",
    ],
    cta: "Pro starten",
    highlighted: true,
  },
];

export function PricingSection() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="border-t px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Einfache Preise</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Starte kostenlos. Upgrade wenn du bereit bist.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 ${
                plan.highlighted
                  ? "border-accent bg-card shadow-lg ring-1 ring-accent/20"
                  : "bg-card shadow-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                  Beliebt
                </div>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full ${
                  plan.highlighted
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : ""
                }`}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => navigate("/auth")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
