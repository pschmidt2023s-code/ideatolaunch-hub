import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const faqItems = [
  {
    q: "Welches Material wird für die Schreibtischunterlage verwendet?",
    a: "Unsere Premium Desk Mat besteht aus hochwertigem PU-Leder mit einer wasserabweisenden Oberfläche und einer rutschfesten Naturkautschuk-Unterseite. Das Material ist langlebig, pflegeleicht und fühlt sich angenehm weich an."
  },
  {
    q: "Passt die 90x45 cm Desk Mat auf jeden Schreibtisch?",
    a: "Die Größe 90x45 cm ist ideal für Standard-Schreibtische ab 120 cm Breite. Sie bietet genug Platz für Tastatur, Maus und Notizen, ohne den Tisch zu überladen. Perfekt für Home Offices und moderne Büros."
  },
  {
    q: "Wie reinige ich die Schreibtischunterlage?",
    a: "Einfach mit einem feuchten Tuch abwischen. Die wasserabweisende Oberfläche verhindert, dass Flüssigkeiten einziehen. Für hartnäckige Flecken empfehlen wir milde Seifenlauge."
  },
  {
    q: "Was unterscheidet eure Desk Mat von günstigen Alternativen?",
    a: "Unsere Desk Mat verwendet Premium-PU-Leder statt billiges Filz oder Kunstleder. Die Nähte sind doppelt vernäht, die Unterseite aus Naturkautschuk (nicht Schaumstoff), und jede Matte durchläuft eine Qualitätskontrolle. Das Ergebnis: Ein Produkt, das jahrelang hält und besser aussieht."
  },
  {
    q: "Gibt es verschiedene Farben?",
    a: "Aktuell bieten wir klassische Farbkombinationen an: Schwarz, Dunkelbraun und Anthrazit. Alle Farben sind zeitlos und passen zu jedem Setup-Stil."
  },
  {
    q: "Wie lange dauert die Lieferung?",
    a: "Der Versand erfolgt innerhalb von 1–3 Werktagen aus Deutschland. Du erhältst eine Sendungsverfolgung per E-Mail, sobald deine Bestellung verschickt wurde."
  }
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a }
  }))
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Premium Schreibtischunterlage 90x45 cm",
  description: "Hochwertige Desk Mat aus PU-Leder mit rutschfester Unterseite. Minimalistisch, langlebig, made in Germany.",
  brand: { "@type": "Brand", name: "BuildYourBrand" },
  offers: {
    "@type": "Offer",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock"
  }
};

export default function Product() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Premium Schreibtischunterlage 90x45 cm – Minimalistisch & Hochwertig"
        description="Hochwertige Desk Mat aus PU-Leder, 90x45 cm. Rutschfest, wasserabweisend, minimalistisches Design. Perfekt für produktive Home Offices. Made in Germany."
        path="/product"
        jsonLd={[productJsonLd, faqJsonLd]}
      />
      <Navbar />

      <main className="px-4 pt-28 pb-20">
        <article className="container mx-auto max-w-3xl">

          {/* Hero / H1 */}
          <header className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-tight">
              Premium Schreibtischunterlage 90x45&nbsp;cm –{" "}
              <span className="text-gradient">Minimalistisch &amp; Hochwertig</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl leading-relaxed">
              Eine Schreibtischunterlage ist mehr als ein Accessoire – sie definiert deinen Workspace.
              Unsere Premium Desk Mat verbindet kompromisslose Materialqualität mit reduziertem,
              zeitlosem Design. Entwickelt für Menschen, die ihren Arbeitsplatz ernst nehmen.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Jetzt entdecken <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Section 1 */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4 md:text-3xl">Warum eine hochwertige Schreibtischunterlage?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Der Schreibtisch ist dein wichtigster Arbeitsort. Trotzdem investieren viele Gründer und Remote-Arbeiter
              Hunderte Euro in Monitore und Tastaturen – und legen sie auf eine blanke Tischplatte.
              Eine Premium-Schreibtischunterlage schützt nicht nur die Oberfläche, sondern schafft eine definierte
              Arbeitsfläche, die Ordnung und Fokus fördert.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Studien zeigen: Ein aufgeräumter, ästhetisch ansprechender Arbeitsplatz steigert die Konzentration
              um bis zu 20 %. Eine hochwertige Desk Mat ist der einfachste Weg, genau das zu erreichen.
              Mehr dazu in unserem{" "}
              <Link to="/blog/minimalistischer-arbeitsplatz" className="text-accent underline underline-offset-4 hover:text-accent/80">
                Guide zum minimalistischen Arbeitsplatz
              </Link>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4 md:text-3xl">Material &amp; Verarbeitung</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Wir verwenden ausschließlich Premium-PU-Leder der Güteklasse A. Die Oberfläche ist glatt genug für
              präzise Mausbewegungen, aber strukturiert genug, um nicht klinisch zu wirken. Die Unterseite besteht
              aus Naturkautschuk – kein billiger Schaumstoff, der nach wenigen Monaten seine Haftung verliert.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 my-6">
              {[
                "PU-Leder Güteklasse A",
                "Doppelt vernähte Kanten",
                "Naturkautschuk-Unterseite",
                "Wasserabweisende Oberfläche",
                "3 mm Materialstärke",
                "Geruchsneutral ab Tag 1"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Jede Matte wird einzeln geprüft, bevor sie unser Lager verlässt. Das bedeutet: keine
              Produktionsfehler, keine unsauberen Nähte, kein chemischer Geruch. Qualität, die man fühlt.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4 md:text-3xl">Vorteile für Produktivität &amp; Fokus</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Eine Desk Mat definiert visuell deine Arbeitszone. Alles, was auf der Matte liegt, gehört zur Arbeit.
              Alles andere ist Ablenkung. Dieses einfache Prinzip der räumlichen Trennung hilft dir,
              schneller in den Flow-Zustand zu kommen.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Die weiche Oberfläche reduziert außerdem die Belastung auf Handgelenke und Unterarme –
              besonders bei langen Arbeitstagen ein unterschätzter Faktor. Entdecke weitere
              wissenschaftlich belegte Produktivitäts-Prinzipien in unserem Artikel{" "}
              <Link to="/blog/produktivitaet-home-office" className="text-accent underline underline-offset-4 hover:text-accent/80">
                Produktivität im Home Office steigern
              </Link>.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4 md:text-3xl">90x45 cm – Die perfekte Größe für moderne Setups</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Warum genau 90x45 cm? Diese Größe ist das Ergebnis sorgfältiger Analyse moderner Workspace-Konfigurationen.
              Sie bietet Platz für eine Full-Size-Tastatur, eine Maus mit großem Bewegungsradius und ein Notizbuch –
              ohne den Schreibtisch zu dominieren.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Ob {" "}
              <Link to="/blog/schreibtisch-setup-guide" className="text-accent underline underline-offset-4 hover:text-accent/80">
                minimalistisches Single-Monitor-Setup
              </Link>{" "}
              oder Dual-Screen-Konfiguration: 90x45 cm passt perfekt. Kein Überhang an den Kanten,
              keine verschwendete Fläche. Einfach die richtige Balance.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4 md:text-3xl">Vergleich zu günstigen Alternativen</h2>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">Eigenschaft</th>
                    <th className="px-4 py-3 text-left font-semibold">Premium Desk Mat</th>
                    <th className="px-4 py-3 text-left font-semibold">Günstige Alternative</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["Material", "PU-Leder Güteklasse A", "Kunstfilz / dünnes PVC"],
                    ["Unterseite", "Naturkautschuk", "Schaumstoff"],
                    ["Kanten", "Doppelt vernäht", "Gestanzt / ungefasst"],
                    ["Geruch", "Geruchsneutral", "Chemischer Geruch"],
                    ["Haltbarkeit", "3+ Jahre", "6–12 Monate"],
                    ["Qualitätskontrolle", "Einzelprüfung", "Keine"],
                  ].map(([prop, premium, cheap]) => (
                    <tr key={prop} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium text-foreground">{prop}</td>
                      <td className="px-4 py-3">{premium}</td>
                      <td className="px-4 py-3">{cheap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4 md:text-3xl">Für wen ist diese Desk Mat ideal?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Unsere Premium Schreibtischunterlage ist nicht für jeden – und das ist Absicht.
              Sie ist für Menschen, die Wert auf Qualität, Ästhetik und ein durchdachtes Arbeitsumfeld legen:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              {[
                "Remote-Arbeiter & Freelancer, die täglich 8+ Stunden am Schreibtisch verbringen",
                "Gründer & Kreative, die ihren Workspace als Teil ihrer Marke verstehen",
                "Minimalisten, die wenige, aber hochwertige Gegenstände bevorzugen",
                "Tech-Enthusiasten mit anspruchsvollen Dual-Monitor-Setups",
                "Jeder, der seinen Arbeitsplatz upgraden will – ohne Kompromisse"
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Star className="h-4 w-4 text-accent mt-1 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ Section */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6 md:text-3xl">Häufig gestellte Fragen</h2>
            <div className="space-y-4">
              {faqItems.map(({ q, a }) => (
                <details key={q} className="group rounded-xl border bg-card p-4">
                  <summary className="cursor-pointer font-semibold text-foreground list-none flex items-center justify-between">
                    {q}
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border bg-card p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold mb-3 md:text-3xl">Bereit für ein Upgrade?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Starte jetzt mit BuildYourBrand und bringe dein Workspace-Produkt von der Idee zum Launch.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
              onClick={() => navigate("/auth?tab=signup")}
            >
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Button>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
