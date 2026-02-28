import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, TrendingUp, Package, Target, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CaseStudy {
  slug: string;
  title: string;
  founder: string;
  background: string;
  problem: string;
  strategy: string;
  tools: string[];
  metricsBefore: Record<string, string>;
  metricsAfter: Record<string, string>;
  revenue: string;
  quote: string;
}

const caseStudies: CaseStudy[] = [
  {
    slug: "skincare-launch",
    title: "Von 0 auf 12.000€ MRR – Naturkosmetik Eigenmarke",
    founder: "Lisa M., Gründerin NaturGlow",
    background: "Marketing-Managerin mit 5 Jahren Erfahrung, keine E-Commerce-Erfahrung.",
    problem: "Hatte 3 Monate mit Excel-Tabellen geplant, aber keinen Überblick über tatsächliche Kosten und Risiken. Fast 6.000€ in falsche Verpackung investiert.",
    strategy: "BuildYourBrand genutzt, um Produktionskosten zu kalkulieren, MOQ zu verhandeln und den Launch mit dem 30-Tage-Plan zu strukturieren.",
    tools: ["Produktionskosten-Rechner", "MOQ-Kalkulator", "Launch-Roadmap", "Risiko-Analyse"],
    metricsBefore: { "Planungszeit": "3 Monate", "Fehlkosten": "6.200€", "Klarheit": "Gering" },
    metricsAfter: { "Planungszeit": "2 Wochen", "Fehlkosten": "0€", "Klarheit": "Vollständig" },
    revenue: "12.400€ MRR nach 6 Monaten",
    quote: "Ohne BuildYourBrand hätte ich vermutlich noch einmal 5.000€ in vermeidbare Fehler investiert. Das Tool hat mir den Durchblick gegeben, den ich brauchte.",
  },
  {
    slug: "supplements-growth",
    title: "Supplements Brand: Break-Even in 8 Wochen",
    founder: "Marco T., Gründer VitalForce",
    background: "Fitness-Trainer mit großer Social-Media-Community, wollte eigene Supplement-Marke launchen.",
    problem: "Wusste nicht, welche MOQ realistisch ist, und hatte keinen Plan für Compliance und Label-Vorschriften in Deutschland.",
    strategy: "Nutzte den Break-Even-Rechner, um die optimale Erstbestellung zu berechnen, und den Compliance-Check für deutsche Label-Vorschriften.",
    tools: ["Break-Even-Rechner", "Compliance-Check", "Lieferanten-Vergleich", "Budget-Planer"],
    metricsBefore: { "Startkapital": "Unklar", "Compliance": "Unbekannt", "Launch-Plan": "Keiner" },
    metricsAfter: { "Startkapital": "8.500€ kalkuliert", "Compliance": "100% konform", "Launch-Plan": "30-Tage-Roadmap" },
    revenue: "Break-Even nach 8 Wochen",
    quote: "Der Break-Even-Rechner war ein Game-Changer. Ich wusste sofort, ab welcher Stückzahl sich die Produktion lohnt.",
  },
  {
    slug: "home-deco-pivot",
    title: "Home-Deco Marke: 40% weniger Produktionskosten",
    founder: "Anna & Stefan K., arthaus living",
    background: "Design-Duo, das handgefertigte Deko-Produkte über Etsy verkaufte und auf Eigenproduktion umsteigen wollte.",
    problem: "Lieferantenangebote waren intransparent, Produktionskosten variierten um bis zu 200% zwischen Anbietern.",
    strategy: "Supplier-Vergleichsmatrix und Szenario-Simulator genutzt, um den optimalen Lieferanten zu identifizieren und Kosten um 40% zu senken.",
    tools: ["Supplier-Vergleich", "Szenario-Simulator", "Produktionskosten-Rechner", "Verhandlungsstrategie"],
    metricsBefore: { "Stückkosten": "14,20€", "Lieferanten": "1 (teuer)", "Marge": "22%" },
    metricsAfter: { "Stückkosten": "8,50€", "Lieferanten": "3 verglichen", "Marge": "48%" },
    revenue: "40% Kostensenkung, 26% höhere Marge",
    quote: "Die Supplier-Matrix hat uns Tausende gespart. Wir hätten nie gewusst, dass unser erster Lieferant so viel teurer war.",
  },
];

function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <article className="rounded-2xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b">
        <h2 className="text-xl font-bold mb-2">{study.title}</h2>
        <p className="text-sm text-accent font-medium">{study.founder}</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Background & Problem */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Hintergrund</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{study.background}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Problem</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{study.problem}</p>
          </div>
        </div>

        {/* Strategy */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Strategie</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{study.strategy}</p>
        </div>

        {/* Tools Used */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Tools genutzt</h3>
          <div className="flex flex-wrap gap-2">
            {study.tools.map(t => (
              <span key={t} className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">{t}</span>
            ))}
          </div>
        </div>

        {/* Metrics Before / After */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4 bg-muted/30">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3">Vorher</h3>
            {Object.entries(study.metricsBefore).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-4 bg-accent/5 border-accent/20">
            <h3 className="text-xs font-semibold uppercase text-accent tracking-wide mb-3">Nachher</h3>
            {Object.entries(study.metricsAfter).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-bold text-accent">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="flex items-center gap-3 rounded-lg bg-accent/5 border border-accent/20 p-4">
          <TrendingUp className="h-5 w-5 text-accent shrink-0" />
          <span className="text-sm font-bold text-accent">{study.revenue}</span>
        </div>

        {/* Quote */}
        <div className="flex gap-4 items-start">
          <Quote className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm italic text-foreground leading-relaxed mb-1">{study.quote}</p>
            <p className="text-xs text-muted-foreground">— {study.founder}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CaseStudies() {
  const navigate = useNavigate();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wie hilft BuildYourBrand bei der Markenentwicklung?",
        acceptedAnswer: { "@type": "Answer", text: "BuildYourBrand bietet datenbasierte Tools zur Kalkulation von Produktionskosten, Break-Even-Analyse, Lieferantenvergleich und Launch-Planung." },
      },
      {
        "@type": "Question",
        name: "Welche Ergebnisse erzielen Gründer mit BuildYourBrand?",
        acceptedAnswer: { "@type": "Answer", text: "Gründer berichten von bis zu 40% geringeren Produktionskosten, Break-Even in 8 Wochen und strukturierteren Launches." },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Case Studies – Echte Gründer, echte Ergebnisse | BuildYourBrand"
        description="Entdecke, wie Gründer mit BuildYourBrand ihre Eigenmarke erfolgreich gestartet haben. Echte Zahlen, echte Strategien."
        path="/case-studies"
      />
      <Navbar />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-3xl">
          <section className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
              Echte Gründer.{" "}
              <span className="text-gradient">Echte Ergebnisse.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Erfahre, wie andere Gründer mit BuildYourBrand ihre Marke aufgebaut haben – mit konkreten Zahlen und Strategien.
            </p>
          </section>

          <div className="space-y-8">
            {caseStudies.map(study => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </div>

          {/* CTA */}
          <section className="mt-14 rounded-2xl border bg-card p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold mb-3">Starte dein eigenes Projekt</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Teste BuildYourBrand kostenlos und kalkuliere dein Vorhaben datenbasiert – wie die Gründer in unseren Case Studies.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
              onClick={() => navigate("/auth?tab=signup")}
            >
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
