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
      <DialogContent className="sm:max-w-md" onPointerDownOutside={isInitial ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {isInitial ? "Select Your Mode" : "Switch Mode"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {isInitial ? "Choose your focus — you can switch anytime." : "Change your mode for a tailored experience."}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 mt-3">
          {ALL_MODES.map((key) => {
            const cfg = MODE_CONFIGS[key];
            const Icon = ICONS[cfg.icon];
            const isSelected = selected === key;

            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                  isSelected
                    ? "border-foreground bg-muted/50"
                    : "border-border hover:border-foreground/20 hover:bg-muted/30"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-3.5 w-3.5 text-foreground" />
                  </div>
                )}
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{cfg.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{cfg.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={saving}
          className="mt-3 w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isInitial ? "Get Started" : "Switch Mode"}
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
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors w-full"
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="truncate">{cfg.label}</span>
      </button>
      <ModeSwitcher open={open} onOpenChange={setOpen} />
    </>
  );
}
