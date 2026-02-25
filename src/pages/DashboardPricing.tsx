import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PricingSection } from "@/components/landing/PricingSection";
import { trackEvent } from "@/lib/analytics";

export default function DashboardPricing() {
  useEffect(() => { trackEvent("pricing_viewed", { source: "dashboard" }); }, []);

  return (
    <DashboardLayout>
      <PricingSection />
    </DashboardLayout>
  );
}
