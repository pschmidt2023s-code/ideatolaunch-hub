import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, FileText, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateBrandReport } from "@/lib/pdf-export";
import { generateSmartRoadmap, type SmartWeek } from "@/lib/roadmap-intelligence";
import { useNavigate } from "react-router-dom";
import type { StepHandle } from "./StepIdeaFoundation";

const staticWeeks = [
  {
    weekKey: "w1",
    titleKey: "w1t",
    tasks: [
      "Social-Media-Profile erstellen",
      "Content-Kalender planen",
      "Teaser-Content produzieren",
      "E-Mail-Liste aufbauen",
      "Influencer recherchieren",
    ],
  },
  {
    weekKey: "w2",
    titleKey: "w2t",
    tasks: [
      "Landing Page live schalten",
      "Erste Teaser posten",
      "Warteliste bewerben",
      "Pressemitteilung vorbereiten",
      "Produktfotos finalisieren",
    ],
  },
  {
    weekKey: "w3",
    titleKey: "w3t",
    tasks: [
      "Shop live schalten",
      "Launch-Announcement posten",
      "E-Mail an Warteliste senden",
      "Erste Ads schalten",
      "PR-Outreach starten",
    ],
  },
  {
    weekKey: "w4",
    titleKey: "w4t",
    tasks: [
      "Kundenfeedback sammeln",
      "Ads optimieren",
      "Retargeting einrichten",
      "Review-Kampagne starten",
      "Erste Analyse & Learnings",
    ],
  },
];

export const StepLaunchRoadmap = forwardRef<StepHandle>(function StepLaunchRoadmap(_, ref) {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const { isFree, isBuilder } = useSubscription();
  const { health } = useBrandHealth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const smartWeeks: SmartWeek[] | null = useMemo(() => {
    if (!isBuilder || !health) return null;
    return generateSmartRoadmap(health);
  }, [isBuilder, health]);

  const allTaskIds = useMemo(() => {
    if (smartWeeks) {
      return smartWeeks.flatMap((w) => [
        ...w.staticTasks,
        ...w.dynamicTasks.map((d) => d.id),
      ]);
    }
    return staticWeeks.flatMap((w) => w.tasks);
  }, [smartWeeks]);

  const completedCount = allTaskIds.filter((id) => checked[id]).length;

  const { data: plan } = useQuery({
    queryKey: ["launch_plan_roadmap", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("launch_plans")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  useEffect(() => {
    if (plan && Array.isArray(plan.roadmap)) {
      const c: Record<string, boolean> = {};
      (plan.roadmap as string[]).forEach((item) => { c[item] = true; });
      setChecked(c);
    }
  }, [plan]);

  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    setSaving(true);
    const completedTasks = Object.entries(checked).filter(([, v]) => v).map(([k]) => k);
    const payload = {
      brand_id: brandId,
      roadmap: completedTasks,
    };

    const { error } = plan
      ? await supabase.from("launch_plans").update(payload).eq("id", plan.id)
      : await supabase.from("launch_plans").insert(payload);

    setSaving(false);
    if (error) {
      if (showToast) toast.error(t("steps.saveError"));
    } else {
      if (showToast) toast.success(t("steps.saved"));
      queryClient.invalidateQueries({ queryKey: ["launch_plan_roadmap", brandId] });
    }
  }, [brandId, checked, plan, queryClient, t]);

  useImperativeHandle(ref, () => ({ save: () => saveToDb(false) }), [saveToDb]);

  const handleExportPdf = () => {
    if (isFree) {
      toast.error(t("upgrade.pdfLocked"));
      navigate("/dashboard/pricing");
      return;
    }
    generateBrandReport({
      brandName: activeBrand?.name || "Brand",
    });
    toast.success(t("pdf.exportSuccess"));
  };

  const hasDynamicTasks = smartWeeks?.some((w) => w.dynamicTasks.length > 0) ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("step7.subtitle", { done: completedCount, total: allTaskIds.length })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {Math.round((completedCount / allTaskIds.length) * 100)}%
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => saveToDb(true)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("steps.save")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPdf}>
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {isBuilder && hasDynamicTasks && (
        <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-sm text-muted-foreground">
            {t("step7.smartInfo")}
          </p>
        </div>
      )}

      {(smartWeeks ?? staticWeeks.map((w) => ({ ...w, staticTasks: w.tasks, dynamicTasks: [] }))).map((week) => (
        <div key={week.weekKey} className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-mono font-medium text-primary-foreground">
              {t(`step7.${week.weekKey}`)}
            </span>
            <h3 className="font-semibold">{t(`step7.${week.titleKey}`)}</h3>
          </div>

          <div className="space-y-3">
            {week.staticTasks.map((task) => (
              <label key={task} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={!!checked[task]}
                  onCheckedChange={(v) => setChecked((p) => ({ ...p, [task]: !!v }))}
                />
                <span className={`text-sm ${checked[task] ? "line-through text-muted-foreground" : ""}`}>
                  {task}
                </span>
              </label>
            ))}
          </div>

          {week.dynamicTasks.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-dashed pt-4">
              {week.dynamicTasks.map((dt) => (
                <div key={dt.id} className="space-y-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={!!checked[dt.id]}
                      onCheckedChange={(v) => setChecked((p) => ({ ...p, [dt.id]: !!v }))}
                    />
                    <span className={`text-sm font-medium ${checked[dt.id] ? "line-through text-muted-foreground" : ""}`}>
                      {dt.triggeredByRisk && (
                        <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5 text-destructive" />
                      )}
                      {dt.label}
                    </span>
                  </label>
                  <p className="ml-9 text-xs text-muted-foreground italic">
                    {t("step7.whyMatters")}: {dt.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
