import { GuideLayout } from "@/components/GuideLayout";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const faq = [
  { q: "Was sind die häufigsten Produktionsfehler?", a: "Falsche MOQ-Einschätzung, keine Samples bestellt, unklare Specs, fehlende Qualitätskontrolle und zu optimistische Zeitplanung." },
  { q: "Wie schütze ich mich vor schlechter Qualität?", a: "Immer Samples bestellen, Qualitätskriterien schriftlich festlegen, unabhängige Inspektion bei größeren Bestellungen." },
  { q: "Was kostet ein Produktionsfehler?", a: "Typisch 2.000-10.000 € für eine verlorene Bestellung. Bei komplexen Produkten deutlich mehr." },
];
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) };

export default function ProduktionsfehlerVermeiden() {
  return (
    <GuideLayout title="Produktionsfehler vermeiden" seoTitle="Produktionsfehler vermeiden – Die 10 teuersten Fehler" seoDescription="Vermeide die 10 teuersten Produktionsfehler bei Eigenmarken. Lerne, wie du Qualität sicherst und dein Kapital schützt." path="/guide/produktionsfehler-vermeiden" breadcrumbs={[{ name: "Home", href: "/" }, { name: "Guide", href: "/guide/eigenmarke-gruenden" }, { name: "Produktionsfehler", href: "/guide/produktionsfehler-vermeiden" }]} jsonLd={faqJsonLd}>
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">Produktionsfehler vermeiden – <span className="text-gradient">Die 10 teuersten Fehler</span></h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Ein einziger Produktionsfehler kann 5.000 €+ kosten. Hier lernst du, welche Fehler am häufigsten passieren und wie du sie systematisch vermeidest.</p>

      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4">Die Top 5 Fehler</h2>
        <div className="space-y-3">
          {[
            { title: "Keine Samples bestellt", desc: "Niemals eine Großbestellung ohne vorherige Sample-Prüfung aufgeben." },
            { title: "Unklare Produktspezifikationen", desc: "Jedes Detail schriftlich festhalten: Maße, Farben, Materialien, Toleranzen." },
            { title: "MOQ-Risiko unterschätzt", desc: "Zu hohe Erstbestellung bindet Kapital und erhöht das Verlustrisiko." },
            { title: "Keine Qualitätskontrolle", desc: "Besonders bei Asien-Sourcing: unabhängige Pre-Shipment Inspection einplanen." },
            { title: "Zeitplan zu optimistisch", desc: "Puffer von mindestens 2-4 Wochen für Verzögerungen einplanen." },
          ].map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div><p className="font-semibold text-sm">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground leading-relaxed mt-4">Nutze den <Link to="/tools/moq-rechner" className="text-accent underline underline-offset-4">MOQ-Rechner</Link> und den <Link to="/tools/produktionskosten-rechner" className="text-accent underline underline-offset-4">Produktionskosten-Rechner</Link> um Risiken zu quantifizieren.</p>
      </section>

      <section><h2 className="text-2xl font-bold mb-6">FAQ</h2><div className="space-y-4">{faq.map(({ q, a }) => <details key={q} className="group rounded-xl border bg-card p-4"><summary className="cursor-pointer font-semibold list-none flex items-center justify-between">{q}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span></summary><p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p></details>)}</div></section>
    </GuideLayout>
  );
}
