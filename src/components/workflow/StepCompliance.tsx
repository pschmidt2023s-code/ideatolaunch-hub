import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const labelChecklist = [
  "Produktname & Beschreibung",
  "Inhaltsstoffe / INCI-Liste",
  "Nettofüllmenge",
  "Hersteller- / Importeuradresse",
  "Mindesthaltbarkeitsdatum / PAO",
  "Chargennummer / Batch-Code",
  "Verwendungshinweise",
  "Warnhinweise",
  "Recycling-Symbole",
  "CE-Kennzeichnung (falls zutreffend)",
];

export function StepCompliance() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Label-Checkliste</h2>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {completedCount}/{labelChecklist.length} erledigt
          </span>
        </div>
        <div className="space-y-3">
          {labelChecklist.map((item) => (
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

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">Rechtliche Hinweise</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Je nach Produktkategorie gelten unterschiedliche Vorschriften. Stelle sicher, dass du die
          EU-Kosmetikverordnung (EC 1223/2009), die Lebensmittelverordnung oder die relevante
          Produktsicherheitsrichtlinie einhältst. Konsultiere im Zweifel einen Rechtsanwalt.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">Barcode & EAN</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Um Produkte im Handel zu listen, benötigst du einen EAN/GTIN-Barcode.</p>
          <ul className="list-inside space-y-1">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Registriere dich bei GS1 Germany
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Beantrage eine GLN (Global Location Number)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Generiere GTIN-Nummern für deine Produkte
            </li>
          </ul>
        </div>
        <Button variant="outline" className="mt-4 gap-2">
          <FileText className="h-4 w-4" />
          Als PDF exportieren
        </Button>
      </div>
    </div>
  );
}
