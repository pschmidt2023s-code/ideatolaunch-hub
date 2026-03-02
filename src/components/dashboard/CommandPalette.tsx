import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Command Center", path: "/dashboard/command", group: "Haupt" },
  { label: "Dashboard", path: "/dashboard", group: "Haupt" },
  { label: "Intelligence Suite", path: "/dashboard/intelligence", group: "Haupt" },
  { label: "Settings", path: "/dashboard/settings", group: "Haupt" },
  { label: "Phase 1 – Validierung & Marke", path: "/dashboard/step/1", group: "Journey" },
  { label: "Phase 2 – Finanzielle Klarheit", path: "/dashboard/step/2", group: "Journey" },
  { label: "Phase 3 – Produktion & Sourcing", path: "/dashboard/step/3", group: "Journey" },
  { label: "Phase 4 – Compliance & Vertrieb", path: "/dashboard/step/4", group: "Journey" },
  { label: "Phase 5 – Launch & Optimierung", path: "/dashboard/step/5", group: "Journey" },
  { label: "Empfehlungen", path: "/dashboard/referrals", group: "Extras" },
  { label: "Recovery Mode", path: "/dashboard/recovery", group: "Extras" },
  { label: "Execution OS", path: "/dashboard/execution", group: "Extras" },
  { label: "Revenue Activation", path: "/dashboard/revenue", group: "Extras" },
  { label: "Product Evolution", path: "/dashboard/evolution", group: "Extras" },
  { label: "Pricing", path: "/dashboard/pricing", group: "Extras" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const filtered = LINKS.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        onClick={toggle}
        className="flex w-full items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Suche…</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 gap-0">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Seite, Tool oder Phase suchen…"
              className="flex-1 bg-transparent py-3 px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nichts gefunden.</p>
            )}
            {filtered.map((l) => (
              <button
                key={l.path}
                onClick={() => go(l.path)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <span>{l.label}</span>
                <span className="text-[10px] text-muted-foreground">{l.group}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
