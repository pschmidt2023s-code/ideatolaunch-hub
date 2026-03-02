import { GuideLayout } from "@/components/GuideLayout";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Was kostet es, eine Eigenmarke zu gründen?", "acceptedAnswer": { "@type": "Answer", "text": "Die Startkosten variieren zwischen 2.000 und 20.000 €, abhängig von Produktkategorie, MOQ und Verpackungsanspruch. Mit BuildYourBrand kannst du die genauen Kosten im Voraus kalkulieren." } },
    { "@type": "Question", "name": "Wie lange dauert es, eine Eigenmarke zu starten?", "acceptedAnswer": { "@type": "Answer", "text": "Vom ersten Konzept bis zum Launch vergehen typischerweise 3-6 Monate. Mit einem strukturierten Prozess wie dem 7-Schritte-System von BuildYourBrand kann dieser Zeitraum verkürzt werden." } },
    { "@type": "Question", "name": "Brauche ich ein Gewerbe für eine Eigenmarke?", "acceptedAnswer": { "@type": "Answer", "text": "Ja, in Deutschland benötigst du mindestens ein Gewerbe. Je nach Produktkategorie können weitere Genehmigungen erforderlich sein (z.B. Lebensmittel, Kosmetik)." } },
    { "@type": "Question", "name": "Was ist der Unterschied zwischen Private Label und White Label?", "acceptedAnswer": { "@type": "Answer", "text": "Private Label: Du entwickelst ein eigenes Produkt mit eigenem Branding. White Label: Du kaufst ein fertiges Produkt und versieht es mit deinem Logo. Private Label bietet mehr Differenzierung." } },
    { "@type": "Question", "name": "Wie finde ich den richtigen Lieferanten?", "acceptedAnswer": { "@type": "Answer", "text": "Recherchiere auf Plattformen wie Alibaba, europäischen Messen oder über Branchenverzeichnisse. Achte auf Zertifizierungen, MOQ, Kommunikation und fordere immer Samples an." } },
    { "@type": "Question", "name": "Wie berechne ich meine Gewinnmarge?", "acceptedAnswer": { "@type": "Answer", "text": "Marge = (Verkaufspreis - Gesamtkosten) / Verkaufspreis × 100. Gesamtkosten umfassen Produktion, Verpackung, Versand, Marketing und Plattformgebühren." } },
  ]
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Eigenmarke gründen in 5 Phasen",
  "description": "Komplette Anleitung zum Aufbau einer eigenen Marke – von der Idee über Produktion und Compliance bis zum Launch.",
  "totalTime": "P90D",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Validierung & Marke", "text": "Definiere Nische, Positionierung und Markenidentität." },
    { "@type": "HowToStep", "position": 2, "name": "Finanzielle Klarheit", "text": "Berechne Produktionskosten, Preise, Margen und Break-even." },
    { "@type": "HowToStep", "position": 3, "name": "Produktion & Sourcing", "text": "Finde Lieferanten, verhandle MOQ und bestelle Samples." },
    { "@type": "HowToStep", "position": 4, "name": "Compliance & Vertrieb", "text": "Rechtliche Absicherung und Vertriebskanal aufbauen." },
    { "@type": "HowToStep", "position": 5, "name": "Launch & Optimierung", "text": "30-Tage Roadmap, KPI-Tracking und Iteration." },
  ]
};

export default function EigenmarkeGruenden() {
  const navigate = useNavigate();

  const clusterLinks = [
    { to: "/guide/private-label-starten", label: "Private Label starten" },
    { to: "/guide/lieferanten-finden", label: "Lieferanten finden" },
    { to: "/guide/produktionskosten-kalkulieren", label: "Produktionskosten kalkulieren" },
    { to: "/guide/moq-berechnen", label: "MOQ berechnen" },
    { to: "/guide/break-even-rechner", label: "Break-Even verstehen" },
    { to: "/guide/kapitalbedarf-berechnen", label: "Kapitalbedarf berechnen" },
    { to: "/guide/launch-plan-erstellen", label: "Launch-Plan erstellen" },
    { to: "/guide/produktionsfehler-vermeiden", label: "Produktionsfehler vermeiden" },
  ];

  return (
    <GuideLayout
      title="Eigenmarke gründen"
      seoTitle="Eigenmarke gründen – Der komplette Guide 2026"
      seoDescription="Lerne Schritt für Schritt, wie du deine eigene Marke gründest. Von Idee über Kalkulation und Produktion bis zum Launch. Kostenloser Guide."
      path="/guide/eigenmarke-gruenden"
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Guide", href: "/guide/eigenmarke-gruenden" },
        { name: "Eigenmarke gründen", href: "/guide/eigenmarke-gruenden" },
      ]}
      jsonLd={[faqJsonLd, howToJsonLd]}
    >
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-tight mb-6">
          Eigenmarke gründen – <span className="text-gradient">Der komplette Guide 2026</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Du willst deine eigene Marke aufbauen, weißt aber nicht, wo du anfangen sollst? Dieser Guide führt dich
          durch jeden Schritt – von der ersten Idee über die Kalkulation und Produktion bis zum erfolgreichen Launch.
          Praxisnah, datengetrieben und speziell für den deutschen Markt.
        </p>
      </header>

      {/* Table of Contents */}
      <nav className="rounded-xl border bg-card p-6 mb-12">
        <h2 className="text-lg font-bold mb-4">Inhaltsverzeichnis</h2>
        <ol className="space-y-2 text-sm">
          {[
            "Warum eine Eigenmarke gründen?",
            "Die 5 Phasen zum Markenaufbau",
            "Idee & Positionierung",
            "Markenidentität aufbauen",
            "Kalkulation & Business Model",
            "Produktion & Lieferanten",
            "Compliance & Rechtliches",
            "Vertrieb & Sales Channels",
            "Launch & Go-to-Market",
            "Häufige Fehler vermeiden",
            "Kostenlose Tools für Gründer",
            "FAQ",
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-muted-foreground">
              <span className="text-accent font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
      </nav>

      {/* Section 1 */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 md:text-3xl">Warum eine Eigenmarke gründen?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Der E-Commerce-Markt in Deutschland wächst kontinuierlich. Eigenmarken bieten höhere Margen als Reselling,
          mehr Kontrolle über Qualität und Branding und die Möglichkeit, eine nachhaltige Marke aufzubauen.
          2026 ist der perfekte Zeitpunkt: Die Werkzeuge sind besser denn je, und die Einstiegshürden sinken.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Aber: Ohne Struktur scheitern die meisten Gründer an vermeidbaren Fehlern – falscher Kalkulation,
          schlechter Lieferantenwahl oder mangelhafter Compliance. Dieser Guide und{" "}
          <Link to="/" className="text-accent underline underline-offset-4 hover:text-accent/80">
            BuildYourBrand
          </Link>{" "}
          helfen dir, diese Fehler zu vermeiden.
        </p>
      </section>

      {/* Section 2 */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 md:text-3xl">Die 5 Phasen zum Markenaufbau</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Unser bewährtes 5-Phasen-System deckt den kompletten Markenaufbau ab:
        </p>
        <div className="space-y-3">
          {[
            { step: "01", title: "Validierung & Marke", desc: "Zielgruppe, USP, Positionierung und Markenidentität" },
            { step: "02", title: "Finanzielle Klarheit", desc: "Produktionskosten, Preisgestaltung, Break-Even, Kapitalbedarf" },
            { step: "03", title: "Produktion & Sourcing", desc: "Lieferanten finden, MOQ verhandeln, Qualitätskontrolle" },
            { step: "04", title: "Compliance & Vertrieb", desc: "Kennzeichnung, Rechtliches, Vertriebskanäle" },
            { step: "05", title: "Launch & Optimierung", desc: "30-Tage-Plan, KPI-Tracking, Iteration" },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4 rounded-lg border bg-card p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-mono font-medium">
                {step}
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Idee */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 md:text-3xl">Schritt 1: Idee & Positionierung</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Alles beginnt mit einer klaren Idee und einer differenzierten Positionierung. Frage dich:
          Welches Problem löst dein Produkt? Wer ist deine Zielgruppe? Was macht dich anders als die Konkurrenz?
        </p>
        <h3 className="text-xl font-semibold mb-3">Zielgruppe definieren</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Ein häufiger Fehler: „Mein Produkt ist für jeden." Je spezifischer deine Zielgruppe, desto stärker deine Positionierung.
          Erstelle ein detailliertes Kundenprofil mit Demografie, Schmerzpunkten und Kaufverhalten.
        </p>
        <h3 className="text-xl font-semibold mb-3">USP entwickeln</h3>
        <p className="text-muted-foreground leading-relaxed">
          Dein Unique Selling Proposition muss in einem Satz erklärbar sein.
          Nicht „hochwertig und günstig" – sondern ein konkreter Vorteil, den die Konkurrenz nicht bietet.
        </p>
      </section>

      {/* Section 4: Kalkulation */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 md:text-3xl">Schritt 3: Kalkulation & Business Model</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Die Kalkulation entscheidet über Erfolg oder Misserfolg. Du musst alle Kosten kennen, bevor du deine erste Bestellung aufgibst.
          Nutze unsere kostenlosen Tools für einen schnellen Überblick:
        </p>
        <div className="grid gap-3 sm:grid-cols-3 my-6">
          {[
            { to: "/tools/produktionskosten-rechner", label: "Produktionskosten Rechner" },
            { to: "/tools/break-even-rechner", label: "Break-Even Rechner" },
            { to: "/tools/moq-rechner", label: "MOQ Rechner" },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm font-medium hover:border-accent/30 hover:shadow-md transition-all">
              <Check className="h-4 w-4 text-accent shrink-0" />
              {label}
            </Link>
          ))}
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Vertiefe dich in die Details:{" "}
          <Link to="/guide/produktionskosten-kalkulieren" className="text-accent underline underline-offset-4 hover:text-accent/80">
            Produktionskosten kalkulieren
          </Link>{" "}
          und{" "}
          <Link to="/guide/kapitalbedarf-berechnen" className="text-accent underline underline-offset-4 hover:text-accent/80">
            Kapitalbedarf berechnen
          </Link>.
        </p>
      </section>

      {/* Section 5: Produktion */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 md:text-3xl">Schritt 4: Produktion & Lieferanten</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Die Lieferantensuche ist der zeitaufwändigste Teil. Plane mindestens 4-8 Wochen für Recherche,
          Erstkontakt, Sample-Bestellung und Verhandlung ein.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Weiterführende Guides:{" "}
          <Link to="/guide/lieferanten-finden" className="text-accent underline underline-offset-4 hover:text-accent/80">
            Lieferanten finden
          </Link>{" "}
          |{" "}
          <Link to="/guide/moq-berechnen" className="text-accent underline underline-offset-4 hover:text-accent/80">
            MOQ verstehen & verhandeln
          </Link>{" "}
          |{" "}
          <Link to="/guide/produktionsfehler-vermeiden" className="text-accent underline underline-offset-4 hover:text-accent/80">
            Produktionsfehler vermeiden
          </Link>
        </p>
      </section>

      {/* Section 6: Launch */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-4 md:text-3xl">Schritt 7: Launch & Go-to-Market</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Ein strukturierter Launch macht den Unterschied. Die ersten 30 Tage sind entscheidend für
          Momentum, erste Bewertungen und organische Reichweite.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Details im{" "}
          <Link to="/guide/launch-plan-erstellen" className="text-accent underline underline-offset-4 hover:text-accent/80">
            Launch-Plan Guide
          </Link>.
        </p>
      </section>

      {/* Cluster Links */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-6 md:text-3xl">Vertiefende Guides</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {clusterLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center justify-between rounded-lg border bg-card p-4 hover:border-accent/30 hover:shadow-md transition-all"
            >
              <span className="font-medium text-sm">{label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-6 md:text-3xl">Häufig gestellte Fragen</h2>
        <div className="space-y-4">
          {[
            { q: "Was kostet es, eine Eigenmarke zu gründen?", a: "Die Startkosten variieren zwischen 2.000 und 20.000 €, abhängig von Produktkategorie, MOQ und Verpackungsanspruch." },
            { q: "Wie lange dauert es bis zum Launch?", a: "Typischerweise 3-6 Monate vom Konzept bis zum ersten Verkauf." },
            { q: "Brauche ich ein Gewerbe?", a: "Ja, in Deutschland ist eine Gewerbeanmeldung Pflicht." },
            { q: "Private Label vs. White Label?", a: "Private Label = eigenes Produkt, mehr Differenzierung. White Label = fertiges Produkt mit deinem Logo." },
            { q: "Wie finde ich Lieferanten?", a: "Plattformen wie Alibaba, EU-Messen, Branchenverzeichnisse. Immer Samples anfordern." },
            { q: "Welche Marge brauche ich?", a: "Mindestens 50-60% auf den VK, um Marketing, Retouren und Gebühren zu decken." },
          ].map(({ q, a }) => (
            <details key={q} className="group rounded-xl border bg-card p-4">
              <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                {q}
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </GuideLayout>
  );
}
