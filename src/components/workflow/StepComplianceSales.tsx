import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Save, Loader2, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ExplainThis } from "@/components/ExplainThis";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { useBrandProfile } from "@/hooks/useBrandProfile";
import { getCapabilities } from "@/lib/feature-flags";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateWorkflowPdf } from "@/lib/pdf-export";
import { useNavigate } from "react-router-dom";
import type { StepHandle } from "./StepIdeaFoundation";
import { generateLabelChecklist, type ChecklistEntry } from "@/lib/checklist-generators";

const RISK_LABELS: Record<string, string> = { low: "Niedrig", medium: "Mittel", high: "Hoch", critical: "Kritisch" };

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

export const StepComplianceSales = forwardRef<StepHandle>(function StepComplianceSales(_, ref) {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const { plan } = useSubscription();
  const { brandProfile: bp } = useBrandProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  const caps = getCapabilities(plan);
  const isPro = caps.canUseLegalMap;
  const isExecution = plan === "execution" || plan === "trading";

  // ── Compliance state ──
  const [complianceChecked, setComplianceChecked] = useState<Record<string, boolean>>({});
  const labelChecklist: ChecklistEntry[] = useMemo(() => {
    if (!bp) return [];
    return generateLabelChecklist(bp, plan);
  }, [bp, plan]);
  const completedComplianceCount = labelChecklist.filter(item => complianceChecked[item.id]).length;

  // ── Sales state ──
  const [channel, setChannel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fulfillment, setFulfillment] = useState("");
  const [salesChecked, setSalesChecked] = useState<Record<string, boolean>>({});
  const [returnRate, setReturnRate] = useState("10");
  const [shippingCost, setShippingCost] = useState("4.90");
  const [avgPrice, setAvgPrice] = useState("29.99");
  const [unitCost, setUnitCost] = useState("12");

  const [saving, setSaving] = useState(false);

  // ── Data fetching ──
  const { data: compliancePlan } = useQuery({
    queryKey: ["compliance_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("compliance_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: launchPlan } = useQuery({
    queryKey: ["launch_plan", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("launch_plans").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  useEffect(() => {
    if (compliancePlan && Array.isArray(compliancePlan.label_checklist)) {
      const c: Record<string, boolean> = {};
      (compliancePlan.label_checklist as string[]).forEach((item) => { c[item] = true; });
      setComplianceChecked(c);
    }
  }, [compliancePlan]);

  useEffect(() => {
    if (launchPlan) {
      setChannel(launchPlan.sales_channel || "");
      setQuantity(launchPlan.launch_quantity?.toString() || "");
      setFulfillment(launchPlan.fulfillment_model || "");
      if (Array.isArray(launchPlan.operational_checklist)) {
        const c: Record<string, boolean> = {};
        (launchPlan.operational_checklist as string[]).forEach((item) => { c[item] = true; });
        setSalesChecked(c);
      }
    }
  }, [launchPlan]);

  const readiness = Math.round(
    (Object.values(salesChecked).filter(Boolean).length / operationalChecklist.length) * 100
  );

  const marginAfterReturns = useMemo(() => {
    const price = parseFloat(avgPrice) || 0;
    const cost = parseFloat(unitCost) || 0;
    const ship = parseFloat(shippingCost) || 0;
    const ret = parseFloat(returnRate) || 0;
    if (price <= 0) return null;
    const grossMargin = price - cost - ship;
    const returnLoss = (ret / 100) * (cost + ship + ship);
    const effectiveMargin = grossMargin - returnLoss;
    const effectiveMarginPct = (effectiveMargin / price) * 100;
    return { effectiveMargin: effectiveMargin.toFixed(2), effectiveMarginPct: effectiveMarginPct.toFixed(1), returnLoss: returnLoss.toFixed(2) };
  }, [avgPrice, unitCost, shippingCost, returnRate]);

  // ── Save both sections ──
  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    setSaving(true);

    const p1Payload = {
      brand_id: brandId,
      label_checklist: Object.entries(complianceChecked).filter(([, v]) => v).map(([k]) => k),
    };
    const p1 = compliancePlan
      ? supabase.from("compliance_plans").update(p1Payload).eq("id", compliancePlan.id)
      : supabase.from("compliance_plans").insert(p1Payload);

    const p2Payload = {
      brand_id: brandId,
      sales_channel: channel,
      launch_quantity: parseInt(quantity) || null,
      fulfillment_model: fulfillment,
      operational_checklist: Object.entries(salesChecked).filter(([, v]) => v).map(([k]) => k),
      launch_readiness_score: readiness,
    };
    const p2 = launchPlan
      ? supabase.from("launch_plans").update(p2Payload).eq("id", launchPlan.id)
      : supabase.from("launch_plans").insert(p2Payload);

    const [r1, r2] = await Promise.all([p1, p2]);
    setSaving(false);

    if (r1.error || r2.error) {
      if (showToast) toast.error(t("steps.saveError"));
    } else {
      if (showToast) toast.success(t("steps.saved"));
      queryClient.invalidateQueries({ queryKey: ["compliance_plan", brandId] });
      queryClient.invalidateQueries({ queryKey: ["launch_plan", brandId] });
    }
  }, [brandId, complianceChecked, compliancePlan, channel, quantity, fulfillment, salesChecked, readiness, launchPlan, queryClient, t]);

  useImperativeHandle(ref, () => ({ save: () => saveToDb(false) }), [saveToDb]);

  const handleExportPdf = () => {
    if (!caps.canExportPDF) {
      toast.error(t("upgrade.pdfLocked"));
      navigate("/dashboard/pricing");
      return;
    }
    generateWorkflowPdf(activeBrand?.name || "Brand", "Compliance & Vertrieb", [{
      title: "Label & Compliance",
      items: labelChecklist.map((item) => ({ label: item.label, checked: !!complianceChecked[item.id] })),
    }]);
    toast.success(t("pdf.exportSuccess"));
  };

  const categories = [...new Set(labelChecklist.map(i => i.category))];
  const CATEGORY_LABELS: Record<string, string> = {
    label: "Pflichtangaben", cosmetics: "Kosmetik-Kennzeichnung", supplements: "Nahrungsergänzung",
    food: "Lebensmittel", apparel: "Textil-Kennzeichnung", electronics: "Elektronik",
    eu: "EU-Markt", barcode: "Barcode / EAN", brand: "Markenpositionierung", packaging: "Verpackung",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => saveToDb(true)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("steps.save")}
        </Button>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compliance">{t("phase4.tabCompliance", "Compliance")}</TabsTrigger>
          <TabsTrigger value="sales">{t("phase4.tabSales", "Vertrieb & Launch-Prep")}</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Compliance ── */}
        <TabsContent value="compliance" className="space-y-6 mt-4">
          {bp && bp.categoryId && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-accent font-medium">Checkliste personalisiert für:</span>
              <span className="text-xs font-bold text-accent capitalize">{bp.categoryId.replace("_", " / ")}</span>
              {bp.targetRegion && <Badge variant="outline" className="text-[10px] ml-1">{bp.targetRegion}</Badge>}
              {bp.priceSegment && <Badge variant="outline" className="text-[10px] ml-1">{bp.priceSegment}</Badge>}
            </div>
          )}

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("step5.labelChecklist")}</h2>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {completedComplianceCount}/{labelChecklist.length} {t("step5.done")}
              </span>
            </div>

            {categories.map(cat => {
              const catItems = labelChecklist.filter(i => i.category === cat);
              return (
                <div key={cat} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">{CATEGORY_LABELS[cat] || cat}</h3>
                  <div className="space-y-3">
                    {catItems.map((item) => (
                      <label key={item.id} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <Checkbox checked={!!complianceChecked[item.id]} onCheckedChange={(v) => setComplianceChecked((p) => ({ ...p, [item.id]: !!v }))} className="mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${complianceChecked[item.id] ? "line-through text-muted-foreground" : ""}`}>
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
        </TabsContent>

        {/* ── Tab 2: Sales & Launch Prep ── */}
        <TabsContent value="sales" className="space-y-6 mt-4">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">{t("step6.title")}</h2>
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

          {/* Return strategy */}
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
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("step6.checklist")}</h2>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${readiness === 100 ? "text-green-600" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{readiness}% {t("step6.ready")}</span>
              </div>
            </div>
            <div className="space-y-3">
              {operationalChecklist.map((item) => (
                <label key={item} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={!!salesChecked[item]} onCheckedChange={(v) => setSalesChecked((p) => ({ ...p, [item]: !!v }))} />
                  <span className={`text-sm ${salesChecked[item] ? "line-through text-muted-foreground" : ""}`}>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
