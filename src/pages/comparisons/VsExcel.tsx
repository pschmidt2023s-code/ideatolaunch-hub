import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthorBox } from "@/components/AuthorBox";

const rows = [
  ["Kosten-Kalkulator", true, false],
  ["Break-Even Analyse", true, false],
  ["KI-Risikoanalyse", true, false],
  ["Lieferanten-Matching", true, false],
  ["Szenario-Simulation", true, false],
  ["Launch-Roadmap", true, false],
  ["PDF Brand Report", true, false],
  ["Compliance-Checks", true, false],
  ["Automatische Updates", true, false],
  ["Formeln pflegen", false, true],
  ["Manuelle Datenerfassung", false, true],
] as const;

export default function VsExcel() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="BuildYourBrand vs. Excel – Markenaufbau im Vergleich"
        description="Warum BuildYourBrand besser als Excel für den Markenaufbau ist: automatische Kalkulation, KI-Risikoanalyse und strukturierte Launch-Planung."
        path="/buildyourbrand-vs-excel"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "BuildYourBrand vs. Excel", url: "/buildyourbrand-vs-excel" }]}
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold md:text-4xl mb-4">BuildYourBrand vs. Excel</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Excel ist flexibel – aber beim strukturierten Markenaufbau stößt es schnell an seine Grenzen. Hier siehst du, warum BuildYourBrand die bessere Wahl ist.
          </p>

          <div className="overflow-x-auto rounded-xl border mb-12">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-accent">BuildYourBrand</th>
                  <th className="px-4 py-3 text-center font-semibold">Excel</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([feature, byb, excel]) => (
                  <tr key={feature as string} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-medium">{feature}</td>
                    <td className="px-4 py-2.5 text-center">{byb ? <Check className="h-4 w-4 text-accent mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                    <td className="px-4 py-2.5 text-center">{excel ? <Check className="h-4 w-4 text-muted-foreground mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="mb-12 space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-2xl font-bold text-foreground">Warum Excel für den Markenaufbau nicht reicht</h2>
            <p>Excel kann vieles – aber beim Markenaufbau fehlen automatische Kalkulationen, Risikoanalyse und ein strukturierter Prozess. Du verbringst Stunden mit Formeln statt mit deiner Marke.</p>
            <p>BuildYourBrand automatisiert Produktionskosten-Kalkulation, Break-Even-Analyse und Compliance-Checks. Die KI erkennt Risiken, bevor sie teuer werden – ohne dass du eine einzige Formel schreiben musst.</p>
          </section>

          <div className="rounded-2xl border bg-card p-8 text-center mb-12">
            <h2 className="text-xl font-bold mb-3">Bereit für den Umstieg?</h2>
            <p className="text-muted-foreground mb-6">Starte kostenlos und importiere deine Daten in wenigen Minuten.</p>
            <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/auth?tab=signup")}>
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <AuthorBox />
        </div>
      </main>
      <Footer />
    </div>
  );
}
