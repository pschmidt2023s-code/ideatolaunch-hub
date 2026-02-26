import { Check, Star, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
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
    { label: "Capital Burn Predictor", desc: "12-Monats-Kostenprognose & Cash Runway" },
    { label: "Supplier Risk Score", desc: "MOQ-, Länder-, Lieferzeit- & Abhängigkeitsrisiko" },
    { label: "Szenario-Simulation", desc: "6-Monats-Outcome bei veränderten Parametern" },
    { label: "Launch-Wahrscheinlichkeit", desc: "Datenbasierte Einschätzung deiner Launch-Chancen" },
    { label: "KI-Strategie-Empfehlungen", desc: "Preis-, MOQ- & Budget-Optimierung per KI" },
    { label: "Execution Score", desc: "Fortschritt messen & Verbesserungsvorschläge erhalten" },
    { label: "Compliance Engine", desc: "Interaktiver Wizard für alle rechtlichen Anforderungen" },
  ] : [
    { label: "Everything in Builder", desc: "Full access to all Builder features" },
    { label: "Capital Burn Predictor", desc: "12-month cost forecast & cash runway" },
    { label: "Supplier Risk Score", desc: "MOQ, country, lead time & dependency risk" },
    { label: "Scenario Simulation", desc: "6-month outcomes with changed parameters" },
    { label: "Launch Probability", desc: "Data-driven assessment of your launch chances" },
    { label: "AI Strategy Recommendations", desc: "Price, MOQ & budget optimization via AI" },
    { label: "Execution Score", desc: "Measure progress & get improvement suggestions" },
    { label: "Compliance Engine", desc: "Interactive wizard for all legal requirements" },
  ];

  const plans = [
    {
      name: "Free",
      price: isDE ? "0 €" : "€0",
      period: isDE ? "für immer" : "forever",
      features: freePlanFeatures,
      cta: isDE ? "Gratis testen – kein Risiko" : "Try free – no risk",
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
        : (isDE ? "Jetzt strukturiert starten →" : "Start structured now →"),
      highlighted: true,
      badge: isDE ? "90% wählen Builder" : "90% choose Builder",
      onClick: () => handleCheckout("builder", setLoadingBuilder),
      loading: loadingBuilder,
      anchor: null,
    },
    {
      name: isDE ? "Pro – Strategic Intelligence" : "Pro – Strategic Intelligence",
      price: isDE ? "79 €" : "€79",
      period: "/ " + (isDE ? "Monat" : "month"),
      features: proFeatures,
      cta: loadingPro
        ? (isDE ? "Weiterleitung zu Stripe..." : "Redirecting to Stripe...")
        : (isDE ? "Strategischen Vorteil sichern →" : "Secure strategic advantage →"),
      highlighted: false,
      badge: "Strategic Intelligence",
      secondBadge: isDE ? "Enterprise-Level Planning" : "Enterprise-Level Planning",
      onClick: () => handleCheckout("pro", setLoadingPro),
      loading: loadingPro,
      proStyle: true,
      anchor: isDE
        ? "Vermeide €5.000–€20.000 teure Fehler. Datenbasierte Entscheidungen für 79 €/Monat."
        : "Avoid €5,000–€20,000 in mistakes. Data-backed decisions for €79/month.",
    },
  ];

  return (
    <section id="pricing" className="border-t px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            {isDE ? "Investiere in Klarheit – nicht in Fehler" : "Invest in clarity – not mistakes"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {isDE
              ? "Die meisten Gründer verlieren 3.000–10.000 € durch vermeidbare Produktionsfehler. BuildYourBrand kostet einen Bruchteil davon."
              : "Most founders lose €3,000–10,000 on avoidable production mistakes. BuildYourBrand costs a fraction of that."}
          </p>
        </div>

        {/* ── ROI Calculator ── */}
        <div className="mb-16 rounded-2xl border bg-card p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="text-xl font-bold">{isDE ? "Was kostet dich ein Produktionsfehler?" : "What does a production mistake cost you?"}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center">
              <p className="text-2xl font-bold text-destructive">3.200 €</p>
              <p className="text-xs text-muted-foreground mt-1">{isDE ? "∅ Kosten eines Produktionsfehlers" : "Avg. cost of one production mistake"}</p>
            </div>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center">
              <p className="text-2xl font-bold text-destructive">8.500 €</p>
              <p className="text-xs text-muted-foreground mt-1">{isDE ? "Falsche MOQ + Überproduktion" : "Wrong MOQ + overproduction"}</p>
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 text-center">
              <p className="text-2xl font-bold text-accent">29 €</p>
              <p className="text-xs text-muted-foreground mt-1">{isDE ? "BuildYourBrand Builder / Monat" : "BuildYourBrand Builder / month"}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {isDE
              ? "→ Ein einziger vermiedener Fehler spart dir 9+ Monate Builder-Kosten."
              : "→ One avoided mistake saves you 9+ months of Builder costs."}
          </p>
        </div>

        {/* ── Social Proof ── */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
            {isDE ? "Gründer aus DE, AT & CH" : "Founders from DE, AT & CH"}
          </span>
          <Link to="/case-studies" className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 hover:border-accent/40 transition-colors">
            <Star className="h-3.5 w-3.5 text-accent" />
            {isDE ? "Case Studies lesen →" : "Read case studies →"}
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 ${
                plan.highlighted
                  ? "border-accent bg-card shadow-lg ring-1 ring-accent/20 scale-[1.02]"
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
                <div className="absolute -top-8 right-6 rounded-full bg-amber-900/90 px-3 py-0.5 text-xs font-semibold text-amber-100">
                  {plan.secondBadge}
                </div>
              )}
              <h3 className="text-lg font-semibold leading-snug">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Savings comparison for Builder */}
              {plan.highlighted && (
                <p className="mt-2 text-xs text-accent font-medium">
                  {isDE ? "= 0,97 €/Tag · Spart ∅ 3.200 € Fehlerkosten" : "= €0.97/day · Saves avg. €3,200 in mistakes"}
                </p>
              )}

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

        {/* Risk reversal */}
        <div className="mt-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium">
            {isDE ? "🎯 Builder = Die beste Wahl für 90% der Gründer" : "🎯 Builder = The best choice for 90% of founders"}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">
              <ShieldCheck className="h-3 w-3 text-accent" />
              {isDE ? "14 Tage Geld-zurück-Garantie" : "14-day money-back guarantee"}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">
              ✓ {isDE ? "Jederzeit kündbar" : "Cancel anytime"}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">
              🔒 {isDE ? "Transparente Preise" : "Transparent pricing"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {isDE
              ? "Keine Mindestlaufzeit. Keine versteckten Kosten. Zahlung über Stripe. Wenn du nicht zufrieden bist, bekommst du innerhalb von 14 Tagen dein Geld zurück."
              : "No minimum term. No hidden costs. Powered by Stripe. If you're not satisfied, get your money back within 14 days."}
          </p>
        </div>
      </div>
    </section>
  );
}
