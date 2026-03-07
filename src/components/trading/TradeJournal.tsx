// Feature 5: Trade Journal with AI Analysis
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  symbol: string;
  side: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  notes: string;
  emotion: string;
  timestamp: string;
  aiReview?: string;
}

export function TradeJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [form, setForm] = useState({ symbol: "BTCUSDT", side: "long" as "long" | "short", entryPrice: 0, exitPrice: 0, notes: "", emotion: "neutral" });

  const addEntry = () => {
    const pnl = form.side === "long" ? form.exitPrice - form.entryPrice : form.entryPrice - form.exitPrice;
    const entry: JournalEntry = {
      id: `j${Date.now()}`,
      ...form,
      pnl: Math.round(pnl * 100) / 100,
      timestamp: new Date().toISOString(),
    };
    setEntries(prev => [entry, ...prev]);
    setForm({ symbol: "BTCUSDT", side: "long", entryPrice: 0, exitPrice: 0, notes: "", emotion: "neutral" });
    setShowForm(false);
  };

  const requestAiReview = async (entry: JournalEntry) => {
    setLoading(entry.id);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-trade-review`;
      const { data: session } = await supabase.auth.getSession();
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          trades: { symbol: entry.symbol, side: entry.side, entry: entry.entryPrice, exit: entry.exitPrice, pnl: entry.pnl, emotion: entry.emotion, notes: entry.notes },
          strategy: "Journal Entry Review",
          context: "Analysiere diesen einzelnen Trade und gib konkretes Feedback in 3-4 Sätzen auf Deutsch.",
        }),
      });

      if (!resp.ok || !resp.body) {
        toast.error("AI Review fehlgeschlagen");
        setLoading(null);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "", full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) full += content;
          } catch {}
        }
      }
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, aiReview: full } : e));
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4" /> Trade Journal</h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="text-xs">
          <Plus className="h-3 w-3 mr-1" /> Trade eintragen
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input placeholder="Symbol" value={form.symbol} onChange={e => setForm(p => ({ ...p, symbol: e.target.value }))} className="h-8 text-xs" />
            <Select value={form.side} onValueChange={v => setForm(p => ({ ...p, side: v as "long" | "short" }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Entry" value={form.entryPrice || ""} onChange={e => setForm(p => ({ ...p, entryPrice: +e.target.value }))} className="h-8 text-xs" />
            <Input type="number" placeholder="Exit" value={form.exitPrice || ""} onChange={e => setForm(p => ({ ...p, exitPrice: +e.target.value }))} className="h-8 text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.emotion} onValueChange={v => setForm(p => ({ ...p, emotion: v }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Emotion" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="confident">😎 Confident</SelectItem>
                <SelectItem value="neutral">😐 Neutral</SelectItem>
                <SelectItem value="fearful">😰 Fearful</SelectItem>
                <SelectItem value="greedy">🤑 Greedy</SelectItem>
                <SelectItem value="revenge">😤 Revenge</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Notizen..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="text-xs h-8 min-h-8 resize-none" />
          </div>
          <Button size="sm" onClick={addEntry} disabled={!form.entryPrice || !form.exitPrice} className="text-xs">Speichern</Button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Noch keine Einträge. Trage deinen ersten Trade ein.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {entry.pnl >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                  <span className="font-semibold text-sm">{entry.symbol}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", entry.side === "long" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>{entry.side.toUpperCase()}</span>
                </div>
                <span className={cn("text-lg font-bold tabular-nums", entry.pnl >= 0 ? "text-green-500" : "text-destructive")}>
                  {entry.pnl >= 0 ? "+" : ""}{entry.pnl}$
                </span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                <span>Entry: {entry.entryPrice}</span>
                <span>Exit: {entry.exitPrice}</span>
                <span>{new Date(entry.timestamp).toLocaleDateString("de")}</span>
              </div>
              {entry.notes && <p className="text-xs text-muted-foreground mb-2">{entry.notes}</p>}
              {entry.aiReview ? (
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-xs mt-2">
                  <p className="font-semibold text-primary mb-1">🤖 AI Review</p>
                  <p className="whitespace-pre-wrap">{entry.aiReview}</p>
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="text-xs gap-1 mt-1" onClick={() => requestAiReview(entry)} disabled={loading === entry.id}>
                  {loading === entry.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                  AI Review anfordern
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
