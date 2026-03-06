import { useState } from "react";
import { useMode } from "@/hooks/useMode";
import { MODE_CONFIGS, ALL_MODES, type AppMode } from "@/lib/mode-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Rocket, TrendingUp, PieChart, Brain, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Rocket, TrendingUp, PieChart, Brain,
};

interface ModeSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isInitial?: boolean;
}

export function ModeSwitcher({ open, onOpenChange, isInitial }: ModeSwitcherProps) {
  const { mode, setMode } = useMode();
  const [selected, setSelected] = useState<AppMode>(mode);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    await setMode(selected);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={isInitial ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={isInitial ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {isInitial ? "Select Your Mode" : "Switch Mode"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {isInitial
              ? "Wähle deinen Schwerpunkt – du kannst jederzeit wechseln."
              : "Wechsle deinen Modus für ein angepasstes Dashboard."}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {ALL_MODES.map((key) => {
            const cfg = MODE_CONFIGS[key];
            const Icon = ICONS[cfg.icon];
            const isSelected = selected === key;

            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={cn(
                  "relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all hover:shadow-md",
                  isSelected
                    ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                    : "border-border hover:border-accent/30"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                )}
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-muted", cfg.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{cfg.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cfg.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={saving}
          className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Speichern..." : isInitial ? "Loslegen" : "Mode wechseln"}
        </button>
      </DialogContent>
    </Dialog>
  );
}

/** Compact mode badge for sidebar – click to switch */
export function ModeBadge() {
  const { mode } = useMode();
  const [open, setOpen] = useState(false);
  const cfg = MODE_CONFIGS[mode];
  const Icon = ICONS[cfg.icon];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted w-full",
          cfg.color
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="truncate">{cfg.label}</span>
      </button>
      <ModeSwitcher open={open} onOpenChange={setOpen} />
    </>
  );
}
