import { Zap, Shield, BarChart3, Heart, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function WhyUsSection() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isDE = i18n.language === "de";

  const reasons = [
    {
      icon: Zap,
      title: isDE ? "Alles in einem System" : "All-in-one system",
      desc: isDE ? "Kein Wechsel zwischen Excel, Notion und 5 verschiedenen Rechnern. Ein Workflow für alles." : "No switching between Excel, Notion, and 5 different calculators.",
      metric: isDE ? "Ø 4h/Woche gespart" : "Avg. 4h/week saved",
    },
    {
      icon: BarChart3,
      title: isDE ? "Datengetriebene Entscheidungen" : "Data-driven decisions",
      desc: isDE ? "KI-Risikoanalyse und Szenario-Simulation statt Bauchgefühl." : "AI risk analysis and scenario simulation instead of gut feeling.",
      metric: isDE ? "+18% Marge" : "+18% margin",
    },
    {
      icon: Shield,
      title: isDE ? "Fehler vermeiden, bevor sie teuer werden" : "Prevent mistakes before they cost you",
      desc: isDE ? "Typische Produktionsfehler kosten 5.000 €+. Wir erkennen Risiken vorher." : "Typical production mistakes cost €5,000+. We detect risks early.",
      metric: isDE ? "Ø €3.200 gespart" : "Avg. €3,200 saved",
    },
    {
      icon: Heart,
      title: isDE ? "Für deutsche Gründer gebaut" : "Built for German founders",
      desc: isDE ? "DSGVO-konform, EU-gehostet, mit deutschen Compliance-Checks." : "GDPR compliant, EU-hosted, with German compliance checks.",
      metric: isDE ? "100% DSGVO" : "100% GDPR",
    },
  ];

  return (
    <section className="border-t px-4 sm:px-6 section-py md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display md:text-4xl">
            {isDE ? "Warum" : "Why"} <span className="text-gradient">BuildYourBrand</span>?
          </h2>
          <p className="mt-3 text-muted-foreground">
            {isDE ? "Was uns von Excel, Notion und generischen Tools unterscheidet." : "What sets us apart from Excel, Notion, and generic tools."}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {reasons.map(({ icon: Icon, title, desc, metric }) => (
            <div
              key={title}
              className="group flex gap-4 rounded-2xl border bg-card p-6 shadow-card card-interactive"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold font-display">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{desc}</p>
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-bold text-success">
                  {metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
