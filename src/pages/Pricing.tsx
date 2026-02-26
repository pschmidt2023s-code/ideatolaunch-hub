import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PricingSection } from "@/components/landing/PricingSection";
import { trackEvent } from "@/lib/analytics";
import { SEO } from "@/components/SEO";

export default function Pricing() {
  useEffect(() => { trackEvent("pricing_viewed"); }, []);
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Preise & Pläne"
        description="Wähle den passenden Plan für deinen Markenaufbau: Kostenlos starten oder mit Premium-Features schneller zum Launch. Transparent, fair, ohne versteckte Kosten."
        path="/pricing"
      />
      <Navbar />
      <main className="pt-16">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
