import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Save } from "lucide-react";
import { toast } from "sonner";

export function StepIdeaFoundation() {
  const [form, setForm] = useState({
    productDescription: "",
    targetAudience: "",
    priceLevel: "",
    country: "",
    budget: "",
    timeline: "",
  });

  const [generated, setGenerated] = useState({
    positioning: "",
    values: "",
    marketAngle: "",
    differentiation: "",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    toast.success("Fortschritt gespeichert!");
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-6 text-lg font-semibold">Deine Geschäftsidee</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Was möchtest du verkaufen?</Label>
            <Textarea
              placeholder="Beschreibe dein Produkt oder deine Dienstleistung..."
              value={form.productDescription}
              onChange={(e) => update("productDescription", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Zielgruppe</Label>
            <Input
              placeholder="z.B. junge Frauen 18-35"
              value={form.targetAudience}
              onChange={(e) => update("targetAudience", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Preissegment</Label>
            <Select value={form.priceLevel} onValueChange={(v) => update("priceLevel", v)}>
              <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="mid">Mittelklasse</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="luxury">Luxus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Verkaufsland</Label>
            <Input
              placeholder="z.B. Deutschland, DACH, EU"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Budget</Label>
            <Input
              placeholder="z.B. 5.000 €"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Zeitrahmen</Label>
            <Select value={form.timeline} onValueChange={(v) => update("timeline", v)}>
              <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3">1–3 Monate</SelectItem>
                <SelectItem value="3-6">3–6 Monate</SelectItem>
                <SelectItem value="6-12">6–12 Monate</SelectItem>
                <SelectItem value="12+">12+ Monate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Sparkles className="h-4 w-4" />
            KI-Analyse starten
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Speichern
          </Button>
        </div>
      </div>

      {/* Generated Results */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">Ergebnisse</h2>
        <p className="text-sm text-muted-foreground">
          Starte die KI-Analyse um deine Markenpositionierung, Werte, Marktwinkel und
          Differenzierung zu generieren. Alle Ergebnisse sind editierbar.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Positionierung", key: "positioning" },
            { label: "Markenwerte", key: "values" },
            { label: "Marktwinkel", key: "marketAngle" },
            { label: "Differenzierung", key: "differentiation" },
          ].map(({ label, key }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Textarea
                placeholder="Wird durch KI generiert..."
                value={generated[key as keyof typeof generated]}
                onChange={(e) =>
                  setGenerated((p) => ({ ...p, [key]: e.target.value }))
                }
                rows={3}
                className="bg-muted/50"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
