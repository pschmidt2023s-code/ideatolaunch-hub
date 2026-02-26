import { GuideLayout } from "@/components/GuideLayout";
import { Link } from "react-router-dom";

const faq = [
  { q: "Wie viel Kapital brauche ich für eine Eigenmarke?", a: "Abhängig von Produkt und MOQ typischerweise 3.000-20.000 € für die erste Bestellung." },
  { q: "Was muss ich alles einplanen?", a: "Produktion, Verpackung, Branding, Samples, Versand, Marketing-Budget, Lager und einen Puffer für Unvorhergesehenes." },
];
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) };

export default function KapitalbedarfBerechnen() {
  return (
    <GuideLayout title="Kapitalbedarf berechnen" seoTitle="Kapitalbedarf berechnen – Budgetplanung für Gründer" seoDescription="Berechne den Kapitalbedarf für deine Eigenmarke. Lerne, welche Kosten anfallen und wie du dein Budget optimal aufteilst." path="/guide/kapitalbedarf-berechnen" breadcrumbs={[{ name: "Home", href: "/" }, { name: "Guide", href: "/guide/eigenmarke-gruenden" }, { name: "Kapitalbedarf", href: "/guide/kapitalbedarf-berechnen" }]} jsonLd={faqJsonLd}>
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">Kapitalbedarf berechnen – <span className="text-gradient">Budget richtig planen</span></h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Ohne klare Budgetplanung scheitern die meisten Eigenmarken-Projekte. Lerne, wie du deinen Kapitalbedarf realistisch berechnest und dein Budget optimal aufteilst.</p>
      <section className="mb-14"><h2 className="text-2xl font-bold mb-4">Typische Budget-Aufteilung</h2><div className="space-y-2 text-muted-foreground"><p>• Produktion & Material: 40-50%</p><p>• Verpackung & Branding: 15-20%</p><p>• Marketing (initial): 15-20%</p><p>• Versand & Lager: 10%</p><p>• Reserve / Puffer: 10-15%</p></div><p className="text-muted-foreground leading-relaxed mt-4">Nutze den <Link to="/tools/produktionskosten-rechner" className="text-accent underline underline-offset-4">Produktionskosten-Rechner</Link> und den <Link to="/tools/moq-rechner" className="text-accent underline underline-offset-4">MOQ-Rechner</Link> für genaue Zahlen.</p></section>
      <section><h2 className="text-2xl font-bold mb-6">FAQ</h2><div className="space-y-4">{faq.map(({ q, a }) => <details key={q} className="group rounded-xl border bg-card p-4"><summary className="cursor-pointer font-semibold list-none flex items-center justify-between">{q}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span></summary><p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p></details>)}</div></section>
    </GuideLayout>
  );
}
