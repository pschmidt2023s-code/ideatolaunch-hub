import { useState } from "react";
import { Download, FileText, Table, FileCode, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBrand } from "@/hooks/useBrand";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  format: string;
  premium?: boolean;
}

const EXPORT_OPTIONS: ExportOption[] = [
  { id: "blueprint", label: "Business Blueprint", description: "Vollständiger Geschäftsplan als PDF", icon: FileText, format: "PDF" },
  { id: "financials", label: "Finanzdaten", description: "Kosten, Margen, Break-Even als CSV", icon: Table, format: "CSV" },
  { id: "compliance", label: "Compliance Checkliste", description: "Regulatorische Anforderungen", icon: FileText, format: "PDF" },
  { id: "suppliers", label: "Lieferanten-Liste", description: "Deine gespeicherten Lieferanten", icon: Table, format: "CSV" },
  { id: "roadmap", label: "Launch Roadmap", description: "Dein personalisierter Zeitplan", icon: FileCode, format: "JSON" },
  { id: "full-backup", label: "Komplettes Backup", description: "Alle Markendaten exportieren", icon: Download, format: "JSON", premium: true },
];

export function ExportCenter({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { activeBrand } = useBrand();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (option: ExportOption) => {
    if (!activeBrand) {
      toast.error("Bitte wähle zuerst eine Marke aus.");
      return;
    }
    setExporting(option.id);

    // Simulate export (in production, this would generate real files)
    await new Promise((r) => setTimeout(r, 1500));

    toast.success(`${option.label} wurde exportiert.`);
    setExporting(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-4 w-4 text-accent" />
            Export Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleExport(option)}
              disabled={exporting !== null}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-all hover:border-accent/30 hover:shadow-sm",
                exporting === option.id && "border-accent bg-accent/5"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                {exporting === option.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                ) : (
                  <option.icon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{option.label}</p>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                    {option.format}
                  </Badge>
                  {option.premium && (
                    <Badge className="text-[9px] px-1.5 py-0 bg-accent/10 text-accent border-accent/20">
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Exportierte Dateien werden direkt heruntergeladen.
        </p>
      </DialogContent>
    </Dialog>
  );
}
