import { TrendingUp, Star, Users, BarChart3, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function SocialProofSection() {
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  const stats = [
    {
      icon: Users,
      value: "2.400+",
      label: isDE ? "Aktive Gründer" : "Active founders",
      desc: isDE ? "Nutzen BuildYourBrand für ihren Launch" : "Using BuildYourBrand for their launch",
    },
    {
      icon: BarChart3,
      value: "840+",
      label: isDE ? "Marken gestartet" : "Brands launched",
      desc: isDE ? "Erfolgreich über die Plattform aufgebaut" : "Successfully built through the platform",
    },
    {
      icon: TrendingUp,
      value: "+18%",
      label: isDE ? "Ø Margen-Verbesserung" : "Avg. margin improvement",
      desc: isDE ? "Durch datenbasierte Optimierung" : "Through data-driven optimization",
    },
    {
      icon: ShieldCheck,
      value: "€3.200",
      label: isDE ? "Ø Fehlerkosten gespart" : "Avg. mistake costs saved",
      desc: isDE ? "Pro Gründer durch Risiko-Analyse" : "Per founder through risk analysis",
    },
  ];

  const testimonials = [
    {
      name: "Lisa K.",
      role: isDE ? "Gründerin, Skincare Brand" : "Founder, Skincare Brand",
      quote: isDE
        ? "Der Break-Even Rechner hat mir gezeigt, dass meine Preiskalkulation komplett falsch war. Das hat mir mindestens €4.000 gespart."
        : "The break-even calculator showed me my pricing was completely wrong. That saved me at least €4,000.",
      metric: isDE ? "Marge von 18% auf 42% optimiert" : "Margin optimized from 18% to 42%",
    },
    {
      name: "Marco T.",
      role: isDE ? "E-Commerce Gründer" : "E-Commerce Founder",
      quote: isDE
        ? "Ohne den Cashflow Predictor hätte ich mein Marketing-Budget viel zu hoch angesetzt. Der Runway war nur 2 Monate."
        : "Without the cashflow predictor, I would have set my marketing budget way too high. My runway was only 2 months.",
      metric: isDE ? "Insolvenzrisiko um 60% reduziert" : "Insolvency risk reduced by 60%",
    },
    {
      name: "Sarah M.",
      role: isDE ? "Private Label Gründerin" : "Private Label Founder",
      quote: isDE
        ? "Die Supplier Risk Analyse hat mich davon abgehalten, einen Lieferanten mit katastrophalen Lieferzeiten zu wählen."
        : "The supplier risk analysis stopped me from choosing a supplier with catastrophic lead times.",
      metric: isDE ? "3 Monate Lieferverzögerung vermieden" : "3 months of delivery delays avoided",
    },
  ];

  return (
    <section className="border-t px-4 py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium mb-4">
            <Star className="h-3.5 w-3.5 text-accent" />
            {isDE ? "Vertraut von deutschen Gründern" : "Trusted by German founders"}
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">
            {isDE ? "Gründer vertrauen auf Daten" : "Founders trust data"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {isDE
              ? "BuildYourBrand hilft Gründern in DACH, teure Fehler zu vermeiden und datenbasiert zu launchen."
              : "BuildYourBrand helps DACH founders avoid costly mistakes and launch with data-backed decisions."}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-6 text-center shadow-card">
              <s.icon className="h-6 w-6 mx-auto text-accent mb-3" />
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="font-semibold text-sm mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic mb-4">"{t.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent">
                  {t.metric}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium hover:border-accent/40 transition-colors"
          >
            {isDE ? "Alle Case Studies lesen →" : "Read all case studies →"}
          </Link>
        </div>
      </div>
    </section>
  );
}
