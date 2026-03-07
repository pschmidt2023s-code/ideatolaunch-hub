import { useCommunityPosts, useToggleUpvote } from "@/hooks/useCommunity";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FounderLevelBadge } from "./FounderLevelBadge";
import { Handshake, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const MATCH_LABELS: Record<string, string> = {
  cofounder: "Co-Founder",
  designer: "Designer",
  marketing: "Marketing Partner",
  investor: "Investor",
  developer: "Developer",
};

export function FounderMatchSection() {
  const { data: matches, isLoading } = useCommunityPosts("match_request");

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {(!matches || matches.length === 0) && (
        <div className="text-center py-8">
          <Handshake className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Noch keine Match-Anfragen.</p>
          <p className="text-xs text-muted-foreground mt-1">Erstelle einen Beitrag vom Typ "Founder Match".</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {matches?.map((match) => {
          const meta = match.metadata || {};
          return (
            <Card key={match.id} className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 shrink-0">
                    <Handshake className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-1">{match.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{match.content}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {meta.looking_for && <Badge className="text-[10px] bg-accent/10 text-accent border-0">{MATCH_LABELS[(meta.looking_for as string)] || (meta.looking_for as string)}</Badge>}
                      {match.tags?.map((tag) => <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>)}
                      <FounderLevelBadge level={match.reputation?.level || "starter"} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {match.reply_count} ·{" "}
                      {formatDistanceToNow(new Date(match.created_at), { addSuffix: true, locale: de })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
