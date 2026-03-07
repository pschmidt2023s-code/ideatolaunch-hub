import { useMarketSignals, useCaseStudies, useTopSuppliers, useTrendingPosts } from "@/hooks/useCommunity";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Flame, Factory, FlaskConical, BookOpen, TrendingUp, BookMarked, MessageSquare, Radar, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface FeedItem {
  id: string;
  type: "signal" | "experiment" | "case_study" | "supplier" | "post" | "log";
  title: string;
  subtitle: string;
  timestamp: string;
  score?: number;
  badge?: string;
}

export function IntelligenceFeed() {
  const { data: signals } = useMarketSignals();
  const { data: cases } = useCaseStudies();
  const { data: suppliers } = useTopSuppliers();
  const { data: trending } = useTrendingPosts();
  const { data: experiments } = useQuery({
    queryKey: ["feed-experiments"],
    queryFn: async () => {
      const { data } = await supabase.from("community_experiments").select("*").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });
  const { data: logs } = useQuery({
    queryKey: ["feed-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("community_startup_logs").select("*").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  // Merge into unified feed
  const feed: FeedItem[] = [
    ...(signals?.slice(0, 5).map(s => ({
      id: `sig-${s.id}`, type: "signal" as const, title: s.title,
      subtitle: `Trend Stärke: ${(s.metadata?.trend_strength as number) || 0}/10`,
      timestamp: s.created_at, score: s.upvote_count, badge: s.metadata?.platform as string,
    })) || []),
    ...(experiments?.slice(0, 5).map((e: any) => ({
      id: `exp-${e.id}`, type: "experiment" as const, title: e.title,
      subtitle: e.key_insight || e.result || e.description || "",
      timestamp: e.created_at, badge: e.experiment_type,
    })) || []),
    ...(cases?.slice(0, 3).map(c => ({
      id: `case-${c.id}`, type: "case_study" as const, title: c.title,
      subtitle: (c.metadata?.industry as string) || "Case Study",
      timestamp: c.created_at, score: c.upvote_count,
    })) || []),
    ...(suppliers?.slice(0, 3).map(s => ({
      id: `sup-${s.id}`, type: "supplier" as const, title: s.supplier_name,
      subtitle: `${s.country || ""} · ⭐ ${((s.quality_rating + s.communication_rating + s.delivery_rating) / 3).toFixed(1)}`,
      timestamp: s.created_at,
    })) || []),
    ...(logs?.slice(0, 5).map((l: any) => ({
      id: `log-${l.id}`, type: "log" as const, title: `Tag ${l.day_number}: ${l.title}`,
      subtitle: l.brand_name, timestamp: l.created_at,
    })) || []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const ICONS = {
    signal: { icon: Radar, color: "text-destructive bg-destructive/10" },
    experiment: { icon: FlaskConical, color: "text-accent bg-accent/10" },
    case_study: { icon: BookOpen, color: "text-purple-500 bg-purple-500/10" },
    supplier: { icon: Factory, color: "text-blue-500 bg-blue-500/10" },
    post: { icon: MessageSquare, color: "text-muted-foreground bg-muted" },
    log: { icon: BookMarked, color: "text-green-500 bg-green-500/10" },
  };

  const LABELS = { signal: "Signal", experiment: "Experiment", case_study: "Case Study", supplier: "Supplier", post: "Post", log: "Log" };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold flex items-center gap-2"><Activity className="h-5 w-5 text-accent" />Intelligence Feed</h3>
        <p className="text-xs text-muted-foreground">Echtzeit-Stream aller Community-Intelligence</p>
      </div>

      {feed.length === 0 && (
        <div className="text-center py-14">
          <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Noch keine Intelligence-Daten</h3>
          <p className="text-xs text-muted-foreground">Der Feed wird gefüllt sobald Community-Aktivität vorhanden ist.</p>
        </div>
      )}

      <div className="space-y-1.5">
        {feed.slice(0, 25).map(item => {
          const config = ICONS[item.type];
          const Icon = config.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium line-clamp-1">{item.title}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{item.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-[9px]">{LABELS[item.type]}</Badge>
                {item.badge && <Badge variant="outline" className="text-[9px]">{item.badge}</Badge>}
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: de })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
