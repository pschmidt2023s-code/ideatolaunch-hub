import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { ExplainThis } from "@/components/ExplainThis";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { StepHandle } from "./StepIdeaFoundation";
import { SupplierExperienceCard } from "@/components/SupplierExperienceCard";
import { UnboxingScoreCard } from "@/components/UnboxingScoreCard";
import { CATEGORIES, normalizeCategoryId } from "@/lib/categories";
import { trackEvent } from "@/lib/analytics";
import { getProductionChecklistForCategory } from "@/lib/product-intelligence";
import type { PackagingType, UnboxingInput } from "@/lib/unboxing-score-engine";

// Dynamic checklist - will be computed based on category
const defaultChecklist = [
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
  const [supplierSegment, setSupplierSegment] = useState<"budget" | "mid" | "premium">("mid");
  const [addonBudget, setAddonBudget] = useState("");

  // Unboxing profile state
  const [packagingType, setPackagingType] = useState<PackagingType>("kraft_box");
  const [tissuePaper, setTissuePaper] = useState(false);
  const [stickerSeal, setStickerSeal] = useState(false);
  const [thankYouCard, setThankYouCard] = useState(false);
  const [insertSamples, setInsertSamples] = useState(false);
  const [customLabeling, setCustomLabeling] = useState(false);
  const [returnFriendly, setReturnFriendly] = useState(false);
  const [pkgBudget, setPkgBudget] = useState("");

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

  const { data: unboxingProfile } = useQuery({
    queryKey: ["unboxing_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("unboxing_profiles")
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
      const raw = plan.product_category || "";
      const normalized = CATEGORIES.some((c) => c.id === raw) ? raw : normalizeCategoryId(raw);
      setCategory(normalized);
      if (Array.isArray(plan.checklist)) {
        const c: Record<string, boolean> = {};
        (plan.checklist as string[]).forEach((item) => { c[item] = true; });
        setChecked(c);
      }
      // Restore supplier matching inputs from risk_warnings JSON (repurposed as supplier_inputs)
      const si = plan.supplier_questions as any;
      if (si && typeof si === "object" && !Array.isArray(si)) {
        setSupplierBudget(si.supplierBudget ?? "");
        setSupplierQty(si.supplierQty ?? "");
        setSupplierSegment(si.supplierSegment ?? "mid");
        setAddonBudget(si.addonBudget ?? "");
      }
    }
  }, [plan]);

  useEffect(() => {
    if (unboxingProfile) {
      setPackagingType((unboxingProfile.packaging_type as PackagingType) || "kraft_box");
      setTissuePaper(unboxingProfile.tissue_paper ?? false);
      setStickerSeal(unboxingProfile.sticker_seal ?? false);
      setThankYouCard(unboxingProfile.thank_you_card ?? false);
      setInsertSamples(unboxingProfile.insert_samples ?? false);
      setCustomLabeling(unboxingProfile.custom_labeling ?? false);
      setReturnFriendly(unboxingProfile.return_friendly ?? false);
      setPkgBudget(unboxingProfile.packaging_budget?.toString() || "");
    }
  }, [unboxingProfile]);

  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    setSaving(true);
    const payload = {
      brand_id: brandId,
      production_region: region,
      moq_expectation: moq,
      product_category: category,
      checklist: Object.entries(checked).filter(([, v]) => v).map(([k]) => k),
      supplier_questions: { supplierBudget, supplierQty, supplierSegment, addonBudget },
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

    // Save unboxing profile in parallel
    const ubPayload = {
      brand_id: brandId,
      packaging_type: packagingType,
      tissue_paper: tissuePaper,
      sticker_seal: stickerSeal,
      thank_you_card: thankYouCard,
      insert_samples: insertSamples,
      custom_labeling: customLabeling,
      return_friendly: returnFriendly,
      packaging_budget: pkgBudget ? Number(pkgBudget) : null,
      target_positioning: supplierSegment,
    };

    const { error: ubErr } = unboxingProfile
      ? await supabase.from("unboxing_profiles").update(ubPayload).eq("id", unboxingProfile.id)
      : await supabase.from("unboxing_profiles").insert(ubPayload);

    if (!ubErr) {
      queryClient.invalidateQueries({ queryKey: ["unboxing_profile", brandId] });
      trackEvent("unboxing_profile_saved");
    }
  }, [brandId, region, moq, category, checked, plan, queryClient, t,
      packagingType, tissuePaper, stickerSeal, thankYouCard, insertSamples,
      customLabeling, returnFriendly, pkgBudget, supplierSegment, unboxingProfile,
      supplierBudget, supplierQty, addonBudget]);

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
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder={t("step4.categoryPh")} /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{t(`step4.cat${c.id.charAt(0).toUpperCase() + c.id.slice(1)}` as any, c.labelDe)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">{t("step4.checklist")}</h2>
        {category && category !== "" && (
          <div className="mb-3 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-accent font-medium">
            Checkliste angepasst an: <span className="font-bold capitalize">{category.replace("_", " / ")}</span>
          </div>
        )}
        <div className="space-y-3">
          {getProductionChecklistForCategory(category || "other").map((item) => (
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

      {/* Supplier Experience — PRO */}
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">{t("step4.supplierTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t("step4.budget")}</Label>
              <Input type="number" placeholder={t("step4.budgetPh")} value={supplierBudget} onChange={(e) => setSupplierBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("step4.startQty")}</Label>
              <Input type="number" placeholder={t("step4.startQtyPh")} value={supplierQty} onChange={(e) => setSupplierQty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("step4.priceSegment")}</Label>
              <Select value={supplierSegment} onValueChange={(v) => setSupplierSegment(v as "budget" | "mid" | "premium")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">{t("step4.segBudget")}</SelectItem>
                  <SelectItem value="mid">{t("step4.segMid")}</SelectItem>
                  <SelectItem value="premium">{t("step4.segPremium")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("step4.addonBudget")}</Label>
              <Input type="number" placeholder={t("step4.addonBudgetPh")} value={addonBudget} onChange={(e) => setAddonBudget(e.target.value)} />
            </div>
          </div>
        </div>
        <SupplierExperienceCard
          categoryId={category}
          budget={Number(supplierBudget) || 0}
          targetRegion={region === "asia" ? "Asia" : region === "eu" ? "EU" : "Global"}
          launchQuantity={Number(supplierQty) || 0}
          priceSegment={supplierSegment}
          addonBudget={Number(addonBudget) || undefined}
        />
      </div>

      {/* Unboxing Profile & Score — PRO */}
      <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
        <h2 className="text-lg font-semibold">{t("step4.unboxingTitle")}</h2>

        <div className="space-y-2">
          <Label>{t("step4.packagingType")}</Label>
          <Select value={packagingType} onValueChange={(v) => setPackagingType(v as PackagingType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="poly_mailer">{t("step4.polyMailer")}</SelectItem>
              <SelectItem value="kraft_box">{t("step4.kraftBox")}</SelectItem>
              <SelectItem value="rigid_box">{t("step4.rigidBox")}</SelectItem>
              <SelectItem value="custom_box">{t("step4.customBox")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["tissuePaper", tissuePaper, setTissuePaper, t("step4.tissuePaper")] as const,
            ["stickerSeal", stickerSeal, setStickerSeal, t("step4.stickerSeal")] as const,
            ["thankYouCard", thankYouCard, setThankYouCard, t("step4.thankYouCard")] as const,
            ["insertSamples", insertSamples, setInsertSamples, t("step4.insertSamples")] as const,
            ["customLabeling", customLabeling, setCustomLabeling, t("step4.customLabeling")] as const,
            ["returnFriendly", returnFriendly, setReturnFriendly, t("step4.returnFriendly")] as const,
          ]).map(([key, val, setter, label]) => (
            <label key={key} className="flex items-center justify-between gap-2 rounded-lg border p-3 cursor-pointer">
              <span className="text-sm">{label}</span>
              <Switch checked={val} onCheckedChange={setter} />
            </label>
          ))}
        </div>

        <div className="max-w-xs space-y-2">
          <Label>{t("step4.pkgBudget")}</Label>
          <Input type="number" placeholder={t("step4.pkgBudgetPh")} value={pkgBudget} onChange={(e) => setPkgBudget(e.target.value)} />
        </div>
      </div>

      <UnboxingScoreCard
        input={{
          packagingType,
          tissuePaper,
          stickerSeal,
          thankYouCard,
          insertSamples,
          customLabeling,
          returnFriendly,
          packagingBudget: pkgBudget ? Number(pkgBudget) : undefined,
          targetPositioning: supplierSegment,
        }}
      />

      {/* Kapitalbindung & Working Capital Gap */}
      {Number(supplierBudget) > 0 && Number(supplierQty) > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            💰 Kapitalbindung & Working Capital
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(() => {
              const capitalLock = Number(supplierBudget);
              const qty = Number(supplierQty);
              const unitCost = capitalLock / (qty || 1);
              // Assume avg 3 months until first sale
              const avgSellMonths = 3;
              const shippingMonths = region === "asia" ? 2 : 0.5;
              const totalLockMonths = avgSellMonths + shippingMonths;
              const workingCapitalGap = capitalLock; // until first revenue comes in

              return (
                <>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Kapitalbindung</p>
                    <p className="text-2xl font-bold text-destructive">{capitalLock.toLocaleString("de-DE")} €</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Gebunden für ≈{totalLockMonths.toFixed(0)} Monate</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Stückkosten</p>
                    <p className="text-2xl font-bold">{unitCost.toFixed(2)} €</p>
                    <p className="text-[10px] text-muted-foreground mt-1">pro Einheit ({qty} Stück)</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Working Capital Gap</p>
                    <p className="text-2xl font-bold text-amber-600">{totalLockMonths.toFixed(1)} Mo.</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {region === "asia" ? "Inkl. ≈2 Mo. Shipping" : "Inkl. ≈2 Wo. Shipping"}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
            <strong>⚠️ Hinweis:</strong> Dein Kapital ist vom Zeitpunkt der Bestellung bis zum ersten Verkauf gebunden.
            {region === "asia" && " Bei Produktion in Asien kommen ≈6-8 Wochen Shipping + Zoll hinzu."}
            {" "}Plane einen Cash-Puffer ein, um laufende Kosten zu decken.
          </div>
        </div>
      )}
    </div>
  );
});
