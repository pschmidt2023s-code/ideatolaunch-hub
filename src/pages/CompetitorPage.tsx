import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CompetitorTracker } from "@/components/dashboard/CompetitorTracker";
import { RevenueForecast } from "@/components/dashboard/RevenueForecast";
import { GoalTracker } from "@/components/dashboard/GoalTracker";
import { BackButton } from "@/components/dashboard/BackButton";

export default function CompetitorPage() {
  return (
    <DashboardLayout>
      <BackButton />
      <div className="space-y-6 animate-fade-in">
        <CompetitorTracker />
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueForecast />
          <GoalTracker />
        </div>
      </div>
    </DashboardLayout>
  );
}
