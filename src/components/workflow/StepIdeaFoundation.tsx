import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { withPerfTracking, logError } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function StepIdeaFoundation() {
  const { t } = useTranslation();
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const brandId = activeBrand?.id;

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
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing data
  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
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

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    setSaving(true);
    const payload = {
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

    const { error } = profile
      ? await supabase.from("brand_profiles").update(payload).eq("id", profile.id)
      : await supabase.from("brand_profiles").insert(payload);

    setSaving(false);
    if (error) {
      if (showToast) toast.error(t("steps.saveError"));
    } else {
      if (showToast) toast.success(t("steps.saved"));
      else {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
      queryClient.invalidateQueries({ queryKey: ["brand_profile", brandId] });
    }
  }, [brandId, form, generated, profile, t, queryClient]);

  // Auto-save on changes (debounced 2s)
  useEffect(() => {
    if (!brandId || (!profile && !form.productDescription && !form.targetAudience)) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveToDb(false);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [form, generated, brandId]);

  const handleAiAnalyze = async () => {
    if (!form.productDescription.trim()) {
      toast.error("Bitte beschreibe dein Produkt zuerst.");
      return;
    }
    setAiLoading(true);
    try {
      const data = await withPerfTracking("ai_analyze", async () => {
        const { data, error } = await supabase.functions.invoke("ai-analyze", {
          body: form,
        });
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

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("step1.title")}</h2>
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

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("step1.whatSell")}</Label>
            <Textarea
              placeholder={t("step1.whatSellPlaceholder")}
              value={form.productDescription}
              onChange={(e) => update("productDescription", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("step1.audience")}</Label>
            <Input
              placeholder={t("step1.audiencePlaceholder")}
              value={form.targetAudience}
              onChange={(e) => update("targetAudience", e.target.value)}
            />
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
            <Input
              placeholder={t("step1.countryPlaceholder")}
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("step1.budget_label")}</Label>
            <Input
              placeholder={t("step1.budgetPlaceholder")}
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
            />
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

        <div className="mt-6 flex gap-3">
          <Button
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleAiAnalyze}
            disabled={aiLoading}
          >
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {([
            { label: t("step1.positioning"), key: "positioning" },
            { label: t("step1.values"), key: "values" },
            { label: t("step1.marketAngle"), key: "marketAngle" },
            { label: t("step1.differentiation"), key: "differentiation" },
          ] as const).map(({ label, key }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Textarea
                placeholder={t("step1.aiPlaceholder")}
                value={generated[key]}
                onChange={(e) => setGenerated((p) => ({ ...p, [key]: e.target.value }))}
                rows={3}
                className="bg-muted/50"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}