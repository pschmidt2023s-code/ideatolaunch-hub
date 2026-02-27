import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Save, Loader2 } from "lucide-react";
import { ExplainThis } from "@/components/ExplainThis";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { StepHandle } from "./StepIdeaFoundation";

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

export const StepSales = forwardRef<StepHandle>(function StepSales(_, ref) {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  const [channel, setChannel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fulfillment, setFulfillment] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ["launch_plan", brandId] });
    }
  }, [brandId, channel, quantity, fulfillment, checked, readiness, plan, queryClient, t]);

  useImperativeHandle(ref, () => ({ save: () => saveToDb(false) }), [saveToDb]);

  const [returnRate, setReturnRate] = useState("10");
  const [shippingCost, setShippingCost] = useState("4.90");
  const [avgPrice, setAvgPrice] = useState("29.99");
  const [unitCost, setUnitCost] = useState("12");

  const marginAfterReturns = useMemo(() => {
    const price = parseFloat(avgPrice) || 0;
    const cost = parseFloat(unitCost) || 0;
    const ship = parseFloat(shippingCost) || 0;
    const ret = parseFloat(returnRate) || 0;
    if (price <= 0) return null;
    const grossMargin = price - cost - ship;
    const returnLoss = (ret / 100) * (cost + ship + ship); // lost unit + double shipping
    const effectiveMargin = grossMargin - returnLoss;
    const effectiveMarginPct = (effectiveMargin / price) * 100;
    return { effectiveMargin: effectiveMargin.toFixed(2), effectiveMarginPct: effectiveMarginPct.toFixed(1), returnLoss: returnLoss.toFixed(2) };
  }, [avgPrice, unitCost, shippingCost, returnRate]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("step6.title")}</h2>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => saveToDb(true)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("steps.save")}
          </Button>
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
            <Label className="flex items-center gap-1">{t("step6.fulfillment")} <ExplainThis term="Fulfillment" /></Label>
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

      {/* Versandstrategie */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">📦 Versand- & Retourenstrategie</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Ø Verkaufspreis (€)</Label>
            <Input type="number" step="0.01" value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Stückkosten (€)</Label>
            <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Versandkosten / Bestellung (€)</Label>
            <Input type="number" step="0.1" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Erwartete Retourenquote (%)</Label>
            <Input type="number" step="1" value={returnRate} onChange={(e) => setReturnRate(e.target.value)} />
          </div>
        </div>

        {marginAfterReturns && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-xs text-muted-foreground">Effektive Marge / Stück</p>
              <p className={`text-2xl font-bold ${parseFloat(marginAfterReturns.effectiveMarginPct) >= 30 ? "text-green-600" : parseFloat(marginAfterReturns.effectiveMarginPct) >= 15 ? "text-amber-600" : "text-destructive"}`}>
                {marginAfterReturns.effectiveMarginPct}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">{marginAfterReturns.effectiveMargin} € pro Einheit</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-xs text-muted-foreground">Retourenverlust / Stück</p>
              <p className="text-2xl font-bold text-destructive">{marginAfterReturns.returnLoss} €</p>
              <p className="text-[10px] text-muted-foreground mt-1">bei {returnRate}% Retourenquote</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-xs text-muted-foreground">Marge nach Retouren</p>
              <p className={`text-2xl font-bold ${parseFloat(marginAfterReturns.effectiveMarginPct) >= 30 ? "text-green-600" : "text-amber-600"}`}>
                {parseFloat(marginAfterReturns.effectiveMarginPct) >= 30 ? "✅ Gesund" : parseFloat(marginAfterReturns.effectiveMarginPct) >= 15 ? "⚠️ Grenzwertig" : "🚨 Kritisch"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Zielwert: ≥30%</p>
            </div>
          </div>
        )}

        {parseFloat(returnRate) > 12 && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <strong>⚠️ Retourenquote über 12%:</strong> Prüfe Produktbeschreibungen, Größentabellen, QC-Standards und Verpackungsqualität. Hohe Retouren vernichten deine Marge.
          </div>
        )}
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
});
