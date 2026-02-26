import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Shield, Lightbulb, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UeberUns() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Über uns – Wer steckt hinter BuildYourBrand?"
        description="Erfahre, warum wir BuildYourBrand gebaut haben und wie wir deutschen Gründern helfen, ihre Eigenmarke erfolgreich zu starten."
        path="/ueber-uns"
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-3xl">

          {/* Hero */}
          <section className="mb-16 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
              Wir helfen Gründern,{" "}
              <span className="text-gradient">ihre Marke richtig zu starten</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              BuildYourBrand ist nicht nur ein Tool – es ist die Plattform, die wir uns selbst gewünscht hätten, als wir unsere erste Eigenmarke gegründet haben.
            </p>
          </section>

          {/* Founder Story */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4">Unsere Geschichte</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Die Idee zu BuildYourBrand entstand aus eigener Erfahrung. Als Gründer im E-Commerce haben wir selbst erlebt, wie komplex und riskant der Aufbau einer Eigenmarke sein kann: falsche Produktionsmengen, unerwartete Kosten, fehlende Compliance – und kein einziges Tool, das den gesamten Prozess abbildet.
              </p>
              <p>
                Wir haben mit Excel-Tabellen angefangen, dann Notion ausprobiert, dutzende Rechner getestet – und am Ende immer noch kritische Fehler gemacht. Deshalb haben wir BuildYourBrand gebaut: <strong className="text-foreground">Ein einziges System, das den kompletten Markenaufbau von der Idee bis zum Launch strukturiert.</strong>
              </p>
              <p>
                Heute nutzen Gründer in Deutschland, Österreich und der Schweiz unsere Plattform, um Produktionskosten zu kalkulieren, Lieferanten zu vergleichen, Risiken zu simulieren und ihren Launch datenbasiert zu planen.
              </p>
            </div>
          </section>

          {/* Mission */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4">Unsere Mission</h2>
            <div className="rounded-xl border bg-card p-6 md:p-8">
              <p className="text-lg text-foreground font-medium leading-relaxed mb-4">
                „Jeder Gründer verdient die Tools und Daten, die bisher nur großen Unternehmen vorbehalten waren."
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Wir demokratisieren den Markenaufbau. Statt tausende Euro für Berater auszugeben oder blind in die Produktion zu investieren, bieten wir eine strukturierte, datengetriebene Alternative – made in Germany.
              </p>
            </div>
          </section>

          {/* Values */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6">Wofür wir stehen</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Target, title: "Klarheit vor Komplexität", desc: "Wir reduzieren den Markenaufbau auf das Wesentliche. Keine überladenen Features – nur was du wirklich brauchst." },
                { icon: Shield, title: "Transparenz", desc: "Offene Preise, keine versteckten Kosten. Du weißt immer, wofür du zahlst und warum." },
                { icon: Lightbulb, title: "Datengetrieben", desc: "Entscheidungen basieren auf Zahlen, nicht auf Bauchgefühl. Unsere KI analysiert Risiken, bevor sie teuer werden." },
                { icon: Users, title: "Made in Germany", desc: "Entwickelt für den DACH-Markt. DSGVO-konform, EU-gehostet, auf deutsche Gründer zugeschnitten." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-3">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-bold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* German Market Focus */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-4">Warum Deutschland?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Der deutsche Markt hat besondere Anforderungen: strenge Compliance-Regeln, hohe Qualitätserwartungen und ein komplexes rechtliches Umfeld. Die meisten internationalen Tools ignorieren das.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              BuildYourBrand berücksichtigt deutsche Label-Vorschriften, EU-Produktionsstandards und DACH-spezifische Marktbedingungen. Unsere Lieferanten-Datenbank und Compliance-Checks sind speziell für den deutschen Markt optimiert.
            </p>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border bg-card p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold mb-3">Bereit, deine Marke zu starten?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Teste BuildYourBrand kostenlos – ohne Kreditkarte, ohne Risiko.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
              onClick={() => navigate("/auth?tab=signup")}
            >
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
