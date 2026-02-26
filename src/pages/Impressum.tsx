import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";

export default function Impressum() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Impressum"
        description="Impressum und Anbieterkennzeichnung gemäß § 5 TMG für BuildYourBrand – Patric-Maurice Schmidt, Lichtenfels, Deutschland."
        path="/impressum"
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl prose prose-sm dark:prose-invert">
          <h1 className="text-2xl font-bold mb-8">Impressum</h1>

          <section className="space-y-1 mb-8">
            <h2 className="text-lg font-semibold">Angaben gemäß § 5 TMG</h2>
            <p className="text-foreground">Patric-Maurice Schmidt</p>
            <p className="text-foreground">BGM.-Scheller-Str 14</p>
            <p className="text-foreground">96215 Lichtenfels</p>
            <p className="text-foreground">Deutschland</p>
          </section>

          <section className="space-y-1 mb-8">
            <h2 className="text-lg font-semibold">Kontakt</h2>
            <p className="text-foreground">E-Mail: support@buildyourbrand.de</p>
          </section>

          <section className="space-y-1 mb-8">
            <h2 className="text-lg font-semibold">Umsatzsteuer</h2>
            <p className="text-muted-foreground">
              Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).
            </p>
          </section>

          <section className="space-y-2 mb-8">
            <h2 className="text-lg font-semibold">Haftungsausschluss</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die Inhalte dieser Plattform wurden mit größtmöglicher Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
              jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1
              TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch
              nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
              überwachen.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Streitschlichtung</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
              (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor
              einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
