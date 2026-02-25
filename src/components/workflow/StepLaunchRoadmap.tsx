import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateBrandReport } from "@/lib/pdf-export";
import { useNavigate } from "react-router-dom";

const weeks = [
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

export function StepLaunchRoadmap() {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const { isFree } = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const allTasks = weeks.flatMap((w) => w.tasks);
  const completedCount = allTasks.filter((t) => checked[t]).length;

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

  const handleSave = async () => {
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
      toast.error(t("steps.saveError"));
    } else {
      toast.success(t("steps.saved"));
      queryClient.invalidateQueries({ queryKey: ["launch_plan_roadmap", brandId] });
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("step7.subtitle", { done: completedCount, total: allTasks.length })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {Math.round((completedCount / allTasks.length) * 100)}%
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("steps.save")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPdf}>
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {weeks.map(({ weekKey, titleKey, tasks }) => (
        <div key={weekKey} className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-mono font-medium text-primary-foreground">
              {t(`step7.${weekKey}`)}
            </span>
            <h3 className="font-semibold">{t(`step7.${titleKey}`)}</h3>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
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
        </div>
      ))}
    </div>
  );
}
