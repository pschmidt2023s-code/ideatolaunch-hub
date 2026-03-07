import { useState } from "react";
import { Plus, Trash2, ExternalLink, Shield, AlertTriangle, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/hooks/useBrand";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { AnimatedCard } from "./AnimatedCard";

const THREAT_CONFIG = {
  low: { color: "text-success", bg: "bg-success/10", label: "Gering" },
  medium: { color: "text-warning", bg: "bg-warning/10", label: "Mittel" },
  high: { color: "text-destructive", bg: "bg-destructive/10", label: "Hoch" },
} as const;

export function CompetitorTracker() {
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", price_range: "", strengths: "", weaknesses: "", threat_level: "medium" });

  const { data: competitors = [] } = useQuery({
    queryKey: ["competitors", activeBrand?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("competitors")
        .select("*")
        .eq("brand_id", activeBrand!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!activeBrand,
  });

  const addCompetitor = async () => {
    if (!form.name.trim() || !activeBrand) return;
    const { error } = await supabase.from("competitors").insert({
      brand_id: activeBrand.id,
      ...form,
    });
    if (error) { toast.error("Fehler beim Speichern"); return; }
    toast.success(isDE ? "Wettbewerber hinzugefügt" : "Competitor added");
    setAddOpen(false);
    setForm({ name: "", url: "", price_range: "", strengths: "", weaknesses: "", threat_level: "medium" });
    queryClient.invalidateQueries({ queryKey: ["competitors", activeBrand.id] });
  };

  const deleteCompetitor = async (id: string) => {
    await supabase.from("competitors").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["competitors", activeBrand?.id] });
    toast.success(isDE ? "Gelöscht" : "Deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{isDE ? "Wettbewerber-Tracking" : "Competitor Tracking"}</h2>
          <p className="text-sm text-muted-foreground">
            {isDE ? "Behalte deine Konkurrenz im Blick" : "Keep an eye on your competition"}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} variant="premium" className="gap-2">
          <Plus className="h-4 w-4" />
          {isDE ? "Hinzufügen" : "Add"}
        </Button>
      </div>

      {competitors.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Target className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {isDE ? "Noch keine Wettbewerber erfasst" : "No competitors tracked yet"}
          </p>
          <Button onClick={() => setAddOpen(true)} variant="outline" className="mt-3 gap-2">
            <Plus className="h-4 w-4" />
            {isDE ? "Ersten Wettbewerber hinzufügen" : "Add first competitor"}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {competitors.map((c: any, i: number) => {
            const threat = THREAT_CONFIG[c.threat_level as keyof typeof THREAT_CONFIG] || THREAT_CONFIG.medium;
            return (
              <AnimatedCard key={c.id} index={i}>
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted font-bold text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        {c.price_range && (
                          <p className="text-[11px] text-muted-foreground">{c.price_range}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", threat.bg, threat.color)}>
                        {c.threat_level === "high" ? <AlertTriangle className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                        {threat.label}
                      </span>
                    </div>
                  </div>

                  {c.strengths && (
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">{isDE ? "Stärken" : "Strengths"}</p>
                      <p className="text-xs mt-0.5">{c.strengths}</p>
                    </div>
                  )}
                  {c.weaknesses && (
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">{isDE ? "Schwächen" : "Weaknesses"}</p>
                      <p className="text-xs mt-0.5">{c.weaknesses}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t">
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline">
                        <ExternalLink className="h-3 w-3" /> Website
                      </a>
                    ) : <span />}
                    <button onClick={() => deleteCompetitor(c.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isDE ? "Wettbewerber hinzufügen" : "Add Competitor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder={isDE ? "Name *" : "Name *"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="URL (optional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <Input placeholder={isDE ? "Preisbereich (z.B. 20-30€)" : "Price range"} value={form.price_range} onChange={(e) => setForm({ ...form, price_range: e.target.value })} />
            <Input placeholder={isDE ? "Stärken" : "Strengths"} value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} />
            <Input placeholder={isDE ? "Schwächen" : "Weaknesses"} value={form.weaknesses} onChange={(e) => setForm({ ...form, weaknesses: e.target.value })} />
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setForm({ ...form, threat_level: level })}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    form.threat_level === level ? THREAT_CONFIG[level].bg + " border-current " + THREAT_CONFIG[level].color : "hover:bg-muted"
                  )}
                >
                  {THREAT_CONFIG[level].label}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{isDE ? "Abbrechen" : "Cancel"}</Button>
            <Button onClick={addCompetitor} disabled={!form.name.trim()}>{isDE ? "Hinzufügen" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
