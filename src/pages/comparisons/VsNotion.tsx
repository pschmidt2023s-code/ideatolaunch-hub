import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthorBox } from "@/components/AuthorBox";

const rows = [
  ["Integrierter Kosten-Rechner", true, false],
  ["KI-Risikoanalyse", true, false],
  ["Break-Even Automatik", true, false],
  ["Lieferanten-Matching", true, false],
  ["Compliance-Checklisten", true, false],
  ["7-Schritte Workflow", true, false],
  ["Flexible Notizen", true, true],
  ["Datenbanken", false, true],
  ["Wiki-Funktion", false, true],
] as const;

export default function VsNotion() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="BuildYourBrand vs. Notion – Markenaufbau im Vergleich"
        description="Notion ist großartig für Notizen – aber für strukturierten Markenaufbau mit Kalkulation und Risikoanalyse ist BuildYourBrand die bessere Wahl."
        path="/buildyourbrand-vs-notion"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "BuildYourBrand vs. Notion", url: "/buildyourbrand-vs-notion" }]}
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold md:text-4xl mb-4">BuildYourBrand vs. Notion</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Notion ist ein mächtiges Tool für Notizen und Projektmanagement – aber beim datenbasierten Markenaufbau fehlen die entscheidenden Features.
          </p>

          <div className="overflow-x-auto rounded-xl border mb-12">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-accent">BuildYourBrand</th>
                  <th className="px-4 py-3 text-center font-semibold">Notion</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([feature, byb, notion]) => (
                  <tr key={feature as string} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-medium">{feature}</td>
                    <td className="px-4 py-2.5 text-center">{byb ? <Check className="h-4 w-4 text-accent mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                    <td className="px-4 py-2.5 text-center">{notion ? <Check className="h-4 w-4 text-muted-foreground mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border bg-card p-8 text-center mb-12">
            <h2 className="text-xl font-bold mb-3">Bereit für strukturierten Markenaufbau?</h2>
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
