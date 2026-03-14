import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SmartTooltipProps {
  term: string;
  explanation: string;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

const GLOSSARY: Record<string, { de: string; en: string }> = {
  "break-even": {
    de: "Der Punkt, ab dem dein Umsatz alle Kosten deckt und du Gewinn machst.",
    en: "The point where revenue covers all costs and you start making profit.",
  },
  moq: {
    de: "Minimum Order Quantity – die kleinste Bestellmenge, die ein Lieferant akzeptiert.",
    en: "Minimum Order Quantity – the smallest order a supplier accepts.",
  },
  margin: {
    de: "Die Differenz zwischen Verkaufspreis und Produktionskosten in Prozent.",
    en: "The difference between selling price and production cost as a percentage.",
  },
  runway: {
    de: "Wie lange dein Kapital bei aktuellem Ausgabentempo noch reicht.",
    en: "How long your capital lasts at current spending rate.",
  },
  cac: {
    de: "Customer Acquisition Cost – was es kostet, einen neuen Kunden zu gewinnen.",
    en: "Customer Acquisition Cost – what it costs to acquire a new customer.",
  },
  ltv: {
    de: "Lifetime Value – der Gesamtwert, den ein Kunde über die gesamte Beziehung bringt.",
    en: "Lifetime Value – total value a customer brings over the entire relationship.",
  },
  compliance: {
    de: "Einhaltung aller gesetzlichen Vorschriften für dein Produkt und deine Marke.",
    en: "Adherence to all legal regulations for your product and brand.",
  },
  cashflow: {
    de: "Der Geldfluss – Einnahmen minus Ausgaben in einem bestimmten Zeitraum.",
    en: "The flow of money – income minus expenses in a specific period.",
  },
};

/**
 * Smart contextual help tooltip that explains business terms.
 */
export function SmartTooltip({ term, explanation, className, side = "top" }: SmartTooltipProps) {
  const glossaryEntry = GLOSSARY[term.toLowerCase()];
  const text = explanation || glossaryEntry?.de || term;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors",
            className
          )}
          aria-label={`Hilfe: ${term}`}
        >
          <HelpCircle className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-[280px] text-xs leading-relaxed">
        <p className="font-semibold text-foreground mb-1">{term}</p>
        <p className="text-muted-foreground">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export { GLOSSARY };
