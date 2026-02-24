import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Save } from "lucide-react";
import { toast } from "sonner";

const toneOptions = ["Luxuriös", "Minimal", "Bold", "Verspielt", "Professionell", "Natürlich"];
const visualOptions = ["Clean & Modern", "Vintage & Retro", "High-End Eleganz", "Bunt & Energetisch"];

export function StepBrandStructure() {
  const [brandName, setBrandName] = useState("");
  const [tone, setTone] = useState("");
  const [visual, setVisual] = useState("");
  const [tagline, setTagline] = useState("");

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
              <Button variant="outline" className="gap-2 shrink-0">
                <Sparkles className="h-4 w-4" />
                Vorschläge
              </Button>
            </div>
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
