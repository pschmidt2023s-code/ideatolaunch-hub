import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { trackEvent, withPerfTracking, logError } from "@/lib/analytics";

interface PlanFeature {
  label: string;
  desc: string;
}

export function PricingSection() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [loadingBuilder, setLoadingBuilder] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);
  const isDE = i18n.language === "de";

  const handleCheckout = async (tier: "builder" | "pro", setLoading: (v: boolean) => void) => {
    if (!user) {
      navigate("/auth?tab=signup");
      return;
    }

    setLoading(true);
    trackEvent("clicked_upgrade", { source: "pricing_section", tier });
    try {
      const data = await withPerfTracking("stripe_checkout", async () => {
        const { data, error } = await supabase.functions.invoke("stripe-checkout", {
          body: { return_url: window.location.origin, tier },
        });
        if (error) throw error;
        return data;
      }, 1500);
      if (data?.url) {
        trackEvent("checkout_started", { tier });
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Starten des Checkouts");
      logError(err.message || "Checkout failed", { errorType: "api", metadata: { tier } });
    } finally {
      setLoading(false);
    }
  };

  const freePlanFeatures: PlanFeature[] = isDE ? [
    { label: "1 Marke erstellen", desc: "Teste deine Idee komplett kostenlos" },
    { label: "Einfacher Wirtschaftlichkeits-Check", desc: "Schnelle Einschätzung deiner Geschäftsidee" },
    { label: "Standard-Launch-Checklisten", desc: "Grundlegende Aufgaben für deinen Start" },
    { label: "Statische Launch-Roadmap", desc: "Überblick über die wichtigsten Launch-Schritte" },
  ] : [
    { label: "Create 1 brand", desc: "Test your idea completely free" },
    { label: "Simple profitability check", desc: "Quick assessment of your business idea" },
    { label: "Standard launch checklists", desc: "Essential tasks for your launch" },
    { label: "Static launch roadmap", desc: "Overview of key launch steps" },
  ];

  const builderFeatures: PlanFeature[] = isDE ? [
    { label: "Unbegrenzte Marken", desc: "Erstelle so viele Marken wie du brauchst" },
    { label: "Volle KI-Unterstützung (Insights)", desc: "Risikoanalysen und strategische Empfehlungen" },
    { label: "Erweiterte Kalkulation", desc: "Profit-Sensitivität, Break-even und Margenanalyse" },
    { label: "PDF-Exporte", desc: "Professioneller Brand Report zum Teilen" },
    { label: "30-Tage Launch-Roadmap", desc: "Statischer Wochenplan für deinen Launch" },
    { label: "Compliance-Vorlagen", desc: "Label-Checklisten und rechtliche Hinweise" },
    { label: "Budget-Planer", desc: "Optimale Verteilung auf Produktion, Marketing und Reserve" },
  ] : [
    { label: "Unlimited brands", desc: "Create as many brands as you need" },
    { label: "Full AI support (Insights)", desc: "Risk analysis and strategic recommendations" },
    { label: "Advanced calculations", desc: "Profit sensitivity, break-even and margin analysis" },
    { label: "PDF exports", desc: "Professional brand report to share" },
    { label: "30-day launch roadmap", desc: "Static weekly plan for your launch" },
    { label: "Compliance templates", desc: "Label checklists and legal notes" },
    { label: "Budget planner", desc: "Optimal allocation across production, marketing, and reserves" },
  ];

  const proFeatures: PlanFeature[] = isDE ? [
    { label: "Alles aus Builder", desc: "Vollständiger Zugang zu allen Builder-Features" },
    { label: "Guided Founder Mode", desc: "Tour + kontextuelle Hilfe pro Step" },
    { label: "Supplier Matching Engine", desc: "Konkrete Production + Packaging Matches" },
    { label: "Execution Readiness Score", desc: "Wie launch-bereit ist deine Marke wirklich?" },
    { label: "Risk Priority Dashboard", desc: "Risiken nach Impact priorisiert" },
    { label: "Adaptive Launch-Roadmap", desc: "Dynamische Roadmap basierend auf deinen Daten" },
    { label: "Szenario-Simulator", desc: "Simuliere verschiedene Mengen- und Preisszenarien" },
  ] : [
    { label: "Everything in Builder", desc: "Full access to all Builder features" },
    { label: "Guided Founder Mode", desc: "Tour + contextual help per step" },
    { label: "Supplier Matching Engine", desc: "Concrete production + packaging matches" },
    { label: "Execution Readiness Score", desc: "How launch-ready is your brand really?" },
    { label: "Risk Priority Dashboard", desc: "Risks prioritized by impact" },
    { label: "Adaptive Launch Roadmap", desc: "Dynamic roadmap based on your data" },
    { label: "Scenario Simulator", desc: "Simulate different quantity and pricing scenarios" },
  ];

  const plans = [
    {
      name: "Free",
      price: isDE ? "0 €" : "€0",
      period: isDE ? "für immer" : "forever",
      features: freePlanFeatures,
      cta: isDE ? "Kostenlos starten" : "Start for free",
      highlighted: false,
      badge: null,
      onClick: () => navigate("/auth"),
      loading: false,
    },
    {
      name: "Builder",
      price: isDE ? "29 €" : "€29",
      period: "/ " + (isDE ? "Monat" : "month"),
      features: builderFeatures,
      cta: loadingBuilder
        ? (isDE ? "Weiterleitung zu Stripe..." : "Redirecting to Stripe...")
        : (isDE ? "Builder starten" : "Start Builder"),
      highlighted: true,
      badge: isDE ? "Beliebt" : "Popular",
      onClick: () => handleCheckout("builder", setLoadingBuilder),
      loading: loadingBuilder,
    },
    {
      name: "Pro",
      price: isDE ? "79 €" : "€79",
      period: "/ " + (isDE ? "Monat" : "month"),
      features: proFeatures,
      cta: loadingPro
        ? (isDE ? "Weiterleitung zu Stripe..." : "Redirecting to Stripe...")
        : (isDE ? "Pro starten" : "Start Pro"),
      highlighted: false,
      badge: "Early Access",
      onClick: () => handleCheckout("pro", setLoadingPro),
      loading: loadingPro,
    },
  ];

  return (
    <section id="pricing" className="border-t px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            {isDE ? "Einfache Preise" : "Simple pricing"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {isDE ? "Starte kostenlos. Upgrade wenn du bereit bist." : "Start for free. Upgrade when you're ready."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 ${
                plan.highlighted
                  ? "border-accent bg-card shadow-lg ring-1 ring-accent/20"
                  : "bg-card shadow-card"
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold flex items-center gap-1 ${
                  plan.highlighted
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {plan.name === "Pro" && <Star className="h-3 w-3" />}
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{f.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                    </div>
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
                onClick={plan.onClick}
                disabled={plan.loading}
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
