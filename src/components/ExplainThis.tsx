import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getTermDefinition } from "@/lib/guidance-engine";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "react-i18next";

interface ExplainThisProps {
  term: string;
}

export function ExplainThis({ term }: ExplainThisProps) {
  const { isFree } = useSubscription();
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  // Only available for Builder+
  if (isFree) return null;

  const definition = getTermDefinition(term, i18n.language);
  if (!definition) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
          aria-label={`Explain: ${term}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="top">
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold">{definition.term}</h4>
            <button
              onClick={() => setOpen(false)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-foreground">{definition.short}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{definition.detail}</p>
          {definition.example && (
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Beispiel:</span> {definition.example}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
