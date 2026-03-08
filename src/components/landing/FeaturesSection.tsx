import {
  Lightbulb,
  Calculator,
  Factory,
  Shield,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function FeaturesSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isDE = i18n.language === "de";
  const { ref, isVisible } = useScrollReveal();

  const steps = [
    {
      icon: Lightbulb,
      step: "01",
      title: t("features.s1"),
      desc: t("features.s1d"),
      output: isDE ? "→ Markenprofil + Positionierung" : "→ Brand profile + positioning",
    },
    {
      icon: Calculator,
      step: "02",
      title: t("features.s2"),
      desc: t("features.s2d"),
      output: isDE ? "→ Finanzmodell + Break-Even" : "→ Financial model + break-even",
    },
    {
      icon: Factory,
      step: "03",
      title: t("features.s3"),
      desc: t("features.s3d"),
      output: isDE ? "→ Produktionsplan + MOQ-Analyse" : "→ Production plan + MOQ analysis",
    },
    {
      icon: Shield,
      step: "04",
      title: t("features.s4"),
      desc: t("features.s4d"),
      output: isDE ? "→ Compliance-Score + Checklisten" : "→ Compliance score + checklists",
    },
    {
      icon: Rocket,
      step: "05",
      title: t("features.s5"),
      desc: t("features.s5d"),
      output: isDE ? "→ Launch-Roadmap + Readiness Score" : "→ Launch roadmap + readiness score",
    },
  ];

  return (
    <section id="features" className="border-t px-4 sm:px-6 section-py md:py-32">
      <div className="mx-auto max-w-5xl" ref={ref}>
        <div className={`mb-16 text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {isDE ? "5 Phasen zum Launch" : "5 phases to launch"}
          </div>
          <h2 className="text-3xl font-bold font-display md:text-4xl">{t("features.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("features.subtitle")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, desc, output }, i) => (
            <div
              key={step}
              className={`group relative rounded-2xl border bg-card p-6 card-interactive transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: isVisible ? `${i * 100 + 200}ms` : "0ms" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-mono font-medium">
                  {step}
                </div>
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="mb-1 text-lg font-semibold font-display">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{desc}</p>
              <p className="text-xs font-medium text-primary">{output}</p>
            </div>
          ))}
        </div>

        {/* CTA below features */}
        <div className={`mt-12 text-center transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Button
            size="lg"
            className="gap-2 hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => navigate("/auth?tab=signup")}
          >
            {isDE ? "Jetzt kostenlos starten" : "Start free now"}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {isDE ? "Keine Kreditkarte nötig · Sofort loslegen" : "No credit card required · Start immediately"}
          </p>
        </div>
      </div>
    </section>
  );
}
