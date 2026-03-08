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
import { FlaskConical, Plus, ArrowUp, Target, DollarSign, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

const EXPERIMENT_TYPES = ["Marketing", "Product Validation", "Pricing", "Ads", "Content", "SEO", "Influencer", "Andere"];
const PLATFORMS = ["TikTok Ads", "Meta Ads", "Google Ads", "Amazon PPC", "Instagram", "YouTube", "Shopify", "Email", "Andere"];

function useExperiments() {
  return useQuery({
    queryKey: ["community-experiments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_experiments")
        .select("*")
        .order("upvote_count", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

function useCreateExperiment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (exp: { title: string; description: string; experiment_type: string; platform: string; budget: string; goal: string; result: string; key_insight: string; tags?: string[] }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("community_experiments").insert({ ...exp, user_id: user.id, tags: exp.tags || [] } as any);
      if (error) throw error;
      // Increment reputation
      await supabase.rpc("increment_reputation", { p_user_id: user.id, p_points: 5, p_field: "post_count" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["community-experiments"] }); toast.success("Experiment veröffentlicht! +5 Punkte 🎉"); },
    onError: () => toast.error("Fehler beim Veröffentlichen"),
  });
}

function useUpvoteExperiment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (experimentId: string) => {
      if (!user) throw new Error("Not authenticated");
      // Check if already upvoted (use experiment_id in post_id field)
      const { data: existing } = await supabase
        .from("community_upvotes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", experimentId)
        .maybeSingle();
      if (existing) {
        // Remove upvote
        await supabase.from("community_upvotes").delete().eq("id", existing.id);
        await supabase.from("community_experiments").update({ upvote_count: supabase.rpc ? undefined : 0 } as any).eq("id", experimentId);
      } else {
        await supabase.from("community_upvotes").insert({ user_id: user.id, post_id: experimentId } as any);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-experiments"] }),
  });
}

function ExperimentCard({ exp, onUpvote }: { exp: any; onUpvote: () => void }) {
  const hasResult = exp.result && exp.result.trim();
  return (
    <Card className="border-border/60 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 shrink-0">
            <FlaskConical className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="text-[10px]">{exp.experiment_type}</Badge>
              {exp.platform && <Badge variant="outline" className="text-[10px]">{exp.platform}</Badge>}
              {hasResult && <Badge className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-0">✓ Ergebnis</Badge>}
            </div>
            <h4 className="text-sm font-semibold line-clamp-1">{exp.title}</h4>
            {exp.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{exp.description}</p>}

            <div className="grid grid-cols-2 gap-2 mt-3">
              {exp.budget && (
                <div className="flex items-center gap-1.5 text-[11px] bg-muted/50 rounded-lg px-2 py-1.5">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">Budget: {exp.budget}</span>
                </div>
              )}
              {exp.goal && (
                <div className="flex items-center gap-1.5 text-[11px] bg-muted/50 rounded-lg px-2 py-1.5">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{exp.goal}</span>
                </div>
              )}
            </div>

            {hasResult && (
              <div className="mt-2 p-2.5 rounded-lg bg-success/5 border border-success/10">
                <p className="text-[11px] font-semibold text-success flex items-center gap-1 mb-0.5">
                  <BarChart3 className="h-3 w-3" /> Ergebnis
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{exp.result}</p>
              </div>
            )}

            {exp.key_insight && (
              <div className="mt-2 p-2.5 rounded-lg bg-accent/5 border border-accent/10">
                <p className="text-[11px] font-semibold text-accent flex items-center gap-1 mb-0.5">
                  <Zap className="h-3 w-3" /> Key Insight
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{exp.key_insight}</p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
              <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 text-[11px] hover:text-accent" onClick={(e) => { e.stopPropagation(); onUpvote(); }}>
                <ArrowUp className="h-3 w-3" /> {exp.upvote_count}
              </Button>
              <span>{formatDistanceToNow(new Date(exp.created_at), { addSuffix: true, locale: de })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExperimentsFeed() {
  const { data: experiments, isLoading } = useExperiments();
  const createExp = useCreateExperiment();
  const upvoteExp = useUpvoteExperiment();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", experiment_type: "Marketing", platform: "", budget: "", goal: "", result: "", key_insight: "", tags: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createExp.mutateAsync({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setForm({ title: "", description: "", experiment_type: "Marketing", platform: "", budget: "", goal: "", result: "", key_insight: "", tags: "" });
    setAddOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2"><FlaskConical className="h-5 w-5 text-accent" />Founder Experiments</h3>
          <p className="text-xs text-muted-foreground">Echte Business-Experimente von echten Gründern</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Experiment teilen
        </Button>
      </div>

      {isLoading && <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}</div>}

      {!isLoading && (!experiments || experiments.length === 0) && (
        <div className="text-center py-14 rounded-2xl border border-dashed border-border bg-muted/20">
          <FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Noch keine Experimente</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">Teile dein erstes Business-Experiment und hilf anderen Gründern mit echten Daten.</p>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Erstes Experiment teilen
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {experiments?.map(exp => <ExperimentCard key={exp.id} exp={exp} onUpvote={() => upvoteExp.mutate(exp.id)} />)}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Experiment teilen</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input placeholder="Experiment Titel *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={200} />
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.experiment_type} onValueChange={v => setForm({ ...form, experiment_type: v })}>
                <SelectTrigger><SelectValue placeholder="Typ" /></SelectTrigger>
                <SelectContent>{EXPERIMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.platform || "empty"} onValueChange={v => setForm({ ...form, platform: v === "empty" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Plattform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Plattform wählen</SelectItem>
                  {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Budget (z.B. 500€)" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
              <Input placeholder="Ziel" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} />
            </div>
            <Textarea placeholder="Beschreibe dein Experiment..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} maxLength={5000} />
            <Textarea placeholder="Ergebnis (z.B. CPA 4.20€, 120 Leads...)" value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} rows={2} maxLength={2000} />
            <Textarea placeholder="Key Insight – Was hast du gelernt?" value={form.key_insight} onChange={e => setForm({ ...form, key_insight: e.target.value })} rows={2} maxLength={2000} />
            <Input placeholder="Tags (kommagetrennt)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} maxLength={200} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Abbrechen</Button>
              <Button type="submit" disabled={createExp.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createExp.isPending ? "Wird veröffentlicht..." : "Experiment veröffentlichen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
