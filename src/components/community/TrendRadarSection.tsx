import { useState } from "react";
import { useMarketSignals, useCreatePost, useToggleUpvote, CommunityPost } from "@/hooks/useCommunity";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Flame, BarChart3, ArrowUp, Plus, Radar, Search, ExternalLink, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const PLATFORMS = ["TikTok", "Amazon", "Shopify", "Instagram", "Google Trends", "Temu", "Andere"];
const CATEGORIES = ["Beauty", "Health", "Home", "Fashion", "Tech", "Food", "Sport", "Pet", "Kids", "Andere"];

function TrendStrengthBar({ value }: { value: number }) {
  const pct = (value / 10) * 100;
  const color = value >= 8 ? "bg-destructive" : value >= 5 ? "bg-accent" : "bg-muted-foreground";
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Trend Stärke</span>
        <span className="font-bold">{value}/10</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TrendSignalCard({ signal, onUpvote }: { signal: CommunityPost; onUpvote: () => void }) {
  const meta = signal.metadata || {};
  const strength = (meta.trend_strength as number) || 5;
  const opportunityScore = (meta.opportunity_score as number) || 0;
  const isHot = strength >= 8;

  return (
    <Card className={`border-border/60 transition-shadow hover:shadow-md ${isHot ? "ring-1 ring-destructive/20" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${isHot ? "bg-destructive/10" : "bg-accent/10"}`}>
            {isHot ? <Flame className="h-5 w-5 text-destructive" /> : <TrendingUp className="h-5 w-5 text-accent" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {isHot && <Badge className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-0">🔥 Hot</Badge>}
              {meta.product_category && <Badge variant="outline" className="text-[10px]">{meta.product_category as string}</Badge>}
              {meta.platform && <Badge variant="outline" className="text-[10px]">{meta.platform as string}</Badge>}
            </div>
            <h4 className="text-sm font-semibold line-clamp-1">{signal.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{signal.content}</p>

            <div className="mt-3 space-y-2">
              <TrendStrengthBar value={strength} />
              {opportunityScore > 0 && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Zap className="h-3 w-3 text-accent" />
                  <span className="text-muted-foreground">Opportunity Score:</span>
                  <span className="font-bold text-accent">{opportunityScore}/10</span>
                </div>
              )}
              {meta.search_growth && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <BarChart3 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Suchtrend: {meta.search_growth as string}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
              <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 text-[11px]" onClick={(e) => { e.stopPropagation(); onUpvote(); }}>
                <ArrowUp className="h-3 w-3" /> {signal.upvote_count}
              </Button>
              <span>{formatDistanceToNow(new Date(signal.created_at), { addSuffix: true, locale: de })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendRadarSection() {
  const { data: signals, isLoading } = useMarketSignals();
  const upvote = useToggleUpvote();
  const createPost = useCreatePost();
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<string>();

  const [form, setForm] = useState({
    title: "", content: "", product_category: "", platform: "",
    trend_strength: 5, opportunity_score: 5, search_growth: "", evidence: "",
  });

  const filtered = signals?.filter((s) => {
    if (!filter) return true;
    return (s.metadata?.product_category as string) === filter;
  });

  // Group by strength
  const hot = filtered?.filter((s) => ((s.metadata?.trend_strength as number) || 0) >= 8) || [];
  const emerging = filtered?.filter((s) => {
    const str = (s.metadata?.trend_strength as number) || 0;
    return str >= 5 && str < 8;
  }) || [];
  const watching = filtered?.filter((s) => ((s.metadata?.trend_strength as number) || 0) < 5) || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createPost.mutateAsync({
      title: form.title.trim(),
      content: form.content.trim(),
      post_type: "market_signal",
      tags: [form.product_category, form.platform].filter(Boolean),
      metadata: {
        product_category: form.product_category,
        platform: form.platform,
        trend_strength: form.trend_strength,
        opportunity_score: form.opportunity_score,
        search_growth: form.search_growth,
        evidence: form.evidence,
      },
    });
    setForm({ title: "", content: "", product_category: "", platform: "", trend_strength: 5, opportunity_score: 5, search_growth: "", evidence: "" });
    setAddOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2"><Radar className="h-5 w-5 text-accent" />Trend Radar</h3>
          <p className="text-xs text-muted-foreground">Community-getriebene Markt-Signale und Trend-Erkennung</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Signal melden
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={!filter ? "default" : "outline"} size="sm" className="text-xs h-7" onClick={() => setFilter(undefined)}>Alle</Button>
        {CATEGORIES.slice(0, 8).map((c) => (
          <Button key={c} variant={filter === c ? "default" : "outline"} size="sm" className="text-xs h-7" onClick={() => setFilter(c)}>{c}</Button>
        ))}
      </div>

      {isLoading && <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>}

      {(!filtered || filtered.length === 0) && !isLoading && (
        <div className="text-center py-14">
          <Radar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Noch keine Trend Signals</h3>
          <p className="text-xs text-muted-foreground mb-4">Teile Marktchancen und Trends mit der Community.</p>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Erstes Signal posten
          </Button>
        </div>
      )}

      {/* Grouped sections */}
      {hot.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-destructive mb-2 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5" /> Trending Opportunities ({hot.length})
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">{hot.map((s) => <TrendSignalCard key={s.id} signal={s} onUpvote={() => upvote.mutate({ postId: s.id })} />)}</div>
        </div>
      )}
      {emerging.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Emerging Niches ({emerging.length})
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">{emerging.map((s) => <TrendSignalCard key={s.id} signal={s} onUpvote={() => upvote.mutate({ postId: s.id })} />)}</div>
        </div>
      )}
      {watching.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> On the Radar ({watching.length})
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">{watching.map((s) => <TrendSignalCard key={s.id} signal={s} onUpvote={() => upvote.mutate({ postId: s.id })} />)}</div>
        </div>
      )}

      {/* Create Signal Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Trend Signal melden</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input placeholder="Trend Name *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.product_category || "empty"} onValueChange={(v) => setForm({ ...form, product_category: v === "empty" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Kategorie wählen</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.platform || "empty"} onValueChange={(v) => setForm({ ...form, platform: v === "empty" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Plattform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Plattform wählen</SelectItem>
                  {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Beschreibe den Trend und warum er relevant ist..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={3} maxLength={3000} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Trend Stärke ({form.trend_strength}/10)</label>
                <Select value={String(form.trend_strength)} onValueChange={(v) => setForm({ ...form, trend_strength: Number(v) })}>
                  <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Opportunity Score ({form.opportunity_score}/10)</label>
                <Select value={String(form.opportunity_score)} onValueChange={(v) => setForm({ ...form, opportunity_score: Number(v) })}>
                  <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Input placeholder="Suchtrend (z.B. +120% in 3 Monaten)" value={form.search_growth} onChange={(e) => setForm({ ...form, search_growth: e.target.value })} />
            <Input placeholder="Quelle / Link (optional)" value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Abbrechen</Button>
              <Button type="submit" disabled={createPost.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createPost.isPending ? "Wird gepostet..." : "Signal posten"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
