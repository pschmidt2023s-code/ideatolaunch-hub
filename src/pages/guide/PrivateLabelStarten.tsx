import { GuideLayout } from "@/components/GuideLayout";
import { Link } from "react-router-dom";

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Was ist Private Label?", "acceptedAnswer": { "@type": "Answer", "text": "Private Label bedeutet, ein Produkt nach eigenen Spezifikationen von einem Hersteller produzieren und unter deiner eigenen Marke verkaufen zu lassen." } },
    { "@type": "Question", "name": "Wie viel Startkapital brauche ich?", "acceptedAnswer": { "@type": "Answer", "text": "Abhängig von Produktkategorie und MOQ typischerweise 3.000-15.000 € für die erste Bestellung inklusive Verpackung und Branding." } },
    { "@type": "Question", "name": "Welche Produkte eignen sich für Private Label?", "acceptedAnswer": { "@type": "Answer", "text": "Produkte mit hoher Nachfrage, wenig Regulierung und guter Marge: Supplements, Kosmetik, Textilien, Accessoires, Food-Produkte." } },
  ]
};

export default function PrivateLabelStarten() {
  return (
    <GuideLayout
      title="Private Label starten" seoTitle="Private Label starten – Komplettanleitung 2026"
      seoDescription="Starte dein Private Label Business: Von der Produktauswahl über Lieferantensuche bis zum ersten Verkauf. Schritt-für-Schritt Guide."
      path="/guide/private-label-starten"
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "Guide", href: "/guide/eigenmarke-gruenden" }, { name: "Private Label starten", href: "/guide/private-label-starten" }]}
      jsonLd={faqJsonLd}
    >
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">Private Label starten – <span className="text-gradient">Komplettanleitung 2026</span></h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Private Label ist der profitabelste Weg, eine eigene Marke aufzubauen. Du kontrollierst Produkt, Branding und Marge – ohne eigene Produktion. Dieser Guide zeigt dir den kompletten Weg.</p>

      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4">Was ist Private Label?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Private Label bedeutet, ein Produkt nach deinen Spezifikationen von einem Hersteller produzieren zu lassen und unter deiner eigenen Marke zu verkaufen. Anders als beim Reselling kontrollierst du Qualität, Design und Preisgestaltung vollständig.</p>
        <p className="text-muted-foreground leading-relaxed">Mehr über die Unterschiede und die Gesamtstrategie im <Link to="/guide/eigenmarke-gruenden" className="text-accent underline underline-offset-4 hover:text-accent/80">Eigenmarke gründen Guide</Link>.</p>
      </section>

      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4">Private Label vs. White Label vs. Reselling</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm"><thead><tr className="border-b bg-muted/50"><th className="px-4 py-3 text-left font-semibold">Modell</th><th className="px-4 py-3 text-left font-semibold">Kontrolle</th><th className="px-4 py-3 text-left font-semibold">Marge</th><th className="px-4 py-3 text-left font-semibold">Aufwand</th></tr></thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b"><td className="px-4 py-3 font-medium text-foreground">Private Label</td><td className="px-4 py-3">Hoch</td><td className="px-4 py-3">50-70%</td><td className="px-4 py-3">Hoch</td></tr>
            <tr className="border-b"><td className="px-4 py-3 font-medium text-foreground">White Label</td><td className="px-4 py-3">Mittel</td><td className="px-4 py-3">30-50%</td><td className="px-4 py-3">Niedrig</td></tr>
            <tr><td className="px-4 py-3 font-medium text-foreground">Reselling</td><td className="px-4 py-3">Gering</td><td className="px-4 py-3">10-30%</td><td className="px-4 py-3">Sehr niedrig</td></tr>
          </tbody></table>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4">Deine nächsten Schritte</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Nutze unsere kostenlosen Tools für eine schnelle Einschätzung:</p>
        <ul className="space-y-2 text-muted-foreground">
          <li>→ <Link to="/tools/produktionskosten-rechner" className="text-accent underline underline-offset-4">Produktionskosten berechnen</Link></li>
          <li>→ <Link to="/tools/moq-rechner" className="text-accent underline underline-offset-4">MOQ-Risiko bewerten</Link></li>
          <li>→ <Link to="/tools/break-even-rechner" className="text-accent underline underline-offset-4">Break-Even kalkulieren</Link></li>
          <li>→ <Link to="/guide/lieferanten-finden" className="text-accent underline underline-offset-4">Lieferanten finden</Link></li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">FAQ</h2>
        <div className="space-y-4">
          {[
            { q: "Was ist Private Label?", a: "Du lässt Produkte nach deinen Specs herstellen und verkaufst sie unter deiner Marke." },
            { q: "Wie viel Startkapital brauche ich?", a: "Typischerweise 3.000-15.000 € je nach Produkt und MOQ." },
            { q: "Welche Produkte eignen sich?", a: "Supplements, Kosmetik, Textilien, Accessoires, Food-Produkte." },
          ].map(({ q, a }) => (
            <details key={q} className="group rounded-xl border bg-card p-4">
              <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">{q}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span></summary>
              <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </GuideLayout>
  );
}
