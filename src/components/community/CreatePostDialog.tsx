import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePost, PostType } from "@/hooks/useCommunity";

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "launch", label: "🚀 Launch Showcase" },
  { value: "supplier_experience", label: "🏭 Supplier Experience" },
  { value: "growth", label: "📈 Growth Experiment" },
  { value: "lesson", label: "💡 Founder Lesson" },
  { value: "feedback", label: "🎯 Startup Feedback" },
  { value: "market_signal", label: "📊 Market Signal" },
  { value: "case_study", label: "📖 Case Study" },
  { value: "match_request", label: "🤝 Founder Match" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: PostType;
}

export function CreatePostDialog({ open, onOpenChange, defaultType }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<string>(defaultType || "launch");
  const [tags, setTags] = useState("");
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await createPost.mutateAsync({
      title: title.trim(),
      content: content.trim(),
      post_type: postType,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setTitle("");
    setContent("");
    setTags("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neuer Beitrag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger>
              <SelectValue placeholder="Typ wählen" />
            </SelectTrigger>
            <SelectContent>
              {POST_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />
          <Textarea
            placeholder="Beschreibe deinen Beitrag..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={5}
            maxLength={5000}
          />
          <Input
            placeholder="Tags (kommagetrennt)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            maxLength={200}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={createPost.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {createPost.isPending ? "Wird veröffentlicht..." : "Veröffentlichen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
