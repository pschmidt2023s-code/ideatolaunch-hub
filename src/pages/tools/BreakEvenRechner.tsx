import { useState, useMemo } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, AlertTriangle, ArrowRight, DollarSign, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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

  const result = useMemo(() => {
    const fixed = parseFloat(fixedCosts) || 0;
    const variable = parseFloat(unitCost) || 0;
    const price = parseFloat(sellingPrice) || 0;
    if (!fixed && !variable && !price) return null;

    const contribution = price - variable;
    if (contribution <= 0) return { breakEvenUnits: Infinity, breakEvenRevenue: Infinity, contributionMargin: contribution, marginPercent: 0 };

    const units = Math.ceil(fixed / contribution);
    return {
      breakEvenUnits: units,
      breakEvenRevenue: units * price,
      contributionMargin: contribution,
      marginPercent: (contribution / price) * 100,
    };
  }, [fixedCosts, unitCost, sellingPrice]);

  const hasInput = fixedCosts || unitCost || sellingPrice;

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
            ab wie vielen verkauften Einheiten dein Business Gewinn macht.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link to="/guide/eigenmarke-gruenden" className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-accent hover:bg-accent/5 transition-colors">
              Eigenmarke-Guide <ArrowRight className="h-3 w-3" />
            </Link>
            <Link to="/tools/produktionskosten-rechner" className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-accent hover:bg-accent/5 transition-colors">
              Produktionskosten <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
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
              <Target className="h-4 w-4 text-accent" />
            </div>
            Break-Even Rechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="fixed" className="text-xs font-medium">Fixkosten gesamt (€)</Label>
              <Input id="fixed" type="number" placeholder="z.B. 5000" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="variable" className="text-xs font-medium">Variable Stückkosten (€)</Label>
              <Input id="variable" type="number" placeholder="z.B. 8.50" value={unitCost} onChange={e => setUnitCost(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-medium">Verkaufspreis (€/Stück)</Label>
              <Input id="price" type="number" placeholder="z.B. 29.90" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          {/* Live Results */}
          {result && (
            <div className="space-y-4 pt-2">
              <div className="grid gap-3 sm:grid-cols-3">
                <ResultCard
                  icon={<Target className="h-4 w-4" />}
                  value={result.breakEvenUnits === Infinity ? "∞" : result.breakEvenUnits.toLocaleString("de-DE")}
                  label="Stück bis Break-Even"
                  level={result.breakEvenUnits === Infinity ? "high" : result.breakEvenUnits > 1000 ? "medium" : "low"}
                />
                <ResultCard
                  icon={<DollarSign className="h-4 w-4" />}
                  value={result.breakEvenRevenue === Infinity ? "–" : `${result.breakEvenRevenue.toLocaleString("de-DE")} €`}
                  label="Umsatz bis Break-Even"
                  level={result.breakEvenRevenue === Infinity ? "high" : "neutral"}
                />
                <ResultCard
                  icon={<BarChart3 className="h-4 w-4" />}
                  value={`${result.contributionMargin.toFixed(2)} €`}
                  label="Deckungsbeitrag/Stück"
                  level={result.contributionMargin <= 0 ? "high" : result.contributionMargin < 5 ? "medium" : "low"}
                />
              </div>

              {/* Margin bar */}
              {result.marginPercent > 0 && (
                <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Stückmarge</span>
                    <span className={cn("font-semibold", result.marginPercent >= 50 ? "text-success" : result.marginPercent >= 30 ? "text-warning" : "text-destructive")}>
                      {result.marginPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500",
                        result.marginPercent >= 50 ? "bg-success" : result.marginPercent >= 30 ? "bg-warning" : "bg-destructive"
                      )}
                      style={{ width: `${Math.min(100, result.marginPercent)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {result.marginPercent >= 50 ? "✓ Gesunde Marge für E-Commerce" : result.marginPercent >= 30 ? "⚠ Knapp – Marketing & Retouren einkalkulieren" : "⚡ Zu niedrig – Preisanpassung empfohlen"}
                  </p>
                </div>
              )}

              {result.contributionMargin <= 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Negativer Deckungsbeitrag</p>
                    <p className="text-xs text-muted-foreground mt-1">
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

function ResultCard({ icon, value, label, level }: { icon: React.ReactNode; value: string; label: string; level: "low" | "medium" | "high" | "neutral" }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center space-y-2">
      <div className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-lg",
        level === "low" ? "bg-success/10 text-success" : level === "medium" ? "bg-warning/10 text-warning" : level === "high" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
      )}>
        {icon}
      </div>
      <p className={cn("text-2xl font-bold tabular-nums",
        level === "low" ? "text-success" : level === "high" ? "text-destructive" : ""
      )}>
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
