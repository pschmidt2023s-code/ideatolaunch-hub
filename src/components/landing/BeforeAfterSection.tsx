import { X, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export function BeforeAfterSection() {
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  const before = isDE
    ? [
        "Excel-Tabellen + Bauchgefühl",
        "Produktionsfehler erst nach 5.000 € Verlust entdeckt",
        "Keine Ahnung wann du profitabel wirst",
        "Compliance? Irgendwann nach dem Launch",
      ]
    : [
        "Excel sheets + gut feeling",
        "Production mistakes found after €5,000 lost",
        "No idea when you'll break even",
        "Compliance? Sometime after launch",
      ];

  const after = isDE
    ? [
        "Strukturierter 7-Schritte Workflow",
        "KI erkennt Risiken vor dem ersten Euro",
        "Break-Even Punkt auf Knopfdruck",
        "Compliance-Check vor Produktionsstart",
      ]
    : [
        "Structured 7-step workflow",
        "AI detects risks before your first euro spent",
        "Break-even point at the push of a button",
        "Compliance check before production starts",
      ];

  return (
    <section className="border-t px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold md:text-4xl">
            {isDE ? "Vorher vs. Nachher" : "Before vs. After"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {isDE
              ? "Was sich ändert, wenn du datenbasiert gründest"
              : "What changes when you build with data"}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Before */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="font-bold text-destructive mb-4">
              {isDE ? "❌ Ohne BuildYourBrand" : "❌ Without BuildYourBrand"}
            </h3>
            <ul className="space-y-3">
              {before.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <X className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
            <h3 className="font-bold text-accent mb-4">
              {isDE ? "✓ Mit BuildYourBrand" : "✓ With BuildYourBrand"}
            </h3>
            <ul className="space-y-3">
              {after.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
