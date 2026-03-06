import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExplainabilityPanel } from "@/components/dashboard/ExplainabilityPanel";
import { MarketRealityCard } from "@/components/MarketRealityCard";
import { FounderCopilot } from "@/components/FounderCopilot";
import { SEO } from "@/components/SEO";
import { MOCK_BRAND_SUGGESTIONS } from "@/lib/command-center-types";
import { Sparkles, BarChart3, Brain, Crown, Target, DollarSign, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function IntelligencePage() {
  return (
    <DashboardLayout>
      <SEO
        title="Intelligence Suite – BrandOS"
        description="Brand Pack, Market Signals und Decision Insights."
        path="/dashboard/intelligence"
      />
      <div className="animate-fade-in space-y-8">
        <PageHeader
          title="Intelligence Suite"
          description="KI-gestützte Analysen und Empfehlungen"
          badge="AI"
          badgeVariant="warning"
        />

        <Tabs defaultValue="brand-pack" className="space-y-6">
          {/* Stable tabs – fixed width to prevent layout shift */}
          <TabsList className="w-full sm:w-auto h-auto p-1 bg-muted rounded-2xl">
            <TabsTrigger value="brand-pack" className="gap-1.5 rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
              <Sparkles className="h-3.5 w-3.5" /> Brand Pack
            </TabsTrigger>
            <TabsTrigger value="market-signals" className="gap-1.5 rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
              <BarChart3 className="h-3.5 w-3.5" /> Market Signals
            </TabsTrigger>
            <TabsTrigger value="decision-insights" className="gap-1.5 rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
              <Brain className="h-3.5 w-3.5" /> Decision Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brand-pack" className="space-y-5">
            {MOCK_BRAND_SUGGESTIONS.filter((b) => b.score >= 90).map((b) => {
              const [primaryColor, accentColor] = b.colorSuggestion.split(" / ");
              return (
                <div key={b.name} className="rounded-2xl border bg-card p-6 shadow-card hover:shadow-md transition-shadow space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold">{b.name}</h3>
                    <ScoreBadge score={b.score} />
                  </div>

                  <p className="text-base italic text-muted-foreground leading-relaxed">„{b.claim}"</p>

                  {/* Metadata grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MetaItem icon={Crown} label="Archetype" value={b.archetype} />
                    <MetaItem icon={Target} label="Zielgruppen-Emotion" value={b.targetEmotion} />
                    <MetaItem icon={DollarSign} label="Preispositionierung" value={b.pricePositioning} />
                    <MetaItem icon={TrendingUp} label="Margen-Kompatibilität" value={b.marginCompatibility} />
                  </div>

                  {/* Tonality pill + color dots */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">
                      {b.tonality}
                    </span>
                    <div className="flex items-center gap-2">
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className="h-4 w-4 rounded-full border border-border/40 shadow-sm cursor-default"
                              style={{ backgroundColor: primaryColor }}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Primärfarbe</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className="h-4 w-4 rounded-full border border-border/40 shadow-sm cursor-default"
                              style={{ backgroundColor: accentColor }}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Akzentfarbe</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <ExplainabilityPanel
                    reasoning={b.reasoning}
                    dataUsed={b.dataUsed}
                    confidence={b.confidence}
                  />
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="market-signals">
            <MarketRealityCard />
          </TabsContent>

          <TabsContent value="decision-insights">
            <FounderCopilot />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

/** Unified score badge */
function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 90 ? "text-success bg-success/10" : score >= 70 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
  return (
    <span className={cn("shrink-0 rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums", variant)}>
      {score}
    </span>
  );
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 group/meta">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 group-hover/meta:bg-accent/10 transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground group-hover/meta:text-accent transition-colors" />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
