import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PricingSection } from "@/components/landing/PricingSection";

export default function Pricing() {
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
