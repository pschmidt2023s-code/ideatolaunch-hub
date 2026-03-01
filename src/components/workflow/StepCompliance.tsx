import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { FileText, Save, Loader2, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrandProfile } from "@/hooks/useBrandProfile";
import { getCapabilities } from "@/lib/feature-flags";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateBrandReport } from "@/lib/pdf-export";
import { useNavigate } from "react-router-dom";
import type { StepHandle } from "./StepIdeaFoundation";
import { generateLabelChecklist, type ChecklistEntry } from "@/lib/checklist-generators";

const RISK_LABELS: Record<string, string> = { low: "Niedrig", medium: "Mittel", high: "Hoch", critical: "Kritisch" };

export const StepCompliance = forwardRef<StepHandle>(function StepCompliance(_, ref) {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const { plan } = useSubscription();
  const { brandProfile: bp } = useBrandProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  const caps = getCapabilities(plan);
  const isPro = caps.canUseLegalMap;
  const isExecution = plan === "execution";

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Dynamic label checklist from BrandProfile
  const labelChecklist: ChecklistEntry[] = useMemo(() => {
    if (!bp) return [];
    return generateLabelChecklist(bp, plan);
  }, [bp, plan]);

  const completedCount = labelChecklist.filter(item => checked[item.id]).length;

  const { data: compliancePlan } = useQuery({
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
    if (compliancePlan && Array.isArray(compliancePlan.label_checklist)) {
      const c: Record<string, boolean> = {};
      (compliancePlan.label_checklist as string[]).forEach((item) => { c[item] = true; });
      setChecked(c);
    }
  }, [compliancePlan]);

  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    setSaving(true);
    const payload = {
      brand_id: brandId,
      label_checklist: Object.entries(checked).filter(([, v]) => v).map(([k]) => k),
    };

    const { error } = compliancePlan
      ? await supabase.from("compliance_plans").update(payload).eq("id", compliancePlan.id)
      : await supabase.from("compliance_plans").insert(payload);

    setSaving(false);
    if (error) {
      if (showToast) toast.error(t("steps.saveError"));
    } else {
      if (showToast) toast.success(t("steps.saved"));
      queryClient.invalidateQueries({ queryKey: ["compliance_plan", brandId] });
    }
  }, [brandId, checked, compliancePlan, queryClient, t]);

  useImperativeHandle(ref, () => ({ save: () => saveToDb(false) }), [saveToDb]);

  const handleExportPdf = () => {
    if (!caps.canExportPDF) {
      toast.error(t("upgrade.pdfLocked"));
      navigate("/dashboard/pricing");
      return;
    }
    generateBrandReport({
      brandName: activeBrand?.name || "Brand",
      complianceChecklist: labelChecklist.map((item) => ({ item: item.label, checked: !!checked[item.id] })),
    });
    toast.success(t("pdf.exportSuccess"));
  };

  // Group by category
  const categories = [...new Set(labelChecklist.map(i => i.category))];

  const CATEGORY_LABELS: Record<string, string> = {
    label: "Pflichtangaben",
    cosmetics: "Kosmetik-Kennzeichnung",
    supplements: "Nahrungsergänzung",
    food: "Lebensmittel",
    apparel: "Textil-Kennzeichnung",
    electronics: "Elektronik",
    eu: "EU-Markt",
    barcode: "Barcode / EAN",
    brand: "Markenpositionierung",
    packaging: "Verpackung",
  };

  return (
    <div className="space-y-8">
      {/* Profile indicator */}
      {bp && bp.categoryId && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5 flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs text-accent font-medium">
            Checkliste personalisiert für:
          </span>
          <span className="text-xs font-bold text-accent capitalize">{bp.categoryId.replace("_", " / ")}</span>
          {bp.targetRegion && <Badge variant="outline" className="text-[10px] ml-1">{bp.targetRegion}</Badge>}
          {bp.priceSegment && <Badge variant="outline" className="text-[10px] ml-1">{bp.priceSegment}</Badge>}
        </div>
      )}

      {/* Score summary */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("step5.labelChecklist")}</h2>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {completedCount}/{labelChecklist.length} {t("step5.done")}
            </span>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => saveToDb(true)} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("steps.save")}
            </Button>
          </div>
        </div>

        {/* Grouped checklists */}
        {categories.map(cat => {
          const catItems = labelChecklist.filter(i => i.category === cat);
          return (
            <div key={cat} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{CATEGORY_LABELS[cat] || cat}</h3>
              <div className="space-y-3">
                {catItems.map((item) => (
                  <label key={item.id} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={!!checked[item.id]}
                      onCheckedChange={(v) => setChecked((p) => ({ ...p, [item.id]: !!v }))}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${checked[item.id] ? "line-through text-muted-foreground" : ""}`}>
                          {item.riskLevel === "critical" && <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-destructive" />}
                          {item.label}
                        </span>
                        {item.required && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Pflicht</Badge>}
                        {(isPro || isExecution) && item.riskLevel && (
                          <Badge variant={item.riskLevel === "critical" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                            {RISK_LABELS[item.riskLevel]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      {isExecution && (item.estimatedFine || item.auditProbability) && (
                        <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
                          {item.estimatedFine && <span className="text-destructive">Exposure: {item.estimatedFine}</span>}
                          {item.auditProbability !== undefined && <span>Audit-Wahrscheinlichkeit: {item.auditProbability}%</span>}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
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
});
