import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Download, Mail, Quote } from "lucide-react";

export default function Press() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Presse & Medien – BuildYourBrand"
        description="Presseinformationen, Gründer-Interview und Media Kit von BuildYourBrand. Ressourcen für Journalisten und Blogger."
        path="/press"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Presse", url: "/press" }]}
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-3xl">
          <section className="mb-16 text-center">
            <h1 className="text-3xl font-bold md:text-5xl mb-4">Presse & Medien</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Alles, was Journalisten und Blogger über BuildYourBrand wissen müssen.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Über BuildYourBrand</h2>
            <div className="rounded-xl border bg-card p-6 space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p><strong className="text-foreground">BuildYourBrand</strong> ist eine SaaS-Plattform, die Gründern hilft, ihre eigene Marke strukturiert aufzubauen – von der Idee über Kalkulation und Produktion bis zum Launch.</p>
              <p>Gegründet von <strong className="text-foreground">Patric-Maurice Schmidt</strong> in Lichtenfels, Deutschland. Die Plattform richtet sich an E-Commerce-Gründer im DACH-Raum und bietet datenbasierte Risikoanalyse, Lieferanten-Matching und einen strukturierten 7-Schritte-Prozess.</p>
              <p>BuildYourBrand ist DSGVO-konform, wird in der EU gehostet und nach deutschen Qualitätsstandards entwickelt.</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Gründer-Interview</h2>
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Quote className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold">Patric-Maurice Schmidt</h3>
                  <p className="text-sm text-muted-foreground">Gründer & CEO, BuildYourBrand</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <p className="font-medium text-foreground mb-1">Was hat dich dazu bewogen, BuildYourBrand zu gründen?</p>
                  <p>Ich habe selbst über 8.000 € durch einen einzigen Produktionsfehler verloren. Es gab kein Tool, das den gesamten Markenaufbau-Prozess abbildet und gleichzeitig Risiken aufzeigt. Also habe ich es selbst gebaut.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Was unterscheidet BuildYourBrand von anderen Tools?</p>
                  <p>Die meisten Tools zeigen dir, was du TUN sollst. Wir zeigen dir, was SCHIEFGEHEN kann – bevor es teuer wird. Unsere KI-gestützte Risikoanalyse und der Execution Readiness Score sind einzigartig im Markt.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Was ist deine Vision für BuildYourBrand?</p>
                  <p>Jeder Gründer verdient Zugang zu den Tools und Daten, die bisher nur großen Unternehmen vorbehalten waren. Wir wollen den Markenaufbau demokratisieren – datengetrieben und made in Germany.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fakten & Zahlen</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Gegründet", value: "2025 in Lichtenfels, Deutschland" },
                { label: "Fokus", value: "DACH-Markt (DE, AT, CH)" },
                { label: "Produkt", value: "SaaS für strukturierten Markenaufbau" },
                { label: "Technologie", value: "KI-gestützte Risikoanalyse & Lieferanten-Matching" },
                { label: "Compliance", value: "DSGVO-konform, EU-Hosting" },
                { label: "Preismodell", value: "Freemium (Free, Builder 29€, Pro 79€)" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border bg-card p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                  <p className="font-medium text-sm">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-8 text-center">
            <Mail className="h-8 w-8 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Presseanfragen</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Für Interviews, Gastbeiträge oder Media Kit schreibe an:
            </p>
            <p className="font-semibold text-accent">presse@buildyourbrand.de</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
