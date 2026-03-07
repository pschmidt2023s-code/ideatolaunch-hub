import { useState, useMemo } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, AlertTriangle, ArrowRight, DollarSign, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Was sind Produktionskosten?", "acceptedAnswer": { "@type": "Answer", "text": "Produktionskosten umfassen alle Kosten für Herstellung, Material, Verpackung, Versand und Qualitätskontrolle eines Produkts." } },
    { "@type": "Question", "name": "Wie berechne ich meine Stückkosten?", "acceptedAnswer": { "@type": "Answer", "text": "Stückkosten = (Produktionskosten + Verpackung + Versand) / Bestellmenge." } },
    { "@type": "Question", "name": "Welche versteckten Kosten gibt es bei der Produktion?", "acceptedAnswer": { "@type": "Answer", "text": "Häufig übersehen: Werkzeugkosten, Muster/Samples, Zollgebühren, Qualitätskontrolle, Lagerung und Retourenabwicklung." } },
    { "@type": "Question", "name": "Wie hoch sollte meine Marge sein?", "acceptedAnswer": { "@type": "Answer", "text": "Für E-Commerce empfehlen Experten mindestens 50-60% Marge auf den VK." } },
  ]
};

export default function ProduktionskostenRechner() {
  const [productionCost, setProductionCost] = useState("");
  const [packagingCost, setPackagingCost] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const result = useMemo(() => {
    const prod = parseFloat(productionCost) || 0;
    const pack = parseFloat(packagingCost) || 0;
    const ship = parseFloat(shippingCost) || 0;
    const qty = parseInt(quantity) || 0;
    const price = parseFloat(sellingPrice) || 0;
    if (!prod && !pack && !ship && !qty && !price) return null;

    const totalCost = prod + pack + ship;
    const unitCost = qty > 0 ? totalCost / qty : 0;
    const margin = price > 0 ? ((price - unitCost) / price) * 100 : 0;
    const profit = (price - unitCost) * (qty || 1);

    return { unitCost, margin, profit, totalCost };
  }, [productionCost, packagingCost, shippingCost, quantity, sellingPrice]);

  return (
    <ToolPageLayout
      title="Produktionskosten Rechner"
      seoTitle="Produktionskosten berechnen – Kostenloser Rechner"
      seoDescription="Berechne deine Produktionskosten, Stückkosten und Marge kostenlos. Ideal für Private Label Gründer."
      path="/tools/produktionskosten-rechner"
      jsonLd={faqJsonLd}
      introContent={
        <header>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
            Produktionskosten berechnen – <span className="text-gradient">Kostenloser Rechner</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Kennst du deine echten Stückkosten? Viele Gründer unterschätzen die Gesamtkosten.
            Unser Rechner zeigt dir in Echtzeit, wie profitabel dein Produkt wirklich ist.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link to="/guide/eigenmarke-gruenden" className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-accent hover:bg-accent/5 transition-colors">
              Eigenmarke-Guide <ArrowRight className="h-3 w-3" />
            </Link>
            <Link to="/guide/produktionskosten-kalkulieren" className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-accent hover:bg-accent/5 transition-colors">
              Kalkulations-Strategien <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </header>
      }
      faqContent={
        <section>
          <h2 className="text-2xl font-bold mb-6">Häufig gestellte Fragen</h2>
          <div className="space-y-4">
            {[
              { q: "Was sind Produktionskosten?", a: "Alle Kosten für Herstellung, Material, Verpackung, Versand und QC." },
              { q: "Wie berechne ich Stückkosten?", a: "Stückkosten = (Produktion + Verpackung + Versand) / Menge." },
              { q: "Welche versteckten Kosten gibt es?", a: "Werkzeugkosten, Muster, Zoll, QC, Lagerung und Retouren." },
              { q: "Wie hoch sollte die Marge sein?", a: "Mindestens 50-60% auf den VK für E-Commerce." },
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
              <Calculator className="h-4 w-4 text-accent" />
            </div>
            Produktionskosten Schnellrechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prod" className="text-xs font-medium">Produktionskosten gesamt (€)</Label>
              <Input id="prod" type="number" placeholder="z.B. 2500" value={productionCost} onChange={e => setProductionCost(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pack" className="text-xs font-medium">Verpackungskosten gesamt (€)</Label>
              <Input id="pack" type="number" placeholder="z.B. 500" value={packagingCost} onChange={e => setPackagingCost(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ship" className="text-xs font-medium">Versandkosten gesamt (€)</Label>
              <Input id="ship" type="number" placeholder="z.B. 300" value={shippingCost} onChange={e => setShippingCost(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qty" className="text-xs font-medium">Bestellmenge (Stück)</Label>
              <Input id="qty" type="number" placeholder="z.B. 500" value={quantity} onChange={e => setQuantity(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-medium">Geplanter Verkaufspreis (€/Stück)</Label>
            <Input id="price" type="number" placeholder="z.B. 29.90" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className="rounded-xl" />
          </div>

          {/* Live Results */}
          {result && (
            <div className="space-y-4 pt-2">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-4 text-center space-y-2">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <Calculator className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{result.unitCost.toFixed(2)} €</p>
                  <p className="text-[11px] text-muted-foreground">Stückkosten</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center space-y-2">
                  <div className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-lg",
                    result.margin >= 50 ? "bg-success/10" : result.margin >= 30 ? "bg-warning/10" : "bg-destructive/10"
                  )}>
                    <BarChart3 className={cn("h-4 w-4",
                      result.margin >= 50 ? "text-success" : result.margin >= 30 ? "text-warning" : "text-destructive"
                    )} />
                  </div>
                  <p className={cn("text-2xl font-bold tabular-nums",
                    result.margin >= 50 ? "text-success" : result.margin < 40 ? "text-destructive" : ""
                  )}>
                    {result.margin.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">Marge</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center space-y-2">
                  <div className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-lg",
                    result.profit >= 0 ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    <DollarSign className={cn("h-4 w-4", result.profit >= 0 ? "text-success" : "text-destructive")} />
                  </div>
                  <p className={cn("text-2xl font-bold tabular-nums", result.profit < 0 ? "text-destructive" : "text-success")}>
                    {result.profit >= 0 ? "+" : ""}{result.profit.toFixed(0)} €
                  </p>
                  <p className="text-[11px] text-muted-foreground">Gesamtgewinn</p>
                </div>
              </div>

              {/* Margin bar */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Margenqualität</span>
                  <span className={cn("font-semibold",
                    result.margin >= 50 ? "text-success" : result.margin >= 30 ? "text-warning" : "text-destructive"
                  )}>
                    {result.margin >= 50 ? "✓ Excellent" : result.margin >= 30 ? "⚠ Okay" : "⚡ Kritisch"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500",
                      result.margin >= 50 ? "bg-success" : result.margin >= 30 ? "bg-warning" : "bg-destructive"
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, result.margin))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0%</span>
                  <span className="border-l border-dashed border-muted-foreground/30 pl-1">30% Min</span>
                  <span className="border-l border-dashed border-muted-foreground/30 pl-1">50% Ziel</span>
                  <span>100%</span>
                </div>
              </div>

              {result.margin < 40 && result.margin > -Infinity && (
                <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Niedrige Marge</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Eine Marge unter 40% ist für E-Commerce riskant. Berücksichtige Marketing (15-25%), Retouren (5-15%) und Plattformgebühren.
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
