import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCommunityPost, usePostReplies, useCreateReply } from "@/hooks/useCommunity";
import { FounderLevelBadge } from "./FounderLevelBadge";
import { ArrowUp, MessageCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Props {
  postId: string | null;
  onClose: () => void;
}

export function PostDetailDialog({ postId, onClose }: Props) {
  const { data: post } = useCommunityPost(postId || "");
  const { data: replies } = usePostReplies(postId || "");
  const createReply = useCreateReply();
  const [replyContent, setReplyContent] = useState("");

  if (!postId) return null;

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    await createReply.mutateAsync({ postId, content: replyContent.trim() });
    setReplyContent("");
  };

  return (
    <Dialog open={!!postId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        {post && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px]">{post.post_type}</Badge>
                <FounderLevelBadge level={post.reputation?.level || "starter"} />
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: de })}
                </span>
              </div>
              <DialogTitle className="text-lg">{post.title}</DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none mt-2">
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{post.content}</p>
            </div>
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground border-t pt-3">
              <span className="flex items-center gap-1"><ArrowUp className="h-3.5 w-3.5" />{post.upvote_count} Upvotes</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.reply_count} Antworten</span>
            </div>

            {/* Replies */}
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-semibold">Antworten</h4>
              {replies?.length === 0 && <p className="text-xs text-muted-foreground">Noch keine Antworten.</p>}
              {replies?.map((reply) => (
                <div key={reply.id} className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FounderLevelBadge level={reply.reputation?.level || "starter"} />
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: de })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div className="mt-4 space-y-2 border-t pt-3">
              <Textarea
                placeholder="Deine Antwort..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                maxLength={2000}
              />
              <Button
                size="sm"
                disabled={createReply.isPending || !replyContent.trim()}
                onClick={handleReply}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {createReply.isPending ? "Wird gesendet..." : "Antworten"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
