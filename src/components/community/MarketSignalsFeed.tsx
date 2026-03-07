import { useCommunityPosts, useToggleUpvote } from "@/hooks/useCommunity";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, BarChart3, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketSignalsFeed() {
  const { data: signals, isLoading } = useCommunityPosts("market_signal");
  const upvote = useToggleUpvote();

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {(!signals || signals.length === 0) && (
        <div className="text-center py-8">
          <TrendingUp className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Noch keine Market Signals.</p>
        </div>
      )}
      {signals?.map((signal) => {
        const meta = signal.metadata || {};
        return (
          <Card key={signal.id} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                  {(meta.trend_strength as number) >= 8 ? <Flame className="h-4.5 w-4.5 text-destructive" /> : <TrendingUp className="h-4.5 w-4.5 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold line-clamp-1">{signal.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{signal.content}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {meta.product_category && <Badge variant="outline" className="text-[10px]">{meta.product_category as string}</Badge>}
                    {meta.platform && <Badge variant="outline" className="text-[10px]">{meta.platform as string}</Badge>}
                    {meta.opportunity_score && (
                      <span className="text-[10px] font-semibold text-accent flex items-center gap-0.5">
                        <BarChart3 className="h-3 w-3" />{meta.opportunity_score as number}/10
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => upvote.mutate({ postId: signal.id })}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Upvote</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
