import {
  Lightbulb,
  Palette,
  Calculator,
  Factory,
  Shield,
  ShoppingBag,
  Rocket,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();

  const steps = [
    { icon: Lightbulb, step: "01", title: t("features.s1"), desc: t("features.s1d") },
    { icon: Palette, step: "02", title: t("features.s2"), desc: t("features.s2d") },
    { icon: Calculator, step: "03", title: t("features.s3"), desc: t("features.s3d") },
    { icon: Factory, step: "04", title: t("features.s4"), desc: t("features.s4d") },
    { icon: Shield, step: "05", title: t("features.s5"), desc: t("features.s5d") },
    { icon: ShoppingBag, step: "06", title: t("features.s6"), desc: t("features.s6d") },
    { icon: Rocket, step: "07", title: t("features.s7"), desc: t("features.s7d") },
  ];

  return (
    <section id="features" className="border-t px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("features.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("features.subtitle")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, desc }, i) => (
            <div
              key={step}
              className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-accent/30"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-mono font-medium">
                  {step}
                </div>
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
