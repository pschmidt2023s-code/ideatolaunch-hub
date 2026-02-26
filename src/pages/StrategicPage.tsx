import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import StrategicDashboard from "@/components/StrategicDashboard";

export default function StrategicPage() {
  return (
    <DashboardLayout>
      <SEO
        title="Strategic Intelligence"
        description="Datengetriebene Entscheidungsintelligenz: Capital Burn, Supplier Risk, Launch-Wahrscheinlichkeit und KI-Empfehlungen."
        path="/dashboard/strategic"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Strategic Founder Intelligence</h1>
          <p className="text-muted-foreground">
            Vermeide €5.000–€20.000 teure Fehler mit datenbasierten Entscheidungen
          </p>
        </div>
        <StrategicDashboard />
      </div>
    </DashboardLayout>
  );
}
