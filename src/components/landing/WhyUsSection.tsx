import { Zap, Shield, BarChart3, Heart } from "lucide-react";

export function WhyUsSection() {
  const reasons = [
    {
      icon: Zap,
      title: "Alles in einem System",
      desc: "Kein Wechsel zwischen Excel, Notion und 5 verschiedenen Rechnern. Ein Workflow für alles.",
    },
    {
      icon: BarChart3,
      title: "Datengetriebene Entscheidungen",
      desc: "KI-Risikoanalyse und Szenario-Simulation statt Bauchgefühl.",
    },
    {
      icon: Shield,
      title: "Fehler vermeiden, bevor sie teuer werden",
      desc: "Typische Produktionsfehler kosten 5.000 €+. Wir erkennen Risiken vorher.",
    },
    {
      icon: Heart,
      title: "Für deutsche Gründer gebaut",
      desc: "DSGVO-konform, EU-gehostet, mit deutschen Compliance-Checks.",
    },
  ];

  return (
    <section className="border-t px-4 sm:px-6 section-py md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display md:text-4xl">
            Warum <span className="text-gradient">BuildYourBrand</span>?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Was uns von Excel, Notion und generischen Tools unterscheidet.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border bg-card p-6 shadow-card"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
