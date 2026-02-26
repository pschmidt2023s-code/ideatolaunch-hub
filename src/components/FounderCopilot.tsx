import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Zap, AlertTriangle, Target, DollarSign, Rocket, Shield } from "lucide-react";
import { generateRecommendations, type CopilotContext, type CopilotRecommendation } from "@/lib/copilot-engine";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  const { plan } = useSubscription();
  const { activeBrand } = useBrand();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const ctx: CopilotContext = {
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
  };

  const recommendations = generateRecommendations(ctx);

  const streamChat = useCallback(async (userMsg: string) => {
    const userMessage: Msg = { role: "user", content: userMsg };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setIsStreaming(true);

    let assistantContent = "";
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-copilot`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, context: ctx }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Fehler beim Verbinden mit dem Copilot. Bitte versuche es erneut." }]);
    } finally {
      setIsStreaming(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
    }
  }, [messages, ctx]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    streamChat(input.trim());
    setInput("");
  };

  const content = (
    <div className="space-y-6">
      {/* Quick Recommendations */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" /> Sofort-Empfehlungen
        </h4>
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const Icon = CATEGORY_ICONS[rec.category] ?? Zap;
            return (
              <div key={rec.id} className="rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{rec.title}</span>
                      <Badge className={`text-[10px] ${PRIORITY_COLORS[rec.priority]}`}>{rec.priority}</Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">Confidence: {rec.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                    <p className="text-xs mt-1 font-medium text-accent">→ {rec.action}</p>
                    <p className="text-xs mt-1 text-muted-foreground italic">{rec.impact}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      <div className="rounded-xl border">
        <div className="border-b p-3 flex items-center gap-2">
          <Bot className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">AI Founder Copilot</span>
          <Badge variant="outline" className="text-[10px] ml-auto">Powered by AI</Badge>
        </div>
        <div ref={scrollRef} className="h-[300px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              <Bot className="h-8 w-8 mx-auto mb-2 text-accent/50" />
              <p>Frag mich zu MOQ, Preisgestaltung, Budget oder Launch-Timing.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {["Soll ich meine MOQ verhandeln?", "Wie optimiere ich mein Budget?", "Wann ist der beste Launch-Zeitpunkt?"].map((q) => (
                  <Button key={q} variant="outline" size="sm" className="text-xs" onClick={() => { setInput(q); streamChat(q); }}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && <Bot className="h-5 w-5 shrink-0 text-accent mt-1" />}
              <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                m.role === "user" ? "bg-accent text-accent-foreground" : "bg-muted"
              }`}>
                {m.content}
              </div>
              {m.role === "user" && <User className="h-5 w-5 shrink-0 text-muted-foreground mt-1" />}
            </div>
          ))}
          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2">
              <Bot className="h-5 w-5 text-accent mt-1" />
              <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                <span className="animate-pulse">●●●</span>
              </div>
            </div>
          )}
        </div>
        <div className="border-t p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Frag den Copilot..."
            disabled={isStreaming}
          />
          <Button size="icon" onClick={handleSend} disabled={isStreaming || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
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
        {plan === "pro" ? content : (
          <LockedOverlay feature="aiStrategyRecommendations" requiredPlan="pro">
            {content}
          </LockedOverlay>
        )}
      </CardContent>
    </Card>
  );
}
