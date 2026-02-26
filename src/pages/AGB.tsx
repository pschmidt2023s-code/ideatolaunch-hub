import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";

export default function AGB() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Nutzungsbedingungen"
        description="Allgemeine Nutzungsbedingungen für die SaaS-Plattform BuildYourBrand. Informationen zu Leistungen, Haftung, Kündigung, Empfehlungsprogramm und anwendbarem Recht."
        path="/agb"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Nutzungsbedingungen", url: "/agb" }]}
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl prose prose-sm dark:prose-invert">
          <h1 className="text-2xl font-bold mb-8">Nutzungsbedingungen</h1>

          <Section title="1. Geltungsbereich">
            <p>
              Diese Nutzungsbedingungen gelten für die Nutzung der SaaS-Plattform
              BuildYourBrand (nachfolgend „Plattform"), einschließlich aller zugehörigen
              Dienste wie Academy, Research, Community, Empfehlungsprogramm und
              Affiliate-Programm. Mit der Registrierung akzeptieren Sie diese Bedingungen.
            </p>
          </Section>

          <Section title="2. Leistungsbeschreibung">
            <p>
              Die Plattform bietet digitale Werkzeuge zur Unterstützung bei der Planung und
              Strukturierung von Marken und Produktgeschäften. Dazu gehören:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>7-Schritte-Workflow für den strukturierten Markenaufbau</li>
              <li>Kostenrechner, Break-Even-Analyse und Szenario-Simulation</li>
              <li>KI-gestützte Risikoanalyse und Lieferanten-Matching</li>
              <li>Market Reality Engine mit Demand- und Wettbewerbsanalyse</li>
              <li>Cashflow Survival Engine mit Liquiditäts- und Stress-Test-Simulation</li>
              <li>AI Founder Copilot für datenbasierte Strategieberatung</li>
              <li>Academy mit Guides und Tutorials</li>
              <li>Research-Berichte und Marktdaten</li>
              <li>Case Studies und Vergleichsseiten</li>
              <li>Community-Zugang und Founder-Netzwerk</li>
            </ul>
            <p>
              Die Inhalte und Analysen dienen ausschließlich der Orientierung und stellen
              keine Rechts-, Steuer- oder Finanzberatung dar.
            </p>
          </Section>

          <Section title="3. Keine Garantie">
            <p>
              Die Plattform liefert keine Erfolgsgarantien. Kalkulationen, Empfehlungen,
              Marktdaten und Analysen basieren auf Ihren Eingaben und allgemeinen
              Marktannahmen. Die tatsächlichen Ergebnisse können abweichen.
              Geschäftsentscheidungen treffen Sie eigenverantwortlich.
            </p>
          </Section>

          <Section title="4. Haftungsbeschränkung">
            <p>
              Wir haften nicht für Schäden, die durch die Nutzung der Plattform entstehen,
              insbesondere nicht für entgangenen Gewinn, Datenverluste oder
              Geschäftsentscheidungen, die auf Grundlage der bereitgestellten Informationen
              getroffen wurden. Dies gilt auch für Empfehlungen aus Research-Berichten,
              Academy-Inhalten und KI-gestützten Analysen. Die Haftung für Vorsatz und grobe
              Fahrlässigkeit bleibt unberührt.
            </p>
          </Section>

          <Section title="5. Simulationen, Prognosen und KI-Funktionen">
            <p>
              Die Plattform enthält Simulations- und Prognosewerkzeuge, darunter:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Market Reality Engine (Nachfrage- und Wettbewerbsanalyse)</li>
              <li>Cashflow Survival Engine (Liquiditätsprognosen und Stress-Tests)</li>
              <li>Szenario-Simulation (Auswirkungsberechnung bei Parameteränderungen)</li>
              <li>AI Founder Copilot (KI-gestützte Strategieempfehlungen)</li>
              <li>Launch Probability Score (Datenbasierte Launch-Einschätzung)</li>
              <li>Supplier Risk Index (Lieferantenrisikobewertung)</li>
            </ul>
            <p>
              <strong>Haftungsausschluss für Simulationen:</strong> Alle Simulationen,
              Prognosen, Scores und KI-Empfehlungen sind rein informativ und basieren auf
              vereinfachten Modellen und Ihren Eingaben. Sie stellen keine Finanzberatung,
              Steuerberatung, Rechtsberatung oder Investitionsempfehlung dar. Marktdaten
              können sich jederzeit ändern. Vergangene Trends garantieren keine zukünftigen
              Ergebnisse.
            </p>
            <p>
              <strong>KI-Nutzung:</strong> Der AI Founder Copilot nutzt KI-Modelle zur
              Generierung von Empfehlungen. Diese KI-Ausgaben können fehlerhaft, veraltet
              oder unvollständig sein. Die endgültige Verantwortung für alle
              Geschäftsentscheidungen liegt beim Nutzer.
            </p>
          </Section>

          <Section title="6. Abonnement und Zahlung">
            <p>
              Die Plattform bietet drei Pläne: Free (kostenlos), Builder (29 €/Monat) und
              Pro – Founder Intelligence Suite (79 €/Monat). Kostenpflichtige Abonnements
              werden monatlich abgerechnet und verlängern sich automatisch. Die
              Zahlungsabwicklung erfolgt über Stripe. Gemäß § 19 UStG wird keine
              Umsatzsteuer berechnet (Kleinunternehmerregelung).
            </p>
            <p>
              Es gilt eine 14-tägige Geld-zurück-Garantie. Innerhalb von 14 Tagen nach
              dem ersten Kauf können Sie eine vollständige Rückerstattung beantragen.
            </p>
          </Section>

          <Section title="7. Kündigung">
            <p>
              Sie können Ihr Abonnement jederzeit zum Ende des aktuellen
              Abrechnungszeitraums kündigen. Es gibt keine Mindestlaufzeit. Die Kündigung
              erfolgt über das Stripe-Kundenportal. Nach Kündigung behalten Sie bis zum
              Ende des bezahlten Zeitraums Zugang zu den Premium-Funktionen.
            </p>
          </Section>

          <Section title="8. Empfehlungsprogramm (Referral)">
            <p>
              Registrierte Nutzer erhalten einen persönlichen Empfehlungslink. Für
              erfolgreiche Empfehlungen gelten folgende Prämien:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>2 erfolgreiche Empfehlungen → 1 Monat Builder kostenlos</li>
              <li>5 erfolgreiche Empfehlungen → Pro-Trial-Zugang</li>
              <li>10+ erfolgreiche Empfehlungen → Lifetime-Status</li>
            </ul>
            <p>
              Als „erfolgreiche Empfehlung" gilt die Registrierung eines neuen Nutzers über
              den Empfehlungslink. Missbrauch (z.B. Fake-Accounts) führt zum Ausschluss aus
              dem Programm. Wir behalten uns vor, die Prämienbedingungen zu ändern.
            </p>
          </Section>

          <Section title="9. Affiliate-Programm">
            <p>
              Das Affiliate-Programm richtet sich an Content-Creator, Blogger und Partner.
              Affiliates erhalten eine Provision von 25% (wiederkehrend) auf Builder- und
              Pro-Abonnements, die über ihren Tracking-Link generiert werden. Die Zuordnung
              erfolgt über Stripe-Webhooks.
            </p>
            <p>
              Die Auszahlung erfolgt monatlich ab einem Mindestbetrag von 50 €. Affiliates
              sind verpflichtet, ihre Partnerschaft transparent zu kennzeichnen. Wir behalten
              uns vor, das Programm zu ändern oder zu beenden.
            </p>
          </Section>

          <Section title="10. Community & Inhalte">
            <p>
              Die Community dient dem Austausch zwischen Gründern. Nutzer verpflichten sich,
              keine rechtswidrigen, beleidigenden oder Spam-Inhalte zu teilen. Wir behalten
              uns vor, Inhalte zu entfernen und Nutzer bei Verstößen auszuschließen.
            </p>
            <p>
              Academy-Inhalte, Guides, Research-Berichte und Case Studies dürfen für den
              persönlichen Gebrauch genutzt, jedoch nicht ohne schriftliche Genehmigung
              vervielfältigt oder weiterveröffentlicht werden.
            </p>
          </Section>

          <Section title="11. Geistiges Eigentum">
            <p>
              Alle Inhalte der Plattform (Texte, Grafiken, Berechnungen, Reports, Software)
              sind urheberrechtlich geschützt. Die Nutzung ist auf den vertraglich
              vereinbarten Umfang beschränkt. Vergleichsseiten und Marktanalysen dürfen
              mit Quellenangabe zitiert werden.
            </p>
          </Section>

          <Section title="12. Digitaler Dienst">
            <p>
              BuildYourBrand ist ein rein digitaler Dienst. Es erfolgt kein Versand
              physischer Produkte. Der Zugang wird nach Registrierung und ggf. Zahlung
              sofort bereitgestellt. PDF-Exporte und Reports werden digital bereitgestellt.
            </p>
          </Section>

          <Section title="13. Änderungen">
            <p>
              Wir behalten uns vor, diese Nutzungsbedingungen anzupassen. Wesentliche
              Änderungen werden mindestens 14 Tage vor Inkrafttreten per E-Mail oder
              innerhalb der Plattform angekündigt.
            </p>
          </Section>

          <Section title="14. Anwendbares Recht">
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist, soweit
              gesetzlich zulässig, der Sitz des Anbieters (Lichtenfels).
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
