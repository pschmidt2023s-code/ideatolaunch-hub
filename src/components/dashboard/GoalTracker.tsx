import { useState } from "react";
import { Plus, Target, CheckCircle2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export function GoalTracker() {
  const { user } = useAuth();
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", target_value: "", unit: "%", deadline: "" });

  const { data: goals = [] } = useQuery({
    queryKey: ["brand-goals", activeBrand?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_goals")
        .select("*")
        .eq("brand_id", activeBrand!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!activeBrand,
  });

  const addGoal = async () => {
    if (!form.title.trim() || !activeBrand || !user) return;
    const { error } = await supabase.from("brand_goals").insert({
      brand_id: activeBrand.id,
      user_id: user.id,
      title: form.title,
      target_value: form.target_value ? Number(form.target_value) : null,
      unit: form.unit,
      deadline: form.deadline || null,
    });
    if (error) { toast.error("Fehler"); return; }
    toast.success(isDE ? "Ziel erstellt" : "Goal created");
    setAddOpen(false);
    setForm({ title: "", target_value: "", unit: "%", deadline: "" });
    queryClient.invalidateQueries({ queryKey: ["brand-goals", activeBrand.id] });
  };

  const updateProgress = async (id: string, value: number) => {
    await supabase.from("brand_goals").update({ current_value: value }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["brand-goals", activeBrand?.id] });
  };

  const toggleComplete = async (id: string, current: string) => {
    const newStatus = current === "completed" ? "active" : "completed";
    await supabase.from("brand_goals").update({ status: newStatus }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["brand-goals", activeBrand?.id] });
  };

  const deleteGoal = async (id: string) => {
    await supabase.from("brand_goals").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["brand-goals", activeBrand?.id] });
  };

  const activeGoals = goals.filter((g: any) => g.status === "active");
  const completedGoals = goals.filter((g: any) => g.status === "completed");

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <Target className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{isDE ? "Ziele" : "Goals"}</h3>
            <p className="text-[11px] text-muted-foreground">
              {activeGoals.length} {isDE ? "aktiv" : "active"} · {completedGoals.length} {isDE ? "erledigt" : "done"}
            </p>
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" />
          {isDE ? "Neues Ziel" : "New Goal"}
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="py-6 text-center">
          <Target className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            {isDE ? "Setze dir Ziele für deine Marke" : "Set goals for your brand"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeGoals.map((g: any) => {
            const progress = g.target_value ? Math.min((g.current_value / g.target_value) * 100, 100) : 0;
            return (
              <div key={g.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleComplete(g.id, g.status)}>
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 hover:border-accent transition-colors" />
                    </button>
                    <span className="text-sm font-medium">{g.title}</span>
                  </div>
                  <button onClick={() => deleteGoal(g.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {g.target_value && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{g.current_value}{g.unit} / {g.target_value}{g.unit}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <input
                      type="range"
                      min={0}
                      max={g.target_value}
                      value={g.current_value}
                      onChange={(e) => updateProgress(g.id, Number(e.target.value))}
                      className="w-full h-1 accent-accent cursor-pointer"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {completedGoals.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5">{isDE ? "Erledigt" : "Completed"}</p>
              {completedGoals.slice(0, 3).map((g: any) => (
                <div key={g.id} className="flex items-center gap-2 py-1">
                  <button onClick={() => toggleComplete(g.id, g.status)}>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </button>
                  <span className="text-xs text-muted-foreground line-through">{g.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isDE ? "Neues Ziel" : "New Goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder={isDE ? "Ziel-Titel *" : "Goal title *"} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder={isDE ? "Zielwert" : "Target value"} value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} />
              <Input placeholder={isDE ? "Einheit (%, €, Stk)" : "Unit (%, €, pcs)"} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{isDE ? "Abbrechen" : "Cancel"}</Button>
            <Button onClick={addGoal} disabled={!form.title.trim()}>{isDE ? "Erstellen" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
