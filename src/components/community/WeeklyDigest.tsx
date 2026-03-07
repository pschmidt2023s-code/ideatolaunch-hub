import { useTrendingPosts, useTopSuppliers, useMarketSignals, useCaseStudies } from "@/hooks/useCommunity";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Flame, Factory, FlaskConical, BookOpen, TrendingUp, Star, Radar } from "lucide-react";

function useTopExperiments() {
  return useQuery({
    queryKey: ["top-experiments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_experiments")
        .select("*")
        .order("upvote_count", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
  });
}

export function WeeklyDigest() {
  const { data: signals } = useMarketSignals();
  const { data: suppliers } = useTopSuppliers();
  const { data: cases } = useCaseStudies();
  const { data: experiments } = useTopExperiments();

  const topSignals = signals?.slice(0, 3) || [];
  const topSuppliers = suppliers?.slice(0, 3) || [];
  const topCases = cases?.slice(0, 2) || [];
  const topExperiments = experiments?.slice(0, 3) || [];

  const hasData = topSignals.length > 0 || topSuppliers.length > 0 || topCases.length > 0 || topExperiments.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold flex items-center gap-2"><Newspaper className="h-5 w-5 text-accent" />Weekly Community Digest</h3>
        <p className="text-xs text-muted-foreground">Die wichtigsten Insights dieser Woche</p>
      </div>

      {!hasData && (
        <div className="text-center py-14">
          <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Noch kein Digest verfügbar</h3>
          <p className="text-xs text-muted-foreground">Der Digest wird automatisch generiert sobald Community-Aktivität vorhanden ist.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Top Market Signals */}
        {topSignals.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Radar className="h-3.5 w-3.5 text-destructive" /> Trending Signals
              </h4>
              <div className="space-y-2">
                {topSignals.map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <Flame className="h-3 w-3 text-destructive shrink-0" />
                    <span className="font-medium truncate">{s.title}</span>
                    <span className="text-muted-foreground ml-auto shrink-0">↑{s.upvote_count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Best Experiments */}
        {topExperiments.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <FlaskConical className="h-3.5 w-3.5 text-accent" /> Best Experiments
              </h4>
              <div className="space-y-2">
                {topExperiments.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-2 text-xs">
                    <FlaskConical className="h-3 w-3 text-accent shrink-0" />
                    <span className="font-medium truncate">{e.title}</span>
                    <Badge variant="outline" className="text-[9px] ml-auto shrink-0">{e.experiment_type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Suppliers */}
        {topSuppliers.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Factory className="h-3.5 w-3.5 text-accent" /> Top Suppliers
              </h4>
              <div className="space-y-2">
                {topSuppliers.map(s => {
                  const avg = ((s.quality_rating + s.communication_rating + s.delivery_rating) / 3).toFixed(1);
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <Factory className="h-3 w-3 text-accent shrink-0" />
                      <span className="font-medium truncate">{s.supplier_name}</span>
                      <div className="flex items-center gap-0.5 ml-auto shrink-0">
                        <Star className="h-3 w-3 text-accent fill-accent" />
                        <span>{avg}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Case Studies */}
        {topCases.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-purple-500" /> Case Studies
              </h4>
              <div className="space-y-2">
                {topCases.map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-xs">
                    <BookOpen className="h-3 w-3 text-purple-500 shrink-0" />
                    <span className="font-medium truncate">{c.title}</span>
                    <span className="text-muted-foreground ml-auto shrink-0">↑{c.upvote_count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
