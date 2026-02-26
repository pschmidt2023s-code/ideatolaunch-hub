import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";

export default function Datenschutz() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Datenschutzerklärung"
        description="Datenschutzerklärung für BuildYourBrand gemäß DSGVO. Informationen zur Datenverarbeitung, Cookies, Empfehlungsprogramm, Affiliate-Tracking und Ihren Rechten."
        path="/datenschutz"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Datenschutz", url: "/datenschutz" }]}
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl prose prose-sm dark:prose-invert">
          <h1 className="text-2xl font-bold mb-8">Datenschutzerklärung</h1>

          <Section title="1. Verantwortliche Stelle">
            <p>Patric-Maurice Schmidt</p>
            <p>BGM.-Scheller-Str 14, 96215 Lichtenfels, Deutschland</p>
            <p>E-Mail: support@buildyourbrand.de</p>
          </Section>

          <Section title="2. Erhebung und Verarbeitung personenbezogener Daten">
            <p>
              Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung
              einer funktionsfähigen Plattform sowie unserer Inhalte und Leistungen
              erforderlich ist. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1
              lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse).
            </p>
          </Section>

          <Section title="3. Registrierung und Nutzerkonto">
            <p>
              Bei der Registrierung erheben wir Ihre E-Mail-Adresse und ein Passwort.
              Optional können Sie Ihren Namen und Firmennamen hinterlegen. Diese Daten
              werden ausschließlich zur Bereitstellung Ihres Nutzerkontos verwendet und
              nicht an Dritte weitergegeben.
            </p>
          </Section>

          <Section title="4. Hosting und Infrastruktur">
            <p>
              Diese Plattform wird auf Cloud-Infrastruktur in der Europäischen Union
              betrieben. Dabei können Server-Logdaten (IP-Adresse, Zeitpunkt des Zugriffs,
              aufgerufene Seite) automatisch erfasst werden. Diese Daten dienen der
              Sicherstellung des Betriebs und werden nicht zur Identifikation einzelner
              Nutzer verwendet.
            </p>
          </Section>

          <Section title="5. Zahlungsabwicklung (Stripe)">
            <p>
              Für die Abwicklung von Zahlungen nutzen wir den Dienst Stripe (Stripe, Inc.,
              510 Townsend Street, San Francisco, CA 94103, USA). Bei einem Kauf werden
              Ihre Zahlungsdaten direkt an Stripe übermittelt. Wir haben keinen Zugriff auf
              vollständige Zahlungsdaten. Stripe verarbeitet Daten auch in den USA auf
              Grundlage von Standardvertragsklauseln (SCC). Es gilt die{" "}
              <a
                href="https://stripe.com/de/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                Datenschutzerklärung von Stripe
              </a>
              .
            </p>
          </Section>

          <Section title="6. Empfehlungsprogramm (Referral)">
            <p>
              Wenn Sie am Empfehlungsprogramm teilnehmen, speichern wir Ihren persönlichen
              Empfehlungscode, die Anzahl erfolgreicher Empfehlungen und den Status Ihrer
              Prämien. Der Empfehlungslink enthält Ihren Code als URL-Parameter
              (<code>?ref=CODE</code>). Wenn sich ein neuer Nutzer über Ihren Link
              registriert, wird die Zuordnung gespeichert.
            </p>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung des Empfehlungsprogramms).
            </p>
          </Section>

          <Section title="7. Affiliate-Programm">
            <p>
              Affiliates erhalten einen Tracking-Link mit persönlichem Affiliate-Code.
              Wir speichern: Klickzahlen, Conversion-Daten, Provisionshöhe, Auszahlungsstatus
              und die Zuordnung zu Stripe-Abonnements. Diese Daten werden ausschließlich
              zur Abwicklung des Affiliate-Programms verwendet.
            </p>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung).
            </p>
          </Section>

          <Section title="8. Community & Waitlist">
            <p>
              Wenn Sie sich für die Community-Warteliste eintragen, speichern wir Ihre
              E-Mail-Adresse, Ihren aktuellen Plan und Ihre Nische. Diese Daten werden
              ausschließlich zur Verwaltung der Warteliste und Einladung zur Community
              verwendet. Sie können Ihre Daten jederzeit löschen lassen.
            </p>
          </Section>

          <Section title="9. Sicherheitsereignisse">
            <p>
              Zum Schutz der Plattform protokollieren wir sicherheitsrelevante Ereignisse
              wie fehlgeschlagene Anmeldeversuche und Rate-Limit-Überschreitungen. Dabei
              werden Zeitstempel, Event-Typ und – soweit verfügbar – ein anonymisierter
              IP-Hinweis gespeichert. Diese Daten dienen ausschließlich dem Schutz vor
              Missbrauch (Art. 6 Abs. 1 lit. f DSGVO – berechtigtes Interesse).
            </p>
          </Section>

          <Section title="10. Analysedaten">
            <p>
              Wir nutzen anonymisierte, interne Analysedaten zur Verbesserung des Produkts.
              Diese Daten werden nur nach ausdrücklicher Einwilligung erhoben (Art. 6 Abs. 1
              lit. a DSGVO). Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie
              die Analyse-Cookies in Ihrem Browser ablehnen oder löschen.
            </p>
            <p>Es werden keine Daten an externe Analyse-Dienste übermittelt.</p>
            <p>
              Zusätzlich erfassen wir anonymisierte Web-Vitals-Daten (LCP, CLS, INP) zur
              Performance-Optimierung. Diese Daten enthalten keine personenbezogenen
              Informationen.
            </p>
          </Section>

          <Section title="11. KI-gestützte Funktionen">
            <p>
              Die Plattform bietet KI-gestützte Analysen (Risikoanalyse, Marktnamen-
              Vorschläge, Insights). Dabei werden Ihre eingegebenen Geschäftsdaten an einen
              KI-Dienst übermittelt, um personalisierte Ergebnisse zu generieren. Es werden
              keine personenbezogenen Daten (Name, E-Mail) an den KI-Dienst weitergegeben –
              ausschließlich anonymisierte Geschäftsdaten (Produktbeschreibung, Preise,
              Zielgruppe).
            </p>
          </Section>

          <Section title="12. Zweckbindung">
            <p>
              Personenbezogene Daten werden nur für den Zweck verwendet, für den sie
              erhoben wurden: Bereitstellung des Dienstes, Abrechnung, Empfehlungs- und
              Affiliate-Programm und Verbesserung des Produkts. Eine Weitergabe an Dritte
              erfolgt nur, soweit dies zur Vertragserfüllung erforderlich ist (z.B.
              Zahlungsabwicklung über Stripe).
            </p>
          </Section>

          <Section title="13. Ihre Rechte (Art. 15–21 DSGVO)">
            <p>Sie haben das Recht auf:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><strong>Auskunft</strong> (Art. 15 DSGVO) über Ihre gespeicherten Daten</li>
              <li><strong>Berichtigung</strong> (Art. 16 DSGVO) unrichtiger Daten</li>
              <li><strong>Löschung</strong> (Art. 17 DSGVO) Ihrer Daten</li>
              <li><strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
              <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
              <li><strong>Widerspruch</strong> (Art. 21 DSGVO) gegen die Verarbeitung</li>
            </ul>
            <p>
              Darüber hinaus haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
              zu beschweren.
            </p>
          </Section>

          <Section title="14. Datenspeicherung und Löschung">
            <p>
              Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist. Nach Löschung
              Ihres Kontos werden personenbezogene Daten innerhalb von 30 Tagen gelöscht,
              sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
              Abrechnungsbezogene Daten werden gemäß steuerrechtlicher Vorgaben
              10 Jahre aufbewahrt.
            </p>
          </Section>

          <Section title="15. Kontakt">
            <p>
              Bei Fragen zum Datenschutz wenden Sie sich bitte an:{" "}
              <span className="text-accent">support@buildyourbrand.de</span>
            </p>
          </Section>

          <p className="text-xs text-muted-foreground mt-12">
            Diese Datenschutzerklärung dient der Information und ersetzt keine
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
