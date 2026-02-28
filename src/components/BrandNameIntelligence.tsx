import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  Search,
  Globe,
  AtSign,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface IntelligenceResult {
  legitimacy_score: number;
  domains: { de: string; com: string };
  social: { instagram: string; tiktok: string };
  trademark: {
    risk_level: string;
    similar_brands: { name: string; similarity: number }[];
    warning: string | null;
  };
  seo: { competition: string; difficulty_score: number; explanation: string };
  rebranding_suggestions: string[];
  summary: string;
}

interface Props {
  brandName: string;
  category?: string;
  tone?: string;
  onSelectName?: (name: string) => void;
}

function AvailabilityIcon({ status }: { status: string }) {
  if (status === "likely_available")
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "likely_taken")
    return <XCircle className="h-4 w-4 text-destructive" />;
  return <HelpCircle className="h-4 w-4 text-yellow-500" />;
}

function AvailabilityLabel({ status }: { status: string }) {
  if (status === "likely_available") return <span className="text-green-600 dark:text-green-400 text-xs font-medium">Wahrscheinlich verfügbar</span>;
  if (status === "likely_taken") return <span className="text-destructive text-xs font-medium">Wahrscheinlich vergeben</span>;
  return <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">Unsicher</span>;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "text-green-500" : score >= 40 ? "text-yellow-500" : "text-destructive";
  const bgColor = score >= 70 ? "bg-green-500/10" : score >= 40 ? "bg-yellow-500/10" : "bg-destructive/10";
  const borderColor = score >= 70 ? "border-green-500/30" : score >= 40 ? "border-yellow-500/30" : "border-destructive/30";

  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl border ${borderColor} ${bgColor} p-4`}>
      <span className={`text-4xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-muted-foreground">/ 100</span>
      <span className="text-xs font-medium text-muted-foreground">Legitimacy Score</span>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  if (level === "low") return <Badge variant="outline" className="border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10">Niedrig</Badge>;
  if (level === "medium") return <Badge variant="outline" className="border-yellow-500/30 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10">Mittel</Badge>;
  return <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10">Hoch</Badge>;
}

export function BrandNameIntelligence({ brandName, category, tone, onSelectName }: Props) {
  const { isPro, isExecution, plan } = useSubscription();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntelligenceResult | null>(null);

  const runCheck = async () => {
    if (!brandName || brandName.trim().length < 2) {
      toast.error("Bitte gib einen Markennamen mit mindestens 2 Zeichen ein.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-brand-intelligence", {
        body: { brandName, category, tone },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setResult(data.result);
    } catch (e) {
      console.error(e);
      toast.error("Intelligence-Check fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold">Brand Name Intelligence</h3>
          <Badge variant="outline" className="text-[10px]">Pro</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={runCheck}
          disabled={loading || !brandName}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Prüfen
        </Button>
      </div>

      {result && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {/* Score + Summary */}
          <div className="flex gap-4 items-start">
            <ScoreRing score={result.legitimacy_score} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
              {result.trademark.risk_level === "high" && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive font-medium">
                    Hohes Verwechslungsrisiko mit bestehender Marke.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Domain + Social Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Globe className="h-3.5 w-3.5" /> Domains
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm">.de</span>
                  <div className="flex items-center gap-1.5">
                    <AvailabilityIcon status={result.domains.de} />
                    <AvailabilityLabel status={result.domains.de} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">.com</span>
                  <div className="flex items-center gap-1.5">
                    <AvailabilityIcon status={result.domains.com} />
                    <AvailabilityLabel status={result.domains.com} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <AtSign className="h-3.5 w-3.5" /> Social Handles
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Instagram</span>
                  <div className="flex items-center gap-1.5">
                    <AvailabilityIcon status={result.social.instagram} />
                    <AvailabilityLabel status={result.social.instagram} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">TikTok</span>
                  <div className="flex items-center gap-1.5">
                    <AvailabilityIcon status={result.social.tiktok} />
                    <AvailabilityLabel status={result.social.tiktok} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trademark + SEO */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Shield className="h-3.5 w-3.5" /> Markenrecht-Risiko
              </div>
              <RiskBadge level={result.trademark.risk_level} />
              {result.trademark.similar_brands.length > 0 && (
                <div className="space-y-1 mt-1">
                  {result.trademark.similar_brands.map((b) => (
                    <div key={b.name} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{b.name}</span>
                      <span className="font-medium">{Math.round(b.similarity * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
              {result.trademark.warning && (
                <p className="text-xs text-destructive mt-1">{result.trademark.warning}</p>
              )}
            </div>

            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> SEO-Wettbewerb
              </div>
              <RiskBadge level={result.seo.competition} />
              <p className="text-xs text-muted-foreground mt-1">{result.seo.explanation}</p>
            </div>
          </div>

          {/* Rebranding Suggestions (Execution only) */}
          {isExecution && result.rebranding_suggestions.length > 0 && (
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Rebranding-Vorschläge
              </div>
              <div className="flex flex-wrap gap-2">
                {result.rebranding_suggestions.map((name) => (
                  <button
                    key={name}
                    onClick={() => onSelectName?.(name)}
                    className="rounded-full border px-3 py-1 text-sm hover:bg-accent/10 hover:border-accent transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!isPro) {
    return (
      <LockedOverlay feature="scenarioSimulator" requiredPlan="pro">
        {content}
      </LockedOverlay>
    );
  }

  return content;
}
