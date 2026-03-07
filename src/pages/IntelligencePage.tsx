import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveKPIDashboard } from "@/components/dashboard/LiveKPIDashboard";
import { AIStrategyAdvisor } from "@/components/dashboard/AIStrategyAdvisor";
import { MarketBenchmarkPanel } from "@/components/dashboard/MarketBenchmarkPanel";
import { MarketRealityCard } from "@/components/MarketRealityCard";
import { FounderCopilot } from "@/components/FounderCopilot";
import { BrandNameEngine } from "@/components/BrandNameEngine";
import { SEO } from "@/components/SEO";
import { Sparkles, BarChart3, Brain, Crown, Compass, Activity } from "lucide-react";

export default function IntelligencePage() {
  return (
    <DashboardLayout>
      <SEO
        title="Intelligence Suite – BrandOS"
        description="Live KPIs, KI-Strategieberater, Market Benchmarks und Brand Intelligence."
        path="/dashboard/intelligence"
      />
      <div className="animate-fade-in space-y-8">
        <PageHeader
          title="Intelligence Suite"
          description="KI-gestützte Analysen, Live-KPIs und strategische Empfehlungen"
          badge="AI"
          badgeVariant="warning"
        />

        <Tabs defaultValue="live-kpis" className="space-y-6">
          <TabsList className="w-full sm:w-auto h-auto p-1 bg-muted rounded-2xl flex-wrap">
            <TabsTrigger value="live-kpis" className="gap-1.5 rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
              <Activity className="h-3.5 w-3.5" /> Live KPIs
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-1.5 rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
              <Sparkles className="h-3.5 w-3.5" /> KI-Strategie
            </TabsTrigger>
            <TabsTrigger value="benchmark" className="gap-1.5 rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
              <BarChart3 className="h-3.5 w-3.5" /> Benchmark
            </TabsTrigger>
            <TabsTrigger value="brand-pack" className="gap-1.5 rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
              <Crown className="h-3.5 w-3.5" /> Brand Pack
            </TabsTrigger>
            <TabsTrigger value="market-signals" className="gap-1.5 rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
              <Compass className="h-3.5 w-3.5" /> Market Signals
            </TabsTrigger>
            <TabsTrigger value="copilot" className="gap-1.5 rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
              <Brain className="h-3.5 w-3.5" /> Copilot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live-kpis">
            <LiveKPIDashboard />
          </TabsContent>

          <TabsContent value="strategy">
            <AIStrategyAdvisor />
          </TabsContent>

          <TabsContent value="benchmark">
            <MarketBenchmarkPanel />
          </TabsContent>

          <TabsContent value="brand-pack">
            <BrandNameEngine />
          </TabsContent>

          <TabsContent value="market-signals">
            <MarketRealityCard />
          </TabsContent>

          <TabsContent value="copilot">
            <FounderCopilot />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
