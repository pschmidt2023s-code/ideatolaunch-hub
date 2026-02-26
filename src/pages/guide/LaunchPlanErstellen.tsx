import { GuideLayout } from "@/components/GuideLayout";
import { Link } from "react-router-dom";

const faq = [
  { q: "Was gehört in einen Launch-Plan?", a: "Pre-Launch Aktivitäten, Woche-für-Woche Aufgaben, Marketing-Strategie, erste Bestellungen und KPI-Tracking." },
  { q: "Wie lange sollte ein Launch-Plan sein?", a: "Ein 30-Tage-Plan für den aktiven Launch, plus 2-4 Wochen Pre-Launch Vorbereitung." },
];
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) };

export default function LaunchPlanErstellen() {
  return (
    <GuideLayout title="Launch-Plan erstellen" seoTitle="Launch-Plan erstellen – 30-Tage Strategie für Eigenmarken" seoDescription="Erstelle einen strukturierten Launch-Plan für deine Eigenmarke. Von Pre-Launch bis zu den ersten 30 Tagen – mit Checklisten und Zeitplan." path="/guide/launch-plan-erstellen" breadcrumbs={[{ name: "Home", href: "/" }, { name: "Guide", href: "/guide/eigenmarke-gruenden" }, { name: "Launch-Plan", href: "/guide/launch-plan-erstellen" }]} jsonLd={faqJsonLd} recommendedLinks={[
      { href: "/guide/produktionsfehler-vermeiden", label: "Produktionsfehler vermeiden", desc: "Schütze dein Kapital vor teuren Fehlern." },
      { href: "/guide/kapitalbedarf-berechnen", label: "Kapitalbedarf berechnen", desc: "Plane dein Budget für den Launch." },
      { href: "/tools/break-even-rechner", label: "Break-Even Rechner", desc: "Ab wann bist du profitabel? Jetzt berechnen." },
    ]}>
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">Launch-Plan erstellen – <span className="text-gradient">Die ersten 30 Tage</span></h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Ein strukturierter Launch macht den Unterschied zwischen einem erfolgreichen Start und einem verpufften Launch. Hier lernst du, wie du einen 30-Tage-Plan erstellst.</p>
      <section className="mb-14"><h2 className="text-2xl font-bold mb-4">Die Launch-Phasen</h2><div className="space-y-2 text-muted-foreground"><p><strong>Pre-Launch (Woche -2 bis 0):</strong> Warteliste, Social Media Teaser, Influencer Seeding</p><p><strong>Launch-Woche:</strong> Produktfreigabe, E-Mail an Warteliste, erste Ads</p><p><strong>Woche 2-4:</strong> Optimierung, Bewertungen sammeln, Content erstellen</p></div><p className="text-muted-foreground leading-relaxed mt-4">Stelle sicher, dass deine Zahlen stimmen: <Link to="/tools/break-even-rechner" className="text-accent underline underline-offset-4">Break-Even berechnen</Link> vor dem Launch.</p></section>
      <section><h2 className="text-2xl font-bold mb-6">FAQ</h2><div className="space-y-4">{faq.map(({ q, a }) => <details key={q} className="group rounded-xl border bg-card p-4"><summary className="cursor-pointer font-semibold list-none flex items-center justify-between">{q}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span></summary><p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p></details>)}</div></section>
    </GuideLayout>
  );
}
