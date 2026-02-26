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
    { label: "Realistische Gewinn-Prognosen", desc: "Keine Schätzungen – echte Zahlen für dein Modell" },
    { label: "Break-even Klarheit", desc: "Wisse genau, ab wann du profitabel bist" },
    { label: "Budget-Kontrolle", desc: "Optimale Verteilung auf Produktion, Marketing und Reserve" },
    { label: "Risikoanalyse per KI", desc: "Schwachstellen erkennen, bevor sie teuer werden" },
    { label: "Launch-Struktur", desc: "30-Tage Wochenplan für deinen Start" },
    { label: "PDF-Exporte", desc: "Professioneller Brand Report zum Teilen" },
    { label: "Compliance-Vorlagen", desc: "Label-Checklisten und rechtliche Hinweise" },
  ] : [
    { label: "Realistic profit forecasts", desc: "No guesswork – real numbers for your model" },
    { label: "Break-even clarity", desc: "Know exactly when you become profitable" },
    { label: "Budget control", desc: "Optimal allocation across production, marketing, and reserves" },
    { label: "AI-powered risk analysis", desc: "Spot weaknesses before they get expensive" },
    { label: "Launch structure", desc: "30-day weekly plan for your launch" },
    { label: "PDF exports", desc: "Professional brand report to share" },
    { label: "Compliance templates", desc: "Label checklists and legal notes" },
  ];

  const proFeatures: PlanFeature[] = isDE ? [
    { label: "Alles aus Builder", desc: "Vollständiger Zugang zu allen Builder-Features" },
    { label: "Produktionsfehler vermeiden", desc: "Risiken vor der ersten Bestellung erkennen" },
    { label: "Kapitalbindung kontrollieren", desc: "Wisse genau, wo dein Geld gebunden ist" },
    { label: "Szenario-Simulation vor Investition", desc: "Verschiedene Mengen- und Preisszenarien durchspielen" },
    { label: "Lieferanten-Vergleich", desc: "Konkrete Production + Packaging Matches" },
    { label: "Datenbasierte Launch-Entscheidung", desc: "Adaptive Roadmap basierend auf deinen Daten" },
    { label: "Execution Readiness Score", desc: "Wie launch-bereit ist deine Marke wirklich?" },
  ] : [
    { label: "Everything in Builder", desc: "Full access to all Builder features" },
    { label: "Avoid production mistakes", desc: "Spot risks before your first order" },
    { label: "Control capital commitment", desc: "Know exactly where your money is tied up" },
    { label: "Scenario simulation before investing", desc: "Test different quantity and pricing scenarios" },
    { label: "Supplier comparison", desc: "Concrete production + packaging matches" },
    { label: "Data-driven launch decisions", desc: "Adaptive roadmap based on your data" },
    { label: "Execution Readiness Score", desc: "How launch-ready is your brand really?" },
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
      anchor: null,
    },
    {
      name: "Builder",
      price: isDE ? "29 €" : "€29",
      period: "/ " + (isDE ? "Monat" : "month"),
      features: builderFeatures,
      cta: loadingBuilder
        ? (isDE ? "Weiterleitung zu Stripe..." : "Redirecting to Stripe...")
        : (isDE ? "Strukturiert starten" : "Start structured"),
      highlighted: true,
      badge: isDE ? "Beliebt" : "Popular",
      onClick: () => handleCheckout("builder", setLoadingBuilder),
      loading: loadingBuilder,
      anchor: null,
    },
    {
      name: "Pro",
      price: isDE ? "79 €" : "€79",
      period: "/ " + (isDE ? "Monat" : "month"),
      features: proFeatures,
      cta: loadingPro
        ? (isDE ? "Weiterleitung zu Stripe..." : "Redirecting to Stripe...")
        : (isDE ? "Risiken absichern" : "Secure against risks"),
      highlighted: false,
      badge: "Early Access",
      secondBadge: isDE ? "Für ambitionierte Gründer" : "For ambitious founders",
      onClick: () => handleCheckout("pro", setLoadingPro),
      loading: loadingPro,
      proStyle: true,
      anchor: isDE
        ? "Eine falsche Produktionsentscheidung kostet oft 5.000 €+. Dieses Tool kostet 79 €."
        : "One wrong production decision often costs €5,000+. This tool costs €79.",
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
                    : plan.proStyle
                      ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white"
                      : "bg-primary text-primary-foreground"
                }`}>
                  {plan.proStyle && <Star className="h-3 w-3" />}
                  {plan.badge}
                </div>
              )}
              {plan.secondBadge && (
                <div className="absolute -top-3 right-6 rounded-full bg-amber-900/90 px-3 py-0.5 text-xs font-semibold text-amber-100">
                  {plan.secondBadge}
                </div>
              )}
              <h3 className="text-lg font-semibold leading-snug">{plan.name}</h3>
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
                    : plan.proStyle
                      ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600 shadow-md border-0"
                      : ""
                }`}
                variant={plan.highlighted || plan.proStyle ? "default" : "outline"}
                onClick={plan.onClick}
                disabled={plan.loading}
              >
                {plan.cta}
              </Button>
              {plan.anchor && (
                <p className="mt-3 text-xs text-center text-muted-foreground italic">
                  {plan.anchor}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-2">
            {isDE ? "Feature-Vergleich" : "Feature Comparison"}
          </h3>
          <p className="text-center text-sm text-muted-foreground mb-8">
            {isDE ? "BuildYourBrand vs. Excel, Notion & manuelle Planung" : "BuildYourBrand vs. Excel, Notion & manual planning"}
          </p>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">{isDE ? "Feature" : "Feature"}</th>
                  <th className="px-4 py-3 text-center font-semibold">Free</th>
                  <th className="px-4 py-3 text-center font-semibold text-accent">Builder</th>
                  <th className="px-4 py-3 text-center font-semibold">Pro</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Excel / Notion</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {(isDE ? [
                  ["Kosten-Kalkulator", "Einfach", "Voll", "Voll + Szenarien", "Manuell"],
                  ["Break-Even Analyse", "—", "✓", "✓ + Simulation", "Manuell"],
                  ["KI-Risikoanalyse", "—", "✓", "✓ + Priorisierung", "—"],
                  ["Budget-Optimierung", "—", "✓", "✓", "—"],
                  ["Lieferanten-Matching", "—", "—", "✓ + Bewertung", "—"],
                  ["Szenario-Simulation", "—", "—", "✓", "—"],
                  ["Launch-Roadmap", "Statisch", "30-Tage Plan", "Adaptiv + KI", "Manuell"],
                  ["PDF-Export", "—", "✓", "✓ Investor-Ready", "Manuell"],
                  ["Execution Score", "—", "—", "✓", "—"],
                  ["Compliance-Check", "—", "Vorlagen", "Voll", "—"],
                ] : [
                  ["Cost Calculator", "Basic", "Full", "Full + Scenarios", "Manual"],
                  ["Break-Even Analysis", "—", "✓", "✓ + Simulation", "Manual"],
                  ["AI Risk Analysis", "—", "✓", "✓ + Prioritization", "—"],
                  ["Budget Optimization", "—", "✓", "✓", "—"],
                  ["Supplier Matching", "—", "—", "✓ + Scoring", "—"],
                  ["Scenario Simulation", "—", "—", "✓", "—"],
                  ["Launch Roadmap", "Static", "30-Day Plan", "Adaptive + AI", "Manual"],
                  ["PDF Export", "—", "✓", "✓ Investor-Ready", "Manual"],
                  ["Execution Score", "—", "—", "✓", "—"],
                  ["Compliance Check", "—", "Templates", "Full", "—"],
                ]).map(([feature, free, builder, pro, manual]) => (
                  <tr key={feature} className="border-b last:border-b-0">
                    <td className="px-4 py-2.5 font-medium text-foreground">{feature}</td>
                    <td className="px-4 py-2.5 text-center">{free}</td>
                    <td className="px-4 py-2.5 text-center font-medium text-accent">{builder}</td>
                    <td className="px-4 py-2.5 text-center">{pro}</td>
                    <td className="px-4 py-2.5 text-center text-muted-foreground/60">{manual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust elements */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {(isDE ? [
            { emoji: "🔒", label: "DSGVO-konform", desc: "Daten in der EU gehostet" },
            { emoji: "⚡", label: "Sofort starten", desc: "Kein Setup, keine Wartezeit" },
            { emoji: "🎯", label: "Made in Germany", desc: "Für den deutschen Markt optimiert" },
          ] : [
            { emoji: "🔒", label: "GDPR Compliant", desc: "Data hosted in the EU" },
            { emoji: "⚡", label: "Start instantly", desc: "No setup, no waiting" },
            { emoji: "🎯", label: "Made in Germany", desc: "Optimized for the German market" },
          ]).map(({ emoji, label, desc }) => (
            <div key={label} className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stripe disclosure */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isDE
              ? "Zahlung wird über Stripe abgewickelt. Abonnement verlängert sich automatisch, kündbar jederzeit im Kundenportal."
              : "Payment is processed via Stripe. Subscription renews automatically, cancel anytime in the customer portal."}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>
              {isDE
                ? "🔒 Keine Zahlungsdaten auf dieser Plattform gespeichert"
                : "🔒 No payment data stored on this platform"}
            </span>
            <span>
              {isDE
                ? "✓ Kein Risiko – jederzeit kündbar"
                : "✓ No risk – cancel anytime"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
