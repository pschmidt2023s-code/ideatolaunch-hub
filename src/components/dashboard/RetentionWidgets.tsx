import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import {
  calculateMomentumScore,
  generateRiskAlerts,
  getRetentionBadges,
  getUpgradeTriggers,
  type RiskAlert,
} from "@/lib/retention-engine";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Zap,
  ArrowRight,
  Award,
} from "lucide-react";

// ─── Weekly CEO Review Card ─────────────────────────────────────

export function WeeklyCEOReviewCard() {
  const { user } = useAuth();
  const { activeBrand } = useBrand();
  const { plan, isExecution } = useSubscription();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;
  const now = new Date();
  const weekNum = getISOWeek(now);
  const year = now.getFullYear();

  const { data: review } = useQuery({
    queryKey: ["weekly_review", brandId, year, weekNum],
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("brand_id", brandId!)
        .eq("year", year)
        .eq("week_number", weekNum)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: streak } = useQuery({
    queryKey: ["review_streak", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_reviews")
        .select("week_number, year, confirmed")
        .eq("brand_id", brandId!)
        .eq("confirmed", true)
        .order("year", { ascending: false })
        .order("week_number", { ascending: false })
        .limit(20);
      if (!data?.length) return 0;
      let count = 0;
      let w = weekNum;
      let y = year;
      for (const r of data) {
        if (r.year === y && r.week_number === w - 1) { count++; w--; }
        else if (r.year === y - 1 && w === 1 && r.week_number === 52) { count++; y--; w = 52; }
        else break;
      }
      return count;
    },
    enabled: !!brandId,
  });

  const streakCount = streak ?? 0;
  const isConfirmed = review?.confirmed === true;

  const confirmReview = async () => {
    if (!brandId || !user) return;
    const payload = {
      brand_id: brandId,
      user_id: user.id,
      week_number: weekNum,
      year,
      confirmed: true,
      confirmed_at: new Date().toISOString(),
      streak_count: streakCount + 1,
    };

    const { error } = review
      ? await supabase.from("weekly_reviews").update({ confirmed: true, confirmed_at: payload.confirmed_at, streak_count: payload.streak_count }).eq("id", review.id)
      : await supabase.from("weekly_reviews").insert(payload);

    if (error) {
      toast.error("Review konnte nicht gespeichert werden.");
      return;
    }
    toast.success("CEO Review bestätigt!");
    trackEvent("weekly_review_confirmed", { streak: streakCount + 1, week: weekNum });
    queryClient.invalidateQueries({ queryKey: ["weekly_review", brandId] });
    queryClient.invalidateQueries({ queryKey: ["review_streak", brandId] });
  };

  const badges = getRetentionBadges(streakCount, isExecution);
  const earnedBadges = badges.filter((b) => b.earned);

  if (!brandId) return null;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold">Weekly CEO Review</h3>
          <span className="text-xs text-muted-foreground">KW {weekNum}</span>
        </div>
        {streakCount > 0 && (
          <Badge variant="outline" className="gap-1 text-xs">
            🔥 {streakCount} Wochen Streak
          </Badge>
        )}
      </div>

      {isConfirmed ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Review bestätigt</p>
            <p className="text-xs text-muted-foreground">Nächster Review in KW {weekNum + 1}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Überprüfe deine wichtigsten KPIs und bestätige deinen wöchentlichen CEO Review.
          </p>
          <Button onClick={confirmReview} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full">
            <CheckCircle2 className="h-4 w-4" />
            Review & Confirm
          </Button>
        </div>
      )}

      {earnedBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
          {earnedBadges.map((b) => (
            <Badge key={b.id} variant="secondary" className="gap-1 text-xs">
              {b.emoji} {b.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Momentum Score Card ────────────────────────────────────────

export function MomentumScoreCard() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;

  const { data: tasks } = useQuery({
    queryKey: ["brand_tasks_momentum", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_tasks")
        .select("completed")
        .eq("brand_id", brandId!);
      return data ?? [];
    },
    enabled: !!brandId,
  });

  const { data: streak } = useQuery({
    queryKey: ["review_streak", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_reviews")
        .select("confirmed")
        .eq("brand_id", brandId!)
        .eq("confirmed", true);
      return data?.length ?? 0;
    },
    enabled: !!brandId,
  });

  const momentum = useMemo(() => {
    const completed = tasks?.filter((t) => t.completed).length ?? 0;
    const total = tasks?.length ?? 0;
    return calculateMomentumScore({
      weeklyReviewStreak: streak ?? 0,
      tasksCompletedThisWeek: completed,
      totalTasks: total,
      marginTrend: 0,
      riskReduction: Math.min((completed / Math.max(total, 1)) * 100, 100),
      kpiTrackingWeeks: streak ?? 0,
    });
  }, [tasks, streak]);

  if (!brandId) return null;

  const TrendIcon = momentum.trend === "improving" ? TrendingUp : momentum.trend === "declining" ? TrendingDown : Minus;
  const trendColor = momentum.trend === "improving" ? "text-green-500" : momentum.trend === "declining" ? "text-destructive" : "text-yellow-500";

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5 text-accent" />
        <h3 className="text-sm font-semibold">Execution Momentum</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className={`text-3xl font-bold ${trendColor}`}>{momentum.score}</span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className={`text-sm font-medium ${trendColor}`}>{momentum.label}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${momentum.score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Decision Timeline ──────────────────────────────────────────

export function DecisionTimeline() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;

  const { data: decisions } = useQuery({
    queryKey: ["founder_decisions", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("founder_decisions")
        .select("*")
        .eq("brand_id", brandId!)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!brandId,
  });

  if (!brandId || !decisions?.length) return null;

  const typeEmoji: Record<string, string> = {
    price_change: "💰",
    moq_change: "📦",
    supplier_selection: "🏭",
    launch_decision: "🚀",
    other: "📋",
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-accent" />
        <h3 className="text-sm font-semibold">Entscheidungs-Timeline</h3>
      </div>
      <div className="space-y-3">
        {decisions.map((d) => {
          const age = getRelativeTime(new Date(d.created_at));
          return (
            <div key={d.id} className="flex gap-3 rounded-lg border p-3">
              <span className="text-lg shrink-0">{typeEmoji[d.decision_type] ?? "📋"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{d.title}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{age}</span>
                </div>
                {d.description && <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>}
                {d.impact_label && (
                  <Badge variant="outline" className="mt-1 text-[10px] border-green-500/30 text-green-600 dark:text-green-400">
                    {d.impact_label}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Smart Upgrade Trigger ──────────────────────────────────────

export function RetentionUpgradeTrigger() {
  const { activeBrand } = useBrand();
  const { plan } = useSubscription();
  const brandId = activeBrand?.id;

  const { data: reviewCount } = useQuery({
    queryKey: ["review_count_trigger", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("weekly_reviews")
        .select("id")
        .eq("brand_id", brandId!)
        .eq("confirmed", true);
      return data?.length ?? 0;
    },
    enabled: !!brandId,
  });

  const { data: analyticsCount } = useQuery({
    queryKey: ["analytics_risk_checks", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("id")
        .eq("event_name", "viewed_insights");
      return data?.length ?? 0;
    },
    enabled: !!brandId,
  });

  const triggers = getUpgradeTriggers({
    kpiTrackingWeeks: reviewCount ?? 0,
    manualRiskChecks: analyticsCount ?? 0,
    weeklyReviewStreak: reviewCount ?? 0,
    plan,
  });

  if (!triggers.length) return null;

  const trigger = triggers[0];

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
          <ArrowRight className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium">{trigger.message}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{trigger.condition}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Risk Alert Bar ─────────────────────────────────────────────

export function RiskAlertBar({ alerts }: { alerts: RiskAlert[] }) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.slice(0, 2).map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 rounded-lg border p-3 ${
            alert.severity === "critical"
              ? "border-destructive/30 bg-destructive/5"
              : "border-yellow-500/30 bg-yellow-500/5"
          }`}
        >
          <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
            alert.severity === "critical" ? "text-destructive" : "text-yellow-600 dark:text-yellow-400"
          }`} />
          <div>
            <p className="text-sm font-medium">{alert.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function getRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 7) return `vor ${days} Tagen`;
  const weeks = Math.floor(days / 7);
  return `vor ${weeks} Woche${weeks > 1 ? "n" : ""}`;
}
