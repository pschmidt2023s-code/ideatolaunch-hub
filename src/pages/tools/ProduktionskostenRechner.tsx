import { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Was sind Produktionskosten?", "acceptedAnswer": { "@type": "Answer", "text": "Produktionskosten umfassen alle Kosten für Herstellung, Material, Verpackung, Versand und Qualitätskontrolle eines Produkts." } },
    { "@type": "Question", "name": "Wie berechne ich meine Stückkosten?", "acceptedAnswer": { "@type": "Answer", "text": "Stückkosten = (Produktionskosten + Verpackung + Versand) / Bestellmenge. Bei höherer Menge sinken die Stückkosten durch Skaleneffekte." } },
    { "@type": "Question", "name": "Welche versteckten Kosten gibt es bei der Produktion?", "acceptedAnswer": { "@type": "Answer", "text": "Häufig übersehene Kosten: Werkzeugkosten, Muster/Samples, Zollgebühren, Qualitätskontrolle, Lagerung und Retourenabwicklung." } },
    { "@type": "Question", "name": "Wie hoch sollte meine Marge sein?", "acceptedAnswer": { "@type": "Answer", "text": "Für E-Commerce Eigenmarken empfehlen Experten eine Mindestmarge von 50-60% auf den Verkaufspreis, um Marketing und Retouren abzudecken." } },
  ]
};

export default function ProduktionskostenRechner() {
  const [productionCost, setProductionCost] = useState("");
  const [packagingCost, setPackagingCost] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [result, setResult] = useState<null | { unitCost: number; margin: number; profit: number }>(null);

  const calculate = () => {
    const prod = parseFloat(productionCost) || 0;
    const pack = parseFloat(packagingCost) || 0;
    const ship = parseFloat(shippingCost) || 0;
    const qty = parseInt(quantity) || 1;
    const price = parseFloat(sellingPrice) || 0;

    const totalCost = prod + pack + ship;
    const unitCost = totalCost / qty;
    const margin = price > 0 ? ((price - unitCost) / price) * 100 : 0;
    const profit = (price - unitCost) * qty;

    setResult({ unitCost, margin, profit });
  };

  return (
    <ToolPageLayout
      title="Produktionskosten Rechner"
      seoTitle="Produktionskosten berechnen – Kostenloser Rechner"
      seoDescription="Berechne deine Produktionskosten, Stückkosten und Marge kostenlos. Ideal für Private Label Gründer und E-Commerce Starter."
      path="/tools/produktionskosten-rechner"
      jsonLd={faqJsonLd}
      introContent={
        <header>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
            Produktionskosten berechnen – <span className="text-gradient">Kostenloser Rechner</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Kennst du deine echten Stückkosten? Viele Gründer unterschätzen die Gesamtkosten ihrer Produktion
            und kalkulieren mit unrealistischen Margen. Unser kostenloser Produktionskosten-Rechner zeigt dir
            in Sekunden, wie profitabel dein Produkt wirklich ist.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Erfahre mehr über die Grundlagen im{" "}
            <Link to="/guide/eigenmarke-gruenden" className="text-accent underline underline-offset-4 hover:text-accent/80">
              kompletten Eigenmarke-Guide
            </Link>{" "}
            oder vertiefe dich in die{" "}
            <Link to="/guide/produktionskosten-kalkulieren" className="text-accent underline underline-offset-4 hover:text-accent/80">
              Kalkulations-Strategien
            </Link>.
          </p>
        </header>
      }
      faqContent={
        <section>
          <h2 className="text-2xl font-bold mb-6">Häufig gestellte Fragen</h2>
          <div className="space-y-4">
            {[
              { q: "Was sind Produktionskosten?", a: "Produktionskosten umfassen alle Kosten für Herstellung, Material, Verpackung, Versand und Qualitätskontrolle eines Produkts." },
              { q: "Wie berechne ich meine Stückkosten?", a: "Stückkosten = (Produktionskosten + Verpackung + Versand) / Bestellmenge. Bei höherer Menge sinken die Stückkosten durch Skaleneffekte." },
              { q: "Welche versteckten Kosten gibt es?", a: "Häufig übersehen: Werkzeugkosten, Muster, Zollgebühren, Qualitätskontrolle, Lagerung und Retourenabwicklung." },
              { q: "Wie hoch sollte meine Marge sein?", a: "Für E-Commerce empfehlen Experten mindestens 50-60% Marge auf den VK, um Marketing und Retouren abzudecken." },
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
            <Calculator className="h-5 w-5 text-accent" />
            Produktionskosten Schnellrechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="prod">Produktionskosten gesamt (€)</Label>
              <Input id="prod" type="number" placeholder="z.B. 2500" value={productionCost} onChange={e => setProductionCost(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pack">Verpackungskosten gesamt (€)</Label>
              <Input id="pack" type="number" placeholder="z.B. 500" value={packagingCost} onChange={e => setPackagingCost(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ship">Versandkosten gesamt (€)</Label>
              <Input id="ship" type="number" placeholder="z.B. 300" value={shippingCost} onChange={e => setShippingCost(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="qty">Bestellmenge (Stück)</Label>
              <Input id="qty" type="number" placeholder="z.B. 500" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="price">Geplanter Verkaufspreis (€/Stück)</Label>
            <Input id="price" type="number" placeholder="z.B. 29.90" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
          </div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={calculate}>
            Kosten berechnen
          </Button>

          {result && (
            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              <div className="rounded-lg border bg-card p-4 text-center">
                <Calculator className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">{result.unitCost.toFixed(2)} €</p>
                <p className="text-xs text-muted-foreground">Stückkosten</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <TrendingUp className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className={`text-2xl font-bold ${result.margin < 40 ? "text-destructive" : "text-success"}`}>
                  {result.margin.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Marge</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <TrendingUp className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className={`text-2xl font-bold ${result.profit < 0 ? "text-destructive" : ""}`}>
                  {result.profit.toFixed(0)} €
                </p>
                <p className="text-xs text-muted-foreground">Gesamtgewinn</p>
              </div>
              {result.margin < 40 && (
                <div className="sm:col-span-3 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Niedrige Marge</p>
                    <p className="text-xs text-muted-foreground">
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
