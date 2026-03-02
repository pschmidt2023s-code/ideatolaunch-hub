import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WhyUsSection } from "@/components/landing/WhyUsSection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { CTABlock } from "@/components/landing/CTABlock";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { LeadMagnetPopup, useLeadMagnet } from "@/components/LeadMagnetPopup";
import { faqJsonLd, howToJsonLd, softwareJsonLd } from "@/lib/homepage-jsonld";

const Index = () => {
  const { showPopup, trigger, setShowPopup } = useLeadMagnet();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Eigene Marke gründen – BuildYourBrand 2026"
        description="Vermeide 5.000 € Produktionsfehler. Starte deine Eigenmarke datenbasiert in 7 Schritten. Kostenlos starten."
        path="/"
        jsonLd={[faqJsonLd, howToJsonLd, softwareJsonLd]}
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTABlock />
        <WhyUsSection />
        <BeforeAfterSection />
        <SocialProofSection />
        <CTABlock variant="download" />
        <PricingSection />
        <TrustSection />
      </main>
      <Footer />
      {showPopup && (
        <LeadMagnetPopup trigger={trigger} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
};

export default Index;
