import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookMarked, Plus, Rocket, Package, ShoppingCart, Lightbulb, Milestone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

const MILESTONE_TYPES = [
  { value: "idea", label: "💡 Idee", icon: Lightbulb, color: "text-info bg-info/10" },
  { value: "supplier", label: "🏭 Supplier", icon: Package, color: "text-accent bg-accent/10" },
  { value: "sample", label: "📦 Sample", icon: Package, color: "text-purple-500 bg-purple-500/10" },
  { value: "launch", label: "🚀 Launch", icon: Rocket, color: "text-success bg-success/10" },
  { value: "first_sale", label: "💰 First Sale", icon: ShoppingCart, color: "text-warning bg-warning/10" },
  { value: "milestone", label: "🎯 Milestone", icon: Milestone, color: "text-destructive bg-destructive/10" },
  { value: "update", label: "📝 Update", icon: BookMarked, color: "text-muted-foreground bg-muted" },
];

function useStartupLogs() {
  return useQuery({
    queryKey: ["startup-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_startup_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

function useCreateLog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (log: { brand_name: string; industry?: string; day_number: number; title: string; content: string; milestone_type: string; tags?: string[] }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("community_startup_logs").insert({ ...log, user_id: user.id, tags: log.tags || [] } as any);
      if (error) throw error;
      await supabase.rpc("increment_reputation", { p_user_id: user.id, p_points: 3, p_field: "post_count" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["startup-logs"] }); toast.success("Log veröffentlicht! +3 Punkte 🎉"); },
    onError: () => toast.error("Fehler beim Veröffentlichen"),
  });
}

function LogTimelineEntry({ log }: { log: any }) {
  const milestone = MILESTONE_TYPES.find(m => m.value === log.milestone_type) || MILESTONE_TYPES[6];
  const Icon = milestone.icon;

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 transition-transform duration-200 group-hover:scale-110 ${milestone.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <Card className="flex-1 border-border/60 mb-3 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className="text-[10px] font-mono">Tag {log.day_number}</Badge>
            <Badge className={`text-[10px] px-1.5 py-0 border-0 ${milestone.color}`}>{milestone.label}</Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: de })}</span>
          </div>
          <h4 className="text-sm font-semibold">{log.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{log.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Rocket className="h-3 w-3" /> {log.brand_name}
            </span>
            {log.industry && <Badge variant="outline" className="text-[9px]">{log.industry}</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function StartupLogs() {
  const { data: logs, isLoading } = useStartupLogs();
  const createLog = useCreateLog();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ brand_name: "", industry: "", day_number: "1", title: "", content: "", milestone_type: "update", tags: "" });

  const grouped = logs?.reduce((acc: Record<string, any[]>, log: any) => {
    const key = `${log.user_id}-${log.brand_name}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {} as Record<string, any[]>) || {};

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.brand_name.trim()) return;
    await createLog.mutateAsync({
      brand_name: form.brand_name.trim(),
      industry: form.industry || undefined,
      day_number: parseInt(form.day_number) || 1,
      title: form.title.trim(),
      content: form.content.trim(),
      milestone_type: form.milestone_type,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setForm({ ...form, title: "", content: "", day_number: String((parseInt(form.day_number) || 0) + 1) });
    setAddOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2"><BookMarked className="h-5 w-5 text-accent" />Startup Logs</h3>
          <p className="text-xs text-muted-foreground">Gründer dokumentieren ihre Journey öffentlich</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Log-Eintrag
        </Button>
      </div>

      {isLoading && <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>}

      {!isLoading && (!logs || logs.length === 0) && (
        <div className="text-center py-14 rounded-2xl border border-dashed border-border bg-muted/20">
          <BookMarked className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Noch keine Startup Logs</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">Dokumentiere deine Gründungsreise öffentlich und inspiriere andere Founder.</p>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Erstes Log starten
          </Button>
        </div>
      )}

      {Object.entries(grouped).map(([key, entries]) => (
        <div key={key} className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-semibold">{(entries as any[])[0].brand_name}</h4>
            <Badge variant="outline" className="text-[10px]">{(entries as any[]).length} Einträge</Badge>
          </div>
          <div className="ml-1">
            {(entries as any[]).map((log: any) => <LogTimelineEntry key={log.id} log={log} />)}
          </div>
        </div>
      ))}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Startup Log Eintrag</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Brand Name *" value={form.brand_name} onChange={e => setForm({ ...form, brand_name: e.target.value })} required maxLength={100} />
              <Input placeholder="Branche" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} maxLength={100} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Tag #" value={form.day_number} onChange={e => setForm({ ...form, day_number: e.target.value })} min={1} />
              <Select value={form.milestone_type} onValueChange={v => setForm({ ...form, milestone_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MILESTONE_TYPES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Titel *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={200} />
            <Textarea placeholder="Was ist passiert? Was hast du gelernt?" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required rows={4} maxLength={5000} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Abbrechen</Button>
              <Button type="submit" disabled={createLog.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createLog.isPending ? "Wird gepostet..." : "Log veröffentlichen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
