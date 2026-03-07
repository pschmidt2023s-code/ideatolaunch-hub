import { CommunityPost } from "@/hooks/useCommunity";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FounderLevelBadge } from "./FounderLevelBadge";
import { ArrowUp, MessageCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  launch: "Launch",
  supplier_experience: "Supplier",
  growth: "Growth",
  lesson: "Lesson",
  feedback: "Feedback",
  market_signal: "Signal",
  case_study: "Case Study",
  match_request: "Match",
  discussion: "Diskussion",
};

interface PostCardProps {
  post: CommunityPost;
  onSelect: (id: string) => void;
  onUpvote: (id: string) => void;
}

export function PostCard({ post, onSelect, onUpvote }: PostCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-shadow border-border/60"
      onClick={() => onSelect(post.id)}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          {/* Upvote */}
          <div className="flex flex-col items-center gap-0.5 pt-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-accent/10"
              onClick={(e) => { e.stopPropagation(); onUpvote(post.id); }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-xs font-semibold text-muted-foreground">{post.upvote_count}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {TYPE_LABELS[post.post_type] || post.post_type}
              </Badge>
              {post.pinned && (
                <Badge className="text-[10px] px-1.5 py-0 bg-accent text-accent-foreground">Pinned</Badge>
              )}
              {post.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
              ))}
            </div>
            <h3 className="font-semibold text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
            <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
              <FounderLevelBadge level={post.reputation?.level || "starter"} />
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {post.reply_count}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: de })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
