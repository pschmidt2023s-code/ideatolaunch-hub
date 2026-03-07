import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Star, TrendingUp } from "lucide-react";
import { FounderLevelBadge } from "./FounderLevelBadge";

function useLeaderboard() {
  return useQuery({
    queryKey: ["community-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_reputation")
        .select("*")
        .order("points", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

const RANK_ICONS = [
  { icon: Crown, color: "text-amber-500" },
  { icon: Medal, color: "text-gray-400" },
  { icon: Medal, color: "text-amber-700" },
];

export function FounderLeaderboard() {
  const { data: leaders, isLoading } = useLeaderboard();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold flex items-center gap-2"><Trophy className="h-5 w-5 text-accent" />Founder Leaderboard</h3>
        <p className="text-xs text-muted-foreground">Die aktivsten und wertvollsten Community-Mitglieder</p>
      </div>

      {isLoading && <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>}

      {!isLoading && (!leaders || leaders.length === 0) && (
        <div className="text-center py-14">
          <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Noch kein Leaderboard</h3>
          <p className="text-xs text-muted-foreground">Teile Insights, um Reputation zu sammeln.</p>
        </div>
      )}

      <div className="space-y-1.5">
        {leaders?.map((user, i) => {
          const rankConfig = RANK_ICONS[i];
          const RankIcon = rankConfig?.icon || Star;
          const rankColor = rankConfig?.color || "text-muted-foreground";

          return (
            <Card key={user.id} className={`border-border/60 ${i < 3 ? "ring-1 ring-accent/10" : ""}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                  {i < 3 ? (
                    <RankIcon className={`h-4 w-4 ${rankColor}`} />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{user.display_name || "Anonym"}</span>
                    <FounderLevelBadge level={user.level} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span>{user.post_count} Posts</span>
                    <span>{user.reply_count} Replies</span>
                    <span>{user.review_count} Reviews</span>
                    <span>{user.case_study_count} Case Studies</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-accent">{user.points}</div>
                  <div className="text-[10px] text-muted-foreground">Punkte</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
