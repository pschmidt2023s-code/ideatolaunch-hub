import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl prose prose-sm dark:prose-invert">
          <h1 className="text-2xl font-bold mb-8">Datenschutzerklärung</h1>

          <Section title="1. Verantwortliche Stelle">
            <p>[Vor- und Nachname]</p>
            <p>[Adresse]</p>
            <p>E-Mail: [deine@email.de]</p>
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
              Diese Daten werden ausschließlich zur Bereitstellung Ihres Nutzerkontos
              verwendet und nicht an Dritte weitergegeben.
            </p>
          </Section>

          <Section title="4. Hosting und Infrastruktur">
            <p>
              Diese Plattform wird auf Cloud-Infrastruktur betrieben. Dabei können
              Server-Logdaten (IP-Adresse, Zeitpunkt des Zugriffs, aufgerufene Seite)
              automatisch erfasst werden. Diese Daten dienen der Sicherstellung des
              Betriebs und werden nicht zur Identifikation einzelner Nutzer verwendet.
            </p>
          </Section>

          <Section title="5. Zahlungsabwicklung (Stripe)">
            <p>
              Für die Abwicklung von Zahlungen nutzen wir den Dienst Stripe (Stripe, Inc.,
              510 Townsend Street, San Francisco, CA 94103, USA). Bei einem Kauf werden
              Ihre Zahlungsdaten direkt an Stripe übermittelt. Wir haben keinen Zugriff auf
              vollständige Zahlungsdaten. Es gilt die{" "}
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

          <Section title="6. Analysedaten">
            <p>
              Wir nutzen anonymisierte, interne Analysedaten zur Verbesserung des Produkts.
              Diese Daten werden nur nach ausdrücklicher Einwilligung erhoben (Art. 6 Abs. 1
              lit. a DSGVO). Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie
              die Analyse-Cookies in Ihrem Browser ablehnen oder löschen.
            </p>
            <p>Es werden keine Daten an externe Analyse-Dienste übermittelt.</p>
          </Section>

          <Section title="7. Zweckbindung">
            <p>
              Personenbezogene Daten werden nur für den Zweck verwendet, für den sie
              erhoben wurden: Bereitstellung des Dienstes, Abrechnung und Verbesserung des
              Produkts. Eine Weitergabe an Dritte erfolgt nur, soweit dies zur
              Vertragserfüllung erforderlich ist (z.B. Zahlungsabwicklung über Stripe).
            </p>
          </Section>

          <Section title="8. Ihre Rechte (Art. 15–21 DSGVO)">
            <p>Sie haben das Recht auf:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><strong>Auskunft</strong> (Art. 15 DSGVO) über Ihre gespeicherten Daten</li>
              <li><strong>Berichtigung</strong> (Art. 16 DSGVO) unrichtiger Daten</li>
              <li><strong>Löschung</strong> (Art. 17 DSGVO) Ihrer Daten</li>
              <li><strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
              <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
              <li><strong>Widerspruch</strong> (Art. 21 DSGVO) gegen die Verarbeitung</li>
            </ul>
          </Section>

          <Section title="9. Kontakt">
            <p>
              Bei Fragen zum Datenschutz wenden Sie sich bitte an:{" "}
              <span className="text-accent">[deine@email.de]</span>
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
