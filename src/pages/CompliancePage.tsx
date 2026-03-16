import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ComplianceWizard from "@/components/ComplianceWizard";
import { BackButton } from "@/components/dashboard/BackButton";

export default function CompliancePage() {
  return (
    <DashboardLayout>
      <SEO
        title="Compliance Center"
        description="Interaktive Compliance-Checkliste für deine Eigenmarke – Gewerbeanmeldung, DSGVO, VerpackG und mehr."
        path="/dashboard/compliance"
      />
      <BackButton />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Launch Control & Compliance</h1>
          <p className="text-muted-foreground">Interaktiver Compliance-Wizard für deinen Launch</p>
        </div>
        <ComplianceWizard />
      </div>
    </DashboardLayout>
  );
}
