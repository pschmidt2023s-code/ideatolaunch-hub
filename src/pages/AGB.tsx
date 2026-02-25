import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function AGB() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl prose prose-sm dark:prose-invert">
          <h1 className="text-2xl font-bold mb-8">Nutzungsbedingungen</h1>

          <Section title="1. Geltungsbereich">
            <p>
              Diese Nutzungsbedingungen gelten für die Nutzung der SaaS-Plattform
              BuildYourBrand (nachfolgend „Plattform"). Mit der Registrierung akzeptieren
              Sie diese Bedingungen.
            </p>
          </Section>

          <Section title="2. Leistungsbeschreibung">
            <p>
              Die Plattform bietet digitale Werkzeuge zur Unterstützung bei der Planung und
              Strukturierung von Marken und Produktgeschäften. Die Inhalte und Analysen
              dienen ausschließlich der Orientierung und stellen keine Rechts-, Steuer-
              oder Finanzberatung dar.
            </p>
          </Section>

          <Section title="3. Keine Garantie">
            <p>
              Die Plattform liefert keine Erfolgsgarantien. Kalkulationen, Empfehlungen und
              Analysen basieren auf Ihren Eingaben und allgemeinen Marktannahmen. Die
              tatsächlichen Ergebnisse können abweichen. Geschäftsentscheidungen treffen Sie
              eigenverantwortlich.
            </p>
          </Section>

          <Section title="4. Haftungsbeschränkung">
            <p>
              Wir haften nicht für Schäden, die durch die Nutzung der Plattform entstehen,
              insbesondere nicht für entgangenen Gewinn, Datenverluste oder
              Geschäftsentscheidungen, die auf Grundlage der bereitgestellten Informationen
              getroffen wurden. Die Haftung für Vorsatz und grobe Fahrlässigkeit bleibt
              unberührt.
            </p>
          </Section>

          <Section title="5. Abonnement und Zahlung">
            <p>
              Die Plattform bietet kostenlose und kostenpflichtige Pläne. Kostenpflichtige
              Abonnements werden monatlich abgerechnet und verlängern sich automatisch. Die
              Zahlungsabwicklung erfolgt über Stripe. Gemäß § 19 UStG wird keine
              Umsatzsteuer berechnet (Kleinunternehmerregelung).
            </p>
          </Section>

          <Section title="6. Kündigung">
            <p>
              Sie können Ihr Abonnement jederzeit zum Ende des aktuellen
              Abrechnungszeitraums kündigen. Die Kündigung erfolgt über das
              Stripe-Kundenportal. Nach Kündigung behalten Sie bis zum Ende des bezahlten
              Zeitraums Zugang zu den Premium-Funktionen.
            </p>
          </Section>

          <Section title="7. Digitaler Dienst">
            <p>
              BuildYourBrand ist ein rein digitaler Dienst. Es erfolgt kein Versand
              physischer Produkte. Der Zugang wird nach Registrierung und ggf. Zahlung
              sofort bereitgestellt.
            </p>
          </Section>

          <Section title="8. Änderungen">
            <p>
              Wir behalten uns vor, diese Nutzungsbedingungen anzupassen. Wesentliche
              Änderungen werden rechtzeitig per E-Mail oder innerhalb der Plattform
              angekündigt.
            </p>
          </Section>

          <Section title="9. Anwendbares Recht">
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist, soweit
              gesetzlich zulässig, der Sitz des Anbieters.
            </p>
          </Section>

          <p className="text-xs text-muted-foreground mt-12">
            Diese Nutzungsbedingungen dienen der Information und ersetzen keine
            Rechtsberatung. Stand: Februar 2026.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
