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
import type { PackagingType, UnboxingInput } from "@/lib/unboxing-score-engine";

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
      customLabeling, returnFriendly, pkgBudget, supplierSegment, unboxingProfile]);

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
                  <SelectItem key={c.id} value={c.id}>{c.labelDe}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* Supplier Experience — PRO */}
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Supplier Matching — Eingaben</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <Select value={supplierSegment} onValueChange={(v) => setSupplierSegment(v as "budget" | "mid" | "premium")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="mid">Mittel</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unboxing-Budget (€, optional)</Label>
              <Input type="number" placeholder="z.B. 500" value={addonBudget} onChange={(e) => setAddonBudget(e.target.value)} />
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
        <h2 className="text-lg font-semibold">Unboxing Experience — Profil</h2>

        <div className="space-y-2">
          <Label>Verpackungstyp</Label>
          <Select value={packagingType} onValueChange={(v) => setPackagingType(v as PackagingType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="poly_mailer">Polybag / Mailer</SelectItem>
              <SelectItem value="kraft_box">Kraft-Box</SelectItem>
              <SelectItem value="rigid_box">Rigid Box</SelectItem>
              <SelectItem value="custom_box">Custom Box</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["tissuePaper", tissuePaper, setTissuePaper, "Seidenpapier"] as const,
            ["stickerSeal", stickerSeal, setStickerSeal, "Sticker-Siegel"] as const,
            ["thankYouCard", thankYouCard, setThankYouCard, "Dankeskarte"] as const,
            ["insertSamples", insertSamples, setInsertSamples, "Produkt-Beilagen"] as const,
            ["customLabeling", customLabeling, setCustomLabeling, "Custom Labeling"] as const,
            ["returnFriendly", returnFriendly, setReturnFriendly, "Rücksendefreundlich"] as const,
          ]).map(([key, val, setter, label]) => (
            <label key={key} className="flex items-center justify-between gap-2 rounded-lg border p-3 cursor-pointer">
              <span className="text-sm">{label}</span>
              <Switch checked={val} onCheckedChange={setter} />
            </label>
          ))}
        </div>

        <div className="max-w-xs space-y-2">
          <Label>Verpackungsbudget pro Bestellung (€, optional)</Label>
          <Input type="number" placeholder="z.B. 2.50" value={pkgBudget} onChange={(e) => setPkgBudget(e.target.value)} />
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
    </div>
  );
});
