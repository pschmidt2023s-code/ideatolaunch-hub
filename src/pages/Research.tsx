import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, FileText, Download, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { AuthorBox } from "@/components/AuthorBox";

const reportJsonLd = {
  "@context": "https://schema.org",
  "@type": "Report",
  "name": "State of German Private Label 2026",
  "author": { "@type": "Organization", "name": "BuildYourBrand" },
  "datePublished": "2026-01-15",
  "description": "Umfassender Marktbericht über den deutschen Private-Label-Markt 2026 mit Daten zu Marktgröße, Trends und Erfolgsfaktoren.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Wie groß ist der Private-Label-Markt in Deutschland?", "acceptedAnswer": { "@type": "Answer", "text": "Der deutsche Private-Label-Markt erreicht 2026 ein Volumen von über 45 Milliarden Euro, mit einem jährlichen Wachstum von 8,5% im D2C-Segment." } },
    { "@type": "Question", "name": "Welche Kategorien wachsen am stärksten?", "acceptedAnswer": { "@type": "Answer", "text": "Naturkosmetik (+23%), Nahrungsergänzungsmittel (+18%) und nachhaltige Haushaltsprodukte (+15%) zeigen das stärkste Wachstum." } },
  ]
};

const stats = [
  { value: "45 Mrd. €", label: "Marktvolumen Private Label DE", sub: "2026 Prognose" },
  { value: "8,5%", label: "D2C-Wachstum p.a.", sub: "vs. 2,1% Gesamtmarkt" },
  { value: "67%", label: "der Gründer scheitern", sub: "an vermeidbaren Fehlern" },
  { value: "3.200 €", label: "∅ Produktionsfehler-Kosten", sub: "erster Bestellung" },
];

const insights = [
  { icon: TrendingUp, title: "Naturkosmetik +23%", desc: "Stärkstes Wachstum aller Kategorien im DACH-Raum. Besonders Clean Beauty und vegane Produkte." },
  { icon: BarChart3, title: "MOQ sinkt um 40%", desc: "Durch Print-on-Demand und Micro-Batch Produktion werden Eigenmarken für Solo-Gründer zugänglich." },
  { icon: FileText, title: "Compliance-Kosten +12%", desc: "Neue EU-Verordnungen erhöhen die Anforderungen an Produktkennzeichnung und Inhaltsstoff-Dokumentation." },
];

export default function Research() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Research & Reports – Private Label Marktdaten 2026"
        description="Datenbasierte Insights zum deutschen Private-Label-Markt. Kostenlose Reports, Statistiken und Branchenanalysen für Gründer."
        path="/research"
        jsonLd={[reportJsonLd, faqJsonLd]}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Research", url: "/research" }]}
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-4xl">
          <section className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Research & Reports</span>
            <h1 className="text-3xl font-bold mt-3 md:text-5xl">State of German Private Label 2026</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Datenbasierte Insights für Gründer, die ihre Eigenmarke strategisch aufbauen wollen.
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl border bg-card p-6 text-center">
                <p className="text-3xl font-bold text-accent">{s.value}</p>
                <p className="text-sm font-medium mt-1">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Branchen-Insights 2026</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {insights.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border bg-card p-6">
                  <Icon className="h-5 w-5 text-accent mb-3" />
                  <h3 className="font-bold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16 rounded-2xl border bg-card p-8 md:p-12 text-center">
            <Download className="h-8 w-8 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Vollständigen Report herunterladen</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              40+ Seiten Marktdaten, Trend-Analysen und Handlungsempfehlungen für deinen Markenaufbau.
            </p>
            <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => { trackEvent("research_download_click"); navigate("/auth?tab=signup"); }}>
              Kostenlos herunterladen <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-3">E-Mail-Adresse erforderlich. Kein Spam.</p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-4">FAQ</h2>
            {[
              { q: "Wie groß ist der Private-Label-Markt in Deutschland?", a: "Der deutsche Private-Label-Markt erreicht 2026 ein Volumen von über 45 Milliarden Euro, mit einem jährlichen Wachstum von 8,5% im D2C-Segment." },
              { q: "Welche Kategorien wachsen am stärksten?", a: "Naturkosmetik (+23%), Nahrungsergänzungsmittel (+18%) und nachhaltige Haushaltsprodukte (+15%) zeigen das stärkste Wachstum." },
            ].map(({ q, a }) => (
              <details key={q} className="border-b py-3 group">
                <summary className="cursor-pointer font-medium text-sm group-open:text-accent">{q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
              </details>
            ))}
          </section>

          <AuthorBox />
        </div>
      </main>
      <Footer />
    </div>
  );
}
