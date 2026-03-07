import { useTrendingPosts, useTopSuppliers, useMarketSignals, useCaseStudies } from "@/hooks/useCommunity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, BookOpen, MessageCircle, ArrowRight, Factory, Star, Flame, Radar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export function CommunityIntelligenceWidget() {
  const { data: signals } = useMarketSignals();
  const { data: suppliers } = useTopSuppliers();
  const { data: cases } = useCaseStudies();
  const navigate = useNavigate();

  const topSignals = signals?.slice(0, 3) || [];
  const topSuppliers = suppliers?.slice(0, 3) || [];
  const topCases = cases?.slice(0, 2) || [];
  const hasData = topSignals.length > 0 || topSuppliers.length > 0 || topCases.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Community Intelligence
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/dashboard/community")}>
            Öffnen <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData && (
          <p className="text-xs text-muted-foreground text-center py-6">Noch keine Community-Daten verfügbar.</p>
        )}

        {/* Top Market Signals */}
        {topSignals.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Radar className="h-3 w-3" /> Trending Market Signals
            </h4>
            <div className="space-y-1.5">
              {topSignals.map((signal) => {
                const strength = (signal.metadata?.trend_strength as number) || 5;
                const isHot = strength >= 8;
                return (
                  <div
                    key={signal.id}
                    className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/dashboard/community")}
                  >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${isHot ? "bg-destructive/10" : "bg-accent/10"}`}>
                      {isHot ? <Flame className="h-3.5 w-3.5 text-destructive" /> : <TrendingUp className="h-3.5 w-3.5 text-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{signal.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {signal.metadata?.product_category && <Badge variant="outline" className="text-[9px] px-1 py-0">{signal.metadata.product_category as string}</Badge>}
                        <span className="text-[10px] text-muted-foreground">↑{signal.upvote_count}</span>
                      </div>
                    </div>
                    <div className="w-16 shrink-0">
                      <Progress value={(strength / 10) * 100} className="h-1" />
                      <p className="text-[9px] text-muted-foreground text-right mt-0.5">{strength}/10</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Suppliers */}
        {topSuppliers.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Factory className="h-3 w-3" /> Top Supplier Insights
            </h4>
            <div className="space-y-1.5">
              {topSuppliers.map((s) => {
                const avg = ((s.quality_rating + s.communication_rating + s.delivery_rating) / 3).toFixed(1);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/dashboard/community")}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                      <Factory className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{s.supplier_name}</p>
                      <p className="text-[10px] text-muted-foreground">{[s.country, s.product_type].filter(Boolean).join(" · ")}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="h-3 w-3 text-accent fill-accent" />
                      <span className="text-xs font-bold">{avg}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Latest Case Studies */}
        {topCases.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" /> Latest Case Studies
            </h4>
            <div className="space-y-1.5">
              {topCases.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate("/dashboard/community")}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                    <BookOpen className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{c.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {c.metadata?.industry && <Badge variant="outline" className="text-[9px] px-1 py-0">{c.metadata.industry as string}</Badge>}
                      <span className="text-[10px] text-muted-foreground">↑{c.upvote_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
