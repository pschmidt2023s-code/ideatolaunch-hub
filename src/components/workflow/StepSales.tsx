import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

const operationalChecklist = [
  "Shop-System ausgewählt und eingerichtet",
  "Produktfotos erstellt",
  "Produktbeschreibungen verfasst",
  "Zahlungsanbieter eingerichtet",
  "Versanddienstleister ausgewählt",
  "AGB & Datenschutz erstellt",
  "Impressum eingerichtet",
  "Retourenrichtlinie definiert",
];

export function StepSales() {
  const [channel, setChannel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fulfillment, setFulfillment] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const readiness = Math.round(
    (Object.values(checked).filter(Boolean).length / operationalChecklist.length) * 100
  );

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-6 text-lg font-semibold">Vertriebskonfiguration</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Vertriebskanal</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="own">Eigener Shop</SelectItem>
                <SelectItem value="marketplace">Marktplatz (Amazon, etc.)</SelectItem>
                <SelectItem value="multi">Multi-Channel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Launch-Menge</Label>
            <Input placeholder="z.B. 500" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Fulfillment</Label>
            <Select value={fulfillment} onValueChange={setFulfillment}>
              <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Eigenversand</SelectItem>
                <SelectItem value="3pl">3PL / Fulfillment-Dienstleister</SelectItem>
                <SelectItem value="dropship">Dropshipping</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Operative Checkliste</h2>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${readiness === 100 ? "text-success" : "text-muted-foreground"}`} />
            <span className="text-sm font-medium">{readiness}% bereit</span>
          </div>
        </div>
        <div className="space-y-3">
          {operationalChecklist.map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={!!checked[item]}
                onCheckedChange={(v) => setChecked((p) => ({ ...p, [item]: !!v }))}
              />
              <span className={`text-sm ${checked[item] ? "line-through text-muted-foreground" : ""}`}>{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
