import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedOverlay } from "@/components/LockedOverlay";
import {
  Loader2,
  Sparkles,
  RefreshCw,
  Check,
  Shield,
  Target,
  Palette,
  Globe,
  Heart,
  Zap,
  Crown,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface NameScores {
  memorability: number;
  pronunciation: number;
  international: number;
  premium: number;
  emotional: number;
  positioning: number;
  risk_penalty: number;
}

interface GeneratedName {
  name: string;
  total_score: number;
  scores: NameScores;
  explanation: string;
  emotional_positioning: string;
  target_segment: string;
  archetype: string;
  risk_level: string;
  slogan: string;
  visual_direction: string;
  color_suggestion: string;
  domain_style: string;
}

interface Props {
  productDescription?: string;
  targetAudience?: string;
  tone?: string;
  visual?: string;
  priceLevel?: string;
  category?: string;
  onSelectName?: (name: string) => void;
  onSelectTagline?: (tagline: string) => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 95
      ? "text-green-500 border-green-500/30 bg-green-500/10"
      : score >= 90
      ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
      : "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
  return (
    <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-bold ${color}`}>
      <Star className="h-3.5 w-3.5 fill-current" />
      {score}
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  if (level === "low")
    return (
      <Badge variant="outline" className="border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10 text-[10px]">
        Niedrig
      </Badge>
    );
  if (level === "medium")
    return (
      <Badge variant="outline" className="border-yellow-500/30 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 text-[10px]">
        Mittel
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10 text-[10px]">
      Hoch
    </Badge>
  );
}

function VisualBadge({ direction }: { direction: string }) {
  const labels: Record<string, string> = {
    minimal: "Minimal",
    bold: "Bold",
    luxury: "Luxury",
    organic: "Organic",
    futuristic: "Futuristic",
  };
  return (
    <Badge variant="outline" className="text-[10px]">
      <Palette className="h-3 w-3 mr-1" />
      {labels[direction] || direction}
    </Badge>
  );
}

const scoreLabels: { key: keyof NameScores; label: string; max: number; icon: typeof Zap }[] = [
  { key: "memorability", label: "Einprägsamkeit", max: 20, icon: Zap },
  { key: "pronunciation", label: "Aussprache", max: 15, icon: Globe },
  { key: "international", label: "International", max: 15, icon: Globe },
  { key: "premium", label: "Premium-Wirkung", max: 15, icon: Crown },
  { key: "emotional", label: "Emotion", max: 15, icon: Heart },
  { key: "positioning", label: "Positionierung", max: 10, icon: Target },
];

function ScoreBreakdown({ scores }: { scores: NameScores }) {
  return (
    <div className="space-y-2">
      {scoreLabels.map(({ key, label, max }) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">
              {scores[key]}/{max}
            </span>
          </div>
          <Progress value={(scores[key] / max) * 100} className="h-1.5" />
        </div>
      ))}
      {scores.risk_penalty < 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-destructive">Risiko-Abzug</span>
          <span className="font-medium text-destructive">{scores.risk_penalty}</span>
        </div>
      )}
    </div>
  );
}

function NameCard({
  item,
  rank,
  isExpanded,
  onToggle,
  onSelect,
  onSelectTagline,
  selected,
}: {
  item: GeneratedName;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onSelectTagline?: () => void;
  selected: boolean;
}) {
  return (
    <div
      className={`rounded-xl border transition-all ${
        selected
          ? "border-accent ring-2 ring-accent/20 bg-accent/5"
          : "bg-card hover:border-accent/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold">{item.name}</h3>
            <ScoreBadge score={item.total_score} />
            <RiskBadge level={item.risk_level} />
            <VisualBadge direction={item.visual_direction} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.explanation}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={selected ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {selected ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {selected ? "Gewählt" : "Übernehmen"}
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Left: Score Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score-Analyse</h4>
              <ScoreBreakdown scores={item.scores} />
            </div>

            {/* Right: Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</h4>

              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Emotionale Positionierung</span>
                  <p className="font-medium">{item.emotional_positioning}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Zielgruppe</span>
                  <p className="font-medium">{item.target_segment}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Marken-Archetyp</span>
                  <p className="font-medium">{item.archetype}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Domain-Vorschlag</span>
                  <p className="font-medium font-mono text-xs">{item.domain_style}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Farbvorschlag</span>
                  <p className="font-medium">{item.color_suggestion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">KI-Slogan-Vorschlag</span>
            <p className="font-medium italic mt-0.5">„{item.slogan}"</p>
            {onSelectTagline && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1.5 h-7 text-xs gap-1"
                onClick={() => onSelectTagline()}
              >
                <Check className="h-3 w-3" /> Als Tagline übernehmen
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BrandNameEngine({
  productDescription,
  targetAudience,
  tone,
  visual,
  priceLevel,
  category,
  onSelectName,
  onSelectTagline,
}: Props) {
  const { isPro } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<GeneratedName[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setNames([]);
    setExpandedIndex(null);
    setSelectedName(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-brand-names", {
        body: { productDescription, targetAudience, tone, visual, priceLevel, category },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setNames(data.names || []);
      if ((data.names || []).length > 0) setExpandedIndex(0);
    } catch (e) {
      console.error(e);
      toast.error("Namensvorschläge konnten nicht generiert werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (name: string) => {
    setSelectedName(name);
    onSelectName?.(name);
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold">Brand Name Engine</h3>
          <Badge variant="outline" className="text-[10px]">Pro</Badge>
        </div>
        <Button
          variant={names.length > 0 ? "outline" : "default"}
          size="sm"
          className="gap-2"
          onClick={generate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : names.length > 0 ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Generiere..." : names.length > 0 ? "Neue generieren" : "Namen generieren"}
        </Button>
      </div>

      {!loading && names.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Generiere 3–5 strategische Markennamen mit KI-Scoring, Archetyp-Analyse und Slogan-Vorschlägen.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Basierend auf deiner Produktbeschreibung, Zielgruppe und Tonalität.
          </p>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
                <div className="h-8 w-24 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && names.length > 0 && (
        <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {names.map((item, i) => (
            <NameCard
              key={item.name}
              item={item}
              rank={i + 1}
              isExpanded={expandedIndex === i}
              onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
              onSelect={() => handleSelect(item.name)}
              onSelectTagline={
                onSelectTagline ? () => onSelectTagline(item.slogan) : undefined
              }
              selected={selectedName === item.name}
            />
          ))}
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
