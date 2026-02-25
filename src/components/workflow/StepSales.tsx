import { useState, useEffect, useCallback, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const operationalChecklist = [
  "Shop-System ausgewählt und eingerichtet",
  "Produktfotos erstellt",
  "Produktbeschreibungen verfasst",
  "Zahlungsanbieter eingerichtet",
  "Versanddienstleister ausgewählt",
  "AGB & Datenschutz erstellt",
  "Impressum eingerichtet",
  "Retourenrichtlinie definiert",
];

export function StepSales() {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  const [channel, setChannel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fulfillment, setFulfillment] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: plan } = useQuery({
    queryKey: ["launch_plan", brandId],
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
    if (plan) {
      setChannel(plan.sales_channel || "");
      setQuantity(plan.launch_quantity?.toString() || "");
      setFulfillment(plan.fulfillment_model || "");
      if (Array.isArray(plan.operational_checklist)) {
        const c: Record<string, boolean> = {};
        (plan.operational_checklist as string[]).forEach((item) => { c[item] = true; });
        setChecked(c);
      }
    }
  }, [plan]);

  const readiness = Math.round(
    (Object.values(checked).filter(Boolean).length / operationalChecklist.length) * 100
  );

  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    setSaving(true);
    const payload = {
      brand_id: brandId,
      sales_channel: channel,
      launch_quantity: parseInt(quantity) || null,
      fulfillment_model: fulfillment,
      operational_checklist: Object.entries(checked).filter(([, v]) => v).map(([k]) => k),
      launch_readiness_score: readiness,
    };

    const { error } = plan
      ? await supabase.from("launch_plans").update(payload).eq("id", plan.id)
      : await supabase.from("launch_plans").insert(payload);

    setSaving(false);
    if (error) {
      if (showToast) toast.error(t("steps.saveError"));
    } else {
      if (showToast) toast.success(t("steps.saved"));
      else {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
      queryClient.invalidateQueries({ queryKey: ["launch_plan", brandId] });
    }
  }, [brandId, channel, quantity, fulfillment, checked, readiness, plan, queryClient, t]);

  // Auto-save on changes (debounced 2s)
  useEffect(() => {
    if (!brandId || (!plan && !channel && !quantity && !fulfillment && Object.keys(checked).length === 0)) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveToDb(false);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [channel, quantity, fulfillment, checked, brandId]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("step6.title")}</h2>
          <div className="flex items-center gap-2">
            {autoSaved && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground animate-fade-in">
                <Check className="h-3 w-3" /> Auto-gespeichert
              </span>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => saveToDb(true)} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("steps.save")}
            </Button>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("step6.channel")}</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue placeholder={t("step1.choose")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shopify">{t("step6.shopify")}</SelectItem>
                <SelectItem value="own">{t("step6.ownShop")}</SelectItem>
                <SelectItem value="marketplace">{t("step6.marketplace")}</SelectItem>
                <SelectItem value="multi">{t("step6.multiChannel")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("step6.launchQty")}</Label>
            <Input placeholder={t("step6.launchQtyPh")} type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("step6.fulfillment")}</Label>
            <Select value={fulfillment} onValueChange={setFulfillment}>
              <SelectTrigger><SelectValue placeholder={t("step1.choose")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="self">{t("step6.self")}</SelectItem>
                <SelectItem value="3pl">{t("step6.threepl")}</SelectItem>
                <SelectItem value="dropship">{t("step6.dropship")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("step6.checklist")}</h2>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${readiness === 100 ? "text-success" : "text-muted-foreground"}`} />
            <span className="text-sm font-medium">{readiness}% {t("step6.ready")}</span>
          </div>
        </div>
        <div className="space-y-3">
          {operationalChecklist.map((item) => (
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
    </div>
  );
}