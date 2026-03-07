import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MarketRealityCard } from "@/components/MarketRealityCard";
import { CashflowSurvivalCard } from "@/components/CashflowSurvivalCard";
import { FounderCopilot } from "@/components/FounderCopilot";
import { SEO } from "@/components/SEO";
import { Brain, Target, DollarSign, Bot } from "lucide-react";

export default function FounderIntelligencePage() {
  return (
    <DashboardLayout>
      <SEO
        title="Founder Intelligence Suite – BuildYourBrand"
        description="Market Reality, Cashflow Survival, AI Copilot – datenbasierte Gründer-Intelligenz."
        path="/dashboard/intelligence"
      />
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Founder Intelligence Suite</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Marktvalidierung, Cashflow-Analyse und KI-gestützter Strategieberater
            </p>
          </div>
        </div>

        {/* Module overview chips */}
        <div className="flex flex-wrap gap-2">
          <a href="#copilot" className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
            <Bot className="h-3.5 w-3.5 text-primary" />
            AI Copilot
          </a>
          <a href="#market" className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
            <Target className="h-3.5 w-3.5 text-primary" />
            Market Reality
          </a>
          <a href="#cashflow" className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            Cashflow Survival
          </a>
        </div>

        <div id="copilot">
          <FounderCopilot />
        </div>
        <div id="market">
          <MarketRealityCard />
        </div>
        <div id="cashflow">
          <CashflowSurvivalCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
