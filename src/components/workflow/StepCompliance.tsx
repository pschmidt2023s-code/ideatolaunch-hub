import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { FileText, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateBrandReport } from "@/lib/pdf-export";

const labelChecklist = [
  "Produktname & Beschreibung",
  "Inhaltsstoffe / INCI-Liste",
  "Nettofüllmenge",
  "Hersteller- / Importeuradresse",
  "Mindesthaltbarkeitsdatum / PAO",
  "Chargennummer / Batch-Code",
  "Verwendungshinweise",
  "Warnhinweise",
  "Recycling-Symbole",
  "CE-Kennzeichnung (falls zutreffend)",
];

export function StepCompliance() {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const completedCount = Object.values(checked).filter(Boolean).length;

  const { data: plan } = useQuery({
    queryKey: ["compliance_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("compliance_plans")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  useEffect(() => {
    if (plan && Array.isArray(plan.label_checklist)) {
      const c: Record<string, boolean> = {};
      (plan.label_checklist as string[]).forEach((item) => { c[item] = true; });
      setChecked(c);
    }
  }, [plan]);

  const handleSave = async () => {
    if (!brandId) return;
    setSaving(true);
    const payload = {
      brand_id: brandId,
      label_checklist: Object.entries(checked).filter(([, v]) => v).map(([k]) => k),
    };

    const { error } = plan
      ? await supabase.from("compliance_plans").update(payload).eq("id", plan.id)
      : await supabase.from("compliance_plans").insert(payload);

    setSaving(false);
    if (error) {
      toast.error(t("steps.saveError"));
    } else {
      toast.success(t("steps.saved"));
      queryClient.invalidateQueries({ queryKey: ["compliance_plan", brandId] });
    }
  };

  const handleExportPdf = () => {
    generateBrandReport({
      brandName: activeBrand?.name || "Brand",
      complianceChecklist: labelChecklist.map((item) => ({ item, checked: !!checked[item] })),
    });
    toast.success(t("pdf.exportSuccess"));
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("step5.labelChecklist")}</h2>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {completedCount}/{labelChecklist.length} {t("step5.done")}
            </span>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("steps.save")}
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {labelChecklist.map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={!!checked[item]}
                onCheckedChange={(v) => setChecked((p) => ({ ...p, [item]: !!v }))}
              />
              <span className={`text-sm ${checked[item] ? "line-through text-muted-foreground" : ""}`}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">{t("step5.legalTitle")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("step5.legalText")}</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">{t("step5.barcodeTitle")}</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{t("step5.barcodeIntro")}</p>
          <ul className="list-inside space-y-1">
            {[t("step5.barcodeStep1"), t("step5.barcodeStep2"), t("step5.barcodeStep3")].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <Button variant="outline" className="mt-4 gap-2" onClick={handleExportPdf}>
          <FileText className="h-4 w-4" />
          {t("step5.exportPdf")}
        </Button>
      </div>
    </div>
  );
}
