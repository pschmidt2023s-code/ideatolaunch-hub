import { GuideLayout } from "@/components/GuideLayout";
import { Link } from "react-router-dom";

const faq = [
  { q: "Wo finde ich Lieferanten für meine Eigenmarke?", a: "Alibaba, europäische Fachmessen (z.B. White Label World Expo), Branchenverzeichnisse und lokale Handelskammern." },
  { q: "EU oder Asien – was ist besser?", a: "Bei Budget <10k € und Mengen <300 Stück empfehlen wir EU-Lieferanten. Weniger Risiko, keine Zollprobleme." },
  { q: "Wie erkenne ich seriöse Lieferanten?", a: "Achte auf Zertifizierungen (ISO, CE), Kommunikationsqualität, Bereitschaft für Samples und transparente Preisgestaltung." },
];

const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) };

export default function LieferantenFinden() {
  return (
    <GuideLayout title="Lieferanten finden" seoTitle="Lieferanten finden – Guide für Eigenmarken 2026" seoDescription="So findest du den richtigen Lieferanten für deine Eigenmarke: EU vs. Asien, Qualitätskriterien, Verhandlungstipps und Fallstricke." path="/guide/lieferanten-finden" breadcrumbs={[{ name: "Home", href: "/" }, { name: "Guide", href: "/guide/eigenmarke-gruenden" }, { name: "Lieferanten finden", href: "/guide/lieferanten-finden" }]} jsonLd={faqJsonLd}>
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">Lieferanten finden – <span className="text-gradient">Der Guide für Eigenmarken</span></h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Die Wahl des richtigen Lieferanten entscheidet über Produktqualität, Marge und Lieferzeiten. Lerne, wie du systematisch den passenden Hersteller findest.</p>
      <section className="mb-14"><h2 className="text-2xl font-bold mb-4">EU vs. Asien Sourcing</h2><p className="text-muted-foreground leading-relaxed mb-4">EU-Lieferanten bieten geringere MOQs, schnellere Lieferung und keine Zollprobleme. Asien-Sourcing lohnt sich erst ab größeren Mengen (500+) und wenn du Erfahrung mit Import hast.</p><p className="text-muted-foreground leading-relaxed">Nutze den <Link to="/tools/moq-rechner" className="text-accent underline underline-offset-4">MOQ-Rechner</Link> um dein Risiko zu bewerten. Vertiefe dich in <Link to="/guide/moq-berechnen" className="text-accent underline underline-offset-4">MOQ-Strategien</Link> und <Link to="/guide/produktionsfehler-vermeiden" className="text-accent underline underline-offset-4">häufige Produktionsfehler</Link>.</p></section>
      <section className="mb-14"><h2 className="text-2xl font-bold mb-4">Qualitätskriterien für Lieferanten</h2><ul className="space-y-2 text-muted-foreground">{["ISO-Zertifizierung", "Transparente Preisstruktur", "Sample-Bereitschaft", "Referenzkunden", "Klare Kommunikation", "Vertragliche Absicherung"].map(i => <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />{i}</li>)}</ul></section>
      <section><h2 className="text-2xl font-bold mb-6">FAQ</h2><div className="space-y-4">{faq.map(({ q, a }) => <details key={q} className="group rounded-xl border bg-card p-4"><summary className="cursor-pointer font-semibold list-none flex items-center justify-between">{q}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span></summary><p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p></details>)}</div></section>
    </GuideLayout>
  );
}
