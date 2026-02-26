import { GuideLayout } from "@/components/GuideLayout";
import { Link } from "react-router-dom";

const faq = [
  { q: "Was bedeutet MOQ?", a: "Minimum Order Quantity – die Mindestbestellmenge, die ein Hersteller verlangt." },
  { q: "Wie verhandle ich einen niedrigeren MOQ?", a: "Höheren Stückpreis anbieten, Langzeit-Commitment signalisieren, Testbestellung vorschlagen." },
  { q: "Welcher MOQ ist für Starter realistisch?", a: "EU: 50-200 Stück. Asien: 300-1.000 Stück. Je nach Produktkomplexität." },
];
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) };

export default function MoqBerechnen() {
  return (
    <GuideLayout title="MOQ berechnen" seoTitle="MOQ berechnen & verhandeln – Guide 2026" seoDescription="Verstehe Mindestbestellmengen, berechne dein MOQ-Risiko und lerne Verhandlungsstrategien für bessere Konditionen." path="/guide/moq-berechnen" breadcrumbs={[{ name: "Home", href: "/" }, { name: "Guide", href: "/guide/eigenmarke-gruenden" }, { name: "MOQ berechnen", href: "/guide/moq-berechnen" }]} jsonLd={faqJsonLd} recommendedLinks={[
      { href: "/guide/lieferanten-finden", label: "Lieferanten finden", desc: "EU vs. Asien – den richtigen Hersteller wählen." },
      { href: "/guide/kapitalbedarf-berechnen", label: "Kapitalbedarf berechnen", desc: "Plane dein Budget richtig ein." },
      { href: "/tools/moq-rechner", label: "MOQ-Rechner nutzen", desc: "Berechne dein Kapitalrisiko in 30 Sekunden." },
    ]}>
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">MOQ berechnen & verhandeln – <span className="text-gradient">Risiko minimieren</span></h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Die Mindestbestellmenge ist oft die größte Hürde für Eigenmarken-Gründer. Zu hoch = hohes Kapitalrisiko. Zu niedrig = hohe Stückkosten. So findest du die Balance.</p>
      <section className="mb-14"><h2 className="text-2xl font-bold mb-4">MOQ-Risiko bewerten</h2><p className="text-muted-foreground leading-relaxed">Nutze den <Link to="/tools/moq-rechner" className="text-accent underline underline-offset-4">kostenlosen MOQ-Rechner</Link>, um dein Risiko einzuschätzen. Kombiniere mit dem <Link to="/tools/break-even-rechner" className="text-accent underline underline-offset-4">Break-Even Rechner</Link> für ein vollständiges Bild.</p></section>
      <section className="mb-14"><h2 className="text-2xl font-bold mb-4">5 Verhandlungsstrategien</h2><ol className="space-y-3 text-muted-foreground list-decimal list-inside"><li>Höheren Stückpreis für niedrigeren MOQ anbieten</li><li>Testbestellung mit klarem Follow-up-Commitment</li><li>Referenzen und Business-Plan zeigen</li><li>Mehrere Produkte vom selben Hersteller bündeln</li><li>Off-Season Bestellungen nutzen</li></ol></section>
      <section><h2 className="text-2xl font-bold mb-6">FAQ</h2><div className="space-y-4">{faq.map(({ q, a }) => <details key={q} className="group rounded-xl border bg-card p-4"><summary className="cursor-pointer font-semibold list-none flex items-center justify-between">{q}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span></summary><p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p></details>)}</div></section>
    </GuideLayout>
  );
}
