import { useState } from "react";
import { useCaseStudies, useCreatePost, useToggleUpvote, CommunityPost } from "@/hooks/useCommunity";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Plus, ArrowUp, Lightbulb, Rocket, Target, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { FounderLevelBadge } from "./FounderLevelBadge";

const INDUSTRIES = ["E-Commerce", "SaaS", "DTC Brand", "Food & Beverage", "Beauty & Cosmetics", "Fashion", "Health & Wellness", "Tech Hardware", "Andere"];

interface CaseStudyMeta {
  brand_name?: string;
  industry?: string;
  product_type?: string;
  starting_budget?: string;
  marketing_strategy?: string;
  revenue_milestones?: string;
  major_challenges?: string;
  lessons_learned?: string;
}

function CaseStudyStoryCard({ post, onUpvote }: { post: CommunityPost; onUpvote: () => void }) {
  const meta = (post.metadata || {}) as CaseStudyMeta;
  const [expanded, setExpanded] = useState(false);

  const sections = [
    { icon: Lightbulb, label: "Idee", content: post.content, color: "text-blue-500" },
    { icon: Target, label: "Strategie", content: meta.marketing_strategy, color: "text-accent" },
    { icon: TrendingUp, label: "Ergebnisse", content: meta.revenue_milestones, color: "text-green-500" },
    { icon: AlertTriangle, label: "Challenges", content: meta.major_challenges, color: "text-destructive" },
    { icon: BookOpen, label: "Lessons", content: meta.lessons_learned, color: "text-purple-500" },
  ].filter((s) => s.content);

  return (
    <Card className="border-border/60 hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge className="text-[10px] px-1.5 py-0 bg-accent/10 text-accent border-0">Case Study</Badge>
                {meta.industry && <Badge variant="outline" className="text-[10px]">{meta.industry}</Badge>}
                <FounderLevelBadge level={post.reputation?.level || "starter"} />
              </div>
              <h3 className="font-semibold text-base leading-tight">{post.title}</h3>
              {meta.brand_name && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Rocket className="h-3 w-3" /> {meta.brand_name}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs shrink-0" onClick={(e) => { e.stopPropagation(); onUpvote(); }}>
              <ArrowUp className="h-3 w-3" /> {post.upvote_count}
            </Button>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-2 mt-3">
            {meta.starting_budget && (
              <div className="flex items-center gap-1 text-[11px] bg-muted/50 rounded-lg px-2 py-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span>Startkapital: {meta.starting_budget}</span>
              </div>
            )}
            {meta.product_type && (
              <div className="flex items-center gap-1 text-[11px] bg-muted/50 rounded-lg px-2 py-1">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span>{meta.product_type}</span>
              </div>
            )}
          </div>
        </div>

        {/* Story sections */}
        <div className="border-t">
          {sections.slice(0, expanded ? sections.length : 2).map(({ icon: Icon, label, content, color }, i) => (
            <div key={label} className={`px-5 py-3 ${i > 0 ? "border-t border-dashed" : ""}`}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${color}`}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
            </div>
          ))}
          {sections.length > 2 && (
            <button
              className="w-full px-5 py-2 text-xs text-accent font-medium hover:bg-muted/30 transition-colors border-t"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Weniger anzeigen" : `Alle ${sections.length} Abschnitte anzeigen`}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-muted/20 text-[11px] text-muted-foreground border-t">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: de })}
          {post.tags?.length > 0 && <> · {post.tags.map((t) => `#${t}`).join(" ")}</>}
        </div>
      </CardContent>
    </Card>
  );
}

export function FounderCaseStudiesSection() {
  const { data: cases, isLoading } = useCaseStudies();
  const upvote = useToggleUpvote();
  const createPost = useCreatePost();
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<string>();

  const [form, setForm] = useState({
    title: "", content: "", brand_name: "", industry: "", product_type: "",
    starting_budget: "", marketing_strategy: "", revenue_milestones: "",
    major_challenges: "", lessons_learned: "", tags: "",
  });

  const filtered = cases?.filter((c) => {
    if (!filter) return true;
    return (c.metadata?.industry as string) === filter;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    await createPost.mutateAsync({
      title: form.title.trim(),
      content: form.content.trim(),
      post_type: "case_study",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      metadata: {
        brand_name: form.brand_name,
        industry: form.industry,
        product_type: form.product_type,
        starting_budget: form.starting_budget,
        marketing_strategy: form.marketing_strategy,
        revenue_milestones: form.revenue_milestones,
        major_challenges: form.major_challenges,
        lessons_learned: form.lessons_learned,
      },
    });
    setForm({ title: "", content: "", brand_name: "", industry: "", product_type: "", starting_budget: "", marketing_strategy: "", revenue_milestones: "", major_challenges: "", lessons_learned: "", tags: "" });
    setAddOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-accent" />Founder Case Studies</h3>
          <p className="text-xs text-muted-foreground">Strukturierte Gründungsgeschichten als Knowledge-Library</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Case Study erstellen
        </Button>
      </div>

      {/* Industry filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={!filter ? "default" : "outline"} size="sm" className="text-xs h-7" onClick={() => setFilter(undefined)}>Alle</Button>
        {INDUSTRIES.slice(0, 6).map((ind) => (
          <Button key={ind} variant={filter === ind ? "default" : "outline"} size="sm" className="text-xs h-7" onClick={() => setFilter(ind)}>{ind}</Button>
        ))}
      </div>

      {isLoading && <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}</div>}

      {(!filtered || filtered.length === 0) && !isLoading && (
        <div className="text-center py-14">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Noch keine Case Studies</h3>
          <p className="text-xs text-muted-foreground mb-4">Teile deine Gründungsgeschichte als strukturierte Case Study.</p>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Erste Case Study erstellen
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {filtered?.map((post) => (
          <CaseStudyStoryCard key={post.id} post={post} onUpvote={() => upvote.mutate({ postId: post.id })} />
        ))}
      </div>

      {/* Create Case Study Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Case Study veröffentlichen</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <p className="text-xs text-muted-foreground">Teile deine Gründungsgeschichte als strukturierte Case Study mit der Community.</p>
            <Input placeholder="Titel deiner Case Study *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Brand Name" value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} />
              <Select value={form.industry || "empty"} onValueChange={(v) => setForm({ ...form, industry: v === "empty" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Branche" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Branche wählen</SelectItem>
                  {INDUSTRIES.map((ind) => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Produkt-Typ" value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} />
              <Input placeholder="Startkapital (z.B. 5.000€)" value={form.starting_budget} onChange={(e) => setForm({ ...form, starting_budget: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5 text-blue-500" /> Die Idee *</label>
              <Textarea placeholder="Beschreibe deine Geschäftsidee und den Anfang..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={3} maxLength={5000} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-accent" /> Marketing-Strategie</label>
              <Textarea placeholder="Welche Strategie hast du verwendet? (Ads, Content, SEO...)" value={form.marketing_strategy} onChange={(e) => setForm({ ...form, marketing_strategy: e.target.value })} rows={2} maxLength={3000} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-green-500" /> Revenue Milestones</label>
              <Textarea placeholder="Umsatz-Meilensteine (z.B. Erste 1.000€, 10.000€ Monat...)" value={form.revenue_milestones} onChange={(e) => setForm({ ...form, revenue_milestones: e.target.value })} rows={2} maxLength={3000} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Größte Herausforderungen</label>
              <Textarea placeholder="Welche Probleme musstest du überwinden?" value={form.major_challenges} onChange={(e) => setForm({ ...form, major_challenges: e.target.value })} rows={2} maxLength={3000} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-purple-500" /> Lessons Learned</label>
              <Textarea placeholder="Die wichtigsten Erkenntnisse für andere Gründer..." value={form.lessons_learned} onChange={(e) => setForm({ ...form, lessons_learned: e.target.value })} rows={2} maxLength={3000} />
            </div>
            <Input placeholder="Tags (kommagetrennt, z.B. DTC, Beauty, Amazon)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} maxLength={200} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Abbrechen</Button>
              <Button type="submit" disabled={createPost.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createPost.isPending ? "Wird veröffentlicht..." : "Case Study veröffentlichen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
