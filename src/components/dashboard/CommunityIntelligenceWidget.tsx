import { useTrendingPosts } from "@/hooks/useCommunity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, BookOpen, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TYPE_ICONS: Record<string, React.ElementType> = {
  market_signal: TrendingUp,
  case_study: BookOpen,
  launch: Users,
};

export function CommunityIntelligenceWidget() {
  const { data: trending } = useTrendingPosts();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-accent" />
            Community Intelligence
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/dashboard/community")}>
            Öffnen <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {(!trending || trending.length === 0) && (
          <p className="text-xs text-muted-foreground text-center py-4">Noch keine Community-Daten.</p>
        )}
        {trending?.slice(0, 4).map((post) => {
          const Icon = TYPE_ICONS[post.post_type] || MessageCircle;
          return (
            <div
              key={post.id}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate("/dashboard/community")}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium line-clamp-1">{post.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[9px] px-1 py-0">{post.post_type}</Badge>
                  <span className="text-[10px] text-muted-foreground">↑{post.upvote_count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
