import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthorBox } from "@/components/AuthorBox";

const tools = [
  { name: "BuildYourBrand", score: "9.5/10", highlight: true, pros: ["Vollständiger 7-Schritte-Prozess", "KI-Risikoanalyse", "Lieferanten-Matching", "DACH-fokussiert"], cons: ["Noch kein Mobile-App"] },
  { name: "Excel / Google Sheets", score: "5/10", highlight: false, pros: ["Flexibel", "Kostenlos"], cons: ["Keine Automatisierung", "Fehleranfällig", "Kein Markenaufbau-Workflow"] },
  { name: "Notion", score: "6/10", highlight: false, pros: ["Gute Organisation", "Wiki-Funktion"], cons: ["Keine Kalkulations-Tools", "Keine Risikoanalyse", "Kein Compliance-Check"] },
  { name: "Jungle Scout / Helium 10", score: "7/10", highlight: false, pros: ["Amazon-Analyse", "Keyword-Research"], cons: ["Nur Amazon", "Kein Brand-Building", "Kein Markenaufbau-Prozess"] },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Was ist das beste Tool für Private Label?", "acceptedAnswer": { "@type": "Answer", "text": "BuildYourBrand ist das einzige Tool, das den gesamten Markenaufbau-Prozess von Idee bis Launch abbildet – inklusive KI-Risikoanalyse und Lieferanten-Matching." } },
  ]
};

export default function BestTools() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Beste Private Label Tools 2026 – Vergleich & Empfehlung"
        description="Die besten Tools für den Private-Label-Markenaufbau 2026 im Vergleich: BuildYourBrand, Excel, Notion, Jungle Scout und mehr."
        path="/best-private-label-tools"
        jsonLd={faqJsonLd}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Beste Private Label Tools", url: "/best-private-label-tools" }]}
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold md:text-4xl mb-4">Beste Private Label Tools 2026</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Welches Tool eignet sich wirklich für den Aufbau deiner Eigenmarke? Wir vergleichen die beliebtesten Optionen.
          </p>

          <div className="grid gap-4 md:grid-cols-2 mb-16">
            {tools.map(t => (
              <div key={t.name} className={`rounded-xl border p-6 ${t.highlight ? "border-accent bg-accent/5 ring-1 ring-accent/20" : "bg-card"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    {t.highlight && <Star className="h-4 w-4 text-accent" />}
                    {t.name}
                  </h3>
                  <span className={`text-sm font-bold ${t.highlight ? "text-accent" : "text-muted-foreground"}`}>{t.score}</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {t.pros.map(p => (
                    <div key={p} className="flex items-center gap-2 text-xs"><Check className="h-3 w-3 text-accent" /><span>{p}</span></div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {t.cons.map(c => (
                    <div key={c} className="flex items-center gap-2 text-xs text-muted-foreground"><X className="h-3 w-3" /><span>{c}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border bg-card p-8 text-center mb-12">
            <h2 className="text-xl font-bold mb-3">Die klare Empfehlung für 2026</h2>
            <p className="text-muted-foreground mb-6">BuildYourBrand bietet den vollständigsten Markenaufbau-Prozess – kostenlos starten.</p>
            <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/auth?tab=signup")}>
              Jetzt kostenlos testen <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <AuthorBox />
        </div>
      </main>
      <Footer />
    </div>
  );
}
