import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Send, Wand2, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { WebsiteData } from "./types";

interface WishPanelProps {
  websiteData: WebsiteData;
  brandName: string;
  activePage: string;
  onUpdate: (data: WebsiteData) => void;
  projectId?: string;
}

const QUICK_WISHES = [
  "Mach die Headline emotionaler und mutiger",
  "Füge mehr Trust-Elemente hinzu",
  "Mach den CTA dringlicher",
  "Ändere den Ton zu luxuriös und exklusiv",
  "Füge eine FAQ-Sektion mit 5 Fragen hinzu",
  "Mach die Testimonials realistischer",
  "Optimiere die Texte für Conversion",
  "Füge Preise zu den Produkten hinzu",
];

export function WishPanel({ websiteData, brandName, activePage, onUpdate, projectId }: WishPanelProps) {
  const [wish, setWish] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ wish: string; timestamp: Date }[]>([]);

  const handleWish = async (wishText: string) => {
    if (!wishText.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-website-edit", {
        body: {
          wish: wishText,
          currentData: websiteData,
          targetPage: activePage,
          brandName,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      onUpdate(data as WebsiteData);
      setHistory(prev => [{ wish: wishText, timestamp: new Date() }, ...prev]);
      setWish("");
      toast.success("Änderung angewendet!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Änderung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-accent" />
            <span className="font-mono">AI WUNSCH-SYSTEM</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={wish}
              onChange={e => setWish(e.target.value)}
              placeholder="z.B. 'Mach die Hero moderner' oder 'Ändere die Farben zu Blau'"
              className="text-sm"
              onKeyDown={e => e.key === "Enter" && !loading && handleWish(wish)}
              disabled={loading}
            />
            <Button
              onClick={() => handleWish(wish)}
              disabled={!wish.trim() || loading}
              size="sm"
              className="gap-1.5 shrink-0"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {loading ? "Läuft..." : "Senden"}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Beschreibe deine Änderung in natürlicher Sprache. Die KI passt die aktuelle Seite "{activePage}" an.
          </p>
        </CardContent>
      </Card>

      {/* Quick Wishes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-mono">SCHNELL-AKTIONEN</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_WISHES.map(qw => (
              <button
                key={qw}
                onClick={() => handleWish(qw)}
                disabled={loading}
                className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-[11px] font-medium hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all disabled:opacity-50"
              >
                {qw}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">VERLAUF</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0 font-mono">
                    {h.timestamp.toLocaleTimeString("de", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-foreground">{h.wish}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
