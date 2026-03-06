import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, TrendingUp, Shield, CheckCircle2, Zap,
  Sparkles, Loader2, RefreshCw, ArrowRight, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Insight {
  title: string;
  description: string;
  category: "risk" | "opportunity" | "optimization" | "compliance" | "growth";
  priority: "critical" | "high" | "medium";
  impact_eur?: number;
  action: string;
  metric_reference: string;
}

interface SmartInsightsData {
  insights: Insight[];
  overall_health: "critical" | "fragile" | "stable" | "strong";
  summary: string;
}

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  risk: { icon: AlertTriangle, color: "text-destructive bg-destructive/10", label: "Risiko" },
  opportunity: { icon: TrendingUp, color: "text-accent bg-accent/10", label: "Chance" },
  optimization: { icon: Zap, color: "text-primary bg-primary/10", label: "Optimierung" },
  compliance: { icon: Shield, color: "text-warning bg-warning/10", label: "Compliance" },
  growth: { icon: TrendingUp, color: "text-success bg-success/10", label: "Wachstum" },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "border-destructive/30 bg-destructive/5",
  high: "border-warning/30 bg-warning/5",
  medium: "border-border",
};

const HEALTH_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  critical: { label: "Kritisch", color: "text-destructive", icon: AlertTriangle },
  fragile: { label: "Fragil", color: "text-warning", icon: AlertTriangle },
  stable: { label: "Stabil", color: "text-success", icon: CheckCircle2 },
  strong: { label: "Stark", color: "text-success", icon: CheckCircle2 },
};

export function SmartInsightsPanel() {
  const { session } = useAuth();
  const { isPro } = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<SmartInsightsData>({
    queryKey: ["smart-insights"],
    queryFn: async () => {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-smart-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (resp.status === 429) {
        toast.error("Rate Limit erreicht. Bitte versuche es später erneut.");
        throw new Error("Rate limited");
      }
      if (resp.status === 402) {
        toast.error("AI-Credits aufgebraucht.");
        throw new Error("Payment required");
      }
      if (!resp.ok) throw new Error("Failed to fetch insights");

      return resp.json();
    },
    enabled: !!session && isPro,
    staleTime: 10 * 60 * 1000, // 10 min cache
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const formatEur = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  if (!isPro) {
    return (
      <LockedOverlay featureName="Smart Insights" requiredPlan="pro">
        <div className="rounded-2xl border bg-card p-8 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-accent mb-3" />
          <h3 className="font-bold">KI-gestützte Smart Insights</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Automatische, datenbasierte Handlungsempfehlungen basierend auf deinen Marken-KPIs.
          </p>
        </div>
      </LockedOverlay>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="font-bold">Smart Insights</h3>
          {data?.overall_health && (
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", HEALTH_META[data.overall_health]?.color)}>
              {HEALTH_META[data.overall_health]?.label}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading || isRefreshing} className="gap-1.5 text-xs">
          <RefreshCw className={cn("h-3.5 w-3.5", (isLoading || isRefreshing) && "animate-spin")} />
          Aktualisieren
        </Button>
      </div>

      {/* Summary */}
      {data?.summary && (
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          {data.summary}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Analysiere deine Daten…</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-sm text-destructive text-center py-4">
          Insights konnten nicht geladen werden. Versuche es erneut.
        </div>
      )}

      {/* Insights */}
      {data?.insights && data.insights.length > 0 && (
        <div className="space-y-3">
          {data.insights.map((insight, i) => {
            const cat = CATEGORY_META[insight.category] || CATEGORY_META.optimization;
            const Icon = cat.icon;

            return (
              <div
                key={i}
                className={cn(
                  "rounded-xl border p-4 transition-all hover:shadow-md",
                  PRIORITY_COLORS[insight.priority] || "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cat.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold">{insight.title}</h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                          insight.priority === "critical" ? "text-destructive bg-destructive/10" :
                          insight.priority === "high" ? "text-warning bg-warning/10" :
                          "text-muted-foreground bg-muted"
                        )}>
                          {insight.priority === "critical" ? "Kritisch" : insight.priority === "high" ? "Hoch" : "Mittel"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-accent font-medium">
                        <ArrowRight className="h-3 w-3" />
                        {insight.action}
                      </div>
                      {insight.impact_eur != null && insight.impact_eur !== 0 && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-accent">
                          <DollarSign className="h-3 w-3" />
                          {insight.impact_eur > 0 ? "+" : ""}{formatEur(insight.impact_eur)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                      📊 {insight.metric_reference}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
