import {
  Lightbulb,
  Palette,
  Calculator,
  Factory,
  Shield,
  ShoppingBag,
  Rocket,
} from "lucide-react";

const steps = [
  { icon: Lightbulb, step: "01", title: "Ideen-Fundament", desc: "Definiere dein Produkt, Zielgruppe und Positionierung." },
  { icon: Palette, step: "02", title: "Markenstruktur", desc: "Name, Tonalität, visuelle Richtung und Tagline." },
  { icon: Calculator, step: "03", title: "Business-Kalkulator", desc: "Kosten, Preise, Margen und Break-even berechnen." },
  { icon: Factory, step: "04", title: "Produktionsplanung", desc: "Checklisten, Lieferantenfragen und Risikoanalyse." },
  { icon: Shield, step: "05", title: "Verpackung & Compliance", desc: "Labelanforderungen, rechtliche Hinweise, Barcode-Guide." },
  { icon: ShoppingBag, step: "06", title: "Vertriebsbasis", desc: "Vertriebskanal, Logistik und Launch-Readiness." },
  { icon: Rocket, step: "07", title: "Launch-Roadmap", desc: "30-Tage-Plan mit Aufgaben, Content und Budget." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            7 Schritte zur fertigen Marke
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ein strukturierter Workflow, der dich von der Idee bis zum Launch begleitet.
          </p>
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
