import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { ExplainThis } from "@/components/ExplainThis";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { StepHandle } from "./StepIdeaFoundation";
import { SupplierMatchCard } from "@/components/SupplierMatchCard";

const checklist = [
  "Produktspezifikationen definiert",
  "Materialanforderungen festgelegt",
  "Qualitätsstandards dokumentiert",
  "Musterproduktion geplant",
  "Produktionszeitplan erstellt",
  "Verpackungsanforderungen geklärt",
];

const supplierQuestions = [
  "Wie hoch ist die Mindestbestellmenge (MOQ)?",
  "Welche Zertifizierungen besitzen Sie?",
  "Wie lang ist die Vorlaufzeit?",
  "Bieten Sie Musterproduktion an?",
  "Welche Zahlungsbedingungen gelten?",
];

export const StepProduction = forwardRef<StepHandle>(function StepProduction(_, ref) {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  const [region, setRegion] = useState("");
  const [moq, setMoq] = useState("");
  const [category, setCategory] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [supplierBudget, setSupplierBudget] = useState("");
  const [supplierQty, setSupplierQty] = useState("");
  const [supplierSegment, setSupplierSegment] = useState<"low" | "mid" | "premium">("mid");

  const { data: plan } = useQuery({
    queryKey: ["production_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("production_plans")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  useEffect(() => {
    if (plan) {
      setRegion(plan.production_region || "");
      setMoq(plan.moq_expectation || "");
      setCategory(plan.product_category || "");
      if (Array.isArray(plan.checklist)) {
        const c: Record<string, boolean> = {};
        (plan.checklist as string[]).forEach((item) => { c[item] = true; });
        setChecked(c);
      }
    }
  }, [plan]);

  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    setSaving(true);
    const payload = {
      brand_id: brandId,
      production_region: region,
      moq_expectation: moq,
      product_category: category,
      checklist: Object.entries(checked).filter(([, v]) => v).map(([k]) => k),
    };

    const { error } = plan
      ? await supabase.from("production_plans").update(payload).eq("id", plan.id)
      : await supabase.from("production_plans").insert(payload);

    setSaving(false);
    if (error) {
      if (showToast) toast.error(t("steps.saveError"));
    } else {
      if (showToast) toast.success(t("steps.saved"));
      queryClient.invalidateQueries({ queryKey: ["production_plan", brandId] });
    }
  }, [brandId, region, moq, category, checked, plan, queryClient, t]);

  useImperativeHandle(ref, () => ({ save: () => saveToDb(false) }), [saveToDb]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("step4.title")}</h2>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => saveToDb(true)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("steps.save")}
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("step4.region")}</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue placeholder={t("step1.choose")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="eu">{t("step4.eu")}</SelectItem>
                <SelectItem value="asia">{t("step4.asia")}</SelectItem>
                <SelectItem value="flexible">{t("step4.flexible")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">{t("step4.moq")} <ExplainThis term="MOQ" /></Label>
            <Input placeholder={t("step4.moqPh")} value={moq} onChange={(e) => setMoq(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("step4.category")}</Label>
            <Input placeholder={t("step4.categoryPh")} value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">{t("step4.checklist")}</h2>
        <div className="space-y-3">
          {checklist.map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={!!checked[item]}
                onCheckedChange={(v) => setChecked((p) => ({ ...p, [item]: !!v }))}
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">{t("step4.supplierQuestions")}</h2>
        <ul className="space-y-2">
          {supplierQuestions.map((q) => (
            <li key={q} className="flex items-start gap-2 text-sm">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              {q}
            </li>
          ))}
        </ul>
      </div>

      {/* Supplier Matching — PRO */}
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Supplier Matching — Eingaben</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Budget (€)</Label>
              <Input type="number" placeholder="z.B. 8000" value={supplierBudget} onChange={(e) => setSupplierBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Startmenge (Stück)</Label>
              <Input type="number" placeholder="z.B. 500" value={supplierQty} onChange={(e) => setSupplierQty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Preissegment</Label>
              <Select value={supplierSegment} onValueChange={(v) => setSupplierSegment(v as "low" | "mid" | "premium")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Budget / Low</SelectItem>
                  <SelectItem value="mid">Mittel</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <SupplierMatchCard
          productCategory={category}
          budget={Number(supplierBudget) || 0}
          targetRegion={region === "asia" ? "Asia" : region === "eu" ? "EU" : "Global"}
          launchQuantity={Number(supplierQty) || 0}
          priceSegment={supplierSegment}
        />
      </div>
    </div>
  );
});
