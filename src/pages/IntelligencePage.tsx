import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExplainabilityPanel } from "@/components/dashboard/ExplainabilityPanel";
import { MarketRealityCard } from "@/components/MarketRealityCard";
import { FounderCopilot } from "@/components/FounderCopilot";
import { SEO } from "@/components/SEO";
import { MOCK_BRAND_SUGGESTIONS } from "@/lib/command-center-types";
import { Sparkles, BarChart3, Brain, Crown, Target, DollarSign, TrendingUp } from "lucide-react";

export default function IntelligencePage() {
  return (
    <DashboardLayout>
      <SEO
        title="Intelligence Suite – BrandOS"
        description="Brand Pack, Market Signals und Decision Insights."
        path="/dashboard/intelligence"
      />
      <div className="animate-fade-in space-y-8">
        <PageHeader title="Intelligence Suite" description="KI-gestützte Analysen und Empfehlungen" />

        <Tabs defaultValue="brand-pack" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="brand-pack" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Brand Pack
            </TabsTrigger>
            <TabsTrigger value="market-signals" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Market Signals
            </TabsTrigger>
            <TabsTrigger value="decision-insights" className="gap-1.5">
              <Brain className="h-3.5 w-3.5" /> Decision Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brand-pack" className="space-y-5">
            {MOCK_BRAND_SUGGESTIONS.filter((b) => b.score >= 90).map((b) => (
              <Card key={b.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{b.name}</CardTitle>
                    <Badge variant="secondary" className="text-sm font-bold tabular-nums px-3">
                      {b.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base italic text-muted-foreground">„{b.claim}"</p>

                  {/* Extended metadata */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetaItem icon={Crown} label="Archetype" value={b.archetype} />
                    <MetaItem icon={Target} label="Zielgruppen-Emotion" value={b.targetEmotion} />
                    <MetaItem icon={DollarSign} label="Preispositionierung" value={b.pricePositioning} />
                    <MetaItem icon={TrendingUp} label="Margen-Kompatibilität" value={b.marginCompatibility} />
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{b.tonality}</Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: b.colorSuggestion.split(" / ")[0] }} />
                      <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: b.colorSuggestion.split(" / ")[1] }} />
                      <span className="text-muted-foreground">{b.colorSuggestion}</span>
                    </div>
                  </div>

                  <ExplainabilityPanel
                    reasoning={b.reasoning}
                    dataUsed={b.dataUsed}
                    confidence={b.confidence}
                  />
                </CardContent>
              </Card>
            ))}
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

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
