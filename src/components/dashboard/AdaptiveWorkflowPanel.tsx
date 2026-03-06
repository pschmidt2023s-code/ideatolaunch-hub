import { useMemo } from "react";
import { CheckCircle2, Circle, AlertTriangle, Clock, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { buildBrandProfile } from "@/lib/brand-profile";
import { generateAdaptiveSteps, getWorkflowSummary, type AdaptiveTask, type WorkflowSummary } from "@/lib/adaptive-workflow-engine";
import { cn } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-orange-500/10 text-orange-600",
  medium: "bg-amber-500/10 text-amber-600",
  low: "bg-green-500/10 text-green-600",
};

const priorityLabels: Record<string, string> = {
  critical: "Kritisch",
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

export function AdaptiveWorkflowPanel({ currentStep }: { currentStep: number }) {
  const { activeBrand } = useBrand();
  const { plan } = useSubscription();
  const brandId = activeBrand?.id;

  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: financial } = useQuery({
    queryKey: ["financial_model", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("financial_models").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: launch } = useQuery({
    queryKey: ["launch_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("launch_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: profileData } = useQuery({
    queryKey: ["profile", activeBrand?.user_id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", activeBrand!.user_id).maybeSingle();
      return data;
    },
    enabled: !!activeBrand?.user_id,
  });

  const { steps, summary } = useMemo(() => {
    const bp = buildBrandProfile(profile ?? null, financial ?? null, launch ?? null, profileData ?? null);
    return {
      steps: generateAdaptiveSteps(bp, plan),
      summary: getWorkflowSummary(bp, plan),
    };
  }, [profile, financial, launch, profileData, plan]);

  const currentStepConfig = steps.find(s => s.step === currentStep);
  if (!currentStepConfig) return null;

  const tasks = currentStepConfig.tasks;
  const criticalTasks = tasks.filter(t => t.priority === "critical");
  const otherTasks = tasks.filter(t => t.priority !== "critical");

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">Adaptive Aufgaben</h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {currentStepConfig.timeEstimate}
          <span className="text-muted-foreground">·</span>
          <span>{tasks.length} Aufgaben</span>
        </div>
      </div>

      {/* Summary badges */}
      {summary.categorySpecificTasks > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] bg-accent/5 border-accent/20 text-accent">
            {summary.productClass === "digital" ? "Digital" : summary.productClass === "hybrid" ? "Hybrid" : "Physisch"}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {summary.categorySpecificTasks} kategorie-spezifisch
          </Badge>
          {summary.regulatoryTasks > 0 && (
            <Badge variant="outline" className="text-[10px] bg-destructive/5 text-destructive border-destructive/20">
              <Shield className="h-2.5 w-2.5 mr-1" />
              {summary.regulatoryTasks} regulatorisch
            </Badge>
          )}
          {summary.totalRiskExposure > 0 && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              {(summary.totalRiskExposure / 1000).toFixed(0)}k € Risiko-Exposure
            </Badge>
          )}
        </div>
      )}

      {/* Critical tasks */}
      {criticalTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Kritische Aufgaben
          </p>
          {criticalTasks.map(task => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Other tasks */}
      {otherTasks.length > 0 && (
        <div className="space-y-2">
          {criticalTasks.length > 0 && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Weitere Aufgaben</p>
          )}
          {otherTasks.map(task => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: AdaptiveTask }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-3 hover:bg-muted/50 transition-colors">
      <Circle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">{task.title}</p>
          <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium", priorityColors[task.priority])}>
            {priorityLabels[task.priority]}
          </span>
          {task.regulatoryFlag && (
            <Shield className="h-3 w-3 text-destructive" />
          )}
          {task.requiredForLaunch && (
            <span className="text-[9px] text-accent font-medium">PFLICHT</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
          <span>~{task.estimatedMinutes} min</span>
          {task.riskImpact && task.riskImpact > 0 && (
            <>
              <span>·</span>
              <span className="text-destructive">€ {task.riskImpact.toLocaleString("de-DE")} Risiko</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
