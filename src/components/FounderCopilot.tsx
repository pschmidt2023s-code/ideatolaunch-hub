import { useState, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Zap, AlertTriangle, Target, DollarSign, Rocket, Shield, Loader2 } from "lucide-react";
import { generateRecommendations, type CopilotContext, type CopilotRecommendation } from "@/lib/copilot-engine";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CATEGORY_ICONS: Record<string, any> = {
  pricing: DollarSign,
  moq: Target,
  budget: Zap,
  launch: Rocket,
  risk: AlertTriangle,
  cashflow: Shield,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-yellow-500 text-white",
  low: "bg-green-500 text-white",
};

export function FounderCopilot() {
  const { plan, isPro } = useSubscription();
  const { activeBrand } = useBrand();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load context from DB
  const { data: financials } = useQuery({
    queryKey: ["copilot-financials", activeBrand?.id],
    queryFn: async () => {
      if (!activeBrand) return null;
      const { data } = await supabase
        .from("financial_models")
        .select("*")
        .eq("brand_id", activeBrand.id)
        .maybeSingle();
      return data;
    },
    enabled: !!activeBrand,
  });

  const { data: profile } = useQuery({
    queryKey: ["copilot-profile", activeBrand?.id],
    queryFn: async () => {
      if (!activeBrand) return null;
      const { data } = await supabase
        .from("brand_profiles")
        .select("budget")
        .eq("brand_id", activeBrand.id)
        .maybeSingle();
      return data;
    },
    enabled: !!activeBrand,
  });

  const ctx: CopilotContext = useMemo(() => ({
    margin: financials?.margin ?? 35,
    capitalSafetyMonths: 5,
    riskScore: 40,
    monthlyBurnRate: 1200,
    returnRate: 5,
    launchProbability: 65,
    moq: 500,
    budget: profile?.budget ? parseFloat(profile.budget) : 10000,
    productionCost: financials?.production_cost ?? 8,
    targetPrice: financials?.recommended_price ?? 24.90,
  }), [financials, profile]);

  const recommendations = useMemo(() => generateRecommendations(ctx), [ctx]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const streamChat = useCallback(async (userMsg: string) => {
    const userMessage: Msg = { role: "user", content: userMsg };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setIsStreaming(true);
    scrollToBottom();

    // Get user session token for authenticated requests
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    let assistantContent = "";
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-copilot`;

    abortRef.current = new AbortController();

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: allMessages, context: ctx }),
        signal: abortRef.current.signal,
      });

      // Handle specific error codes
      if (resp.status === 429) {
        toast.error("Rate Limit erreicht. Bitte warte einen Moment und versuche es erneut.");
        setMessages(allMessages);
        setIsStreaming(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI-Credits aufgebraucht. Bitte lade Credits im Workspace nach.");
        setMessages(allMessages);
        setIsStreaming(false);
        return;
      }
      if (resp.status === 401) {
        toast.error("Bitte melde dich an, um den Copilot zu nutzen.");
        setMessages(allMessages);
        setIsStreaming(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error(`Stream failed: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              const snapshot = assistantContent;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m);
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
              scrollToBottom();
            }
          } catch {
            // Partial JSON – put it back and wait
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              const snapshot = assistantContent;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m);
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("Copilot stream error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Verbindungsfehler – bitte versuche es erneut." }]);
      toast.error("Copilot-Verbindung fehlgeschlagen");
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      scrollToBottom();
    }
  }, [messages, ctx, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput("");
    streamChat(msg);
  }, [input, isStreaming, streamChat]);

  const handleQuickQuestion = useCallback((q: string) => {
    if (isStreaming) return;
    streamChat(q);
  }, [isStreaming, streamChat]);

  const content = (
    <div className="space-y-6">
      {/* Quick Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" /> Sofort-Empfehlungen
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const Icon = CATEGORY_ICONS[rec.category] ?? Zap;
              return (
                <div key={rec.id} className="rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm">{rec.title}</span>
                        <Badge className={`text-[10px] ${PRIORITY_COLORS[rec.priority]}`}>{rec.priority}</Badge>
                        <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
                          Confidence: {rec.confidence}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec.reasoning}</p>
                      <p className="text-xs mt-1.5 font-medium text-accent">→ {rec.action}</p>
                      <p className="text-xs mt-1 text-muted-foreground/80 italic">{rec.impact}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="border-b border-border/60 p-3 flex items-center gap-2 bg-muted/30">
          <Bot className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">AI Founder Copilot</span>
          {isStreaming && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent ml-2" />}
          <Badge variant="outline" className="text-[10px] ml-auto">Powered by AI</Badge>
        </div>
        <div ref={scrollRef} className="h-[360px] overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              <Bot className="h-10 w-10 mx-auto mb-3 text-accent/40" />
              <p className="font-medium mb-1">Dein persönlicher Strategie-Berater</p>
              <p className="text-xs text-muted-foreground/70 mb-4">
                Frag mich zu MOQ, Preisgestaltung, Budget oder Launch-Timing.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Soll ich meine MOQ verhandeln?",
                  "Wie optimiere ich mein Budget?",
                  "Wann ist der beste Launch-Zeitpunkt?",
                ].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 mt-0.5">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted/60 border border-border/40"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>p:last-child]:mb-0">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
              {m.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div className="bg-muted/60 border border-border/40 rounded-2xl px-4 py-2.5 text-sm">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-border/60 p-3 flex gap-2 bg-background">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Frag den Copilot..."
            disabled={isStreaming}
            className="rounded-xl"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="rounded-xl shrink-0"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <LegalDisclaimer type="copilot" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          Founder Copilot
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPro ? content : (
          <LockedOverlay feature="aiStrategyRecommendations" requiredPlan="pro">
            {content}
          </LockedOverlay>
        )}
      </CardContent>
    </Card>
  );
}
