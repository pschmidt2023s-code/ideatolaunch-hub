import { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Was ist der Break-Even-Point?", "acceptedAnswer": { "@type": "Answer", "text": "Der Break-Even-Point ist der Punkt, ab dem dein Umsatz deine Gesamtkosten deckt. Ab hier machst du Gewinn." } },
    { "@type": "Question", "name": "Wie berechne ich meinen Break-Even?", "acceptedAnswer": { "@type": "Answer", "text": "Break-Even = Fixkosten / (Verkaufspreis - variable Stückkosten). Das Ergebnis ist die Mindestmenge, die du verkaufen musst." } },
    { "@type": "Question", "name": "Was sind Fixkosten bei einer Eigenmarke?", "acceptedAnswer": { "@type": "Answer", "text": "Typische Fixkosten: Tooling/Werkzeuge, Design, Branding, Gewerbeanmeldung, Shop-Setup, initiale Marketingkosten und Lagermiete." } },
    { "@type": "Question", "name": "Wie senke ich meinen Break-Even?", "acceptedAnswer": { "@type": "Answer", "text": "Entweder Fixkosten reduzieren, Verkaufspreis erhöhen oder variable Kosten senken (z.B. bessere Lieferantenkonditionen)." } },
  ]
};

export default function BreakEvenRechner() {
  const [fixedCosts, setFixedCosts] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [result, setResult] = useState<null | { breakEvenUnits: number; breakEvenRevenue: number; contributionMargin: number }>(null);

  const calculate = () => {
    const fixed = parseFloat(fixedCosts) || 0;
    const variable = parseFloat(unitCost) || 0;
    const price = parseFloat(sellingPrice) || 0;

    const contribution = price - variable;
    if (contribution <= 0) {
      setResult({ breakEvenUnits: Infinity, breakEvenRevenue: Infinity, contributionMargin: contribution });
      return;
    }

    const units = Math.ceil(fixed / contribution);
    setResult({
      breakEvenUnits: units,
      breakEvenRevenue: units * price,
      contributionMargin: contribution,
    });
  };

  return (
    <ToolPageLayout
      title="Break-Even Rechner"
      seoTitle="Break-Even berechnen – Kostenloser Rechner 2026"
      seoDescription="Berechne deinen Break-Even-Point kostenlos. Finde heraus, ab wie vielen verkauften Einheiten deine Eigenmarke profitabel wird."
      path="/tools/break-even-rechner"
      jsonLd={faqJsonLd}
      introContent={
        <header>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
            Break-Even berechnen – <span className="text-gradient">Ab wann bist du profitabel?</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Der Break-Even-Point ist die wichtigste Kennzahl für jeden Gründer. Er zeigt dir exakt,
            ab wie vielen verkauften Einheiten dein Business Gewinn macht. Mit unserem kostenlosen Rechner
            findest du es in Sekunden heraus.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Mehr zur Gesamtkalkulation im{" "}
            <Link to="/guide/eigenmarke-gruenden" className="text-accent underline underline-offset-4 hover:text-accent/80">
              Eigenmarke-Guide
            </Link>{" "}
            oder nutze den{" "}
            <Link to="/tools/produktionskosten-rechner" className="text-accent underline underline-offset-4 hover:text-accent/80">
              Produktionskosten-Rechner
            </Link>{" "}
            für detaillierte Stückkosten.
          </p>
        </header>
      }
      faqContent={
        <section>
          <h2 className="text-2xl font-bold mb-6">Häufig gestellte Fragen</h2>
          <div className="space-y-4">
            {[
              { q: "Was ist der Break-Even-Point?", a: "Der Punkt, ab dem dein Umsatz deine Gesamtkosten deckt. Ab hier machst du Gewinn." },
              { q: "Wie berechne ich meinen Break-Even?", a: "Break-Even = Fixkosten / (Verkaufspreis - variable Stückkosten)." },
              { q: "Was sind typische Fixkosten?", a: "Tooling, Design, Branding, Shop-Setup, initiale Marketingkosten und Lagermiete." },
              { q: "Wie senke ich meinen Break-Even?", a: "Fixkosten reduzieren, Verkaufspreis erhöhen oder variable Kosten senken." },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-xl border bg-card p-4">
                <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                  {q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{a}</p>
              </details>
            ))}
          </div>
        </section>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Break-Even Rechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="fixed">Fixkosten gesamt (€)</Label>
              <Input id="fixed" type="number" placeholder="z.B. 5000" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="variable">Variable Stückkosten (€)</Label>
              <Input id="variable" type="number" placeholder="z.B. 8.50" value={unitCost} onChange={e => setUnitCost(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="price">Verkaufspreis (€/Stück)</Label>
              <Input id="price" type="number" placeholder="z.B. 29.90" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
            </div>
          </div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={calculate}>
            Break-Even berechnen
          </Button>

          {result && (
            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <div className="rounded-lg border bg-card p-4 text-center">
                <Target className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {result.breakEvenUnits === Infinity ? "∞" : result.breakEvenUnits}
                </p>
                <p className="text-xs text-muted-foreground">Stück bis Break-Even</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <TrendingUp className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {result.breakEvenRevenue === Infinity ? "–" : `${result.breakEvenRevenue.toFixed(0)} €`}
                </p>
                <p className="text-xs text-muted-foreground">Umsatz bis Break-Even</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <TrendingUp className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className={`text-2xl font-bold ${result.contributionMargin <= 0 ? "text-destructive" : "text-success"}`}>
                  {result.contributionMargin.toFixed(2)} €
                </p>
                <p className="text-xs text-muted-foreground">Deckungsbeitrag/Stück</p>
              </div>
              {result.contributionMargin <= 0 && (
                <div className="sm:col-span-3 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Negativer Deckungsbeitrag</p>
                    <p className="text-xs text-muted-foreground">
                      Dein Verkaufspreis liegt unter den variablen Kosten. Du verlierst mit jedem Verkauf Geld.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
}
