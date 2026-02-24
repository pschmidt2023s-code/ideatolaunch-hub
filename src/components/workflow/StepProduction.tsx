import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const checklist = [
  "Produktspezifikationen definiert",
  "Materialanforderungen festgelegt",
  "Qualitätsstandards dokumentiert",
  "Musterproduktion geplant",
  "Produktionszeitplan erstellt",
  "Verpackungsanforderungen geklärt",
];

const supplierQuestions = [
  "Wie hoch ist die Mindestbestellmenge (MOQ)?",
  "Welche Zertifizierungen besitzen Sie?",
  "Wie lang ist die Vorlaufzeit?",
  "Bieten Sie Musterproduktion an?",
  "Welche Zahlungsbedingungen gelten?",
];

export function StepProduction() {
  const [region, setRegion] = useState("");
  const [moq, setMoq] = useState("");
  const [category, setCategory] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-6 text-lg font-semibold">Produktionsdetails</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Produktionsregion</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="eu">EU</SelectItem>
                <SelectItem value="asia">Asien</SelectItem>
                <SelectItem value="flexible">Flexibel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>MOQ-Erwartung</Label>
            <Input placeholder="z.B. 100 Stück" value={moq} onChange={(e) => setMoq(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Produktkategorie</Label>
            <Input placeholder="z.B. Kosmetik" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">Produktions-Checkliste</h2>
        <div className="space-y-3">
          {checklist.map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={!!checked[item]}
                onCheckedChange={(v) => setChecked((p) => ({ ...p, [item]: !!v }))}
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">Fragen an Lieferanten</h2>
        <ul className="space-y-2">
          {supplierQuestions.map((q) => (
            <li key={q} className="flex items-start gap-2 text-sm">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
