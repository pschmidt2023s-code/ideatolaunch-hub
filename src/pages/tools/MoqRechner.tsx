import { useState, useMemo } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, TrendingDown, AlertTriangle, Check, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Was bedeutet MOQ?", "acceptedAnswer": { "@type": "Answer", "text": "MOQ steht für Minimum Order Quantity – die Mindestbestellmenge, die ein Hersteller pro Auftrag verlangt." } },
    { "@type": "Question", "name": "Wie hoch ist ein typischer MOQ?", "acceptedAnswer": { "@type": "Answer", "text": "MOQs variieren stark: 50-200 Stück bei EU-Herstellern, 500-5.000 bei asiatischen Lieferanten." } },
    { "@type": "Question", "name": "Kann ich den MOQ verhandeln?", "acceptedAnswer": { "@type": "Answer", "text": "Ja, bei Erstbestellungen lassen viele Hersteller mit sich reden." } },
    { "@type": "Question", "name": "Wie berechne ich mein MOQ-Risiko?", "acceptedAnswer": { "@type": "Answer", "text": "MOQ-Risiko = gebundenes Kapital (MOQ × Stückkosten) im Verhältnis zu deinem verfügbaren Budget." } },
  ]
};

export default function MoqRechner() {
  const [moq, setMoq] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [budget, setBudget] = useState("");
  const [region, setRegion] = useState("eu");

  const result = useMemo(() => {
    const moqVal = parseInt(moq) || 0;
    const cost = parseFloat(unitCost) || 0;
    const budgetVal = parseFloat(budget) || 0;
    if (!moqVal && !cost && !budgetVal) return null;

    const total = moqVal * cost;
    const ratio = budgetVal > 0 ? (total / budgetVal) * 100 : 100;
    const riskLevel = ratio > 70 ? "hoch" : ratio > 40 ? "mittel" : "niedrig";
    const remaining = Math.max(0, budgetVal - total);

    return { totalInvestment: total, budgetRatio: ratio, riskLevel, remaining };
  }, [moq, unitCost, budget]);

  return (
    <ToolPageLayout
      title="MOQ Rechner"
      seoTitle="MOQ berechnen – Mindestbestellmenge Rechner 2026"
      seoDescription="Berechne dein MOQ-Risiko kostenlos. Finde heraus, wie viel Kapital deine Mindestbestellmenge bindet."
      path="/tools/moq-rechner"
      jsonLd={faqJsonLd}
      introContent={
        <header>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
            MOQ berechnen – <span className="text-gradient">Mindestbestellmenge verstehen</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Die Mindestbestellmenge (MOQ) ist einer der größten Stolpersteine für Eigenmarken-Gründer.
            Unser Rechner zeigt dir das finanzielle Risiko deiner MOQ in Echtzeit.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link to="/guide/moq-berechnen" className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-accent hover:bg-accent/5 transition-colors">
              MOQ-Strategien <ArrowRight className="h-3 w-3" />
            </Link>
            <Link to="/guide/lieferanten-finden" className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-accent hover:bg-accent/5 transition-colors">
              Lieferanten finden <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
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
              { q: "Was ist ein sicheres Verhältnis?", a: "Unter 40% deines Gesamtbudgets gilt als sicher für die erste Bestellung." },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border bg-card p-4">
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
      <Card className="rounded-2xl border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10">
              <Package className="h-4 w-4 text-accent" />
            </div>
            MOQ Risiko-Rechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="moq" className="text-xs font-medium">Mindestbestellmenge (Stück)</Label>
              <Input id="moq" type="number" placeholder="z.B. 500" value={moq} onChange={e => setMoq(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost" className="text-xs font-medium">Stückkosten (€)</Label>
              <Input id="cost" type="number" placeholder="z.B. 6.50" value={unitCost} onChange={e => setUnitCost(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget" className="text-xs font-medium">Verfügbares Budget (€)</Label>
              <Input id="budget" type="number" placeholder="z.B. 10000" value={budget} onChange={e => setBudget(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Produktionsregion</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu">🇪🇺 EU / Deutschland</SelectItem>
                  <SelectItem value="asia">🇨🇳 Asien (China, Vietnam)</SelectItem>
                  <SelectItem value="turkey">🇹🇷 Türkei</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Live Results */}
          {result && (
            <div className="space-y-4 pt-2">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-4 text-center space-y-2">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <Package className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{result.totalInvestment.toLocaleString("de-DE")} €</p>
                  <p className="text-[11px] text-muted-foreground">Kapitalbindung</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center space-y-2">
                  <div className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-lg",
                    result.riskLevel === "niedrig" ? "bg-success/10" : result.riskLevel === "mittel" ? "bg-warning/10" : "bg-destructive/10"
                  )}>
                    <TrendingDown className={cn("h-4 w-4",
                      result.riskLevel === "niedrig" ? "text-success" : result.riskLevel === "mittel" ? "text-warning" : "text-destructive"
                    )} />
                  </div>
                  <p className={cn("text-2xl font-bold tabular-nums",
                    result.budgetRatio > 70 ? "text-destructive" : result.budgetRatio > 40 ? "text-warning" : "text-success"
                  )}>
                    {result.budgetRatio.toFixed(0)}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">Budget-Auslastung</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center space-y-2">
                  <div className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-lg",
                    result.riskLevel === "niedrig" ? "bg-success/10" : result.riskLevel === "mittel" ? "bg-warning/10" : "bg-destructive/10"
                  )}>
                    {result.riskLevel === "niedrig" ? <Shield className="h-4 w-4 text-success" /> : <AlertTriangle className={cn("h-4 w-4", result.riskLevel === "mittel" ? "text-warning" : "text-destructive")} />}
                  </div>
                  <p className={cn("text-2xl font-bold capitalize",
                    result.riskLevel === "niedrig" ? "text-success" : result.riskLevel === "mittel" ? "text-warning" : "text-destructive"
                  )}>
                    {result.riskLevel}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Risikostufe</p>
                </div>
              </div>

              {/* Budget bar */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Restbudget nach MOQ</span>
                  <span className="font-semibold tabular-nums">{result.remaining.toLocaleString("de-DE")} €</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500",
                      result.budgetRatio > 70 ? "bg-destructive" : result.budgetRatio > 40 ? "bg-warning" : "bg-success"
                    )}
                    style={{ width: `${Math.min(100, result.budgetRatio)}%` }}
                  />
                </div>
              </div>

              {region === "asia" && (
                <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Asien-Sourcing Hinweis</p>
                    <p className="text-xs text-muted-foreground mt-1">
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
