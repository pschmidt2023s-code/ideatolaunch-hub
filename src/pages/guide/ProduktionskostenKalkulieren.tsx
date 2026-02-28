import { GuideLayout } from "@/components/GuideLayout";
import { Link } from "react-router-dom";

const pages = [
  { file: "ProduktionskostenKalkulieren", title: "Produktionskosten kalkulieren", seoTitle: "Produktionskosten kalkulieren – Guide 2026", desc: "Lerne alle Kostenfaktoren kennen: Material, Verpackung, Versand, Zoll und versteckte Kosten. Mit kostenlosem Rechner.", path: "/guide/produktionskosten-kalkulieren",
    content: <>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Die Kalkulation deiner Produktionskosten ist die Grundlage für ein profitables Business. Viele Gründer unterschätzen versteckte Kosten und kalkulieren mit unrealistischen Margen.</p>
      <section className="mb-14"><h2 className="text-2xl font-bold mb-4">Die vollständige Kostenstruktur</h2><p className="text-muted-foreground leading-relaxed mb-4">Neben den reinen Herstellungskosten musst du berücksichtigen: Verpackung, Versand, Zoll (bei Import), Lagerung, Retouren, Marketing und Plattformgebühren.</p><p className="text-muted-foreground leading-relaxed">Starte mit unserem <Link to="/tools/produktionskosten-rechner" className="text-accent underline underline-offset-4">Produktionskosten-Rechner</Link> für eine Schnellkalkulation. Für die vollständige Budgetplanung siehe <Link to="/guide/kapitalbedarf-berechnen" className="text-accent underline underline-offset-4">Kapitalbedarf berechnen</Link>.</p></section>
    </> },
];

export default function ProduktionskostenKalkulieren() {
  const p = pages[0];
  const faq = [
    { q: "Welche Kosten werden oft vergessen?", a: "Werkzeugkosten, Samples, Zollgebühren, Qualitätskontrolle, Lagerung und Retourenabwicklung." },
    { q: "Wie kalkuliere ich den Verkaufspreis?", a: "VK = Stückkosten × Aufschlagsfaktor (mindestens 2,5x für E-Commerce). Berücksichtige Marketing (15-25%) und Retouren." },
    { q: "Was ist ein gesunder Aufschlag?", a: "Für E-Commerce mindestens Faktor 2,5-3x auf die Gesamtkosten, um alle laufenden Kosten abzudecken." },
  ];
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) };

  return (
    <GuideLayout title={p.title} seoTitle={p.seoTitle} seoDescription={p.desc} path={p.path} breadcrumbs={[{ name: "Home", href: "/" }, { name: "Guide", href: "/guide/eigenmarke-gruenden" }, { name: p.title, href: p.path }]} jsonLd={faqJsonLd} recommendedLinks={[
      { href: "/tools/produktionskosten-rechner", label: "Produktionskosten-Rechner", desc: "Berechne deine Stückkosten sofort – kostenlos." },
      { href: "/guide/break-even-rechner", label: "Break-Even verstehen", desc: "Ab wann wird dein Produkt profitabel?" },
      { href: "/guide/moq-berechnen", label: "MOQ berechnen", desc: "Mindestbestellmengen richtig einschätzen." },
    ]}>
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">{p.title} – <span className="text-gradient">Vollständiger Guide</span></h1>
      {p.content}
      <section><h2 className="text-2xl font-bold mb-6">FAQ</h2><div className="space-y-4">{faq.map(({ q, a }) => <details key={q} className="group rounded-xl border bg-card p-4"><summary className="cursor-pointer font-semibold list-none flex items-center justify-between">{q}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span></summary><p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p></details>)}</div></section>
    </GuideLayout>
  );
}
