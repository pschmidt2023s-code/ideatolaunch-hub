import { useState } from "react";
import { useCommunityPosts, useCreatePost, useToggleUpvote, CommunityPost } from "@/hooks/useCommunity";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Plus, ArrowUp, Eye, Flame, Palette, Package, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const FEEDBACK_CATEGORIES = [
  { value: "landing_page", label: "🌐 Landing Page Roast", icon: Globe },
  { value: "brand_name", label: "✨ Brand Name Feedback", icon: Palette },
  { value: "product", label: "📦 Product Validation", icon: Package },
  { value: "packaging", label: "🎁 Packaging Feedback", icon: Package },
  { value: "strategy", label: "🎯 Strategy Review", icon: Eye },
];

function FeedbackCard({ post, onUpvote, onSelect }: { post: CommunityPost; onUpvote: () => void; onSelect: () => void }) {
  const cat = FEEDBACK_CATEGORIES.find(c => c.value === post.category);
  return (
    <Card className="border-border/60 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {cat && <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">{cat.label}</Badge>}
              {post.tags?.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
            </div>
            <h4 className="text-sm font-semibold line-clamp-1">{post.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{post.content}</p>
            <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
              <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 text-[11px]" onClick={(e) => { e.stopPropagation(); onUpvote(); }}>
                <ArrowUp className="h-3 w-3" /> {post.upvote_count}
              </Button>
              <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.reply_count}</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: de })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeedbackSection({ onSelectPost }: { onSelectPost: (id: string) => void }) {
  const { data: posts, isLoading } = useCommunityPosts("feedback");
  const upvote = useToggleUpvote();
  const createPost = useCreatePost();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "landing_page", tags: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    await createPost.mutateAsync({
      title: form.title.trim(),
      content: form.content.trim(),
      post_type: "feedback",
      category: form.category,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setForm({ title: "", content: "", category: "landing_page", tags: "" });
    setAddOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />Founder Feedback</h3>
          <p className="text-xs text-muted-foreground">Hole dir konstruktives Feedback von anderen Gründern</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Feedback anfragen
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FEEDBACK_CATEGORIES.map(c => (
          <Badge key={c.value} variant="outline" className="text-[11px] cursor-pointer hover:bg-muted/50">{c.label}</Badge>
        ))}
      </div>

      {isLoading && <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>}

      {!isLoading && (!posts || posts.length === 0) && (
        <div className="text-center py-14">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Noch kein Feedback angefragt</h3>
          <p className="text-xs text-muted-foreground mb-4">Lass deine Idee, dein Branding oder deine Strategie von Gründern roasten.</p>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Erstes Feedback anfragen
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {posts?.map(post => (
          <FeedbackCard key={post.id} post={post} onUpvote={() => upvote.mutate({ postId: post.id })} onSelect={() => onSelectPost(post.id)} />
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Feedback anfragen</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
              <SelectContent>{FEEDBACK_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Titel *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={200} />
            <Textarea placeholder="Beschreibe was du feedbacken lassen möchtest. Füge Links oder Details hinzu..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required rows={5} maxLength={5000} />
            <Input placeholder="Tags (kommagetrennt)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} maxLength={200} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Abbrechen</Button>
              <Button type="submit" disabled={createPost.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createPost.isPending ? "Wird gepostet..." : "Feedback anfragen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
