import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import FraudDashboard from "@/components/admin/FraudDashboard";

export default function FraudPage() {
  return (
    <DashboardLayout>
      <SEO
        title="Fraud Dashboard"
        description="Admin-Dashboard zur Überwachung und Verwaltung von Referral-Betrugsversuchen."
        path="/admin/fraud"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Referral Fraud Dashboard</h1>
          <p className="text-muted-foreground">
            Überwache und verwalte verdächtige Referral-Aktivitäten
          </p>
        </div>
        <FraudDashboard />
      </div>
    </DashboardLayout>
  );
}
