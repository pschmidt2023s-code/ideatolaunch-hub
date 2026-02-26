import { GuideLayout } from "@/components/GuideLayout";
import { Link } from "react-router-dom";

const faq = [
  { q: "Was ist ein Break-Even?", a: "Der Punkt, ab dem dein Umsatz deine Gesamtkosten deckt und du Gewinn machst." },
  { q: "Wie senke ich meinen Break-Even?", a: "Fixkosten reduzieren, Verkaufspreis erhöhen oder variable Kosten senken." },
];
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) };

export default function BreakEvenGuide() {
  return (
    <GuideLayout title="Break-Even verstehen" seoTitle="Break-Even berechnen – Wann wird dein Startup profitabel?" seoDescription="Verstehe den Break-Even-Point und berechne, ab wann deine Eigenmarke Gewinn macht. Mit kostenlosem Rechner und Praxisbeispielen." path="/guide/break-even-rechner" breadcrumbs={[{ name: "Home", href: "/" }, { name: "Guide", href: "/guide/eigenmarke-gruenden" }, { name: "Break-Even", href: "/guide/break-even-rechner" }]} jsonLd={faqJsonLd} recommendedLinks={[
      { href: "/tools/break-even-rechner", label: "Break-Even Rechner", desc: "Berechne deinen Break-Even sofort – kostenlos." },
      { href: "/guide/produktionskosten-kalkulieren", label: "Produktionskosten kalkulieren", desc: "Verstehe alle Kostenfaktoren im Detail." },
      { href: "/guide/launch-plan-erstellen", label: "Launch-Plan erstellen", desc: "Plane deinen Start mit einer 30-Tage-Roadmap." },
    ]}>
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">Break-Even berechnen – <span className="text-gradient">Profitabilität verstehen</span></h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Der Break-Even-Point ist die wichtigste Kennzahl für jeden Gründer. Hier lernst du, wie du ihn berechnest, interpretierst und systematisch senkst.</p>
      <section className="mb-14"><h2 className="text-2xl font-bold mb-4">Break-Even Formel</h2><p className="text-muted-foreground leading-relaxed mb-4">Break-Even (Stück) = Fixkosten / (Verkaufspreis - Variable Stückkosten)</p><p className="text-muted-foreground leading-relaxed">Berechne deinen Break-Even sofort mit dem <Link to="/tools/break-even-rechner" className="text-accent underline underline-offset-4">kostenlosen Break-Even Rechner</Link>. Für die Gesamtkalkulation nutze den <Link to="/tools/produktionskosten-rechner" className="text-accent underline underline-offset-4">Produktionskosten-Rechner</Link>.</p></section>
      <section><h2 className="text-2xl font-bold mb-6">FAQ</h2><div className="space-y-4">{faq.map(({ q, a }) => <details key={q} className="group rounded-xl border bg-card p-4"><summary className="cursor-pointer font-semibold list-none flex items-center justify-between">{q}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span></summary><p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p></details>)}</div></section>
    </GuideLayout>
  );
}
