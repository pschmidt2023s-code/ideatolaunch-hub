import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { withPerfTracking, logError } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BrandNameIntelligence } from "@/components/BrandNameIntelligence";
import type { StepHandle } from "./StepIdeaFoundation";

const toneOptions = ["Luxuriös", "Minimal", "Bold", "Verspielt", "Professionell", "Natürlich"];
const visualOptions = ["Clean & Modern", "Vintage & Retro", "High-End Eleganz", "Bunt & Energetisch"];

export const StepValidationBrand = forwardRef<StepHandle>(function StepValidationBrand(_, ref) {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

  // ── Validation (ex Step 1) state ──
  const [form, setForm] = useState({
    productDescription: "",
    targetAudience: "",
    priceLevel: "",
    country: "",
    budget: "",
    timeline: "",
  });
  const [generated, setGenerated] = useState({
    positioning: "",
    values: "",
    marketAngle: "",
    differentiation: "",
  });
  const [aiLoading, setAiLoading] = useState(false);

  // ── Brand Identity (ex Step 2) state ──
  const [brandName, setBrandName] = useState("");
  const [tone, setTone] = useState("");
  const [visual, setVisual] = useState("");
  const [tagline, setTagline] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [saving, setSaving] = useState(false);

  // ── Data fetching ──
  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: identity } = useQuery({
    queryKey: ["brand_identity", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_identities").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        productDescription: profile.product_description || "",
        targetAudience: profile.target_audience || "",
        priceLevel: profile.price_level || "",
        country: profile.country || "",
        budget: profile.budget || "",
        timeline: profile.timeline || "",
      });
      setGenerated({
        positioning: profile.positioning_statement || "",
        values: profile.brand_values || "",
        marketAngle: profile.market_angle || "",
        differentiation: profile.differentiation || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (identity) {
      setBrandName(identity.brand_name || "");
      setTone(identity.tone || "");
      setVisual(identity.visual_direction || "");
      setTagline(identity.tagline || "");
    }
  }, [identity]);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  // ── Save both sections ──
  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    setSaving(true);

    // Save profile
    const profilePayload = {
      brand_id: brandId,
      product_description: form.productDescription,
      target_audience: form.targetAudience,
      price_level: form.priceLevel,
      country: form.country,
      budget: form.budget,
      timeline: form.timeline,
      positioning_statement: generated.positioning,
      brand_values: generated.values,
      market_angle: generated.marketAngle,
      differentiation: generated.differentiation,
    };
    const p1 = profile
      ? supabase.from("brand_profiles").update(profilePayload).eq("id", profile.id)
      : supabase.from("brand_profiles").insert(profilePayload);

    // Save identity
    const identityPayload = {
      brand_id: brandId,
      brand_name: brandName.trim(),
      tone,
      visual_direction: visual,
      tagline: tagline.trim(),
    };
    const p2 = identity
      ? supabase.from("brand_identities").update(identityPayload).eq("id", identity.id)
      : supabase.from("brand_identities").insert(identityPayload);

    const [r1, r2] = await Promise.all([p1, p2]);
    setSaving(false);

    if (r1.error || r2.error) {
      if (showToast) toast.error(t("steps.saveError"));
    } else {
      if (showToast) toast.success(t("steps.saved"));
      queryClient.invalidateQueries({ queryKey: ["brand_profile", brandId] });
      queryClient.invalidateQueries({ queryKey: ["brand_identity", brandId] });
    }
  }, [brandId, form, generated, profile, identity, brandName, tone, visual, tagline, t, queryClient]);

  useImperativeHandle(ref, () => ({ save: () => saveToDb(false) }), [saveToDb]);

  const handleAiAnalyze = async () => {
    if (!form.productDescription.trim()) {
      toast.error("Bitte beschreibe dein Produkt zuerst.");
      return;
    }
    setAiLoading(true);
    try {
      const data = await withPerfTracking("ai_analyze", async () => {
        const { data, error } = await supabase.functions.invoke("ai-analyze", { body: form });
        if (error) throw error;
        return data;
      }, 1500);
      setGenerated({
        positioning: data.positioning || "",
        values: data.values || "",
        marketAngle: data.marketAngle || "",
        differentiation: data.differentiation || "",
      });
      toast.success("KI-Analyse abgeschlossen!");
    } catch (err: any) {
      console.error(err);
      toast.error("KI-Analyse fehlgeschlagen.");
      logError(err.message || "AI analyze failed", { errorType: "api", metadata: { form } });
    } finally {
      setAiLoading(false);
    }
  };

  const generateNameSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-brand-names", {
        body: { productDescription: tagline || brandName, tone, visual },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setSuggestions(data.names || []);
    } catch (e) {
      console.error(e);
      toast.error("Vorschläge konnten nicht geladen werden.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => saveToDb(true)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("steps.save")}
        </Button>
      </div>

      <Tabs defaultValue="validation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="validation">{t("phase1.tabValidation", "Produkt & Markt")}</TabsTrigger>
          <TabsTrigger value="brand">{t("phase1.tabBrand", "Markenidentität")}</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Validation ── */}
        <TabsContent value="validation" className="space-y-6 mt-4">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">{t("step1.title")}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("step1.whatSell")}</Label>
                <Textarea placeholder={t("step1.whatSellPlaceholder")} value={form.productDescription} onChange={(e) => update("productDescription", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t("step1.audience")}</Label>
                <Input placeholder={t("step1.audiencePlaceholder")} value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("step1.priceLevel")}</Label>
                <Select value={form.priceLevel} onValueChange={(v) => update("priceLevel", v)}>
                  <SelectTrigger><SelectValue placeholder={t("step1.choose")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">{t("step1.priceBudget")}</SelectItem>
                    <SelectItem value="mid">{t("step1.priceMid")}</SelectItem>
                    <SelectItem value="premium">{t("step1.pricePremium")}</SelectItem>
                    <SelectItem value="luxury">{t("step1.priceLuxury")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("step1.country")}</Label>
                <Input placeholder={t("step1.countryPlaceholder")} value={form.country} onChange={(e) => update("country", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("step1.budget_label")}</Label>
                <Input placeholder={t("step1.budgetPlaceholder")} value={form.budget} onChange={(e) => update("budget", e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("step1.timeline")}</Label>
                <Select value={form.timeline} onValueChange={(v) => update("timeline", v)}>
                  <SelectTrigger><SelectValue placeholder={t("step1.choose")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">{t("step1.t13")}</SelectItem>
                    <SelectItem value="3-6">{t("step1.t36")}</SelectItem>
                    <SelectItem value="6-12">{t("step1.t612")}</SelectItem>
                    <SelectItem value="12+">{t("step1.t12plus")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6">
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAiAnalyze} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {aiLoading ? t("step1.aiRunning") : t("step1.aiAnalyze")}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">{t("step1.results")}</h2>
            {!generated.positioning && !generated.values && (
              <p className="text-sm text-muted-foreground">{t("step1.resultsEmpty")}</p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {([
                { label: t("step1.positioning"), key: "positioning" },
                { label: t("step1.values"), key: "values" },
                { label: t("step1.marketAngle"), key: "marketAngle" },
                { label: t("step1.differentiation"), key: "differentiation" },
              ] as const).map(({ label, key }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Textarea placeholder={t("step1.aiPlaceholder")} value={generated[key]} onChange={(e) => setGenerated((p) => ({ ...p, [key]: e.target.value }))} rows={3} className="bg-muted/50" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Brand Identity ── */}
        <TabsContent value="brand" className="space-y-6 mt-4">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">{t("step2.title", "Markenidentität")}</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>{t("step2.brandName", "Markenname")}</Label>
                <div className="flex gap-3">
                  <Input placeholder="Dein Markenname..." value={brandName} onChange={(e) => setBrandName(e.target.value)} className="flex-1" />
                  <Button variant="outline" className="gap-2 shrink-0" onClick={generateNameSuggestions} disabled={loadingSuggestions}>
                    {loadingSuggestions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {t("step2.suggestions", "Vorschläge")}
                  </Button>
                </div>
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestions.map((name) => (
                      <button key={name} onClick={() => { setBrandName(name); setSuggestions([]); }} className="rounded-full border px-3 py-1 text-sm hover:bg-accent/10 hover:border-accent transition-colors">
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("step2.tone", "Tonalität")}</Label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((t) => (
                    <button key={t} onClick={() => setTone(t)} className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${tone === t ? "border-accent bg-accent/10 text-accent font-medium" : "hover:bg-muted"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("step2.visual", "Visuelle Richtung")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {visualOptions.map((v) => (
                    <button key={v} onClick={() => setVisual(v)} className={`rounded-lg border p-4 text-left text-sm transition-all ${visual === v ? "border-accent bg-accent/5 ring-1 ring-accent/20 font-medium" : "hover:bg-muted"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("step2.tagline", "Tagline")}</Label>
                <Input placeholder={t("step2.taglinePh", "Dein Markenclaim...")} value={tagline} onChange={(e) => setTagline(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <BrandNameIntelligence brandName={brandName} tone={tone} onSelectName={(name) => setBrandName(name)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
