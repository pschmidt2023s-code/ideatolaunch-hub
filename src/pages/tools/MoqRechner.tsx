import { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, TrendingDown, AlertTriangle, Check } from "lucide-react";
import { Link } from "react-router-dom";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Was bedeutet MOQ?", "acceptedAnswer": { "@type": "Answer", "text": "MOQ steht für Minimum Order Quantity – die Mindestbestellmenge, die ein Hersteller pro Auftrag verlangt." } },
    { "@type": "Question", "name": "Wie hoch ist ein typischer MOQ?", "acceptedAnswer": { "@type": "Answer", "text": "MOQs variieren stark: 50-200 Stück bei EU-Herstellern, 500-5.000 bei asiatischen Lieferanten. Je nach Produktkategorie und Komplexität." } },
    { "@type": "Question", "name": "Kann ich den MOQ verhandeln?", "acceptedAnswer": { "@type": "Answer", "text": "Ja, bei Erstbestellungen lassen viele Hersteller mit sich reden. Strategien: höheren Stückpreis anbieten, Langzeit-Commitment signalisieren, oder Testbestellung vorschlagen." } },
    { "@type": "Question", "name": "Wie berechne ich mein MOQ-Risiko?", "acceptedAnswer": { "@type": "Answer", "text": "MOQ-Risiko = gebundenes Kapital (MOQ × Stückkosten) im Verhältnis zu deinem verfügbaren Budget. Über 50% Kapitalbindung gilt als riskant." } },
  ]
};

export default function MoqRechner() {
  const [moq, setMoq] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [budget, setBudget] = useState("");
  const [region, setRegion] = useState("eu");
  const [result, setResult] = useState<null | { totalInvestment: number; budgetRatio: number; riskLevel: string }>(null);

  const calculate = () => {
    const moqVal = parseInt(moq) || 0;
    const cost = parseFloat(unitCost) || 0;
    const budgetVal = parseFloat(budget) || 1;

    const total = moqVal * cost;
    const ratio = (total / budgetVal) * 100;
    const riskLevel = ratio > 70 ? "hoch" : ratio > 40 ? "mittel" : "niedrig";

    setResult({ totalInvestment: total, budgetRatio: ratio, riskLevel });
  };

  return (
    <ToolPageLayout
      title="MOQ Rechner"
      seoTitle="MOQ berechnen – Mindestbestellmenge Rechner 2026"
      seoDescription="Berechne dein MOQ-Risiko kostenlos. Finde heraus, wie viel Kapital deine Mindestbestellmenge bindet und ob dein Budget reicht."
      path="/tools/moq-rechner"
      jsonLd={faqJsonLd}
      introContent={
        <header>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
            MOQ berechnen – <span className="text-gradient">Mindestbestellmenge verstehen</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Die Mindestbestellmenge (MOQ) ist einer der größten Stolpersteine für Eigenmarken-Gründer.
            Zu hoher MOQ bindet Kapital, zu niedriger MOQ erhöht die Stückkosten.
            Unser kostenloser Rechner zeigt dir das finanzielle Risiko deiner MOQ.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Lerne mehr über{" "}
            <Link to="/guide/moq-berechnen" className="text-accent underline underline-offset-4 hover:text-accent/80">
              MOQ-Strategien und Verhandlung
            </Link>{" "}
            oder finde passende{" "}
            <Link to="/guide/lieferanten-finden" className="text-accent underline underline-offset-4 hover:text-accent/80">
              Lieferanten mit niedrigerem MOQ
            </Link>.
          </p>
        </header>
      }
      faqContent={
        <section>
          <h2 className="text-2xl font-bold mb-6">Häufig gestellte Fragen</h2>
          <div className="space-y-4">
            {[
              { q: "Was bedeutet MOQ?", a: "Minimum Order Quantity – die Mindestbestellmenge pro Auftrag." },
              { q: "Wie hoch ist ein typischer MOQ?", a: "50-200 bei EU-Herstellern, 500-5.000 bei asiatischen Lieferanten." },
              { q: "Kann ich den MOQ verhandeln?", a: "Ja – höherer Stückpreis, Langzeit-Commitment oder Testbestellungen helfen." },
              { q: "Was ist ein sicheres Kapitalbindungs-Verhältnis?", a: "Unter 40% deines Gesamtbudgets gilt als sicher für die erste Bestellung." },
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
            <Package className="h-5 w-5 text-accent" />
            MOQ Risiko-Rechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="moq">Mindestbestellmenge (Stück)</Label>
              <Input id="moq" type="number" placeholder="z.B. 500" value={moq} onChange={e => setMoq(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cost">Stückkosten (€)</Label>
              <Input id="cost" type="number" placeholder="z.B. 6.50" value={unitCost} onChange={e => setUnitCost(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="budget">Verfügbares Budget (€)</Label>
              <Input id="budget" type="number" placeholder="z.B. 10000" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <div>
              <Label>Produktionsregion</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu">EU / Deutschland</SelectItem>
                  <SelectItem value="asia">Asien (China, Vietnam)</SelectItem>
                  <SelectItem value="turkey">Türkei</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={calculate}>
            MOQ-Risiko berechnen
          </Button>

          {result && (
            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <div className="rounded-lg border bg-card p-4 text-center">
                <Package className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">{result.totalInvestment.toFixed(0)} €</p>
                <p className="text-xs text-muted-foreground">Kapitalbindung</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <TrendingDown className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">{result.budgetRatio.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Budget-Auslastung</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <div className={`mx-auto mb-2 h-5 w-5 rounded-full flex items-center justify-center ${
                  result.riskLevel === "niedrig" ? "bg-success/20 text-success" :
                  result.riskLevel === "mittel" ? "bg-yellow-500/20 text-yellow-600" :
                  "bg-destructive/20 text-destructive"
                }`}>
                  {result.riskLevel === "niedrig" ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                </div>
                <p className={`text-2xl font-bold capitalize ${
                  result.riskLevel === "niedrig" ? "text-success" :
                  result.riskLevel === "mittel" ? "text-yellow-600" :
                  "text-destructive"
                }`}>
                  {result.riskLevel}
                </p>
                <p className="text-xs text-muted-foreground">Risikostufe</p>
              </div>
              {region === "asia" && (
                <div className="sm:col-span-3 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Asien-Sourcing Hinweis</p>
                    <p className="text-xs text-muted-foreground">
                      Bei Budgets unter 10.000 € empfehlen wir EU-Lieferanten – geringeres Risiko, keine Zollprobleme, schnellere Lieferung.
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
