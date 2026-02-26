import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MarketRealityCard } from "@/components/MarketRealityCard";
import { CashflowSurvivalCard } from "@/components/CashflowSurvivalCard";
import { FounderCopilot } from "@/components/FounderCopilot";
import { SEO } from "@/components/SEO";

export default function FounderIntelligencePage() {
  return (
    <DashboardLayout>
      <SEO
        title="Founder Intelligence Suite – BuildYourBrand"
        description="Market Reality, Cashflow Survival, AI Copilot – datenbasierte Gründer-Intelligenz."
        path="/dashboard/intelligence"
      />
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Founder Intelligence Suite</h1>
          <p className="mt-1 text-muted-foreground">
            Marktvalidierung, Cashflow-Analyse und KI-gestützter Strategieberater
          </p>
        </div>
        <FounderCopilot />
        <MarketRealityCard />
        <CashflowSurvivalCard />
      </div>
    </DashboardLayout>
  );
}
