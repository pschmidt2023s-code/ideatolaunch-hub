import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const toneOptions = ["Luxuriös", "Minimal", "Bold", "Verspielt", "Professionell", "Natürlich"];
const visualOptions = ["Clean & Modern", "Vintage & Retro", "High-End Eleganz", "Bunt & Energetisch"];

export function StepBrandStructure() {
  const [brandName, setBrandName] = useState("");
  const [tone, setTone] = useState("");
  const [visual, setVisual] = useState("");
  const [tagline, setTagline] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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
        <h2 className="mb-6 text-lg font-semibold">Markenidentität</h2>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Markenname</Label>
            <div className="flex gap-3">
              <Input
                placeholder="Dein Markenname..."
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
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
                  onClick={() => setTone(t)}
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
                  onClick={() => setVisual(v)}
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
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="mt-6 gap-2"
          variant="outline"
          onClick={() => toast.success("Gespeichert!")}
        >
          <Save className="h-4 w-4" />
          Speichern
        </Button>
      </div>
    </div>
  );
}
