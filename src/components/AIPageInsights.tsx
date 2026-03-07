// AI-powered contextual insights panel for any page
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface AIPageInsightsProps {
  pageContext: string;          // describe what this page is about
  dataContext?: Record<string, any>; // current page data to analyze
  title?: string;
  className?: string;
}

export function AIPageInsights({ pageContext, dataContext, title, className }: AIPageInsightsProps) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);

  const generateInsights = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);
    setInsights("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-copilot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: isDE
                  ? `Analysiere diese Seite und gib 3-5 konkrete, umsetzbare Insights. Seite: ${pageContext}. Formatiere mit Markdown-Überschriften und Bullet Points.`
                  : `Analyze this page and give 3-5 concrete, actionable insights. Page: ${pageContext}. Format with markdown headings and bullet points.`,
              },
            ],
            context: {
              page: pageContext,
              language: isDE ? "de" : "en",
              ...dataContext,
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error(isDE ? "Rate Limit erreicht – bitte warte einen Moment" : "Rate limit reached – please wait");
        } else if (response.status === 402) {
          toast.error(isDE ? "AI-Credits aufgebraucht" : "AI credits exhausted");
        } else {
          throw new Error(err.error || "AI request failed");
        }
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        let buf = "";
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
              if (content) {
                full += content;
                setInsights(full);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "AI-Analyse fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }, [user, loading, pageContext, dataContext, isDE]);

  if (!user) return null;

  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          {title || (isDE ? "AI Insights" : "AI Insights")}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1.5 h-7"
          onClick={generateInsights}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : insights ? (
            <RefreshCw className="h-3 w-3" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {loading ? (isDE ? "Analysiere…" : "Analyzing…") : insights ? (isDE ? "Neu laden" : "Refresh") : (isDE ? "Analysieren" : "Analyze")}
        </Button>
      </div>

      {insights ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm [&>h3]:text-xs [&>h3]:font-bold [&>h3]:uppercase [&>h3]:tracking-wider [&>h3]:text-muted-foreground [&>ul]:space-y-1 [&>p]:text-muted-foreground">
          <ReactMarkdown>{insights}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {isDE
            ? 'Klicke auf "Analysieren" für KI-gestützte Insights zu dieser Seite.'
            : 'Click "Analyze" for AI-powered insights about this page.'}
        </p>
      )}
    </div>
  );
}
