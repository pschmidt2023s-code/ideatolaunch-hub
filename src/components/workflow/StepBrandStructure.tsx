import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/hooks/useBrand";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const toneOptions = ["Luxuriös", "Minimal", "Bold", "Verspielt", "Professionell", "Natürlich"];
const visualOptions = ["Clean & Modern", "Vintage & Retro", "High-End Eleganz", "Bunt & Energetisch"];

export function StepBrandStructure() {
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const brandId = activeBrand?.id;

  const [brandName, setBrandName] = useState("");
  const [tone, setTone] = useState("");
  const [visual, setVisual] = useState("");
  const [tagline, setTagline] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirty = useRef(false);

  // Load existing data
  const { data: identity } = useQuery({
    queryKey: ["brand_identity", brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_identities")
        .select("*")
        .eq("brand_id", brandId!)
        .maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  useEffect(() => {
    if (identity) {
      setBrandName(identity.brand_name || "");
      setTone(identity.tone || "");
      setVisual(identity.visual_direction || "");
      setTagline(identity.tagline || "");
    }
  }, [identity]);

  const saveToDb = useCallback(async (showToast = true) => {
    if (!brandId) return;
    setSaving(true);
    const payload = {
      brand_id: brandId,
      brand_name: brandName.trim(),
      tone,
      visual_direction: visual,
      tagline: tagline.trim(),
    };

    const { error } = identity
      ? await supabase.from("brand_identities").update(payload).eq("id", identity.id)
      : await supabase.from("brand_identities").insert(payload);

    setSaving(false);
    if (error) {
      if (showToast) toast.error(t("steps.saveError"));
    } else {
      if (showToast) toast.success(t("steps.saved"));
      else {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
      queryClient.invalidateQueries({ queryKey: ["brand_identity", brandId] });
    }
  }, [brandId, brandName, tone, visual, tagline, identity, queryClient, t]);

  // Auto-save on changes (debounced 2s) — only after user interaction
  useEffect(() => {
    if (!isDirty.current || !brandId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveToDb(false);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [brandName, tone, visual, tagline, brandId]);

  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-brand-names", {
        body: { productDescription: tagline || brandName, tone, visual },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setSuggestions(data.names || []);
    } catch (e) {
      console.error(e);
      toast.error("Vorschläge konnten nicht geladen werden.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Markenidentität</h2>
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

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Markenname</Label>
            <div className="flex gap-3">
              <Input
                placeholder="Dein Markenname..."
                value={brandName}
                onChange={(e) => { isDirty.current = true; setBrandName(e.target.value); }}
                className="flex-1"
              />
              <Button
                variant="outline"
                className="gap-2 shrink-0"
                onClick={generateSuggestions}
                disabled={loadingSuggestions}
              >
                {loadingSuggestions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Vorschläge
              </Button>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      isDirty.current = true;
                      setBrandName(name);
                      setSuggestions([]);
                    }}
                    className="rounded-full border px-3 py-1 text-sm hover:bg-accent/10 hover:border-accent transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tonalität</Label>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => { isDirty.current = true; setTone(t); }}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    tone === t
                      ? "border-accent bg-accent/10 text-accent font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Visuelle Richtung</Label>
            <div className="grid grid-cols-2 gap-3">
              {visualOptions.map((v) => (
                <button
                  key={v}
                  onClick={() => { isDirty.current = true; setVisual(v); }}
                  className={`rounded-lg border p-4 text-left text-sm transition-all ${
                    visual === v
                      ? "border-accent bg-accent/5 ring-1 ring-accent/20 font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input
              placeholder="Dein Markenclaim..."
              value={tagline}
              onChange={(e) => { isDirty.current = true; setTagline(e.target.value); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
