import { Check, Star, AlertTriangle, TrendingUp, ShieldCheck, Crown } from "lucide-react";
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
  const [loadingExecution, setLoadingExecution] = useState(false);
  const isDE = i18n.language === "de";

  const handleCheckout = async (tier: "builder" | "pro" | "execution", setLoading: (v: boolean) => void) => {
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
    { label: "Voller Business Calculator", desc: "Realistische Gewinn-Prognosen mit echten Zahlen" },
    { label: "Break-Even Analyse", desc: "Wisse genau, ab wann du profitabel bist" },
    { label: "Basis Markt-Demand Score", desc: "Einschätzung der Nachfrage in deiner Kategorie" },
    { label: "Basis Wettbewerber-Übersicht", desc: "Preisspannen und Positionierung der Konkurrenz" },
    { label: "Cashflow-Timeline", desc: "12-Monats-Übersicht deiner Ein- und Ausgaben" },
    { label: "Supplier Risk Basis-Score", desc: "MOQ- und Länderrisiko auf einen Blick" },
    { label: "Launch Readiness Score", desc: "Wie bereit bist du für den Markteintritt?" },
    { label: "Compliance Wizard", desc: "Checklisten + Vorlagen für alle rechtlichen Anforderungen" },
    { label: "PDF Blueprint Export", desc: "Personalisierter Brand Report zum Teilen" },
    { label: "Begrenzte KI-Empfehlungen", desc: "Top-3 strategische Sofort-Empfehlungen" },
  ] : [
    { label: "Full Business Calculator", desc: "Realistic profit forecasts with real numbers" },
    { label: "Break-Even Analysis", desc: "Know exactly when you become profitable" },
    { label: "Basic Market Demand Score", desc: "Demand assessment for your category" },
    { label: "Basic Competitor Overview", desc: "Competitor price ranges and positioning" },
    { label: "Cashflow Timeline", desc: "12-month overview of your income & expenses" },
    { label: "Supplier Risk Base Score", desc: "MOQ and country risk at a glance" },
    { label: "Launch Readiness Score", desc: "How ready are you for market entry?" },
    { label: "Compliance Wizard", desc: "Checklists + templates for all legal requirements" },
    { label: "PDF Blueprint Export", desc: "Personalized brand report to share" },
    { label: "Limited AI Suggestions", desc: "Top 3 strategic instant recommendations" },
  ];

  const proFeatures: PlanFeature[] = isDE ? [
    { label: "Alles aus Builder", desc: "Vollständiger Zugang zu allen Builder-Features" },
    { label: "AI Founder Copilot (Voll)", desc: "KI-Chat mit kontextbezogenen Empfehlungen & Deep-Dive" },
    { label: "Volle Market Reality Engine", desc: "Demand Index, Price Benchmarking & Launch-Wahrscheinlichkeit" },
    { label: "Stress Test Simulation", desc: "Was passiert bei +20% Ads, +8% Retouren, -10% Preis?" },
    { label: "Cashflow Survival Predictor", desc: "Runway, Working Capital Gap & Liquiditäts-Alerts" },
    { label: "Supplier Risk Heatmap", desc: "5 Risikokategorien inkl. Customs & Capital Lock" },
    { label: "Business Recovery Mode", desc: "Krisenfrüherkennung, Recovery-Pläne & Survival Score" },
    { label: "Priority KI-Insights", desc: "Priorisierte Empfehlungen basierend auf deinem Risikoprofil" },
  ] : [
    { label: "Everything in Builder", desc: "Full access to all Builder features" },
    { label: "AI Founder Copilot (Full)", desc: "AI chat with context-aware recommendations & deep dive" },
    { label: "Full Market Reality Engine", desc: "Demand index, price benchmarking & launch probability" },
    { label: "Stress Test Simulation", desc: "What if ads +20%, returns +8%, price -10%?" },
    { label: "Cashflow Survival Predictor", desc: "Runway, working capital gap & liquidity alerts" },
    { label: "Supplier Risk Heatmap", desc: "5 risk categories incl. customs & capital lock" },
    { label: "Business Recovery Mode", desc: "Crisis detection, recovery plans & survival score" },
    { label: "Priority AI Insights", desc: "Prioritized recommendations based on your risk profile" },
  ];

  const executionFeatures: PlanFeature[] = isDE ? [
    { label: "Alles aus Pro", desc: "Vollständiger Zugang zu allen Pro-Features" },
    { label: "Founder Operating Dashboard", desc: "Wöchentliches KPI-Tracking mit Revenue, Margin & Cashflow" },
    { label: "Survival Monitoring System", desc: "Echtzeit-Alerts bei Cash-, Margen- und Conversion-Drops" },
    { label: "Benchmark Engine", desc: "Anonymer Vergleich deiner KPIs mit anderen Gründern" },
    { label: "Execution Planner", desc: "Wöchentliche Aufgabenplanung mit Accountability Score" },
    { label: "Investor Mode", desc: "Investor-Ready Summary, Financial Overview & Health Report" },
    { label: "Advanced AI Copilot", desc: "CEO-Level Empfehlungen & Next-Best-Action Vorschläge" },
  ] : [
    { label: "Everything in Pro", desc: "Full access to all Pro features" },
    { label: "Founder Operating Dashboard", desc: "Weekly KPI tracking with revenue, margin & cashflow" },
    { label: "Survival Monitoring System", desc: "Real-time alerts on cash, margin & conversion drops" },
    { label: "Benchmark Engine", desc: "Anonymous KPI comparison with other founders" },
    { label: "Execution Planner", desc: "Weekly task planning with accountability score" },
    { label: "Investor Mode", desc: "Investor-ready summary, financial overview & health report" },
    { label: "Advanced AI Copilot", desc: "CEO-level recommendations & next-best-action suggestions" },
  ];

  const plans = [
    {
      name: "Free",
      price: isDE ? "0 €" : "€0",
      period: isDE ? "für immer" : "forever",
      features: freePlanFeatures,
      cta: isDE ? "Gratis testen – kein Risiko" : "Try free – no risk",
      highlighted: false,
      badge: null as string | null,
      onClick: () => navigate("/auth"),
      loading: false,
      anchor: null as string | null,
      tier: "free" as const,
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
      anchor: null as string | null,
      tier: "builder" as const,
    },
    {
      name: isDE ? "Pro – Founder Intelligence" : "Pro – Founder Intelligence",
      price: isDE ? "79 €" : "€79",
      period: "/ " + (isDE ? "Monat" : "month"),
      features: proFeatures,
      cta: loadingPro
        ? (isDE ? "Weiterleitung zu Stripe..." : "Redirecting to Stripe...")
        : (isDE ? "Strategischen Vorteil sichern →" : "Secure strategic advantage →"),
      highlighted: false,
      badge: "Early Access",
      onClick: () => handleCheckout("pro", setLoadingPro),
      loading: loadingPro,
      tier: "pro" as const,
      anchor: isDE
        ? "Vermeide €5.000–€20.000 teure Fehler. Datenbasierte Entscheidungen für 79 €/Monat."
        : "Avoid €5,000–€20,000 in mistakes. Data-backed decisions for €79/month.",
    },
    {
      name: "Execution OS",
      price: isDE ? "159 €" : "€159",
      period: "/ " + (isDE ? "Monat" : "month"),
      features: executionFeatures,
      cta: loadingExecution
        ? (isDE ? "Weiterleitung zu Stripe..." : "Redirecting to Stripe...")
        : (isDE ? "Business wie ein CEO führen →" : "Run your business like a CEO →"),
      highlighted: false,
      badge: isDE ? "Für ambitionierte Gründer" : "For ambitious founders",
      onClick: () => handleCheckout("execution", setLoadingExecution),
      loading: loadingExecution,
      tier: "execution" as const,
      anchor: isDE
        ? "Eine falsche Produktionsentscheidung: €8.000–€20.000. Execution OS: €159/Monat."
        : "One wrong production decision: €8,000–€20,000. Execution OS: €159/month.",
    },
  ];

  return (
    <section id="pricing" className="border-t px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-7xl">
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
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
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
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
              <p className="text-2xl font-bold text-amber-600">159 €</p>
              <p className="text-xs text-muted-foreground mt-1">{isDE ? "Execution OS / Monat" : "Execution OS / month"}</p>
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isExecutionTier = plan.tier === "execution";
            const isProTier = plan.tier === "pro";

            return (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-7 ${
                  plan.highlighted
                    ? "border-accent bg-card shadow-lg ring-1 ring-accent/20 scale-[1.02]"
                    : isExecutionTier
                    ? "border-amber-500/40 bg-gradient-to-b from-card to-amber-500/5 shadow-lg ring-1 ring-amber-500/20"
                    : "bg-card shadow-card"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold flex items-center gap-1 ${
                    plan.highlighted
                      ? "bg-accent text-accent-foreground"
                      : isExecutionTier
                        ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white"
                        : isProTier
                          ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white"
                          : "bg-primary text-primary-foreground"
                  }`}>
                    {(isExecutionTier || isProTier) && <Crown className="h-3 w-3" />}
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-lg font-semibold leading-snug">{plan.name}</h3>
                {isExecutionTier && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    {isDE ? "Founder Operating System" : "Founder Operating System"}
                  </p>
                )}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                {plan.highlighted && (
                  <p className="mt-2 text-xs text-accent font-medium">
                    {isDE ? "= 0,97 €/Tag · Spart ∅ 3.200 € Fehlerkosten" : "= €0.97/day · Saves avg. €3,200 in mistakes"}
                  </p>
                )}

                {isExecutionTier && (
                  <p className="mt-2 text-xs text-amber-600 font-medium">
                    {isDE ? "= 5,30 €/Tag · Für Gründer mit echtem Kapitalrisiko" : "= €5.30/day · For founders with real capital at risk"}
                  </p>
                )}

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${isExecutionTier ? "text-amber-500" : "text-success"}`} />
                      <div>
                        <span className="font-medium">{f.label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 w-full ${
                    plan.highlighted
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : isExecutionTier
                        ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600 shadow-md border-0"
                        : isProTier
                          ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600 shadow-md border-0"
                          : ""
                  }`}
                  variant={plan.highlighted || isExecutionTier || isProTier ? "default" : "outline"}
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
            );
          })}
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
                  <th className="px-4 py-3 text-center font-semibold text-amber-600">Execution OS</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {(isDE ? [
                  ["Market Reality Engine", "—", "Basis Demand", "Voll + Benchmark", "✓ Voll"],
                  ["Cashflow Survival Engine", "—", "Timeline", "Voll + Stress-Test", "✓ Voll"],
                  ["Stress Test Simulation", "—", "—", "✓ + Worst Case", "✓ Voll"],
                  ["AI Founder Copilot", "—", "3 Empfehlungen", "Voll + Chat", "Advanced CEO-Level"],
                  ["Business Recovery Mode", "—", "—", "✓ Voll", "✓ Voll"],
                  ["Kosten-Kalkulator", "Einfach", "Voll", "Voll + Szenarien", "✓ Voll"],
                  ["Survival Monitoring", "—", "—", "—", "✓ Echtzeit-Alerts"],
                  ["Benchmark Engine", "—", "—", "—", "✓ Anonymer Vergleich"],
                  ["Execution Planner", "—", "—", "—", "✓ Wöchentlich"],
                  ["Investor Mode", "—", "—", "—", "✓ Reports"],
                  ["Advanced Copilot", "—", "—", "—", "✓ CEO-Level"],
                ] : [
                  ["Market Reality Engine", "—", "Basic Demand", "Full + Benchmark", "✓ Full"],
                  ["Cashflow Survival Engine", "—", "Timeline", "Full + Stress Test", "✓ Full"],
                  ["Stress Test Simulation", "—", "—", "✓ + Worst Case", "✓ Full"],
                  ["AI Founder Copilot", "—", "3 Suggestions", "Full + Chat", "Advanced CEO-Level"],
                  ["Business Recovery Mode", "—", "—", "✓ Full", "✓ Full"],
                  ["Cost Calculator", "Basic", "Full", "Full + Scenarios", "✓ Full"],
                  ["Survival Monitoring", "—", "—", "—", "✓ Real-time Alerts"],
                  ["Benchmark Engine", "—", "—", "—", "✓ Anonymous Comparison"],
                  ["Execution Planner", "—", "—", "—", "✓ Weekly"],
                  ["Investor Mode", "—", "—", "—", "✓ Reports"],
                  ["Advanced Copilot", "—", "—", "—", "✓ CEO-Level"],
                ]).map(([feature, free, builder, pro, execution]) => (
                  <tr key={feature} className="border-b last:border-b-0">
                    <td className="px-4 py-2.5 font-medium text-foreground">{feature}</td>
                    <td className="px-4 py-2.5 text-center">{free}</td>
                    <td className="px-4 py-2.5 text-center font-medium text-accent">{builder}</td>
                    <td className="px-4 py-2.5 text-center">{pro}</td>
                    <td className="px-4 py-2.5 text-center font-medium text-amber-600">{execution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Execution OS Cost Anchor */}
        <div className="mt-12 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 p-8 text-center">
          <Crown className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">
            {isDE ? "Execution OS – Für Gründer mit echtem Kapitalrisiko" : "Execution OS – For founders with real capital at risk"}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">€8.000–€20.000</p>
              <p className="text-xs text-muted-foreground mt-1">{isDE ? "Eine falsche Produktionsentscheidung" : "One wrong production decision"}</p>
            </div>
            <span className="text-2xl text-muted-foreground">vs.</span>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">€159<span className="text-base font-normal text-muted-foreground">/Mo.</span></p>
              <p className="text-xs text-muted-foreground mt-1">Execution OS</p>
            </div>
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
