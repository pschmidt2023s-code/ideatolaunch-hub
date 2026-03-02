import { Check, Star, AlertTriangle, TrendingUp, ShieldCheck, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { trackEvent, withPerfTracking, logError } from "@/lib/analytics";
import { openExternal } from "@/lib/openExternal";

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

  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">("yearly");
  const isDE = i18n.language === "de";
  const isYearly = billingCycle === "yearly";

  const handleCheckout = async (
    tier: "builder" | "pro" | "execution",
    setLoading: (v: boolean) => void
  ) => {
    if (!user) {
      navigate("/auth?tab=signup");
      return;
    }

    setLoading(true);
    trackEvent("clicked_upgrade", { source: "pricing_section", tier, billing: billingCycle });

    try {
      // In Tauri, window.location.origin is tauri://localhost which Stripe rejects.
      // Use the published web URL as return target instead.
      const isTauriEnv = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
      const returnUrl = isTauriEnv
        ? "https://brand.aldenairperfumes.de"
        : window.location.origin;

      const data = await withPerfTracking(
        "stripe_checkout",
        async () => {
          const { data, error } = await supabase.functions.invoke("stripe-checkout", {
            body: { return_url: returnUrl, tier },
          });
          if (error) throw error;
          return data;
        },
        1500
      );

      if (!data?.url) throw new Error("Stripe URL fehlt");

      trackEvent("checkout_started", { tier });
      await openExternal(data.url);
    } catch (err: any) {
      toast.error(err?.message || "Fehler beim Starten des Checkouts");
      logError(err?.message || "Checkout failed", { errorType: "api", metadata: { tier } });
    } finally {
      setLoading(false);
    }
  };

  const monthlyPrices = { builder: 29, pro: 79, execution: 159 };
  const yearlyPrices = {
    builder: Math.round(29 * 0.85),
    pro: Math.round(79 * 0.85),
    execution: Math.round(159 * 0.85),
  };

  const getPrice = (tier: "builder" | "pro" | "execution") => (isYearly ? yearlyPrices[tier] : monthlyPrices[tier]);
  const formatPrice = (amount: number) => (isDE ? `${amount} €` : `€${amount}`);

  const freePlanFeatures: PlanFeature[] = isDE
    ? [
        { label: "1 Marke erstellen", desc: "Teste deine Idee komplett kostenlos" },
        { label: "Einfacher Wirtschaftlichkeits-Check", desc: "Schnelle Einschätzung deiner Geschäftsidee" },
        { label: "Standard-Launch-Checklisten", desc: "Grundlegende Aufgaben für deinen Start" },
        { label: "Statische Launch-Roadmap", desc: "Überblick über die wichtigsten Launch-Schritte" },
      ]
    : [
        { label: "Create 1 brand", desc: "Test your idea completely free" },
        { label: "Simple profitability check", desc: "Quick assessment of your business idea" },
        { label: "Standard launch checklists", desc: "Essential tasks for your launch" },
        { label: "Static launch roadmap", desc: "Overview of key launch steps" },
      ];

  const builderFeatures: PlanFeature[] = isDE
    ? [
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
      ]
    : [
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

  const proFeatures: PlanFeature[] = isDE
    ? [
        { label: "Alles aus Builder", desc: "Vollständiger Zugang zu allen Builder-Features" },
        { label: "AI Founder Copilot (Voll)", desc: "KI-Chat mit kontextbezogenen Empfehlungen & Deep-Dive" },
        { label: "Volle Market Reality Engine", desc: "Demand Index, Price Benchmarking & Launch-Wahrscheinlichkeit" },
        { label: "Stress Test Simulation", desc: "Was passiert bei +20% Ads, +8% Retouren, -10% Preis?" },
        { label: "Cashflow Survival Predictor", desc: "Runway, Working Capital Gap & Liquiditäts-Alerts" },
        { label: "Supplier Risk Heatmap", desc: "5 Risikokategorien inkl. Customs & Capital Lock" },
        { label: "Business Recovery Mode", desc: "Krisenfrüherkennung, Recovery-Pläne & Survival Score" },
        { label: "Priority KI-Insights", desc: "Priorisierte Empfehlungen basierend auf deinem Risikoprofil" },
      ]
    : [
        { label: "Everything in Builder", desc: "Full access to all Builder features" },
        { label: "AI Founder Copilot (Full)", desc: "AI chat with context-aware recommendations & deep dive" },
        { label: "Full Market Reality Engine", desc: "Demand index, price benchmarking & launch probability" },
        { label: "Stress Test Simulation", desc: "What if ads +20%, returns +8%, price -10%?" },
        { label: "Cashflow Survival Predictor", desc: "Runway, working capital gap & liquidity alerts" },
        { label: "Supplier Risk Heatmap", desc: "5 risk categories incl. customs & capital lock" },
        { label: "Business Recovery Mode", desc: "Crisis detection, recovery plans & survival score" },
        { label: "Priority AI Insights", desc: "Prioritized recommendations based on your risk profile" },
      ];

  const executionFeatures: PlanFeature[] = isDE
    ? [
        { label: "Alles aus Pro", desc: "Vollständiger Zugang zu allen Pro-Features" },
        { label: "Wöchentliche KPI-Kontrolle", desc: "Revenue, Marge & Cashflow in Echtzeit überwachen" },
        { label: "Kapitalschutz-Alerts", desc: "Echtzeit-Warnungen bei Cash-, Margen- und Conversion-Drops" },
        { label: "Strategische Benchmark Intelligence", desc: "Anonymer KPI-Vergleich mit anderen Gründern" },
        { label: "Investor-Ready Übersicht", desc: "Professionelle Finanz-Zusammenfassung für Investoren" },
        { label: "Execution Planner", desc: "Wöchentliche Aufgabenplanung mit Accountability Score" },
        { label: "Advanced AI Copilot", desc: "CEO-Level Empfehlungen & Next-Best-Action" },
      ]
    : [
        { label: "Everything in Pro", desc: "Full access to all Pro features" },
        { label: "Weekly KPI control", desc: "Monitor revenue, margin & cashflow in real-time" },
        { label: "Capital protection alerts", desc: "Real-time warnings on cash, margin & conversion drops" },
        { label: "Strategic benchmark intelligence", desc: "Anonymous KPI comparison with other founders" },
        { label: "Investor-ready overview", desc: "Professional financial summary for investors" },
        { label: "Execution Planner", desc: "Weekly task planning with accountability score" },
        { label: "Advanced AI Copilot", desc: "CEO-level recommendations & next-best-action" },
      ];

  const plans = [
    {
      name: "Free",
      price: isDE ? "0 €" : "€0",
      period: isDE ? "für immer" : "forever",
      tagline: "",
      features: freePlanFeatures,
      cta: isDE ? "Gratis testen – kein Risiko" : "Try free – no risk",
      highlighted: false,
      badge: null as string | null,
      onClick: () => navigate("/auth"),
      loading: false,
      anchor: null as string | null,
      tier: "free" as const,
      roiText: null as string | null,
    },
    {
      name: "Builder",
      price: formatPrice(getPrice("builder")),
      period: "/ " + (isDE ? "Monat" : "month"),
      tagline: isDE ? "Für den strukturierten Launch." : "For structured launch.",
      features: builderFeatures,
      cta: loadingBuilder
        ? isDE
          ? "Weiterleitung zu Stripe..."
          : "Redirecting to Stripe..."
        : isDE
          ? "Jetzt strukturiert starten →"
          : "Start structured now →",
      highlighted: true,
      badge: isDE ? "90% wählen Builder" : "90% choose Builder",
      onClick: () => handleCheckout("builder", setLoadingBuilder),
      loading: loadingBuilder,
      anchor: null as string | null,
      tier: "builder" as const,
      roiText: isDE ? "1 vermiedener Produktionsfehler = 3.000–10.000 € gespart." : "1 prevented production mistake = €3,000–€10,000 saved.",
    },
    {
      name: isDE ? "Pro – Founder Intelligence" : "Pro – Founder Intelligence",
      price: formatPrice(getPrice("pro")),
      period: "/ " + (isDE ? "Monat" : "month"),
      tagline: isDE ? "Für strategische Entscheidungen." : "For strategic decision-making.",
      features: proFeatures,
      cta: loadingPro
        ? isDE
          ? "Weiterleitung zu Stripe..."
          : "Redirecting to Stripe..."
        : isDE
          ? "Strategischen Vorteil sichern →"
          : "Secure strategic advantage →",
      highlighted: false,
      badge: "Early Access",
      onClick: () => handleCheckout("pro", setLoadingPro),
      loading: loadingPro,
      tier: "pro" as const,
      anchor: isDE
        ? "Vermeide €5.000–€20.000 teure Fehler. Datenbasierte Entscheidungen."
        : "Avoid €5,000–€20,000 in mistakes. Data-backed decisions.",
      roiText: isDE ? "1 vermiedener Produktionsfehler = 3.000–10.000 € gespart." : "1 prevented production mistake = €3,000–€10,000 saved.",
    },
    {
      name: "Execution OS",
      price: formatPrice(getPrice("execution")),
      period: "/ " + (isDE ? "Monat" : "month"),
      tagline: isDE ? "Für kapitalgeschützte Business-Führung." : "For capital-protected business leadership.",
      features: executionFeatures,
      cta: loadingExecution
        ? isDE
          ? "Weiterleitung zu Stripe..."
          : "Redirecting to Stripe..."
        : isDE
          ? "Business wie ein CEO führen →"
          : "Run your business like a CEO →",
      highlighted: false,
      badge: isDE ? "Für Gründer mit echtem Risiko" : "For founders managing real risk",
      onClick: () => handleCheckout("execution", setLoadingExecution),
      loading: loadingExecution,
      tier: "execution" as const,
      anchor: null as string | null,
      roiText: isDE
        ? "Eine falsche Produktionsentscheidung kann 8.000–20.000 € kosten."
        : "One wrong production decision can cost €8,000–€20,000.",
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

        {/* ── Billing Toggle ── */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border bg-card p-1 shadow-card">
            <button
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              {isDE ? "Monatlich" : "Monthly"}
            </button>
            <button
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              {isDE ? "Jährlich" : "Yearly"}
              <span className="ml-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                -15%
              </span>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {isDE ? "Die meisten ambitionierten Gründer wählen jährlich." : "Most serious founders choose annual."}
          </p>
        </div>

        {/* ── ROI Calculator ── */}
        <div className="mb-16 rounded-2xl border bg-card p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="text-xl font-bold">
              {isDE ? "Was kostet dich ein Produktionsfehler?" : "What does a production mistake cost you?"}
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center">
              <p className="text-2xl font-bold text-destructive">3.200 €</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isDE ? "∅ Kosten eines Produktionsfehlers" : "Avg. cost of one production mistake"}
              </p>
            </div>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center">
              <p className="text-2xl font-bold text-destructive">8.500 €</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isDE ? "Falsche MOQ + Überproduktion" : "Wrong MOQ + overproduction"}
              </p>
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 text-center">
              <p className="text-2xl font-bold text-accent">{formatPrice(getPrice("builder"))}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isDE ? "BuildYourBrand Builder / Monat" : "BuildYourBrand Builder / month"}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
              <p className="text-2xl font-bold text-amber-600">{formatPrice(getPrice("execution"))}</p>
              <p className="text-xs text-muted-foreground mt-1">Execution OS / {isDE ? "Monat" : "month"}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {isDE ? "→ Ein einziger vermiedener Fehler spart dir 9+ Monate Builder-Kosten." : "→ One avoided mistake saves you 9+ months of Builder costs."}
          </p>
        </div>

        {/* ── Social Proof ── */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
            {isDE ? "Gründer aus DE, AT & CH" : "Founders from DE, AT & CH"}
          </span>
          <Link
            to="/case-studies"
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 hover:border-accent/40 transition-colors"
          >
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
                  <div
                    className={`absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold flex items-center gap-1 ${
                      plan.highlighted
                        ? "bg-accent text-accent-foreground"
                        : isExecutionTier
                          ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white"
                          : isProTier
                            ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white"
                            : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {(isExecutionTier || isProTier) && <Crown className="h-3 w-3" />}
                    {plan.badge}
                  </div>
                )}

                <h3 className="text-lg font-semibold leading-snug">{plan.name}</h3>
                {plan.tagline && <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>}

                {isExecutionTier && (
                  <p className="text-xs text-amber-600/80 mt-0.5 italic">
                    {isDE
                      ? "Für Gründer, die echtes Kapital und echtes Risiko managen."
                      : "For founders managing real capital and real risk."}
                  </p>
                )}

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                {isYearly && plan.tier !== "free" && (
                  <p className="mt-1 text-xs text-emerald-600 font-medium">
                    {isDE ? "15% gespart vs. monatlich" : "Save 15% vs. monthly"}
                  </p>
                )}

                {plan.highlighted && (
                  <p className="mt-2 text-xs text-accent font-medium">
                    {isDE
                      ? `= ${(getPrice("builder") / 30).toFixed(2).replace(".", ",")} €/Tag · Spart ∅ 3.200 € Fehlerkosten`
                      : `= €${(getPrice("builder") / 30).toFixed(2)}/day · Saves avg. €3,200 in mistakes`}
                  </p>
                )}

                {isExecutionTier && (
                  <p className="mt-2 text-xs text-amber-600 font-medium">
                    {isDE
                      ? `= ${(getPrice("execution") / 30).toFixed(2).replace(".", ",")} €/Tag · Kapitalschutz für echte Gründer`
                      : `= €${(getPrice("execution") / 30).toFixed(2)}/day · Capital protection for real founders`}
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

                {plan.roiText && (
                  <p className="mt-3 text-[11px] text-center text-muted-foreground leading-relaxed">{plan.roiText}</p>
                )}
                {plan.anchor && (
                  <p className="mt-2 text-xs text-center text-muted-foreground italic">{plan.anchor}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-2">{isDE ? "Feature-Vergleich" : "Feature Comparison"}</h3>
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
                {(isDE
                  ? [
                      ["Market Reality Engine", "—", "Basis Demand", "Voll + Benchmark", "✓ Voll"],
                      ["Cashflow Survival Engine", "—", "Timeline", "Voll + Stress-Test", "✓ Voll"],
                      ["Stress Test Simulation", "—", "—", "✓ + Worst Case", "✓ Voll"],
                      ["AI Founder Copilot", "—", "3 Empfehlungen", "Voll + Chat", "Advanced CEO-Level"],
                      ["Business Recovery Mode", "—", "—", "✓ Voll", "✓ Voll"],
                      ["Kosten-Kalkulator", "Einfach", "Voll", "Voll + Szenarien", "✓ Voll"],
                      ["Kapitalschutz-Alerts", "—", "—", "—", "✓ Echtzeit"],
                      ["Benchmark Intelligence", "—", "—", "—", "✓ Anonymer Vergleich"],
                      ["Execution Planner", "—", "—", "—", "✓ Wöchentlich"],
                      ["Investor-Ready Reports", "—", "—", "—", "✓ Reports"],
                      ["Advanced Copilot", "—", "—", "—", "✓ CEO-Level"],
                    ]
                  : [
                      ["Market Reality Engine", "—", "Basic Demand", "Full + Benchmark", "✓ Full"],
                      ["Cashflow Survival Engine", "—", "Timeline", "Full + Stress Test", "✓ Full"],
                      ["Stress Test Simulation", "—", "—", "✓ + Worst Case", "✓ Full"],
                      ["AI Founder Copilot", "—", "3 Suggestions", "Full + Chat", "Advanced CEO-Level"],
                      ["Business Recovery Mode", "—", "—", "✓ Full", "✓ Full"],
                      ["Cost Calculator", "Basic", "Full", "Full + Scenarios", "✓ Full"],
                      ["Capital Protection Alerts", "—", "—", "—", "✓ Real-time"],
                      ["Benchmark Intelligence", "—", "—", "—", "✓ Anonymous Comparison"],
                      ["Execution Planner", "—", "—", "—", "✓ Weekly"],
                      ["Investor-Ready Reports", "—", "—", "—", "✓ Reports"],
                      ["Advanced Copilot", "—", "—", "—", "✓ CEO-Level"],
                    ]
                ).map(([feature, free, builder, pro, execution]) => (
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
          <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
            {isDE ? "Für Gründer, die echtes Kapital und echtes Risiko managen." : "For founders managing real capital and real risk."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-xs">
            {(isDE
              ? ["Wöchentliche KPI-Kontrolle", "Kapitalschutz-Alerts", "Strategische Benchmark Intelligence", "Investor-Ready Übersicht"]
              : ["Weekly KPI control", "Capital protection alerts", "Strategic benchmark intelligence", "Investor-ready overview"]
            ).map((bullet) => (
              <span
                key={bullet}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-amber-700"
              >
                <Shield className="h-3 w-3" />
                {bullet}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">€8.000–€20.000</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isDE ? "Eine falsche Produktionsentscheidung" : "One wrong production decision"}
              </p>
            </div>
            <span className="text-2xl text-muted-foreground">vs.</span>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {formatPrice(getPrice("execution"))}
                <span className="text-base font-normal text-muted-foreground">/{isDE ? "Mo." : "mo."}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Execution OS</p>
            </div>
          </div>
        </div>

        {/* Trust elements */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {(isDE
            ? [
                { emoji: "🔒", label: "DSGVO-konform", desc: "Daten in der EU gehostet" },
                { emoji: "⚡", label: "Sofort starten", desc: "Kein Setup, keine Wartezeit" },
                { emoji: "🎯", label: "Made in Germany", desc: "Für den deutschen Markt optimiert" },
              ]
            : [
                { emoji: "🔒", label: "GDPR Compliant", desc: "Data hosted in the EU" },
                { emoji: "⚡", label: "Start instantly", desc: "No setup, no waiting" },
                { emoji: "🎯", label: "Made in Germany", desc: "Optimized for the German market" },
              ]
          ).map(({ emoji, label, desc }) => (
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
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">✓ {isDE ? "Jederzeit kündbar" : "Cancel anytime"}</span>
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">🔒 {isDE ? "Transparente Preise" : "Transparent pricing"}</span>
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