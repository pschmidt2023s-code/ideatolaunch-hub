import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PricingSection } from "@/components/landing/PricingSection";
import { trackEvent } from "@/lib/analytics";

export default function Pricing() {
  useEffect(() => { trackEvent("pricing_viewed"); }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
